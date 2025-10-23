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

@router.get("/", status_code=200)
def auth_root():
    return {"message": "Auth root"}

@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    session: Session = Depends(get_session),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    註冊新用戶並發送驗證郵件
    
    - **email**: 用戶的 email 地址（必須唯一）
    - **display_name**: 用戶的顯示名稱
    - **password**: 用戶的密碼（至少 8 字符，包含大小寫字母和數字）
    """
    # 檢查 email 是否已存在
    existing_user = UserService.get_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists."
        )
    
    # 建立新用戶
    new_user = UserService.create(session, user_data)
    
    # 產生 token 並發送驗證郵件 (背景任務)
    token = EmailService.generate_verification_token(session, new_user)
    background_tasks.add_task(EmailService.send_verification_email, new_user, token)
    
    return RegistrationResponse(message="註冊成功，請至信箱查收驗證信")

@router.get("/verify-email", response_model=EmailVerificationResponse, status_code=status.HTTP_200_OK)
def verify_email(
    token: str,
    session: Session = Depends(get_session)
):
    """
    驗證用戶的 email 地址

    - **token**: 從驗證郵件中獲取的 token
    """
    # 先檢查這個 token 是否曾經存在過（檢查是否有對應的已驗證用戶）
    # 這是為了提供更好的用戶體驗訊息
    
    user = UserService.verify_email(session, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無效或過期的驗證 token"
        )
    
    return EmailVerificationResponse(message="Email 驗證成功，您現在可以登入了。", success=True)

@router.post("/resend-verification", response_model=EmailVerificationResponse, status_code=status.HTTP_200_OK)
def resend_verification_email(
    request: EmailVerificationRequest,
    session: Session = Depends(get_session),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    重新發送 email 驗證信

    - **email**: 要接收驗證信的 email 地址
    """
    # TODO: 實作更嚴謹的速率限制 (e.g., using slowapi)
    user = UserService.get_by_email(session, request.email)
    if not user:
        # 即使找不到用戶，也返回成功訊息以避免洩漏用戶資訊
        return EmailVerificationResponse(message="如果該 email 已註冊，將會收到一封新的驗證信。", success=True)

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="此 email 地址已經驗證過了。"
        )

    # 產生新 token 並發送郵件
    token = EmailService.generate_verification_token(session, user)
    background_tasks.add_task(EmailService.send_verification_email, user, token)

    return EmailVerificationResponse(message="如果該 email 已註冊，將會收到一封新的驗證信。", success=True)


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(
    login_data: UserLogin,
    session: Session = Depends(get_session)
):
    """
    用戶登入
    
    - **email**: 用戶的 email 地址
    - **password**: 用戶的密碼
    - **remember_me**: 是否記住登入狀態（預設 False）
      - False: token 有效期 30 分鐘
      - True: token 有效期 7 天
    """
    try:
        user = UserService.authenticate(session, login_data.email, login_data.password)
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
    session: Session = Depends(get_session)
):
    """
    Google OAuth 登入/註冊
    
    - **id_token**: Google 提供的 ID Token
    
    成功時返回：
    - **access_token**: JWT access token
    - **token_type**: "bearer"
    - **is_new_user**: 是否為新註冊用戶
    - **needs_display_name**: 是否需要補充顯示名稱
    """
    # 驗證 Google ID Token
    google_info = UserService.verify_google_token(login_data.id_token)
    
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token"
        )
    
    # 取得或創建用戶
    user, is_new_user, needs_display_name = UserService.get_or_create_google_user(
        session,
        google_id=google_info['google_id'],
        email=google_info['email'],
        name=google_info.get('name')
    )
    
    # 檢查帳號是否為活躍狀態
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # 建立 access token
    access_token = create_access_token(
        data={"sub": user.email}
    )
    
    return GoogleLoginResponse(
        access_token=access_token,
        token_type="bearer",
        is_new_user=is_new_user,
        needs_display_name=needs_display_name
    )
