# backend/app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlmodel import Session
from datetime import timedelta
from app.models.user import UserCreate, RegistrationResponse, UserLogin, Token, TokenWithUser, UserRead
from app.schemas.email_verification import EmailVerificationRequest, EmailVerificationResponse
from app.models.password_reset import (
    ForgotPasswordRequest, 
    ForgotPasswordResponse, 
    ResetPasswordRequest, 
    ResetPasswordResponse,
    VerifyResetTokenResponse
)
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.services.password_reset_service import PasswordResetService
from app.db.session import get_session
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER
from app.core.logging_config import log_auth_event, log_error, log_business_event

router = APIRouter()

def get_user_service(session: Session = Depends(get_session)) -> UserService:
    return UserService(session)

@router.get("/", status_code=200)
def auth_root():
    return {"message": "Auth root"}

@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service),
    session: Session = Depends(get_session), # Keep for email service
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    try:
        existing_user = user_service.get_by_email(user_data.email)
        if existing_user:
            log_auth_event("Registration Failed - Email exists", email=user_data.email, success=False)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists."
            )
        
        new_user = user_service.create(user_data)
        log_auth_event("User Registered", user_id=new_user.id, email=new_user.email)
        
        token = EmailService.generate_verification_token(session, new_user)
        background_tasks.add_task(EmailService.send_verification_email, new_user, token)
        
        return RegistrationResponse(message="註冊成功，請至信箱查收驗證信")
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, context="User Registration", user_id=None)
        raise HTTPException(status_code=500, detail="註冊失敗")

@router.get("/verify-email", response_model=EmailVerificationResponse, status_code=status.HTTP_200_OK)
def verify_email(
    token: str,
    user_service: UserService = Depends(get_user_service)
):
    user = user_service.verify_email(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無效或過期的驗證 token"
        )
    
    return EmailVerificationResponse(message="Email 驗證成功，您現在可以登入了。", success=True)

@router.post("/resend-verification", response_model=EmailVerificationResponse, status_code=status.HTTP_200_OK)
def resend_verification_email(
    request: EmailVerificationRequest,
    user_service: UserService = Depends(get_user_service),
    session: Session = Depends(get_session), # Keep for email service
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    user = user_service.get_by_email(request.email)
    if not user:
        return EmailVerificationResponse(message="如果該 email 已註冊，將會收到一封新的驗證信。", success=True)

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="此 email 地址已經驗證過了。"
        )

    token = EmailService.generate_verification_token(session, user)
    background_tasks.add_task(EmailService.send_verification_email, user, token)

    return EmailVerificationResponse(message="如果該 email 已註冊，將會收到一封新的驗證信。", success=True)


@router.post("/login", response_model=TokenWithUser, status_code=status.HTTP_200_OK)
def login(
    login_data: UserLogin,
    user_service: UserService = Depends(get_user_service)
):
    try:
        user = user_service.authenticate(login_data.email, login_data.password)
        
        if not user:
            log_auth_event("Login Failed - Invalid credentials", email=login_data.email, success=False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            log_auth_event("Login Failed - Inactive account", user_id=user.id, email=user.email, success=False)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        if login_data.remember_me:
            access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER)
        else:
            access_token_expires = None
        
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        log_auth_event("Login Successful", user_id=user.id, email=user.email)
        
        return TokenWithUser(
            access_token=access_token,
            token_type="bearer",
            user=UserRead.model_validate(user)
        )
        
    except ValueError as e:
        log_auth_event(f"Login Failed - {str(e)}", email=login_data.email, success=False)
        if str(e) == "請先完成 Email 驗證":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, context="User Login", user_id=None)
        raise HTTPException(status_code=500, detail="登入失敗")


@router.post("/forgot-password", response_model=ForgotPasswordResponse, status_code=status.HTTP_200_OK)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    user_service: UserService = Depends(get_user_service),
    session: Session = Depends(get_session)
):
    """
    處理忘記密碼請求，發送重置郵件
    
    為了安全考量，即使 email 不存在也返回成功訊息
    """
    user = user_service.get_by_email(request_data.email)
    
    if user:
        # 取得客戶端 IP 位址
        ip_address = request.client.host if request.client else None
        
        try:
            token = PasswordResetService.create_reset_token(session, user, ip_address)
            background_tasks.add_task(EmailService.send_password_reset_email, user, token)
        except HTTPException as e:
            # 直接重新拋出 HTTPException (包括 429 rate limit)
            raise e
        except ValueError as e:
            # 處理其他驗證錯誤
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    return ForgotPasswordResponse(
        message="如果該 email 已註冊，您將會收到密碼重置連結。"
    )


@router.get("/verify-reset-token", response_model=VerifyResetTokenResponse, status_code=status.HTTP_200_OK)
def verify_reset_token(
    token: str,
    session: Session = Depends(get_session)
):
    """
    驗證密碼重置 token 是否有效
    """
    result = PasswordResetService.verify_reset_token(session, token)
    
    if not result["valid"]:
        return VerifyResetTokenResponse(valid=False, email=None)
    
    return VerifyResetTokenResponse(valid=True, email=result["email"])


@router.post("/reset-password", response_model=ResetPasswordResponse, status_code=status.HTTP_200_OK)
def reset_password(
    reset_data: ResetPasswordRequest,
    session: Session = Depends(get_session)
):
    """
    使用 token 重置密碼
    """
    try:
        PasswordResetService.reset_password(
            session, 
            reset_data.token, 
            reset_data.new_password
        )
        return ResetPasswordResponse(message="密碼重置成功，請使用新密碼登入。")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )