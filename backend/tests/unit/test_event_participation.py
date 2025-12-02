
import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember
from app.models.event import Event, EventStatus, EventParticipant, ParticipantStatus
from app.services.event_service import join_event, leave_event

@pytest.fixture
def setup_participation_data(session: Session):
    """建立測試資料：使用者、讀書會、活動"""
    # 1. 建立使用者 (Organizer & Member)
    organizer = User(email="org@test.com", display_name="Organizer", password_hash="hash")
    member = User(email="member@test.com", display_name="Member", password_hash="hash")
    non_member = User(email="other@test.com", display_name="Other", password_hash="hash")
    session.add(organizer)
    session.add(member)
    session.add(non_member)
    session.commit()
    session.refresh(organizer)
    session.refresh(member)
    session.refresh(non_member)

    # 2. 建立讀書會
    club = BookClub(name="Club", description="Desc", owner_id=organizer.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    # 3. 加入成員
    m1 = BookClubMember(book_club_id=club.id, user_id=organizer.id, role="owner")
    m2 = BookClubMember(book_club_id=club.id, user_id=member.id, role="member")
    session.add(m1)
    session.add(m2)
    session.commit()

    # 4. 建立活動 (未來, Published)
    future_event = Event(
        title="Future Event",
        description="Desc",
        event_datetime=datetime.utcnow() + timedelta(days=1),
        club_id=club.id,
        organizer_id=organizer.id,
        status=EventStatus.PUBLISHED,
        max_participants=2, # 設定上限為 2
        meeting_url="https://meet.google.com/test"
    )
    session.add(future_event)
    session.commit()
    session.refresh(future_event)

    return {
        "club": club,
        "organizer": organizer,
        "member": member,
        "non_member": non_member,
        "future_event": future_event
    }

def test_join_event_success(session: Session, setup_participation_data):
    """測試成功報名活動"""
    member = setup_participation_data["member"]
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    result = join_event(session, member, club.id, event.id)

    assert result.is_participating is True
    assert result.current_participants == 1
    
    # 驗證資料庫記錄
    participation = session.query(EventParticipant).filter_by(
        event_id=event.id, user_id=member.id
    ).first()
    assert participation is not None
    assert participation.status == ParticipantStatus.REGISTERED

def test_join_event_full_fails(session: Session, setup_participation_data):
    """測試額滿時無法報名"""
    member = setup_participation_data["member"]
    organizer = setup_participation_data["organizer"] # 讓 organizer 也報名，佔一個名額
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    # 先讓 organizer 報名 (1/2)
    join_event(session, organizer, club.id, event.id)
    
    # 再讓 member 報名 (2/2) - 應該成功
    join_event(session, member, club.id, event.id)

    # 建立第三個成員嘗試報名 (3/2) - 應該失敗
    user3 = User(email="u3@test.com", display_name="U3", password_hash="hash")
    session.add(user3)
    session.commit()
    session.refresh(user3)
    # 加入讀書會
    session.add(BookClubMember(book_club_id=club.id, user_id=user3.id, role="member"))
    session.commit()

    with pytest.raises(HTTPException) as exc:
        join_event(session, user3, club.id, event.id)
    
    assert exc.value.status_code == 400
    assert "人數已滿" in exc.value.detail

def test_join_event_ended_fails(session: Session, setup_participation_data):
    """測試活動已結束無法報名"""
    member = setup_participation_data["member"]
    club = setup_participation_data["club"]
    organizer = setup_participation_data["organizer"]

    # 建立過去的活動
    past_event = Event(
        title="Past Event",
        description="Desc",
        event_datetime=datetime.utcnow() - timedelta(days=1),
        club_id=club.id,
        organizer_id=organizer.id,
        status=EventStatus.PUBLISHED,
        meeting_url="https://meet.google.com/test"
    )
    session.add(past_event)
    session.commit()
    session.refresh(past_event)

    with pytest.raises(HTTPException) as exc:
        join_event(session, member, club.id, past_event.id)
    
    assert exc.value.status_code == 400
    assert "已結束" in exc.value.detail

def test_join_event_already_joined_fails(session: Session, setup_participation_data):
    """測試重複報名失敗"""
    member = setup_participation_data["member"]
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    # 第一次報名
    join_event(session, member, club.id, event.id)

    # 第二次報名
    with pytest.raises(HTTPException) as exc:
        join_event(session, member, club.id, event.id)
    
    assert exc.value.status_code == 400
    assert "已經參與" in exc.value.detail

def test_join_event_non_member_fails(session: Session, setup_participation_data):
    """測試非讀書會成員無法報名"""
    non_member = setup_participation_data["non_member"]
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    with pytest.raises(HTTPException) as exc:
        join_event(session, non_member, club.id, event.id)
    
    assert exc.value.status_code == 403
    assert "不是此讀書會成員" in exc.value.detail

def test_leave_event_success(session: Session, setup_participation_data):
    """測試成功取消報名"""
    member = setup_participation_data["member"]
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    # 先報名
    join_event(session, member, club.id, event.id)

    # 取消報名
    result = leave_event(session, member, club.id, event.id)

    assert result.is_participating is False
    assert result.current_participants == 0
    
    # 驗證資料庫記錄已刪除
    participation = session.query(EventParticipant).filter_by(
        event_id=event.id, user_id=member.id
    ).first()
    assert participation is None

def test_leave_event_not_joined_fails(session: Session, setup_participation_data):
    """測試未報名無法取消"""
    member = setup_participation_data["member"]
    club = setup_participation_data["club"]
    event = setup_participation_data["future_event"]

    with pytest.raises(HTTPException) as exc:
        leave_event(session, member, club.id, event.id)
    
    assert exc.value.status_code == 400
    assert "尚未參與" in exc.value.detail
