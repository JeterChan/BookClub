from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum
from pydantic import field_validator

# This import is needed to resolve the forward reference from User
from .user import User

if TYPE_CHECKING:
    from .club_tag import ClubTag, ClubTagRead
    from .event import Event

# 必須在運行時導入 BookClubTagLink 作為 link_model
from .club_tag import BookClubTagLink

class BookClubVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

class BookClub(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    visibility: BookClubVisibility = Field(default=BookClubVisibility.PUBLIC, max_length=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)
    
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owner: "User" = Relationship(back_populates="owned_clubs")
    members: List["BookClubMember"] = Relationship(back_populates="book_club")
    threads: List["DiscussionTopic"] = Relationship(back_populates="book_club")
    tags: List["ClubTag"] = Relationship(back_populates="book_clubs", link_model=BookClubTagLink)
    events: List["Event"] = Relationship(back_populates="book_club")


# ===== API Schemas (基本 CRUD) =====

class BookClubCreate(SQLModel):
    """建立讀書會請求 schema"""
    name: str = Field(max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    visibility: BookClubVisibility = Field(default=BookClubVisibility.PUBLIC)
    tag_ids: List[int] = Field(min_length=1)
    cover_image_url: Optional[str] = Field(None, max_length=255)
    
    @field_validator('name')
    @classmethod
    def validate_name_length(cls, v: str) -> str:
        if len(v) > 50:
            raise ValueError('讀書會名稱不能超過 50 個字元')
        if len(v) == 0:
            raise ValueError('讀書會名稱為必填')
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description_length(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 500:
            raise ValueError('讀書會簡介不能超過 500 個字元')
        return v
    
    @field_validator('tag_ids')
    @classmethod
    def validate_tag_ids(cls, v: List[int]) -> List[int]:
        if len(v) == 0:
            raise ValueError('至少需要選擇一個標籤')
        return v


class BookClubRead(SQLModel):
    """讀書會讀取 schema (基本資訊)"""
    id: int
    name: str
    description: Optional[str]
    visibility: BookClubVisibility
    cover_image_url: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: datetime
