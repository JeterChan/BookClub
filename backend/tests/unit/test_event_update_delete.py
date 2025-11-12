import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.event import Event, EventStatus, EventParticipant, ParticipantStatus


@pytest.fixture
def test_club(session: Session, test_user_for_auth: User) -> BookClub:
    """創建測試讀書會"""
    club = BookClub(
        name="測試讀書會",
        description="測試用",
        owner_id=test_user_for_auth.id
    )
    session.add(club)
    session.commit()
    session.refresh(club)
    
    # 添加成員關係
    member = BookClubMember(
        user_id=test_user_for_auth.id,
        book_club_id=club.id,
        role=MemberRole.OWNER
    )
    session.add(member)
    session.commit()
    
    return club


@pytest.fixture
def test_event(session: Session, test_club: BookClub, test_user_for_auth: User) -> Event:
    """創建測試活動"""
    future_time = datetime.now(timezone.utc) + timedelta(days=7)
    event = Event(
        club_id=test_club.id,
        title="測試活動",
        description="測試活動描述",
        event_datetime=future_time,
        meeting_url="https://meet.google.com/test",
        organizer_id=test_user_for_auth.id,
        status=EventStatus.PUBLISHED
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


def test_update_event_success(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event,
    auth_headers: dict
):
    """測試成功更新活動"""
    future_time = datetime.now(timezone.utc) + timedelta(days=10)
    update_data = {
        "title": "更新後的標題",
        "description": "更新後的描述",
        "eventDatetime": future_time.isoformat(),
        "meetingUrl": "https://zoom.us/updated",
        "maxParticipants": 50
    }
    
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        json=update_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "更新後的標題"
    assert data["description"] == "更新後的描述"
    assert data["meetingUrl"] == "https://zoom.us/updated"
    assert data["maxParticipants"] == 50


def test_update_event_partial_update(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event,
    auth_headers: dict
):
    """測試部分更新活動"""
    update_data = {
        "title": "只更新標題"
    }
    
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        json=update_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "只更新標題"
    assert data["description"] == "測試活動描述"  # 保持原值


def test_update_event_not_organizer(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event
):
    """測試非發起人且非管理員無法更新活動"""
    # 創建另一個用戶（普通成員）
    other_user = User(
        email="other@test.com",
        display_name="Other User",
        password_hash="hash"
    )
    session.add(other_user)
    session.commit()
    
    # 將其加入讀書會（普通成員）
    member = BookClubMember(
        user_id=other_user.id,
        book_club_id=test_club.id,
        role=MemberRole.MEMBER
    )
    session.add(member)
    session.commit()
    
    # 使用其他用戶登入
    from app.core.security import create_access_token
    token = create_access_token({"sub": other_user.email})
    headers = {"Authorization": f"Bearer {token}"}
    
    update_data = {"title": "試圖更新"}
    
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 403
    assert "管理員" in response.json()["detail"]


def test_update_event_by_admin(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event
):
    """測試讀書會管理員可以更新活動"""
    # 創建管理員用戶
    admin_user = User(
        email="update_admin@test.com",
        display_name="Update Admin",
        password_hash="hash"
    )
    session.add(admin_user)
    session.commit()
    
    # 將其設為管理員
    member = BookClubMember(
        user_id=admin_user.id,
        book_club_id=test_club.id,
        role=MemberRole.ADMIN
    )
    session.add(member)
    session.commit()
    
    # 使用管理員登入
    from app.core.security import create_access_token
    token = create_access_token({"sub": admin_user.email})
    headers = {"Authorization": f"Bearer {token}"}
    
    update_data = {"title": "管理員更新的標題"}
    
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "管理員更新的標題"


def test_update_event_max_participants_below_current(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event,
    test_user_for_auth: User,
    auth_headers: dict
):
    """測試人數上限不能小於目前報名人數"""
    # 添加一些參與者
    for i in range(3):
        user = User(
            email=f"participant{i}@test.com",
            display_name=f"Participant {i}",
            password_hash="hash"
        )
        session.add(user)
        session.flush()
        
        participant = EventParticipant(
            event_id=test_event.id,
            user_id=user.id,
            status=ParticipantStatus.REGISTERED
        )
        session.add(participant)
    
    session.commit()
    
    # 嘗試將人數上限設為小於報名人數
    update_data = {"maxParticipants": 2}
    
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        json=update_data,
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert "人數上限不能小於目前報名人數" in response.json()["detail"]


def test_delete_event_success(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event,
    auth_headers: dict
):
    """測試成功刪除活動"""
    response = client.delete(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # 確認活動已被刪除
    deleted_event = session.get(Event, test_event.id)
    assert deleted_event is None


def test_delete_event_by_admin(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event
):
    """測試讀書會管理員可以刪除活動"""
    # 創建管理員用戶
    admin_user = User(
        email="admin@test.com",
        display_name="Admin User",
        password_hash="hash"
    )
    session.add(admin_user)
    session.commit()
    
    # 將其設為管理員
    member = BookClubMember(
        user_id=admin_user.id,
        book_club_id=test_club.id,
        role=MemberRole.ADMIN
    )
    session.add(member)
    session.commit()
    
    # 使用管理員登入
    from app.core.security import create_access_token
    token = create_access_token({"sub": admin_user.email})
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.delete(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        headers=headers
    )
    
    assert response.status_code == 204


def test_delete_event_not_authorized(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_event: Event
):
    """測試普通成員無法刪除活動"""
    # 創建普通成員
    member_user = User(
        email="member@test.com",
        display_name="Member User",
        password_hash="hash"
    )
    session.add(member_user)
    session.commit()
    
    # 將其加入讀書會
    member = BookClubMember(
        user_id=member_user.id,
        book_club_id=test_club.id,
        role=MemberRole.MEMBER
    )
    session.add(member)
    session.commit()
    
    # 使用普通成員登入
    from app.core.security import create_access_token
    token = create_access_token({"sub": member_user.email})
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.delete(
        f"/api/v1/clubs/{test_club.id}/events/{test_event.id}",
        headers=headers
    )
    
    assert response.status_code == 403
    assert "只有活動發起人或讀書會管理員可以刪除活動" in response.json()["detail"]


def test_delete_past_event(
    client: TestClient,
    session: Session,
    test_club: BookClub,
    test_user_for_auth: User,
    auth_headers: dict
):
    """測試無法刪除已過期的活動"""
    # 創建已過期的活動
    past_time = datetime.now(timezone.utc) - timedelta(days=1)
    past_event = Event(
        club_id=test_club.id,
        title="過期活動",
        description="已過期",
        event_datetime=past_time,
        meeting_url="https://meet.google.com/past",
        organizer_id=test_user_for_auth.id,
        status=EventStatus.COMPLETED
    )
    session.add(past_event)
    session.commit()
    session.refresh(past_event)
    
    response = client.delete(
        f"/api/v1/clubs/{test_club.id}/events/{past_event.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 400
    assert "活動已開始或結束，無法刪除" in response.json()["detail"]
