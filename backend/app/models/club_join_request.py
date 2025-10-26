
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

if TYPE_CHECKING:
    from .user import User
    from .book_club import BookClub

class JoinRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ClubJoinRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: JoinRequestStatus = Field(default=JoinRequestStatus.PENDING, index=True)
    
    book_club_id: int = Field(foreign_key="bookclub.id")
    user_id: int = Field(foreign_key="user.id")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    book_club: "BookClub" = Relationship()
    user: "User" = Relationship()
