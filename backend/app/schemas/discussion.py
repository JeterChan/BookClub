from typing import List, Optional
from sqlmodel import SQLModel
from app.models.user import UserRead

# Base properties for a comment
class DiscussionCommentBase(SQLModel):
    content: str

# Schema for creating a new comment
class DiscussionCommentCreate(DiscussionCommentBase):
    pass

# Schema for reading a comment, includes id and owner info
class DiscussionCommentRead(DiscussionCommentBase):
    id: int
    owner_id: int
    author: Optional[UserRead] = None

# Base properties for a discussion topic
class DiscussionTopicBase(SQLModel):
    title: str
    content: str

# Schema for creating a new topic
class DiscussionTopicCreate(DiscussionTopicBase):
    pass

# Schema for reading a topic, includes id and owner info
class DiscussionTopicRead(DiscussionTopicBase):
    id: int
    owner_id: int
    author: Optional[UserRead] = None
    comment_count: int

# Schema for reading a topic with all its comments
class DiscussionTopicReadWithComments(DiscussionTopicRead):
    comments: List[DiscussionCommentRead] = []
