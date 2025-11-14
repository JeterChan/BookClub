# backend/tests/unit/test_book_club_list_service.py
import pytest
from sqlmodel import Session, select
from datetime import datetime

from app.models.book_club import BookClub
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.user import User
from app.services.book_club_service import list_book_clubs, get_book_club_by_id
from fastapi import HTTPException


def test_list_book_clubs_returns_only_public_clubs(session: Session):
    """測試返回所有讀書會（公開和私密都可以瀏覽）"""
    # 建立測試用戶
    user = User(email="test@example.com", hashed_password="hashedpassword", display_name="Test User")
    session.add(user)
    session.commit()
    
    # 建立公開讀書會
    public_club = BookClub(name="Public Club", visibility="public", owner_id=user.id)
    session.add(public_club)
    
    # 建立私密讀書會
    private_club = BookClub(name="Private Club", visibility="private", owner_id=user.id)
    session.add(private_club)
    
    session.commit()
    
    # 測試
    clubs, pagination = list_book_clubs(session, page=1, page_size=20)
    
    # 所有讀書會都應該返回（公開和私密）
    assert len(clubs) == 2
    club_names = [club.name for club in clubs]
    assert "Public Club" in club_names
    assert "Private Club" in club_names


def test_list_book_clubs_keyword_search(session: Session):
    """測試關鍵字搜尋功能"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    club1 = BookClub(name="Python 讀書會", description="Learn Python", visibility="public", owner_id=user.id)
    club2 = BookClub(name="JavaScript 讀書會", description="Learn JS", visibility="public", owner_id=user.id)
    club3 = BookClub(name="Data Science", description="Python for data", visibility="public", owner_id=user.id)
    
    session.add_all([club1, club2, club3])
    session.commit()
    
    # 搜尋 "Python"
    clubs, pagination = list_book_clubs(session, keyword="Python")
    
    assert len(clubs) == 2
    club_names = [c.name for c in clubs]
    assert "Python 讀書會" in club_names
    assert "Data Science" in club_names


def test_list_book_clubs_tag_filter(session: Session):
    """測試標籤篩選功能"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    # 建立標籤
    tag1 = ClubTag(name="Python", is_predefined=True)
    tag2 = ClubTag(name="JavaScript", is_predefined=True)
    session.add_all([tag1, tag2])
    session.commit()
    
    # 建立讀書會
    club1 = BookClub(name="Club 1", visibility="public", owner_id=user.id)
    club2 = BookClub(name="Club 2", visibility="public", owner_id=user.id)
    club3 = BookClub(name="Club 3", visibility="public", owner_id=user.id)
    session.add_all([club1, club2, club3])
    session.commit()
    
    # 關聯標籤
    session.add(BookClubTagLink(book_club_id=club1.id, tag_id=tag1.id))
    session.add(BookClubTagLink(book_club_id=club2.id, tag_id=tag2.id))
    session.add(BookClubTagLink(book_club_id=club3.id, tag_id=tag1.id))
    session.commit()
    
    # 篩選 tag1
    clubs, pagination = list_book_clubs(session, tag_ids=[tag1.id])
    
    assert len(clubs) == 2
    club_names = [c.name for c in clubs]
    assert "Club 1" in club_names
    assert "Club 3" in club_names


def test_list_book_clubs_pagination(session: Session):
    """測試分頁功能"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    # 建立 25 個讀書會
    for i in range(25):
        club = BookClub(name=f"Club {i}", visibility="public", owner_id=user.id)
        session.add(club)
    session.commit()
    
    # 第一頁（每頁 10 個）
    clubs, pagination = list_book_clubs(session, page=1, page_size=10)
    
    assert len(clubs) == 10
    assert pagination["page"] == 1
    assert pagination["page_size"] == 10
    assert pagination["total_items"] == 25
    assert pagination["total_pages"] == 3
    assert pagination["has_next"] is True
    assert pagination["has_previous"] is False
    
    # 第二頁
    clubs, pagination = list_book_clubs(session, page=2, page_size=10)
    
    assert len(clubs) == 10
    assert pagination["has_next"] is True
    assert pagination["has_previous"] is True


def test_list_book_clubs_member_count(session: Session):
    """測試成員數計算"""
    user1 = User(email="user1@example.com", password_hash="hash", display_name="User 1")
    user2 = User(email="user2@example.com", password_hash="hash", display_name="User 2")
    session.add_all([user1, user2])
    session.commit()
    
    club = BookClub(name="Test Club", visibility="public", owner_id=user1.id)
    session.add(club)
    session.commit()
    
    # 新增成員
    session.add(BookClubMember(user_id=user1.id, book_club_id=club.id, role=MemberRole.OWNER))
    session.add(BookClubMember(user_id=user2.id, book_club_id=club.id, role=MemberRole.MEMBER))
    session.commit()
    
    clubs, pagination = list_book_clubs(session)
    
    assert len(clubs) == 1
    assert clubs[0].member_count == 2


def test_get_book_club_by_id_success(session: Session):
    """測試成功獲取讀書會詳細資訊"""
    user = User(email="test@example.com", password_hash="hash", display_name="Test User")
    session.add(user)
    session.commit()
    
    club = BookClub(name="Test Club", description="Test Description", visibility="public", owner_id=user.id)
    session.add(club)
    session.commit()
    
    # 新增成員
    session.add(BookClubMember(user_id=user.id, book_club_id=club.id, role=MemberRole.OWNER))
    session.commit()
    
    result = get_book_club_by_id(session, club.id)
    
    assert result.id == club.id
    assert result.name == "Test Club"
    assert result.description == "Test Description"
    assert result.owner.id == user.id
    assert result.member_count == 1


def test_get_book_club_by_id_not_found(session: Session):
    """測試讀書會不存在時拋出 404 錯誤"""
    with pytest.raises(HTTPException) as exc_info:
        get_book_club_by_id(session, 999)
    
    assert exc_info.value.status_code == 404
    assert "不存在" in exc_info.value.detail


def test_get_book_club_by_id_includes_tags(session: Session):
    """測試返回完整資料包含標籤"""
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
    
    result = get_book_club_by_id(session, club.id)
    
    assert len(result.tags) == 1
    assert result.tags[0].name == "Python"
