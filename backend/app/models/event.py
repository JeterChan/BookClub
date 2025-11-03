from typing import List, Optional, TYPE_CHECKING, Annotated
from datetime import datetime
from sqlmodel import Field as SQLField, SQLModel, Relationship
from enum import Enum
from pydantic import field_validator, ConfigDict, BaseModel, AliasChoices, Field

if TYPE_CHECKING:
    from .book_club import BookClub
    from .user import User

class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ParticipantStatus(str, Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"

class Event(SQLModel, table=True):
    """活動資料表"""
    id: Optional[int] = SQLField(default=None, primary_key=True)
    club_id: int = SQLField(foreign_key="bookclub.id", index=True)
    title: str = SQLField(max_length=100)
    description: str = SQLField(max_length=2000)
    event_datetime: datetime = SQLField(index=True)
    meeting_url: str = SQLField(max_length=500)
    organizer_id: int = SQLField(foreign_key="user.id")
    max_participants: Optional[int] = SQLField(default=None)
    status: EventStatus = SQLField(default=EventStatus.DRAFT, max_length=20, index=True)
    
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
    updated_at: datetime = SQLField(default_factory=datetime.utcnow)
    
    # Relationships
    book_club: "BookClub" = Relationship(back_populates="events")
    organizer: "User" = Relationship(back_populates="organized_events")
    participants: List["EventParticipant"] = Relationship(back_populates="event")


class EventParticipant(SQLModel, table=True):
    """活動參與者資料表（中間表）"""
    event_id: int = SQLField(foreign_key="event.id", primary_key=True)
    user_id: int = SQLField(foreign_key="user.id", primary_key=True)
    status: ParticipantStatus = SQLField(default=ParticipantStatus.REGISTERED, max_length=20)
    registered_at: datetime = SQLField(default_factory=datetime.utcnow)
    
    # Relationships
    event: Event = Relationship(back_populates="participants")
    user: "User" = Relationship(back_populates="event_participations")


# ===== API Schemas =====

class EventCreate(BaseModel):
    """建立活動請求 schema（使用 camelCase alias）"""
    model_config = ConfigDict(populate_by_name=True)
    
    title: str = Field(max_length=100)
    description: str = Field(max_length=2000)
    event_datetime: Annotated[datetime, Field(validation_alias=AliasChoices('eventDatetime', 'event_datetime'))]
    meeting_url: Annotated[str, Field(max_length=500, validation_alias=AliasChoices('meetingUrl', 'meeting_url'))]
    max_participants: Annotated[Optional[int], Field(default=None, validation_alias=AliasChoices('maxParticipants', 'max_participants'))]
    status: EventStatus = Field(default=EventStatus.DRAFT)
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError('活動名稱為必填')
        if len(v) > 100:
            raise ValueError('活動名稱不能超過 100 個字元')
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError('活動描述為必填')
        if len(v) > 2000:
            raise ValueError('活動描述不能超過 2000 個字元')
        return v.strip()


class EventRead(BaseModel):
    """活動讀取 schema（使用 camelCase alias）"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: int
    club_id: Annotated[int, Field(serialization_alias="clubId", validation_alias=AliasChoices('clubId', 'club_id'))]
    title: str
    description: str
    event_datetime: Annotated[datetime, Field(serialization_alias="eventDatetime", validation_alias=AliasChoices('eventDatetime', 'event_datetime'))]
    meeting_url: Annotated[str, Field(serialization_alias="meetingUrl", validation_alias=AliasChoices('meetingUrl', 'meeting_url'))]
    organizer_id: Annotated[int, Field(serialization_alias="organizerId", validation_alias=AliasChoices('organizerId', 'organizer_id'))]
    max_participants: Annotated[Optional[int], Field(serialization_alias="maxParticipants", validation_alias=AliasChoices('maxParticipants', 'max_participants'))]
    status: EventStatus
    created_at: Annotated[datetime, Field(serialization_alias="createdAt", validation_alias=AliasChoices('createdAt', 'created_at'))]
    updated_at: Annotated[datetime, Field(serialization_alias="updatedAt", validation_alias=AliasChoices('updatedAt', 'updated_at'))]
    
    # 計算欄位：目前報名人數
    participant_count: Annotated[int, Field(default=0, serialization_alias="participantCount", validation_alias=AliasChoices('participantCount', 'participant_count'))]


class EventUpdate(BaseModel):
    """更新活動請求 schema（使用 camelCase alias）"""
    model_config = ConfigDict(populate_by_name=True)
    
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    event_datetime: Annotated[Optional[datetime], Field(default=None, validation_alias=AliasChoices('eventDatetime', 'event_datetime'))]
    meeting_url: Annotated[Optional[str], Field(default=None, max_length=500, validation_alias=AliasChoices('meetingUrl', 'meeting_url'))]
    max_participants: Annotated[Optional[int], Field(default=None, validation_alias=AliasChoices('maxParticipants', 'max_participants'))]
    status: Optional[EventStatus] = None


class OrganizerInfo(BaseModel):
    """發起人資訊"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: int
    display_name: Annotated[str, Field(serialization_alias="displayName", validation_alias=AliasChoices('displayName', 'display_name'))]
    avatar_url: Annotated[Optional[str], Field(serialization_alias="avatarUrl", validation_alias=AliasChoices('avatarUrl', 'avatar_url'))]


class EventListItem(BaseModel):
    """活動列表項目 schema"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: int
    club_id: Annotated[int, Field(serialization_alias="clubId")]
    title: str
    event_datetime: Annotated[datetime, Field(serialization_alias="eventDatetime")]
    current_participants: Annotated[int, Field(serialization_alias="currentParticipants")]
    max_participants: Annotated[Optional[int], Field(serialization_alias="maxParticipants")]
    status: EventStatus
    organizer: OrganizerInfo
    is_organizer: Annotated[bool, Field(serialization_alias="isOrganizer")]
    is_participating: Annotated[bool, Field(serialization_alias="isParticipating")]
    created_at: Annotated[datetime, Field(serialization_alias="createdAt")]


class EventDetail(BaseModel):
    """活動詳細資訊 schema"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: int
    club_id: Annotated[int, Field(serialization_alias="clubId")]
    title: str
    description: str
    event_datetime: Annotated[datetime, Field(serialization_alias="eventDatetime")]
    meeting_url: Annotated[str, Field(serialization_alias="meetingUrl")]
    current_participants: Annotated[int, Field(serialization_alias="currentParticipants")]
    max_participants: Annotated[Optional[int], Field(serialization_alias="maxParticipants")]
    status: EventStatus
    organizer: OrganizerInfo
    is_organizer: Annotated[bool, Field(serialization_alias="isOrganizer")]
    is_participating: Annotated[bool, Field(serialization_alias="isParticipating")]
    created_at: Annotated[datetime, Field(serialization_alias="createdAt")]


class PaginationMetadata(BaseModel):
    """分頁元資料"""
    model_config = ConfigDict(populate_by_name=True)
    
    page: int
    page_size: Annotated[int, Field(serialization_alias="pageSize")]
    total_items: Annotated[int, Field(serialization_alias="totalItems")]
    total_pages: Annotated[int, Field(serialization_alias="totalPages")]


class EventListResponse(BaseModel):
    """活動列表回應 schema"""
    items: List[EventListItem]
    pagination: PaginationMetadata
