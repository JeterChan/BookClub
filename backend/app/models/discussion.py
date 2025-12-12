from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .book_club import BookClub
    from .user import User

class DiscussionTopicBase(SQLModel):
    title: str
    content: str

class DiscussionTopic(DiscussionTopicBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    club_id: int = Field(foreign_key="bookclub.id")
    owner_id: int = Field(foreign_key="user.id")
    comment_count: int = Field(default=0)
    
    author: User = Relationship(back_populates="threads")
    comments: List["DiscussionComment"] = Relationship(back_populates="topic")
    book_club: "BookClub" = Relationship(back_populates="threads")

class DiscussionCommentBase(SQLModel):
    content: str

class DiscussionComment(DiscussionCommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="discussiontopic.id")
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    owner: User = Relationship(back_populates="posts")
    topic: "DiscussionTopic" = Relationship(back_populates="comments")
