# backend/tests/unit/test_book_club_service.py
import pytest
from sqlmodel import Session, select
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.user import User
from app.models.book_club import BookClub, BookClubCreate, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_tag import ClubTag
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.services import book_club_service


def test_create_book_club_success(session: Session, test_user: User):
    """測試成功建立讀書會"""
    # Arrange: 建立測試標籤
    tag1 = ClubTag(name="文學", is_predefined=True)
    tag2 = ClubTag(name="科技", is_predefined=True)
    session.add(tag1)
    session.add(tag2)
    session.commit()
    session.refresh(tag1)
    session.refresh(tag2)
    
    book_club_data = BookClubCreate(
        name="Python 讀書會",
        description="一起學習 Python 程式設計",
        visibility=BookClubVisibility.PUBLIC,
        tag_ids=[tag1.id, tag2.id]
    )
    
    # Act: 建立讀書會
    result = book_club_service.create_book_club(
        session=session,
        current_user=test_user,
        book_club_data=book_club_data
    )
    
    # Assert: 驗證結果
    assert result.id is not None
    assert result.name == "Python 讀書會"
    assert result.description == "一起學習 Python 程式設計"
    assert result.visibility == BookClubVisibility.PUBLIC
    assert result.owner_id == test_user.id
    assert result.member_count == 1
    assert len(result.tags) == 2
    assert result.owner.email == test_user.email


def test_create_book_club_with_invalid_tag_ids(session: Session, test_user: User):
    """測試使用無效的標籤 ID 建立讀書會"""
    # Arrange
    book_club_data = BookClubCreate(
        name="測試讀書會",
        description="測試描述",
        visibility=BookClubVisibility.PUBLIC,
        tag_ids=[999, 1000]  # 不存在的標籤 ID
    )
    
    # Act & Assert: 應該拋出 HTTPException
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.create_book_club(
            session=session,
            current_user=test_user,
            book_club_data=book_club_data
        )
    
    assert exc_info.value.status_code == 400
    assert "標籤 ID 無效" in exc_info.value.detail


def test_create_book_club_name_too_long(session: Session, test_user: User):
    """測試名稱過長的驗證"""
    # Arrange: 建立一個標籤
    tag = ClubTag(name="測試", is_predefined=True)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    # Act & Assert: 名稱超過 50 字元應該失敗
    with pytest.raises(ValidationError) as exc_info:
        BookClubCreate(
            name="A" * 51,  # 51 個字元
            description="測試",
            visibility=BookClubVisibility.PUBLIC,
            tag_ids=[tag.id]
        )
    
    assert "at most 50 characters" in str(exc_info.value)


def test_create_book_club_description_too_long(session: Session, test_user: User):
    """測試簡介過長的驗證"""
    # Arrange
    tag = ClubTag(name="測試", is_predefined=True)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    # Act & Assert
    with pytest.raises(ValidationError) as exc_info:
        BookClubCreate(
            name="測試讀書會",
            description="A" * 501,  # 501 個字元
            visibility=BookClubVisibility.PUBLIC,
            tag_ids=[tag.id]
        )
    
    assert "at most 500 characters" in str(exc_info.value)


def test_create_book_club_no_tags(session: Session, test_user: User):
    """測試未選擇標籤的驗證"""
    # Act & Assert
    with pytest.raises(ValidationError) as exc_info:
        BookClubCreate(
            name="測試讀書會",
            description="測試",
            visibility=BookClubVisibility.PUBLIC,
            tag_ids=[]  # 空的標籤列表
        )
    
    assert "at least 1 item" in str(exc_info.value)


def test_get_available_tags(session: Session):
    """測試取得可用標籤列表"""
    # Arrange: 建立一些標籤
    tag1 = ClubTag(name="文學", is_predefined=True)
    tag2 = ClubTag(name="科技", is_predefined=True)
    tag3 = ClubTag(name="自定義標籤", is_predefined=False)
    session.add_all([tag1, tag2, tag3])
    session.commit()
    
    # Act
    tags = book_club_service.get_available_tags(session)
    
    # Assert
    assert len(tags) == 3
    assert all(hasattr(tag, 'id') for tag in tags)
    assert all(hasattr(tag, 'name') for tag in tags)
    assert all(hasattr(tag, 'is_predefined') for tag in tags)


