from typing import Optional
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from enum import Enum

# Import forward references
from .user import User

class NotificationType(str, Enum):
    NEW_POST = "NEW_POST"
    NEW_MEMBER = "NEW_MEMBER"
    EVENT_CREATED = "EVENT_CREATED"

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: dict = Field(sa_column=Column(JSON))
    type: NotificationType = Field(max_length=50)
    is_read: bool = Field(default=False)
    
    recipient_id: int = Field(foreign_key="user.id")
    recipient: "User" = Relationship(back_populates="notifications")