from typing import List, Optional
from sqlmodel import SQLModel
from pydantic import Field
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
    author: Optional[UserRead] = Field(default=None, validation_alias="owner", serialization_alias="author")
    
    class Config:
        populate_by_name = True
        from_attributes = True

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
    author: Optional[UserRead] = Field(default=None, validation_alias="author", serialization_alias="author")
    comment_count: int
    
    class Config:
        populate_by_name = True
        from_attributes = True

# Schema for reading a topic with all its comments
class DiscussionTopicReadWithComments(DiscussionTopicRead):
    comments: List[DiscussionCommentRead] = []
