# backend/app/services/user_service.py
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
import os

# Account protection settings
MAX_FAILED_ATTEMPTS = 5
LOCK_DURATION_MINUTES = 15

class UserService:
    """Service class for user-related business logic"""
    def __init__(self, session: Session):
        self.session = session

    def create(self, user_data: UserCreate) -> User:
        password_hash = hash_password(user_data.password)
        db_user = User(
            email=user_data.email,
            display_name=user_data.display_name,
            password_hash=password_hash
        )
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    def get_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        user = self.session.exec(statement).first()
        return user

    def get_by_verification_token(self, token: str) -> Optional[User]:
        statement = select(User).where(User.email_verification_token == token)
        user = self.session.exec(statement).first()
        return user

    def authenticate(self, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(email)
        if not user:
            return None
        
        if user.locked_until and datetime.utcnow() < user.locked_until:
            raise ValueError("Account is locked due to multiple failed login attempts")
        
        user.locked_until = None
        user.failed_login_attempts = 0
        self.session.add(user)
        self.session.commit()
        
        if not user.password_hash:
            return None
        
        if not verify_password(password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_DURATION_MINUTES)
            self.session.add(user)
            self.session.commit()
            return None
        
        if not user.email_verified:
            raise ValueError("請先完成 Email 驗證")

        user.failed_login_attempts = 0
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def verify_email(self, token: str) -> Optional[User]:
        user = self.get_by_verification_token(token)
        if not user or not user.email_verification_token_expires_at or user.email_verification_token_expires_at < datetime.utcnow():
            return None

        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_token_expires_at = None
        self.session.add(user)
        self.session.commit()
        return user

    def get_user_profile(self, user: User) -> User:
        self.session.refresh(user)
        return user

    def update_profile(self, user: User, display_name: Optional[str], bio: Optional[str]) -> User:
        if display_name is not None:
            user.display_name = display_name
        if bio is not None:
            user.bio = bio
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def upload_avatar(self, user: User, file: UploadFile) -> str:
        allowed_types = ["image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise ValueError("不支援的檔案類型,僅限 JPG/PNG")

        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        max_size = 2 * 1024 * 1024
        if size > max_size:
            raise ValueError("檔案大小不可超過 2MB")

        try:
            img = Image.open(file.file)
            img.verify()
            file.file.seek(0)
            img = Image.open(file.file)
            file.file.seek(0)
            image_format = img.format
            if image_format not in ["JPEG", "PNG"]:
                raise ValueError("無效的圖片格式")
        except Exception as e:
            if "無效的圖片格式" in str(e):
                raise
            raise ValueError("無效的圖片檔案")

        timestamp = int(time.time() * 1000)
        extension = "jpg" if file.content_type == "image/jpeg" else "png"
        filename = f"{user.id}_{timestamp}.{extension}"
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if user.avatar_url:
            old_avatar_path = user.avatar_url.lstrip("/")
            if os.path.exists(old_avatar_path):
                try:
                    os.remove(old_avatar_path)
                except OSError:
                    pass

        avatar_url = f"/{file_path}"
        user.avatar_url = avatar_url
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return avatar_url

    def add_interest_tag(self, user: User, tag_id: int) -> User:
        tag = self.session.get(InterestTag, tag_id)
        if not tag:
            raise ValueError("標籤不存在")
        if len(user.interest_tags) >= 20:
            raise ValueError("興趣標籤數量已達上限 (20個)")
        if tag in user.interest_tags:
            raise ValueError("已新增過此標籤")
        user.interest_tags.append(tag)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def remove_interest_tag(self, user: User, tag_id: int) -> User:
        tag = self.session.get(InterestTag, tag_id)
        if not tag:
            raise ValueError("標籤不存在")
        if tag not in user.interest_tags:
            raise ValueError("用戶沒有此標籤")
        user.interest_tags.remove(tag)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user