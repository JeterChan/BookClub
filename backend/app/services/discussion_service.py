# backend/app/services/discussion_service.py
from typing import List
from sqlmodel import Session, select

from app.models.discussion import DiscussionTopic, DiscussionComment
from app.schemas.discussion import DiscussionTopicCreate, DiscussionCommentCreate

def get_topics_by_club(*, session: Session, club_id: int) -> List[DiscussionTopic]:
    statement = select(DiscussionTopic).where(DiscussionTopic.club_id == club_id)
    topics = session.exec(statement).all()
    return topics

def create_topic(*, session: Session, club_id: int, owner_id: int, topic_in: DiscussionTopicCreate) -> DiscussionTopic:
    topic = DiscussionTopic.from_orm(topic_in, update={
        "club_id": club_id,
        "owner_id": owner_id
    })
    session.add(topic)
    session.commit()
    session.refresh(topic)
    return topic

def create_comment(*, session: Session, topic_id: int, owner_id: int, comment_in: DiscussionCommentCreate) -> DiscussionComment:
    # Verify topic exists
    topic = session.get(DiscussionTopic, topic_id)
    if not topic:
        return None # Or raise exception, handled by API
    
    comment = DiscussionComment.from_orm(comment_in, update={
        "topic_id": topic_id,
        "owner_id": owner_id
    })
    
    topic.comment_count += 1
    session.add(topic)
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment
