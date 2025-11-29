
import pytest
from datetime import datetime, timedelta
from sqlmodel import Session

from app.services.user_event_service import get_user_club_events
from app.models.user import User
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember
from app.models.event import Event, EventParticipant, EventStatus

@pytest.fixture
def setup_data(session: Session):
    """建立測試資料：使用者、讀書會、活動、參與記錄"""
    # 1. 建立使用者
    user = User(email="user@example.com", display_name="User", password_hash="hash")
    session.add(user)
    session.commit()
    session.refresh(user)

    # 2. 建立讀書會
    club1 = BookClub(name="Club 1", description="Desc 1", owner_id=user.id)
    club2 = BookClub(name="Club 2", description="Desc 2", owner_id=user.id)
    session.add(club1)
    session.add(club2)
    session.commit()
    session.refresh(club1)
    session.refresh(club2)

    # 3. 使用者加入 Club 1，但不加入 Club 2
    member = BookClubMember(book_club_id=club1.id, user_id=user.id, role="member")
    session.add(member)
    session.commit()

    # 4. 建立活動
    # Event 1 in Club 1 (使用者已加入讀書會) - 狀態: published
    event1 = Event(
        title="Event 1",
        description="Desc",
        event_datetime=datetime.utcnow() + timedelta(days=1),
        club_id=club1.id,
        organizer_id=user.id,
        status=EventStatus.PUBLISHED,
        max_participants=10,
        meeting_url="http://meet.example.com/1"
    )
    # Event 2 in Club 1 - 狀態: cancelled
    event2 = Event(
        title="Event 2",
        description="Desc",
        event_datetime=datetime.utcnow() + timedelta(days=2),
        club_id=club1.id,
        organizer_id=user.id,
        status=EventStatus.CANCELLED,
        max_participants=10,
        meeting_url="http://meet.example.com/2"
    )
    # Event 3 in Club 2 (使用者未加入讀書會)
    event3 = Event(
        title="Event 3",
        description="Desc",
        event_datetime=datetime.utcnow() + timedelta(days=3),
        club_id=club2.id,
        organizer_id=user.id,
        status=EventStatus.PUBLISHED,
        max_participants=10,
        meeting_url="http://meet.example.com/3"
    )
    session.add(event1)
    session.add(event2)
    session.add(event3)
    session.commit()
    session.refresh(event1)
    session.refresh(event2)

    # 5. 使用者報名 Event 1
    participant = EventParticipant(event_id=event1.id, user_id=user.id, status="registered")
    session.add(participant)
    session.commit()

    return {
        "user": user,
        "club1": club1,
        "club2": club2,
        "event1": event1,
        "event2": event2,
        "event3": event3
    }

def test_get_user_club_events_basic(session: Session, setup_data):
    """測試基本查詢：應只返回已加入讀書會的活動"""
    user = setup_data["user"]
    events, pagination = get_user_club_events(session, user_id=user.id)

    # 應該只看到 Club 1 的活動 (event1, event2)，不應看到 Club 2 的 event3
    assert len(events) == 2
    event_ids = [e.id for e in events]
    assert setup_data["event1"].id in event_ids
    assert setup_data["event2"].id in event_ids
    assert setup_data["event3"].id not in event_ids
    
    # 驗證分頁 meta
    assert pagination.total_items == 2
    assert pagination.page == 1

def test_get_user_club_events_filter_status(session: Session, setup_data):
    """測試狀態篩選"""
    user = setup_data["user"]
    events, _ = get_user_club_events(session, user_id=user.id, status=EventStatus.PUBLISHED)

    # 應只返回 published 的活動 (event1)
    assert len(events) == 1
    assert events[0].id == setup_data["event1"].id

def test_get_user_club_events_filter_participation_registered(session: Session, setup_data):
    """測試參與狀態篩選：已報名"""
    user = setup_data["user"]
    events, _ = get_user_club_events(session, user_id=user.id, participation="registered")

    # 應只返回已報名的活動 (event1)
    assert len(events) == 1
    assert events[0].id == setup_data["event1"].id
    assert events[0].is_registered is True

def test_get_user_club_events_filter_participation_not_registered(session: Session, setup_data):
    """測試參與狀態篩選：未報名"""
    user = setup_data["user"]
    events, _ = get_user_club_events(session, user_id=user.id, participation="not_registered")

    # 應只返回未報名的活動 (event2)
    assert len(events) == 1
    assert events[0].id == setup_data["event2"].id
    assert events[0].is_registered is False

def test_get_user_club_events_check_fields(session: Session, setup_data):
    """測試返回欄位的正確性"""
    user = setup_data["user"]
    events, _ = get_user_club_events(session, user_id=user.id, status=EventStatus.PUBLISHED)
    
    event_dto = events[0]
    assert event_dto.club_name == "Club 1"
    assert event_dto.current_participants == 1 # 因為 user 報名了
    assert event_dto.is_organizer is True # 因為 user 是 organizer

def test_get_user_club_events_pagination(session: Session, setup_data):
    """測試分頁"""
    user = setup_data["user"]
    # 每頁 1 筆，取第 1 頁
    events, meta = get_user_club_events(session, user_id=user.id, page=1, page_size=1)
    assert len(events) == 1
    assert meta.total_items == 2
    assert meta.total_pages == 2
    assert meta.has_next is True

    # 取第 2 頁
    events_p2, meta_p2 = get_user_club_events(session, user_id=user.id, page=2, page_size=1)
    assert len(events_p2) == 1
    assert meta_p2.has_next is False
    assert events[0].id != events_p2[0].id
