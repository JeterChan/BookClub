# backend/app/models/interest_tag.py
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class UserInterestTag(SQLModel, table=True):
    """用戶興趣標籤關聯表"""
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    tag_id: int = Field(foreign_key="interesttag.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterestTag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, index=True)
    is_predefined: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    users: List["User"] = Relationship(back_populates="interest_tags", link_model=UserInterestTag)


class InterestTagRead(SQLModel):
    """興趣標籤讀取 schema"""
    id: int
    name: str
    is_predefined: bool


class InterestTagCreate(SQLModel):
    """興趣標籤創建 schema"""
    name: str


class UserInterestTagCreate(SQLModel):
    """使用者關聯興趣標籤 schema"""
    tag_id: int
