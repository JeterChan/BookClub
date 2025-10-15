from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship

# Import forward references
from .user import User
from .book_club import BookClub

class DiscussionThread(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    
    book_club_id: int = Field(foreign_key="bookclub.id")
    book_club: "BookClub" = Relationship(back_populates="threads")
    
    author_id: int = Field(foreign_key="user.id")
    author: "User" = Relationship(back_populates="threads")
    
    # Relationships
    posts: List["DiscussionPost"] = Relationship(back_populates="thread")

class DiscussionPost(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str = Field(max_length=2000)
    
    thread_id: int = Field(foreign_key="discussionthread.id")
    thread: "DiscussionThread" = Relationship(back_populates="posts")
    
    author_id: int = Field(foreign_key="user.id")
    author: "User" = Relationship(back_populates="posts")