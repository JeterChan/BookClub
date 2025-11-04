# backend/app/services/discussion_service.py
from typing import List
from sqlmodel import Session, select

from app.models.discussion import DiscussionTopic

def get_topics_by_club(*, session: Session, club_id: int) -> List[DiscussionTopic]:
    statement = select(DiscussionTopic).where(DiscussionTopic.club_id == club_id)
    topics = session.exec(statement).all()
    return topics
