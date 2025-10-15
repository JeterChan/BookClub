from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

# This import is needed to resolve the forward reference from User
from .user import User 

class BookClubVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

class BookClub(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    visibility: BookClubVisibility = Field(default=BookClubVisibility.PUBLIC, max_length=50)
    
    owner_id: int = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="owned_clubs")
    
    # Relationships
    members: List["BookClubMember"] = Relationship(back_populates="book_club")
    threads: List["DiscussionThread"] = Relationship(back_populates="book_club")