def test_create_private_book_club(session: Session, test_user: User):
    """測試建立私密讀書會"""
    # Arrange
    tag = ClubTag(name="私密", is_predefined=True)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    book_club_data = BookClubCreate(
        name="私密讀書會",
        description="只限邀請",
        visibility=BookClubVisibility.PRIVATE,
        tag_ids=[tag.id]
    )
    
    # Act
    result = book_club_service.create_book_club(
        session=session,
        current_user=test_user,
        book_club_data=book_club_data
    )
    
    # Assert
    assert result.visibility == BookClubVisibility.PRIVATE

# --- New tests for Task 2 --- 

@pytest.fixture
def public_club(session: Session, test_user: User) -> BookClub:
    club = BookClub(name="Public Club", visibility=BookClubVisibility.PUBLIC, owner_id=test_user.id)
    session.add(club)
    session.flush() # Flush to get club.id

    # Add owner as a member
    owner_membership = BookClubMember(book_club_id=club.id, user_id=test_user.id, role=MemberRole.OWNER)
    session.add(owner_membership)
    
    session.commit()
    session.refresh(club)
    return club

@pytest.fixture
def private_club(session: Session, test_user: User) -> BookClub:
    club = BookClub(name="Private Club", visibility=BookClubVisibility.PRIVATE, owner_id=test_user.id)
    session.add(club)
    session.commit()
    session.refresh(club)
    return club

@pytest.fixture
def another_user(session: Session) -> User:
    user = User(email="another@test.com", display_name="Another User", hashed_password="password")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def test_join_public_book_club_success(session: Session, public_club: BookClub, another_user: User):
    book_club_service.join_book_club(session, public_club.id, another_user.id)
    member_record = session.exec(
        select(BookClubMember).where(BookClubMember.book_club_id == public_club.id, BookClubMember.user_id == another_user.id)
    ).first()
    assert member_record is not None
    assert member_record.role == MemberRole.MEMBER

def test_join_private_book_club_fail(session: Session, private_club: BookClub, another_user: User):
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.join_book_club(session, private_club.id, another_user.id)
    assert exc_info.value.status_code == 400

def test_join_already_member_fail(session: Session, public_club: BookClub, another_user: User):
    book_club_service.join_book_club(session, public_club.id, another_user.id)
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.join_book_club(session, public_club.id, another_user.id)
    assert exc_info.value.status_code == 409

def test_leave_book_club_success(session: Session, public_club: BookClub, another_user: User):
    book_club_service.join_book_club(session, public_club.id, another_user.id)
    book_club_service.leave_book_club(session, public_club.id, another_user.id)
    member_record = session.exec(
        select(BookClubMember).where(BookClubMember.book_club_id == public_club.id, BookClubMember.user_id == another_user.id)
    ).first()
    assert member_record is None

def test_leave_not_a_member_fail(session: Session, public_club: BookClub, another_user: User):
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.leave_book_club(session, public_club.id, another_user.id)
    assert exc_info.value.status_code == 404

def test_owner_leave_book_club_fail(session: Session, public_club: BookClub, test_user: User):
    # The test_user is the owner of the public_club fixture
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.leave_book_club(session, public_club.id, test_user.id)
    assert exc_info.value.status_code == 400

def test_request_to_join_private_club_success(session: Session, private_club: BookClub, another_user: User):
    request = book_club_service.request_to_join_book_club(session, private_club.id, another_user.id)
    assert request.book_club_id == private_club.id
    assert request.user_id == another_user.id
    assert request.status == JoinRequestStatus.PENDING

def test_request_to_join_public_club_fail(session: Session, public_club: BookClub, another_user: User):
    with pytest.raises(HTTPException) as exc_info:
        book_club_service.request_to_join_book_club(session, public_club.id, another_user.id)
    assert exc_info.value.status_code == 400

def test_get_book_club_by_id_with_membership_status(session: Session, public_club: BookClub, private_club: BookClub, another_user: User, test_user: User):
    # Not a member
    club_details = book_club_service.get_book_club_by_id(session, public_club.id, another_user)
    assert club_details.membership_status == "not_member"

    # Is a member
    book_club_service.join_book_club(session, public_club.id, another_user.id)
    club_details_member = book_club_service.get_book_club_by_id(session, public_club.id, another_user)
    assert club_details_member.membership_status == "member"

    # Pending request
    book_club_service.request_to_join_book_club(session, private_club.id, another_user.id)
    club_details_pending = book_club_service.get_book_club_by_id(session, private_club.id, another_user)
    assert club_details_pending.membership_status == "pending_request"

    # Is owner
    club_details_owner = book_club_service.get_book_club_by_id(session, public_club.id, test_user)
    assert club_details_owner.membership_status == "member" # Owner is also a member
