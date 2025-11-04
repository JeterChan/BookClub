from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.event import EventStatus
from app.schemas.pagination import PaginationMeta


class UserEventRead(BaseModel):
    """使用者讀書會活動 Schema"""
    id: int
    title: str
    description: str
    event_datetime: datetime = Field(alias="eventDatetime", serialization_alias="eventDatetime")
    meeting_url: str = Field(alias="meetingUrl", serialization_alias="meetingUrl")
    club_id: int = Field(alias="clubId", serialization_alias="clubId")
    club_name: str = Field(alias="clubName", serialization_alias="clubName")
    club_cover_image_url: Optional[str] = Field(alias="clubCoverImageUrl", serialization_alias="clubCoverImageUrl")
    status: EventStatus
    is_registered: bool = Field(alias="isRegistered", serialization_alias="isRegistered")  # 使用者是否已報名
    is_organizer: bool = Field(alias="isOrganizer", serialization_alias="isOrganizer")   # 使用者是否為主辦人
    current_participants: int = Field(alias="currentParticipants", serialization_alias="currentParticipants")
    max_participants: Optional[int] = Field(alias="maxParticipants", serialization_alias="maxParticipants")
    created_at: datetime = Field(alias="createdAt", serialization_alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class PaginatedUserEventList(BaseModel):
    """分頁使用者活動列表"""
    items: List[UserEventRead]
    pagination: PaginationMeta
