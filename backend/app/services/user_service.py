from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta
import time
import shutil
from fastapi import UploadFile
from PIL import Image

from app.models.user import User, UserCreate
from app.models.interest_tag import InterestTag
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
    def get_by_verification_token(session: Session, token: str) -> Optional[User]:
        """
        根據 email 驗證 token 查詢用戶
        
        Args:
            session: 資料庫 session
            token: 驗證 token
            
        Returns:
            Optional[User]: 找到的用戶物件，如果不存在則返回 None
        """
        statement = select(User).where(User.email_verification_token == token)
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
            ValueError: 當帳號被鎖定或 email 未驗證時拋出異常
        """
        # 查詢用戶
        user = UserService.get_by_email(session, email)
        if not user:
            return None
        
        # 檢查帳號是否被鎖定
        if user.locked_until and datetime.utcnow() < user.locked_until:
            raise ValueError("Account is locked due to multiple failed login attempts")
        
        # 鎖定期已過，重置鎖定狀態
        user.locked_until = None
        user.failed_login_attempts = 0
        session.add(user)
        session.commit()
        
        # 檢查是否為 OAuth 用戶（沒有密碼）
        if not user.password_hash:
            return None
        
        # 驗證密碼
        if not verify_password(password, user.password_hash):
            # 密碼錯誤，增加失敗計數
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_DURATION_MINUTES)
            session.add(user)
            session.commit()
            return None
        
        # 檢查 email 是否已驗證
        if not user.email_verified:
            raise ValueError("請先完成 Email 驗證")

        # 密碼正確，重置失敗計數
        user.failed_login_attempts = 0
        session.add(user)
        session.commit()
        session.refresh(user)
        
        return user

    @staticmethod
    def verify_email(session: Session, token: str) -> Optional[User]:
        """
        驗證用戶的 email。

        Args:
            session: The database session.
            token: The verification token.

        Returns:
            The verified user, or None if the token is invalid or expired.
        """
        # 先通過 token 查找用戶
        user = UserService.get_by_verification_token(session, token)

        # Token 無效或不存在
        if not user:
            # 檢查是否有已驗證的用戶（token 已被清空）
            # 這種情況發生在用戶重複點擊驗證連結時
            return None
        
        # 檢查 token 是否過期
        if not user.email_verification_token_expires_at:
            return None

        if user.email_verification_token_expires_at < datetime.utcnow():
            return None

        # Token 有效，執行驗證
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_token_expires_at = None
        session.add(user)
        session.commit()

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
            password_hash=None,  # Google 登入用戶沒有密碼
            email_verified=True  # Google 用戶自動視為已驗證
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

    @staticmethod
    def get_user_profile(session: Session, user: User) -> User:
        """獲取完整的用戶個人檔案，包含關聯的興趣標籤"""
        # The user object from get_current_user might not have the tags loaded.
        # We need to refresh it to load the relationship.
        session.refresh(user)
        return user

    @staticmethod
    def update_profile(session: Session, user: User, display_name: Optional[str], bio: Optional[str]) -> User:
        """更新用戶的顯示名稱和個人簡介"""
        if display_name is not None:
            user.display_name = display_name
        if bio is not None:
            user.bio = bio
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def upload_avatar(session: Session, user: User, file: UploadFile) -> str:
        """處理頭像上傳,包括驗證、儲存和清理舊檔案"""
        # 1. 驗證檔案類型
        allowed_types = ["image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise ValueError("不支援的檔案類型,僅限 JPG/PNG")

        # 2. 檢查檔案大小 (2MB)
        file.file.seek(0, 2)  # 移動到檔案結尾
        size = file.file.tell()  # 獲取檔案大小
        file.file.seek(0)  # 重置檔案指標
        
        max_size = 2 * 1024 * 1024  # 2MB
        if size > max_size:
            raise ValueError("檔案大小不可超過 2MB")

        # 3. 使用 Pillow 驗證圖片完整性和真實性
        try:
            img = Image.open(file.file)
            img.verify()  # 驗證圖片完整性
            file.file.seek(0)  # 重置檔案指標
            
            # 再次打開以獲取圖片格式 (verify() 後無法再使用原始 Image 物件)
            img = Image.open(file.file)
            file.file.seek(0)
            
            # 驗證圖片格式與宣告的 MIME type 一致
            image_format = img.format
            if image_format not in ["JPEG", "PNG"]:
                raise ValueError("無效的圖片格式")
                
        except Exception as e:
            if "無效的圖片格式" in str(e):
                raise
            raise ValueError("無效的圖片檔案")

        # 4. 產生安全檔名 (使用時間戳避免衝突)
        timestamp = int(time.time() * 1000)  # 使用毫秒級時間戳提高唯一性
        extension = "jpg" if file.content_type == "image/jpeg" else "png"
        filename = f"{user.id}_{timestamp}.{extension}"
        
        # 5. 儲存檔案
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 6. 清理舊頭像
        if user.avatar_url:
            old_avatar_path = user.avatar_url.lstrip("/")
            if os.path.exists(old_avatar_path):
                try:
                    os.remove(old_avatar_path)
                except OSError:
                    # 忽略刪除失敗的情況 (可能檔案已被刪除或權限問題)
                    pass

        # 7. 更新資料庫
        avatar_url = f"/{file_path}"
        user.avatar_url = avatar_url
        session.add(user)
        session.commit()
        session.refresh(user)

        return avatar_url

    @staticmethod
    def add_interest_tag(session: Session, user: User, tag_id: int) -> User:
        """為用戶新增興趣標籤"""
        # 檢查標籤是否存在
        tag = session.get(InterestTag, tag_id)
        if not tag:
            raise ValueError("標籤不存在")

        # 檢查用戶標籤數量是否已達上限 (20)
        if len(user.interest_tags) >= 20:
            raise ValueError("興趣標籤數量已達上限 (20個)")

        # 檢查是否已新增過此標籤
        if tag in user.interest_tags:
            raise ValueError("已新增過此標籤")

        user.interest_tags.append(tag)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def remove_interest_tag(session: Session, user: User, tag_id: int) -> User:
        """移除用戶的興趣標籤"""
        tag = session.get(InterestTag, tag_id)
        if not tag:
            raise ValueError("標籤不存在")

        if tag not in user.interest_tags:
            raise ValueError("用戶沒有此標籤")

        user.interest_tags.remove(tag)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

