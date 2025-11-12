import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.event import EventCreate, EventStatus
from app.services.event_service import (
    create_event,
    validate_event_datetime,
    validate_meeting_url
)


class TestValidateEventDatetime:
    """測試活動時間驗證"""
    
    def test_future_datetime_valid(self):
        """測試未來時間驗證通過"""
        future_time = datetime.utcnow() + timedelta(days=1)
        # 不應該拋出異常
        validate_event_datetime(future_time)
    
    def test_past_datetime_invalid(self):
        """測試過去時間驗證失敗"""
        past_time = datetime.utcnow() - timedelta(days=1)
        with pytest.raises(HTTPException) as exc_info:
            validate_event_datetime(past_time)
        assert exc_info.value.status_code == 400
        assert "未來時間" in exc_info.value.detail
    
    def test_current_datetime_invalid(self):
        """測試當前時間驗證失敗"""
        current_time = datetime.utcnow()
        with pytest.raises(HTTPException) as exc_info:
            validate_event_datetime(current_time)
        assert exc_info.value.status_code == 400


class TestValidateMeetingUrl:
    """測試會議 URL 驗證"""
    
    def test_valid_https_google_meet(self):
        """測試有效的 Google Meet URL"""
        url = "https://meet.google.com/abc-defg-hij"
        validate_meeting_url(url)
    
    def test_valid_https_zoom(self):
        """測試有效的 Zoom URL"""
        url = "https://zoom.us/j/1234567890"
        validate_meeting_url(url)
    
    def test_valid_https_teams(self):
        """測試有效的 Teams URL"""
        url = "https://teams.microsoft.com/l/meetup-join/xxx"
        validate_meeting_url(url)
    
    def test_invalid_http_url(self):
        """測試 HTTP URL 驗證失敗"""
        url = "http://meet.google.com/abc-defg-hij"
        with pytest.raises(HTTPException) as exc_info:
            validate_meeting_url(url)
        assert exc_info.value.status_code == 400
        assert "HTTPS" in exc_info.value.detail
    
    def test_invalid_url_format(self):
        """測試無效 URL 格式驗證失敗"""
        url = "not-a-url"
        with pytest.raises(HTTPException) as exc_info:
            validate_meeting_url(url)
        assert exc_info.value.status_code == 400
        assert "格式無效" in exc_info.value.detail


class TestCreateEvent:
    """測試建立活動功能"""
    
    @pytest.fixture
    def test_club(self, session: Session, test_user: User) -> BookClub:
        """建立測試讀書會"""
        club = BookClub(
            name="測試讀書會",
            description="測試用讀書會",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user.id
        )
        session.add(club)
        session.commit()
        session.refresh(club)
        return club
    
    @pytest.fixture
    def member_user(self, session: Session, test_club: BookClub) -> User:
        """建立測試用讀書會管理員"""
        user = User(
            email="admin@test.com",
            display_name="Admin User",
            password_hash="hashed"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        # 加入讀書會並設為管理員
        membership = BookClubMember(
            book_club_id=test_club.id,
            user_id=user.id,
            role=MemberRole.ADMIN
        )
        session.add(membership)
        session.commit()
        
        return user
    
    def test_create_event_success(
        self, session: Session, test_club: BookClub, member_user: User
    ):
        """測試管理員成功建立活動"""
        event_data = EventCreate(
            title="測試活動",
            description="這是一個測試活動",
            event_datetime=datetime.utcnow() + timedelta(days=7),
            meeting_url="https://meet.google.com/test-meet",
            max_participants=10,
            status=EventStatus.DRAFT
        )
        
        result = create_event(
            session=session,
            current_user=member_user,
            club_id=test_club.id,
            event_data=event_data
        )
        
        assert result.title == "測試活動"
        assert result.club_id == test_club.id
        assert result.organizer_id == member_user.id
        assert result.status == EventStatus.DRAFT
        assert result.participant_count == 0
    
    def test_create_event_non_member_fails(
        self, session: Session, test_club: BookClub, test_user: User
    ):
        """測試非成員無法建立活動"""
        event_data = EventCreate(
            title="測試活動",
            description="這是一個測試活動",
            event_datetime=datetime.utcnow() + timedelta(days=7),
            meeting_url="https://meet.google.com/test-meet",
            status=EventStatus.DRAFT
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_event(
                session=session,
                current_user=test_user,
                club_id=test_club.id,
                event_data=event_data
            )
        
        assert exc_info.value.status_code == 403
        assert "成員" in exc_info.value.detail
    
    def test_create_event_regular_member_fails(
        self, session: Session, test_club: BookClub
    ):
        """測試普通成員無法建立活動"""
        # 創建普通成員
        regular_user = User(
            email="regular@test.com",
            display_name="Regular Member",
            password_hash="hashed"
        )
        session.add(regular_user)
        session.commit()
        session.refresh(regular_user)
        
        # 加入讀書會但只是普通成員
        membership = BookClubMember(
            book_club_id=test_club.id,
            user_id=regular_user.id,
            role=MemberRole.MEMBER
        )
        session.add(membership)
        session.commit()
        
        event_data = EventCreate(
            title="測試活動",
            description="這是一個測試活動",
            event_datetime=datetime.utcnow() + timedelta(days=7),
            meeting_url="https://meet.google.com/test-meet",
            status=EventStatus.DRAFT
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_event(
                session=session,
                current_user=regular_user,
                club_id=test_club.id,
                event_data=event_data
            )
        
        assert exc_info.value.status_code == 403
        assert "管理員" in exc_info.value.detail
    
    def test_create_event_past_datetime_fails(
        self, session: Session, test_club: BookClub, member_user: User
    ):
        """測試過去時間無法建立活動"""
        event_data = EventCreate(
            title="測試活動",
            description="這是一個測試活動",
            event_datetime=datetime.utcnow() - timedelta(days=1),
            meeting_url="https://meet.google.com/test-meet",
            status=EventStatus.DRAFT
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_event(
                session=session,
                current_user=member_user,
                club_id=test_club.id,
                event_data=event_data
            )
        
        assert exc_info.value.status_code == 400
        assert "未來時間" in exc_info.value.detail
    
    def test_create_event_invalid_url_fails(
        self, session: Session, test_club: BookClub, member_user: User
    ):
        """測試無效 URL 無法建立活動"""
        event_data = EventCreate(
            title="測試活動",
            description="這是一個測試活動",
            event_datetime=datetime.utcnow() + timedelta(days=7),
            meeting_url="http://insecure-url.com",
            status=EventStatus.DRAFT
        )
        
        with pytest.raises(HTTPException) as exc_info:
            create_event(
                session=session,
                current_user=member_user,
                club_id=test_club.id,
                event_data=event_data
            )
        
        assert exc_info.value.status_code == 400
        assert "HTTPS" in exc_info.value.detail
