from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel
from pydantic import BaseModel

class PasswordResetToken(SQLModel, table=True):
    """密碼重置 Token 資料表"""
    __tablename__ = "password_reset_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(max_length=255, unique=True, index=True)
    expires_at: datetime
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    
    # Relationship
    # user: "User" = Relationship(back_populates="password_reset_tokens")


# API Schemas
class ForgotPasswordRequest(BaseModel):
    """忘記密碼請求 schema"""
    email: str


class ForgotPasswordResponse(BaseModel):
    """忘記密碼回應 schema"""
    message: str


class ResetPasswordRequest(BaseModel):
    """重置密碼請求 schema"""
    token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    """重置密碼回應 schema"""
    message: str


class VerifyResetTokenResponse(BaseModel):
    """驗證重置 Token 回應 schema"""
    valid: bool
    email: Optional[str] = None
