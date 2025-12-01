import pytest
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models.user import User
from app.models.book_club import BookClub, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.services.club_management_service import ClubManagementService

# --- Fixtures ---

@pytest.fixture
def club_management_service(session: Session):
    return ClubManagementService(session)

@pytest.fixture
def owner(session: Session) -> User:
    user = User(email="owner@example.com", display_name="Owner", hashed_password="pw", email_verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture
def admin_user(session: Session) -> User:
    user = User(email="admin@example.com", display_name="Admin", hashed_password="pw", email_verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture
def member_user(session: Session) -> User:
    user = User(email="member@example.com", display_name="Member", hashed_password="pw", email_verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture
def requester_user(session: Session) -> User:
    user = User(email="requester@example.com", display_name="Requester", hashed_password="pw", email_verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture
def private_club(session: Session, owner: User) -> BookClub:
    club = BookClub(
        name="Private Club",
        description="Exclusive",
        visibility=BookClubVisibility.PRIVATE,
        owner_id=owner.id
    )
    session.add(club)
    session.flush()
    
    # Add owner membership
    session.add(BookClubMember(book_club_id=club.id, user_id=owner.id, role=MemberRole.OWNER))
    session.commit()
    session.refresh(club)
    return club

@pytest.fixture
def join_request(session: Session, private_club: BookClub, requester_user: User) -> ClubJoinRequest:
    req = ClubJoinRequest(
        book_club_id=private_club.id,
        user_id=requester_user.id,
        status=JoinRequestStatus.PENDING
    )
    session.add(req)
    session.commit()
    session.refresh(req)
    return req

# --- Tests ---

def test_get_join_requests(club_management_service: ClubManagementService, join_request: ClubJoinRequest, private_club: BookClub):
    """Test retrieving pending join requests"""
    requests = club_management_service.get_join_requests(club_id=private_club.id)
    assert len(requests) == 1
    assert requests[0].id == join_request.id
    assert requests[0].user.id == join_request.user_id

def test_approve_join_request_success(session: Session, club_management_service: ClubManagementService, join_request: ClubJoinRequest, private_club: BookClub):
    """Test approving a join request adds member and updates status"""
    club_management_service.approve_join_request(request_id=join_request.id, club_id=private_club.id)
    
    # Verify status updated
    updated_req = session.get(ClubJoinRequest, join_request.id)
    assert updated_req.status == JoinRequestStatus.APPROVED
    
    # Verify member added
    member = session.exec(
        select(BookClubMember).where(
            BookClubMember.book_club_id == private_club.id,
            BookClubMember.user_id == join_request.user_id
        )
    ).first()
    assert member is not None
    assert member.role == MemberRole.MEMBER

def test_approve_join_request_already_member(session: Session, club_management_service: ClubManagementService, join_request: ClubJoinRequest, private_club: BookClub):
    """Test approving request when user is already a member raises conflict"""
    # Manually add user as member first
    session.add(BookClubMember(book_club_id=private_club.id, user_id=join_request.user_id, role=MemberRole.MEMBER))
    session.commit()
    
    with pytest.raises(HTTPException) as exc:
        club_management_service.approve_join_request(request_id=join_request.id, club_id=private_club.id)
    assert exc.value.status_code == 409

def test_reject_join_request_success(session: Session, club_management_service: ClubManagementService, join_request: ClubJoinRequest, private_club: BookClub):
    """Test rejecting a join request"""
    club_management_service.reject_join_request(request_id=join_request.id, club_id=private_club.id)
    
    updated_req = session.get(ClubJoinRequest, join_request.id)
    assert updated_req.status == JoinRequestStatus.REJECTED
    
    # Verify NOT a member
    member = session.exec(
        select(BookClubMember).where(
            BookClubMember.book_club_id == private_club.id,
            BookClubMember.user_id == join_request.user_id
        )
    ).first()
    assert member is None

def test_update_member_role_success(session: Session, club_management_service: ClubManagementService, private_club: BookClub, owner: User, member_user: User):
    """Test owner promoting a member to admin"""
    # Add member
    session.add(BookClubMember(book_club_id=private_club.id, user_id=member_user.id, role=MemberRole.MEMBER))
    session.commit()
    
    updated_member = club_management_service.update_member_role(
        club_id=private_club.id,
        target_user_id=member_user.id,
        new_role=MemberRole.ADMIN,
        acting_user=owner
    )
    
    assert updated_member.role == MemberRole.ADMIN

def test_update_member_role_forbidden_admin_demoting_owner(session: Session, club_management_service: ClubManagementService, private_club: BookClub, owner: User, admin_user: User):
    """Test admin cannot change owner's role"""
    # Add admin
    session.add(BookClubMember(book_club_id=private_club.id, user_id=admin_user.id, role=MemberRole.ADMIN))
    session.commit()
    
    with pytest.raises(HTTPException) as exc:
        club_management_service.update_member_role(
            club_id=private_club.id,
            target_user_id=owner.id,
            new_role=MemberRole.ADMIN,
            acting_user=admin_user
        )
    assert exc.value.status_code == 403

def test_remove_member_success(session: Session, club_management_service: ClubManagementService, private_club: BookClub, owner: User, member_user: User):
    """Test owner removing a member"""
    session.add(BookClubMember(book_club_id=private_club.id, user_id=member_user.id, role=MemberRole.MEMBER))
    session.commit()
    
    club_management_service.remove_member(
        club_id=private_club.id,
        target_user_id=member_user.id,
        acting_user=owner
    )
    
    member = session.exec(
        select(BookClubMember).where(BookClubMember.user_id == member_user.id)
    ).first()
    assert member is None

def test_transfer_ownership_success(session: Session, club_management_service: ClubManagementService, private_club: BookClub, owner: User, admin_user: User):
    """Test transferring ownership"""
    # Add admin (new owner)
    session.add(BookClubMember(book_club_id=private_club.id, user_id=admin_user.id, role=MemberRole.ADMIN))
    session.commit()
    
    club_management_service.transfer_ownership(
        club_id=private_club.id,
        new_owner_id=admin_user.id,
        acting_user=owner
    )
    
    session.refresh(private_club)
    assert private_club.owner_id == admin_user.id
    
    # Verify roles swapped/updated
    old_owner_mem = session.exec(select(BookClubMember).where(BookClubMember.user_id == owner.id)).first()
    new_owner_mem = session.exec(select(BookClubMember).where(BookClubMember.user_id == admin_user.id)).first()
    
    assert old_owner_mem.role == MemberRole.ADMIN
    assert new_owner_mem.role == MemberRole.OWNER

def test_delete_club_cleanup(session: Session, club_management_service: ClubManagementService, private_club: BookClub, owner: User, join_request: ClubJoinRequest):
    """Test deleting club removes dependencies"""
    club_id = private_club.id
    
    # Act
    club_management_service.delete_club(club_id=club_id, current_user=owner)
    
    # Assert Club Gone
    assert session.get(BookClub, club_id) is None
    
    # Assert Join Request Gone
    assert session.get(ClubJoinRequest, join_request.id) is None
    
    # Assert Memberships Gone
    members = session.exec(select(BookClubMember).where(BookClubMember.book_club_id == club_id)).all()
    assert len(members) == 0
