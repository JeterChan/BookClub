# backend/app/models/club_tag.py
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .book_club import BookClub


class BookClubTagLink(SQLModel, table=True):
    """讀書會標籤關聯表"""
    book_club_id: int = Field(foreign_key="bookclub.id", primary_key=True)
    tag_id: int = Field(foreign_key="clubtag.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ClubTag(SQLModel, table=True):
    """讀書會標籤模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, index=True)
    is_predefined: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    book_clubs: List["BookClub"] = Relationship(back_populates="tags", link_model=BookClubTagLink)


# ===== API Schemas (基本 CRUD) =====

class ClubTagRead(SQLModel):
    """讀書會標籤讀取 schema（統一使用 snake_case）"""
    id: int
    name: str
    is_predefined: bool


class ClubTagCreate(SQLModel):
    """讀書會標籤創建 schema"""
    name: str
