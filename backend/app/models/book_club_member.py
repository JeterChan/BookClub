from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

# Import forward references
from .user import User
from .book_club import BookClub

class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"

class MembershipStatus(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    PENDING_REQUEST = "pending_request"
    NOT_MEMBER = "not_member"

class BookClubMember(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)
    book_club_id: Optional[int] = Field(default=None, foreign_key="bookclub.id", primary_key=True)
    role: MemberRole = Field(default=MemberRole.MEMBER, max_length=50)

    # Relationships
    user: "User" = Relationship(back_populates="memberships")
    book_club: "BookClub" = Relationship(back_populates="members")