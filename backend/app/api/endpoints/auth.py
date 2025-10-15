
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import timedelta
from app.models.user import UserCreate, UserRead, UserLogin, Token, GoogleLoginRequest, GoogleLoginResponse
from app.services.user_service import UserService
from app.db.session import get_session
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER

router = APIRouter()

@router.get("/", status_code=200)
def auth_root():
    return {"message": "Auth root"}

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    註冊新用戶
    
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
    
    return new_user

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
        # 驗證用戶憑證
        user = UserService.authenticate(session, login_data.email, login_data.password)
    except ValueError as e:
        # 帳號被鎖定
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    # 驗證失敗（用戶不存在或密碼錯誤）
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # 檢查帳號是否為活躍狀態
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # 根據 remember_me 設定 token 有效期
    if login_data.remember_me:
        access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER)
    else:
        access_token_expires = None  # 使用預設的 30 分鐘
    
    # 建立 access token
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
