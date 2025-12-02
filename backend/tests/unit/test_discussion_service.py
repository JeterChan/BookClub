
from sqlmodel import Session
from app.services.discussion_service import create_topic, create_comment, get_topics_by_club
from app.schemas.discussion import DiscussionTopicCreate, DiscussionCommentCreate
from app.models.user import User
from app.models.book_club import BookClub

def test_create_topic(session: Session, test_user: User):
    # Setup
    club = BookClub(name="Service Test Club", description="Desc", owner_id=test_user.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    topic_in = DiscussionTopicCreate(title="Service Topic", content="Content")
    
    # Execute
    topic = create_topic(session=session, club_id=club.id, owner_id=test_user.id, topic_in=topic_in)

    # Verify
    assert topic.id is not None
    assert topic.title == "Service Topic"
    assert topic.owner_id == test_user.id
    assert topic.club_id == club.id

def test_create_reply(session: Session, test_user: User):
    # Setup
    club = BookClub(name="Service Test Club 2", description="Desc", owner_id=test_user.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    topic_in = DiscussionTopicCreate(title="Topic for Reply", content="Content")
    topic = create_topic(session=session, club_id=club.id, owner_id=test_user.id, topic_in=topic_in)

    comment_in = DiscussionCommentCreate(content="Service Reply")

    # Execute
    comment = create_comment(session=session, topic_id=topic.id, owner_id=test_user.id, comment_in=comment_in)

    # Verify
    assert comment.id is not None
    assert comment.content == "Service Reply"
    assert comment.topic_id == topic.id
    assert comment.owner_id == test_user.id

def test_get_topics_by_club(session: Session, test_user: User):
    # Setup
    club = BookClub(name="Service Test Club 3", description="Desc", owner_id=test_user.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    create_topic(session=session, club_id=club.id, owner_id=test_user.id, topic_in=DiscussionTopicCreate(title="T1", content="C1"))
    create_topic(session=session, club_id=club.id, owner_id=test_user.id, topic_in=DiscussionTopicCreate(title="T2", content="C2"))

    # Execute
    topics = get_topics_by_club(session=session, club_id=club.id)

    # Verify
    assert len(topics) == 2
    assert topics[0].title == "T1"
    assert topics[1].title == "T2"
