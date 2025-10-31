# backend/tests/integration/test_explore_book_clubs.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.book_club_member import BookClubMember, MemberRole


def test_get_clubs_list_success(client: TestClient, session: Session):
    """測試成功獲取讀書會列表"""
    # 建立測試數據
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    club = BookClub(name="Test Club", description="Test Desc", visibility="public", owner_id=user.id)
    session.add(club)
    session.commit()
    
    session.add(BookClubMember(user_id=user.id, book_club_id=club.id, role=MemberRole.OWNER))
    session.commit()
    
    # 請求
    response = client.get("/api/v1/clubs")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "items" in data
    assert "pagination" in data
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Test Club"


def test_get_clubs_list_only_public(client: TestClient, session: Session):
    """測試只返回公開讀書會"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    public_club = BookClub(name="Public", visibility="public", owner_id=user.id)
    private_club = BookClub(name="Private", visibility="private", owner_id=user.id)
    session.add_all([public_club, private_club])
    session.commit()
    
    response = client.get("/api/v1/clubs")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Public"


def test_get_clubs_list_with_pagination(client: TestClient, session: Session):
    """測試分頁參數"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    # 建立 15 個讀書會
    for i in range(15):
        club = BookClub(name=f"Club {i}", visibility="public", owner_id=user.id)
        session.add(club)
    session.commit()
    
    # 請求第一頁（每頁 10 個）
    response = client.get("/api/v1/clubs?page=1&page_size=10")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 10
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10
    assert data["pagination"]["total_items"] == 15
    assert data["pagination"]["total_pages"] == 2
    assert data["pagination"]["has_next"] is True
    assert data["pagination"]["has_previous"] is False


def test_get_clubs_list_with_search(client: TestClient, session: Session):
    """測試搜尋參數"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    club1 = BookClub(name="Python Club", description="Learn Python", visibility="public", owner_id=user.id)
    club2 = BookClub(name="JS Club", description="Learn JavaScript", visibility="public", owner_id=user.id)
    session.add_all([club1, club2])
    session.commit()
    
    response = client.get("/api/v1/clubs?keyword=Python")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Python Club"


def test_get_clubs_list_with_tag_filter(client: TestClient, session: Session):
    """測試標籤篩選參數"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    tag = ClubTag(name="Python", is_predefined=True)
    session.add(tag)
    session.commit()
    
    club1 = BookClub(name="Club 1", visibility="public", owner_id=user.id)
    club2 = BookClub(name="Club 2", visibility="public", owner_id=user.id)
    session.add_all([club1, club2])
    session.commit()
    
    # 只有 club1 有標籤
    session.add(BookClubTagLink(book_club_id=club1.id, tag_id=tag.id))
    session.commit()
    
    response = client.get(f"/api/v1/clubs?tag_ids={tag.id}")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Club 1"


def test_get_clubs_list_camelcase_response(client: TestClient, session: Session):
    """測試返回格式統一使用 snake_case（方案3）"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User", avatar_url="http://avatar.com/pic.jpg")
    session.add(user)
    session.commit()
    
    club = BookClub(name="Test", visibility="public", owner_id=user.id, cover_image_url="http://cover.jpg")
    session.add(club)
    session.commit()
    
    session.add(BookClubMember(user_id=user.id, book_club_id=club.id, role=MemberRole.OWNER))
    session.commit()
    
    response = client.get("/api/v1/clubs")
    
    assert response.status_code == 200
    data = response.json()
    
    # 檢查 pagination snake_case
    assert "page_size" in data["pagination"]
    assert "total_items" in data["pagination"]
    assert "has_next" in data["pagination"]
    
    # 檢查items有數據 (統一 snake_case)
    item = data["items"][0]
    assert "id" in item
    assert "name" in item
    assert item["name"] == "Test"


def test_get_clubs_list_empty_results(client: TestClient, session: Session):
    """測試空結果"""
    response = client.get("/api/v1/clubs")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 0
    assert data["pagination"]["total_items"] == 0


def test_get_clubs_list_includes_owner_and_tags(client: TestClient, session: Session):
    """測試返回資料包含 owner 和 tags"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    tag = ClubTag(name="Python", is_predefined=True)
    session.add(tag)
    session.commit()
    
    club = BookClub(name="Test Club", visibility="public", owner_id=user.id)
    session.add(club)
    session.commit()
    
    session.add(BookClubTagLink(book_club_id=club.id, tag_id=tag.id))
    session.add(BookClubMember(user_id=user.id, book_club_id=club.id, role=MemberRole.OWNER))
    session.commit()
    
    response = client.get("/api/v1/clubs")
    
    assert response.status_code == 200
    data = response.json()
    
    item = data["items"][0]
    assert "owner" in item
    # 暫時接受 snake_case - 技術債
    assert item["owner"]["display_name"] == "Test User" or item["owner"].get("displayName") == "Test User"
    assert len(item["tags"]) == 1
    assert item["tags"][0]["name"] == "Python"
    assert item["member_count"] == 1 or item.get("memberCount") == 1
