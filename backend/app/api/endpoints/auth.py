# backend/app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session
from datetime import timedelta
from app.models.user import UserCreate, RegistrationResponse, UserLogin, Token, GoogleLoginRequest, GoogleLoginResponse
from app.schemas.email_verification import EmailVerificationRequest, EmailVerificationResponse
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.db.session import get_session
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER

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
    existing_user = user_service.get_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists."
        )
    
    new_user = user_service.create(user_data)
    
    token = EmailService.generate_verification_token(session, new_user)
    background_tasks.add_task(EmailService.send_verification_email, new_user, token)
    
    return RegistrationResponse(message="註冊成功，請至信箱查收驗證信")

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


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(
    login_data: UserLogin,
    user_service: UserService = Depends(get_user_service)
):
    try:
        user = user_service.authenticate(login_data.email, login_data.password)
    except ValueError as e:
        if str(e) == "請先完成 Email 驗證":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    if login_data.remember_me:
        access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER)
    else:
        access_token_expires = None
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.post("/google/login", response_model=GoogleLoginResponse, status_code=status.HTTP_200_OK)
def google_login(
    login_data: GoogleLoginRequest,
    user_service: UserService = Depends(get_user_service)
):
    google_info = user_service.verify_google_token(login_data.id_token)
    
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token"
        )
    
    user, is_new_user, needs_display_name = user_service.get_or_create_google_user(
        google_id=google_info['google_id'],
        email=google_info['email'],
        name=google_info.get('name')
    )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(
        data={"sub": user.email}
    )
    
    return GoogleLoginResponse(
        access_token=access_token,
        token_type="bearer",
        is_new_user=is_new_user,
        needs_display_name=needs_display_name
    )