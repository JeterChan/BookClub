from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.user import User
from app.models.discussion import DiscussionTopic, DiscussionComment
from app.schemas.discussion import (
    DiscussionTopicRead, DiscussionTopicCreate, DiscussionTopicReadWithComments,
    DiscussionCommentCreate, DiscussionCommentRead
)
from app.models.book_club_member import BookClubMember
from app.core.security import get_current_user, get_club_member
from app.services import discussion_service

router = APIRouter()

@router.get("/{club_id}/discussions", response_model=List[DiscussionTopicRead])
def get_discussion_topics(
    *, 
    db: Session = Depends(get_session),
    club_id: int,
    current_user: User = Depends(get_current_user),
    member: BookClubMember = Depends(get_club_member)
):
    """獲取讀書會的所有討論主題"""
    topics = db.exec(select(DiscussionTopic).where(DiscussionTopic.club_id == club_id).options(selectinload(DiscussionTopic.author))).all()
    return topics

@router.post("/{club_id}/discussions", response_model=DiscussionTopicRead)
def create_discussion_topic(
    *, 
    db: Session = Depends(get_session),
    club_id: int,
    topic_in: DiscussionTopicCreate,
    current_user: User = Depends(get_current_user),
    member: BookClubMember = Depends(get_club_member)
):
    """建立新的討論主題"""
    return discussion_service.create_topic(
        session=db,
        club_id=club_id,
        owner_id=current_user.id,
        topic_in=topic_in
    )

@router.get("/{club_id}/discussions/{topic_id}", response_model=DiscussionTopicReadWithComments)
def get_discussion_topic(
    *, 
    db: Session = Depends(get_session),
    club_id: int,
    topic_id: int,
    current_user: User = Depends(get_current_user),
    member: BookClubMember = Depends(get_club_member)
):
    """獲取單一主題及其所有回覆"""
    topic = db.exec(
        select(DiscussionTopic)
        .where(DiscussionTopic.id == topic_id)
        .options(
            selectinload(DiscussionTopic.author),
            selectinload(DiscussionTopic.comments).selectinload(DiscussionComment.owner)
        )
    ).first()
    
    if not topic or topic.club_id != club_id:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@router.post("/{club_id}/discussions/{topic_id}/comments", response_model=DiscussionCommentRead)
def create_discussion_comment(
    *, 
    db: Session = Depends(get_session),
    club_id: int,
    topic_id: int,
    comment_in: DiscussionCommentCreate,
    current_user: User = Depends(get_current_user),
    member: BookClubMember = Depends(get_club_member)
):
    """對主題發表回覆"""
    topic = db.get(DiscussionTopic, topic_id)
    if not topic or topic.club_id != club_id:
        raise HTTPException(status_code=404, detail="Topic not found")

    comment = discussion_service.create_comment(
        session=db,
        topic_id=topic_id,
        owner_id=current_user.id,
        comment_in=comment_in
    )
    
    # 重新載入 comment 以包含 owner 關聯資料
    comment = db.exec(
        select(DiscussionComment)
        .where(DiscussionComment.id == comment.id)
        .options(selectinload(DiscussionComment.owner))
    ).first()
    
    return comment
