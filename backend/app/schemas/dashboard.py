from typing import List, Optional, Literal
from datetime import datetime
from sqlmodel import SQLModel
from pydantic import Field


class DashboardStats(SQLModel):
    """儀表板統計資料"""
    clubs_count: int = Field(alias="clubsCount")
    books_read: int = Field(alias="booksRead")
    discussions_count: int = Field(alias="discussionsCount")
    
    class Config:
        populate_by_name = True


class DashboardClub(SQLModel):
    """儀表板讀書會資訊"""
    id: int
    name: str
    cover_image: Optional[str] = Field(default=None, alias="coverImage")
    member_count: int = Field(alias="memberCount")
    last_activity: datetime = Field(alias="lastActivity")
    
    class Config:
        populate_by_name = True


class RelatedEntity(SQLModel):
    """活動相關實體"""
    id: int
    name: str
    link: str


class DashboardActivity(SQLModel):
    """儀表板活動記錄"""
    id: int
    type: Literal['join_club', 'post_discussion', 'complete_book', 'comment']
    description: str
    timestamp: datetime
    related_entity: Optional[RelatedEntity] = Field(default=None, alias="relatedEntity")
    
    class Config:
        populate_by_name = True


class DashboardData(SQLModel):
    """完整儀表板資料"""
    stats: DashboardStats
    clubs: List[DashboardClub] = []
    recent_activities: List[DashboardActivity] = Field(default=[], alias="recentActivities")
    
    class Config:
        populate_by_name = True
