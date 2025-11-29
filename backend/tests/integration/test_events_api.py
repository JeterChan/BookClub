import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.event import EventStatus


class TestCreateEventAPI:
    """測試建立活動 API 端點"""
    
    @pytest.fixture
    def test_club(self, session: Session, test_user_for_auth: User) -> BookClub:
        """建立測試讀書會"""
        club = BookClub(
            name="測試讀書會",
            description="測試用讀書會",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user_for_auth.id
        )
        session.add(club)
        session.commit()
        session.refresh(club)
        
        # 讓建立者自動成為成員
        membership = BookClubMember(
            book_club_id=club.id,
            user_id=test_user_for_auth.id,
            role=MemberRole.OWNER
        )
        session.add(membership)
        session.commit()
        
        return club
    
    def test_create_event_success(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試成功建立活動"""
        event_data = {
            "title": "週末讀書會",
            "description": "討論《人類大歷史》第一章",
            "eventDatetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "meetingUrl": "https://meet.google.com/abc-defg-hij",
            "maxParticipants": 20,
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "週末讀書會"
        assert data["clubId"] == test_club.id
        assert data["status"] == "draft"
        assert data["participantCount"] == 0
        assert "id" in data
        assert "organizerId" in data
    
    def test_create_event_published_status(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試建立已發布的活動"""
        event_data = {
            "title": "緊急討論會",
            "description": "重要議題討論",
            "eventDatetime": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "meetingUrl": "https://zoom.us/j/1234567890",
            "status": "published"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "published"
    
    def test_create_event_without_max_participants(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試建立沒有人數上限的活動"""
        event_data = {
            "title": "開放討論會",
            "description": "歡迎所有人參加",
            "eventDatetime": (datetime.utcnow() + timedelta(days=5)).isoformat(),
            "meetingUrl": "https://teams.microsoft.com/l/meetup-join/xxx",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["maxParticipants"] is None
    
    def test_create_event_past_datetime_fails(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試過去時間建立活動失敗"""
        event_data = {
            "title": "過去的活動",
            "description": "這個活動時間已過",
            "eventDatetime": (datetime.utcnow() - timedelta(days=1)).isoformat(),
            "meetingUrl": "https://meet.google.com/test",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 400
        assert "未來時間" in response.json()["detail"]
    
    def test_create_event_invalid_url_fails(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試無效 URL 建立活動失敗"""
        event_data = {
            "title": "測試活動",
            "description": "使用不安全的 URL",
            "eventDatetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "meetingUrl": "http://insecure-url.com",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 400
        assert "HTTPS" in response.json()["detail"]
    
    def test_create_event_non_member_fails(
        self, session: Session, authenticated_client: TestClient, test_user: User
    ):
        """測試非成員無法建立活動"""
        # 建立另一個讀書會，當前用戶不是成員
        other_club = BookClub(
            name="其他讀書會",
            description="測試用",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user.id
        )
        session.add(other_club)
        session.commit()
        session.refresh(other_club)
        
        event_data = {
            "title": "測試活動",
            "description": "不應該成功",
            "eventDatetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "meetingUrl": "https://meet.google.com/test",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{other_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 403
        assert "成員" in response.json()["detail"]
    
    def test_create_event_invalid_title_length(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試標題長度驗證"""
        event_data = {
            "title": "a" * 101,  # 超過 100 字元
            "description": "測試描述",
            "eventDatetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "meetingUrl": "https://meet.google.com/test",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 422 or response.status_code == 400
    
    def test_create_event_invalid_description_length(
        self, authenticated_client: TestClient, test_club: BookClub
    ):
        """測試描述長度驗證"""
        event_data = {
            "title": "測試活動",
            "description": "a" * 2001,  # 超過 2000 字元
            "eventDatetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "meetingUrl": "https://meet.google.com/test",
            "status": "draft"
        }
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club.id}/events",
            json=event_data
        )
        
        assert response.status_code == 422 or response.status_code == 400


class TestListEventsAPI:
    """測試查詢活動列表 API 端點"""
    
    @pytest.fixture
    def test_club_with_events(
        self, session: Session, test_user_for_auth: User
    ) -> BookClub:
        """建立包含多個活動的測試讀書會"""
        club = BookClub(
            name="活動測試讀書會",
            description="用於測試活動列表",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user_for_auth.id
        )
        session.add(club)
        session.commit()
        session.refresh(club)
        
        # 建立成員關係
        membership = BookClubMember(
            book_club_id=club.id,
            user_id=test_user_for_auth.id,
            role=MemberRole.OWNER
        )
        session.add(membership)
        session.commit()
        
        # 建立多個活動（不同狀態）
        from app.models.event import Event
        
        events_data = [
            {
                "title": "未來活動 1",
                "description": "即將舉行",
                "event_datetime": datetime.utcnow() + timedelta(days=7),
                "status": EventStatus.PUBLISHED
            },
            {
                "title": "未來活動 2",
                "description": "即將舉行",
                "event_datetime": datetime.utcnow() + timedelta(days=14),
                "status": EventStatus.PUBLISHED
            },
            {
                "title": "過去活動",
                "description": "已結束",
                "event_datetime": datetime.utcnow() - timedelta(days=7),
                "status": EventStatus.COMPLETED
            },
            {
                "title": "草稿活動",
                "description": "未發布",
                "event_datetime": datetime.utcnow() + timedelta(days=5),
                "status": EventStatus.DRAFT
            },
        ]
        
        for event_data in events_data:
            event = Event(
                club_id=club.id,
                title=event_data["title"],
                description=event_data["description"],
                event_datetime=event_data["event_datetime"],
                meeting_url="https://meet.google.com/test",
                organizer_id=test_user_for_auth.id,
                status=event_data["status"]
            )
            session.add(event)
        
        session.commit()
        return club
    
    def test_list_events_success(
        self, authenticated_client: TestClient, test_club_with_events: BookClub
    ):
        """測試成功查詢活動列表"""
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 檢查回應結構
        assert "items" in data
        assert "pagination" in data
        
        # 預設只顯示 published 狀態
        items = data["items"]
        assert len(items) == 2  # 只有 2 個 published 活動
        
        # 檢查活動資料結構
        assert "id" in items[0]
        assert "clubId" in items[0]
        assert "title" in items[0]
        assert "eventDatetime" in items[0]
        assert "currentParticipants" in items[0]
        assert "maxParticipants" in items[0]
        assert "status" in items[0]
        assert "organizer" in items[0]
        assert "isOrganizer" in items[0]
        assert "isParticipating" in items[0]
        assert "createdAt" in items[0]
        
        # 檢查 organizer 結構
        organizer = items[0]["organizer"]
        assert "id" in organizer
        assert "displayName" in organizer
        assert "avatarUrl" in organizer
    
    def test_list_events_with_status_filter(
        self, authenticated_client: TestClient, test_club_with_events: BookClub
    ):
        """測試狀態篩選"""
        # 查詢 completed 狀態
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?status=completed"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "completed"
        
        # 查詢 draft 狀態
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?status=draft"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "draft"
    
    def test_list_events_pagination(
        self, session: Session, authenticated_client: TestClient, test_club_with_events: BookClub, test_user_for_auth: User
    ):
        """測試分頁功能"""
        # 建立更多活動以測試分頁
        from app.models.event import Event
        
        for i in range(25):
            event = Event(
                club_id=test_club_with_events.id,
                title=f"分頁測試活動 {i}",
                description="測試",
                event_datetime=datetime.utcnow() + timedelta(days=i+1),
                meeting_url="https://meet.google.com/test",
                organizer_id=test_user_for_auth.id,
                status=EventStatus.PUBLISHED
            )
            session.add(event)
        session.commit()
        
        # 測試第一頁
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?page=1&page_size=10"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["pageSize"] == 10
        assert data["pagination"]["totalItems"] >= 25
        assert data["pagination"]["totalPages"] >= 3
        
        # 測試第二頁
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?page=2&page_size=10"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["pagination"]["page"] == 2
    
    def test_list_events_sorting(
        self, authenticated_client: TestClient, test_club_with_events: BookClub
    ):
        """測試排序功能"""
        # 升序排序
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?sort_by=event_datetime&order=asc"
        )
        
        assert response.status_code == 200
        data = response.json()
        items = data["items"]
        
        if len(items) >= 2:
            # 檢查時間是升序
            first_time = datetime.fromisoformat(items[0]["eventDatetime"].replace('Z', '+00:00'))
            second_time = datetime.fromisoformat(items[1]["eventDatetime"].replace('Z', '+00:00'))
            assert first_time <= second_time
        
        # 降序排序
        response = authenticated_client.get(
            f"/api/v1/clubs/{test_club_with_events.id}/events?sort_by=event_datetime&order=desc"
        )
        
        assert response.status_code == 200
        data = response.json()
        items = data["items"]
        
        if len(items) >= 2:
            # 檢查時間是降序
            first_time = datetime.fromisoformat(items[0]["eventDatetime"].replace('Z', '+00:00'))
            second_time = datetime.fromisoformat(items[1]["eventDatetime"].replace('Z', '+00:00'))
            assert first_time >= second_time
    
    def test_list_events_non_member_fails(
        self, session: Session, authenticated_client: TestClient, test_user: User
    ):
        """測試非成員無法查看活動列表"""
        # 建立一個用戶不是成員的讀書會
        other_club = BookClub(
            name="私密讀書會",
            description="測試用",
            visibility=BookClubVisibility.PRIVATE,
            owner_id=test_user.id
        )
        session.add(other_club)
        session.commit()
        session.refresh(other_club)
        
        response = authenticated_client.get(
            f"/api/v1/clubs/{other_club.id}/events"
        )
        
        assert response.status_code == 403
        assert "成員" in response.json()["detail"]
    
    def test_list_events_empty(
        self, session: Session, authenticated_client: TestClient, test_user_for_auth: User
    ):
        """測試空活動列表"""
        # 建立沒有活動的讀書會
        empty_club = BookClub(
            name="空讀書會",
            description="沒有活動",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user_for_auth.id
        )
        session.add(empty_club)
        session.commit()
        session.refresh(empty_club)
        
        # 建立成員關係
        membership = BookClubMember(
            book_club_id=empty_club.id,
            user_id=test_user_for_auth.id,
            role=MemberRole.OWNER
        )
        session.add(membership)
        session.commit()
        
        response = authenticated_client.get(
            f"/api/v1/clubs/{empty_club.id}/events"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["pagination"]["totalItems"] == 0
        assert data["pagination"]["totalPages"] == 0


class TestJoinLeaveEventAPI:
    """測試加入與退出活動 API 端點"""

    @pytest.fixture
    def test_club_and_event(
        self, session: Session, test_user_for_auth: User
    ):
        """建立測試讀書會與活動"""
        # 1. 建立讀書會
        club = BookClub(
            name="活動測試讀書會",
            description="用於測試加入退出",
            visibility=BookClubVisibility.PUBLIC,
            owner_id=test_user_for_auth.id
        )
        session.add(club)
        session.commit()
        session.refresh(club)
        
        # 2. 建立成員關係 (Owner)
        membership = BookClubMember(
            book_club_id=club.id,
            user_id=test_user_for_auth.id,
            role=MemberRole.OWNER
        )
        session.add(membership)
        
        # 3. 建立活動 (未來, Published)
        from app.models.event import Event
        event = Event(
            club_id=club.id,
            title="未來活動",
            description="即將舉行",
            event_datetime=datetime.utcnow() + timedelta(days=7),
            meeting_url="https://meet.google.com/test",
            organizer_id=test_user_for_auth.id,
            status=EventStatus.PUBLISHED,
            max_participants=10
        )
        session.add(event)
        session.commit()
        session.refresh(event)
        
        return {"club": club, "event": event}

    def test_join_event_success(
        self, authenticated_client: TestClient, test_club_and_event: dict, test_user_for_auth: User, session: Session
    ):
        """測試成功加入活動"""
        # 建立另一個使用者作為參加者
        participant_user = User(email="joiner@test.com", display_name="Joiner", password_hash="hash")
        session.add(participant_user)
        session.commit()
        session.refresh(participant_user)
        
        # 加入讀書會
        session.add(BookClubMember(book_club_id=test_club_and_event["club"].id, user_id=participant_user.id, role="member"))
        session.commit()
        
        # 產生新的 token 給參加者
        from app.core.security import create_access_token
        token = create_access_token(data={"sub": participant_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{test_club_and_event['club'].id}/events/{test_club_and_event['event'].id}/join",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["isParticipating"] is True
        # 因為 owner 沒有參加，只有 joiner 參加，所以人數為 1
        assert data["currentParticipants"] == 1

    def test_join_event_already_joined(
        self, authenticated_client: TestClient, test_club_and_event: dict
    ):
        """測試重複加入活動失敗"""
        # 先加入一次
        club_id = test_club_and_event["club"].id
        event_id = test_club_and_event["event"].id
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{club_id}/events/{event_id}/join"
        )
        assert response.status_code == 200
        
        # 再加入一次
        response = authenticated_client.post(
            f"/api/v1/clubs/{club_id}/events/{event_id}/join"
        )
        assert response.status_code == 400
        assert "已經參與" in response.json()["detail"]

    def test_leave_event_success(
        self, authenticated_client: TestClient, test_club_and_event: dict
    ):
        """測試成功退出活動"""
        club_id = test_club_and_event["club"].id
        event_id = test_club_and_event["event"].id
        
        # 先加入
        authenticated_client.post(
            f"/api/v1/clubs/{club_id}/events/{event_id}/join"
        )
        
        # 退出
        response = authenticated_client.post(
            f"/api/v1/clubs/{club_id}/events/{event_id}/leave"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["isParticipating"] is False
        assert data["currentParticipants"] == 0

    def test_leave_event_not_joined(
        self, authenticated_client: TestClient, test_club_and_event: dict
    ):
        """測試未加入時退出失敗"""
        club_id = test_club_and_event["club"].id
        event_id = test_club_and_event["event"].id
        
        response = authenticated_client.post(
            f"/api/v1/clubs/{club_id}/events/{event_id}/leave"
        )
        
        assert response.status_code == 400
        assert "尚未參與" in response.json()["detail"]
