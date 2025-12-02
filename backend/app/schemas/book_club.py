# backend/app/schemas/book_club.py
"""
讀書會相關的複合型 schemas
包含需要 join 多個表或包含額外業務邏輯的 schemas
"""
from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel
from pydantic import BaseModel

from app.models.book_club import BookClubVisibility
from app.models.club_tag import ClubTagRead
from app.models.user import UserRead
from app.models.book_club_member import MembershipStatus
from app.schemas.pagination import PaginationMeta


class BookClubReadWithDetails(SQLModel):
    """讀書會詳細資訊 schema (包含 owner, tags 和成員數)
    統一使用 snake_case 以保持前後端一致性
    """
    id: int
    name: str
    description: Optional[str] = None
    visibility: BookClubVisibility
    cover_image_url: Optional[str] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    # 關聯資料
    owner: UserRead
    tags: List[ClubTagRead] = []
    member_count: int = 0
    membership_status: Optional[MembershipStatus] = None


class BookClubListItem(SQLModel):
    """讀書會列表項目 schema (用於探索頁面)"""
    id: int
    name: str
    description: Optional[str]
    cover_image_url: Optional[str]
    visibility: BookClubVisibility
    member_count: int
    tags: List[ClubTagRead] = []


class PaginatedBookClubList(BaseModel):
    """分頁讀書會列表"""
    items: List[BookClubReadWithDetails]
    pagination: PaginationMeta


class BookClubUpdate(SQLModel):
    """用於更新讀書會資訊的 schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[BookClubVisibility] = None
    cover_image_url: Optional[str] = None
