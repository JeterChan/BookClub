from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta
from app.models.user import User, UserCreate
from app.core.security import hash_password, verify_password
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# 帳號保護設定
MAX_FAILED_ATTEMPTS = 5
LOCK_DURATION_MINUTES = 15

class UserService:
    """用戶服務類別，處理所有與用戶相關的業務邏輯"""
    
    @staticmethod
    def create(session: Session, user_data: UserCreate) -> User:
        """
        建立新用戶
        
        Args:
            session: 資料庫 session
            user_data: 用戶建立資料
            
        Returns:
            User: 建立的用戶物件
        """
        # 雜湊密碼
        password_hash = hash_password(user_data.password)
        
        # 建立用戶物件
        db_user = User(
            email=user_data.email,
            display_name=user_data.display_name,
            password_hash=password_hash
        )
        
        # 儲存到資料庫
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def get_by_email(session: Session, email: str) -> Optional[User]:
        """
        根據 email 查詢用戶
        
        Args:
            session: 資料庫 session
            email: 用戶 email
            
        Returns:
            Optional[User]: 找到的用戶物件，如果不存在則返回 None
        """
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        return user
    
    @staticmethod
    def authenticate(session: Session, email: str, password: str) -> Optional[User]:
        """
        驗證用戶登入
        
        Args:
            session: 資料庫 session
            email: 用戶 email
            password: 明文密碼
            
        Returns:
            Optional[User]: 驗證成功返回用戶物件，失敗返回 None
            
        Raises:
            ValueError: 當帳號被鎖定時拋出異常
        """
        # 查詢用戶
        user = UserService.get_by_email(session, email)
        if not user:
            return None
        
        # 檢查帳號是否被鎖定
        if user.locked_until:
            if datetime.utcnow() < user.locked_until:
                # 帳號仍在鎖定期間
                raise ValueError("Account is locked due to multiple failed login attempts")
            else:
                # 鎖定期已過，重置鎖定狀態
                user.locked_until = None
                user.failed_login_attempts = 0
                session.add(user)
                session.commit()
        
        # 檢查是否為 OAuth 用戶（沒有密碼）
        if not user.password_hash:
            # OAuth 用戶不能使用密碼登入
            return None
        
        # 驗證密碼
        if not verify_password(password, user.password_hash):
            # 密碼錯誤，增加失敗計數
            user.failed_login_attempts += 1
            
            # 檢查是否達到鎖定門檻
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_DURATION_MINUTES)
            
            session.add(user)
            session.commit()
            return None
        
        # 密碼正確，重置失敗計數
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            user.locked_until = None
            session.add(user)
            session.commit()
            session.refresh(user)
        
        return user
    
    @staticmethod
    def verify_google_token(token: str) -> Optional[dict]:
        """
        驗證 Google ID Token 的真實性
        
        Args:
            token: Google ID token 字串
            
        Returns:
            Optional[dict]: 解碼後的 token payload，包含 google_id, email, name 等資訊
            如果驗證失敗則返回 None
        """
        try:
            client_id = os.getenv("GOOGLE_CLIENT_ID")
            if not client_id:
                return None
            
            # 驗證 ID token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                client_id
            )
            
            # 驗證 issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return None
            
            return {
                'google_id': idinfo['sub'],
                'email': idinfo.get('email'),
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture')
            }
        except ValueError:
            # Token 無效
            return None
    
    @staticmethod
    def get_or_create_google_user(
        session: Session, 
        google_id: str, 
        email: str, 
        name: Optional[str] = None
    ) -> tuple[User, bool, bool]:
        """
        取得或創建 Google OAuth 用戶
        
        Args:
            session: 資料庫 session
            google_id: Google 用戶 ID
            email: 用戶 email
            name: 用戶顯示名稱（可選）
            
        Returns:
            tuple[User, bool, bool]: (用戶物件, 是否為新用戶, 是否需要補充名稱)
        """
        # 先查詢是否已有此 Google ID 的用戶
        statement = select(User).where(User.google_id == google_id)
        user = session.exec(statement).first()
        
        if user:
            # 既有用戶登入
            return (user, False, False)
        
        # 檢查 email 是否已被使用
        existing_user = UserService.get_by_email(session, email)
        if existing_user:
            # Email 已存在但未綁定 Google，這是一個邊緣情況
            # 根據業務邏輯，可以選擇：
            # 1. 拋出錯誤要求用戶先登入後綁定
            # 2. 自動綁定（需要額外驗證）
            # 這裡我們選擇創建新帳號，因為 Google email 可能與註冊 email 不同
            pass
        
        # 創建新用戶
        needs_display_name = not name or name.strip() == ""
        display_name = name if name and name.strip() else email.split('@')[0]
        
        new_user = User(
            email=email,
            display_name=display_name,
            google_id=google_id,
            oauth_provider='google',
            password_hash=None  # Google 登入用戶沒有密碼
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        return (new_user, True, needs_display_name)
    
    @staticmethod
    def get_by_google_id(session: Session, google_id: str) -> Optional[User]:
        """
        根據 Google ID 查詢用戶
        
        Args:
            session: 資料庫 session
            google_id: Google 用戶 ID
            
        Returns:
            Optional[User]: 找到的用戶物件，如果不存在則返回 None
        """
        statement = select(User).where(User.google_id == google_id)
        user = session.exec(statement).first()
        return user
    
    @staticmethod
    def link_google_account(session: Session, user: User, google_id: str) -> None:
        """
        綁定 Google 帳號到現有用戶
        
        Args:
            session: 資料庫 session
            user: 要綁定的用戶物件
            google_id: Google 用戶 ID
            
        Raises:
            ValueError: 當 Google ID 已被其他用戶使用，或用戶已綁定其他 Google 帳號時
        """
        # 檢查此 Google ID 是否已被其他用戶使用
        existing_user = UserService.get_by_google_id(session, google_id)
        if existing_user and existing_user.id != user.id:
            raise ValueError("This Google account is already linked to another user")
        
        # 檢查用戶是否已綁定 Google 帳號
        if user.google_id:
            raise ValueError("This account is already linked to a Google account")
        
        # 綁定 Google 帳號
        user.google_id = google_id
        user.oauth_provider = 'google'
        session.add(user)
        session.commit()
        session.refresh(user)
    
    @staticmethod
    def unlink_google_account(session: Session, user: User) -> None:
        """
        解綁 Google 帳號
        
        Args:
            session: 資料庫 session
            user: 要解綁的用戶物件
            
        Raises:
            ValueError: 當用戶未綁定 Google 帳號，或解綁後無法登入時
        """
        # 檢查用戶是否已綁定 Google 帳號
        if not user.google_id:
            raise ValueError("No Google account linked")
        
        # 檢查用戶是否設定密碼（防止解綁後無法登入）
        if not user.password_hash:
            raise ValueError("Cannot unlink Google account: no password set. Please set a password first.")
        
        # 解綁 Google 帳號
        user.google_id = None
        user.oauth_provider = None
        session.add(user)
        session.commit()
        session.refresh(user)
