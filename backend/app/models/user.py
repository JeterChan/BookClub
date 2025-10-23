from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .interest_tag import InterestTag, InterestTagRead

# 必須在運行時導入 UserInterestTag 作為 link_model
from .interest_tag import UserInterestTag

import re
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator

class UserBase(SQLModel):
    email: str = Field(max_length=255, unique=True, index=True)
    display_name: str = Field(max_length=50)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    
    # OAuth 相關欄位
    google_id: Optional[str] = Field(default=None, unique=True, index=True, max_length=255)
    oauth_provider: Optional[str] = Field(default=None, max_length=50)
    
    bio: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    
    # 帳號保護機制欄位
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None)
    
    # 時間戳欄位
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Email 驗證相關欄位
    email_verified: bool = Field(default=False)
    email_verification_token: Optional[str] = Field(default=None, max_length=255, index=True)
    email_verification_token_expires_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    owned_clubs: List["BookClub"] = Relationship(back_populates="owner")
    memberships: List["BookClubMember"] = Relationship(back_populates="user")
    threads: List["DiscussionThread"] = Relationship(back_populates="author")
    posts: List["DiscussionPost"] = Relationship(back_populates="author")
    notifications: List["Notification"] = Relationship(back_populates="recipient")
    interest_tags: List["InterestTag"] = Relationship(back_populates="users", link_model=UserInterestTag)


class UserProfileUpdate(SQLModel):
    """更新個人檔案請求"""
    display_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)


class UserProfileRead(UserBase):
    """完整個人檔案讀取 schema"""
    id: int
    bio: Optional[str]
    avatar_url: Optional[str]
    interest_tags: List["InterestTagRead"] = []


class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        驗證密碼強度：
        - 至少 8 個字符
        - 包含大寫字母
        - 包含小寫字母
        - 包含數字
        """
        if len(v) < 8:
            raise ValueError('密碼必須至少包含 8 個字符')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密碼必須包含至少一個大寫字母')
        if not re.search(r'[a-z]', v):
            raise ValueError('密碼必須包含至少一個小寫字母')
        if not re.search(r'\d', v):
            raise ValueError('密碼必須包含至少一個數字')
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """驗證 email 格式"""
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('無效的 email 格式')
        return v

class UserRead(UserBase):
    id: int

class UserLogin(SQLModel):
    """用戶登入請求 schema"""
    email: str
    password: str
    remember_me: bool = False

class Token(SQLModel):
    """JWT Token 回應 schema"""
    access_token: str
    token_type: str = "bearer"

class GoogleLoginRequest(SQLModel):
    """Google OAuth 登入請求"""
    id_token: str

class GoogleLoginResponse(SQLModel):
    """Google OAuth 登入回應"""
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
    needs_display_name: bool

class UserUpdateDisplayName(SQLModel):
    """更新顯示名稱請求"""
    display_name: str = Field(max_length=50)

class UserLinkGoogle(SQLModel):
    """綁定 Google 帳號請求"""
    id_token: str

class RegistrationResponse(SQLModel):
    """註冊成功回應"""
    message: str
