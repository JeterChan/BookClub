# backend/tests/integration/test_club_management_api.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus

# Helper to get auth headers
def get_auth_headers(client: TestClient, email: str, password: str = "TestPassword123") -> dict:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(name="club_owner")
def club_owner_fixture(session: Session) -> User:
    from app.core.security import hash_password
    user = User(email="owner@example.com", display_name="Club Owner", password_hash=hash_password("TestPassword123"), email_verified=True)
    session.add(user)
    session.commit()
    return user

@pytest.fixture(name="club_admin")
def club_admin_fixture(session: Session) -> User:
    from app.core.security import hash_password
    user = User(email="admin@example.com", display_name="Club Admin", password_hash=hash_password("TestPassword123"), email_verified=True)
    session.add(user)
    session.commit()
    return user

@pytest.fixture(name="club_member")
def club_member_fixture(session: Session) -> User:
    from app.core.security import hash_password
    user = User(email="member@example.com", display_name="Club Member", password_hash=hash_password("TestPassword123"), email_verified=True)
    session.add(user)
    session.commit()
    return user

@pytest.fixture(name="requester")
def requester_fixture(session: Session) -> User:
    from app.core.security import hash_password
    user = User(email="requester@example.com", display_name="Join Requester", password_hash=hash_password("TestPassword123"), email_verified=True)
    session.add(user)
    session.commit()
    return user

@pytest.fixture(name="test_club")
def test_club_fixture(session: Session, club_owner: User, club_admin: User, club_member: User) -> BookClub:
    club = BookClub(name="Managed Club", visibility=BookClubVisibility.PRIVATE, owner_id=club_owner.id)
    session.add(club)
    session.commit()

    session.add(BookClubMember(book_club_id=club.id, user_id=club_owner.id, role=MemberRole.OWNER))
    session.add(BookClubMember(book_club_id=club.id, user_id=club_admin.id, role=MemberRole.ADMIN))
    session.add(BookClubMember(book_club_id=club.id, user_id=club_member.id, role=MemberRole.MEMBER))
    session.commit()
    session.refresh(club)
    return club

@pytest.fixture(name="join_request")
def join_request_fixture(session: Session, test_club: BookClub, requester: User) -> ClubJoinRequest:
    request = ClubJoinRequest(book_club_id=test_club.id, user_id=requester.id, status=JoinRequestStatus.PENDING)
    session.add(request)
    session.commit()
    session.refresh(request)
    return request


def test_owner_can_see_join_requests(client: TestClient, test_club: BookClub, club_owner: User, join_request: ClubJoinRequest):
    headers = get_auth_headers(client, club_owner.email)
    response = client.get(f"/api/v1/clubs/{test_club.id}/join-requests", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == join_request.id

def test_admin_can_approve_join_request(client: TestClient, test_club: BookClub, club_admin: User, join_request: ClubJoinRequest):
    headers = get_auth_headers(client, club_admin.email)
    response = client.post(f"/api/v1/clubs/{test_club.id}/join-requests/{join_request.id}/approve", headers=headers)
    assert response.status_code == 204

def test_member_cannot_see_join_requests(client: TestClient, test_club: BookClub, club_member: User):
    headers = get_auth_headers(client, club_member.email)
    response = client.get(f"/api/v1/clubs/{test_club.id}/join-requests", headers=headers)
    assert response.status_code == 403

def test_owner_can_promote_member_to_admin(client: TestClient, test_club: BookClub, club_owner: User, club_member: User):
    headers = get_auth_headers(client, club_owner.email)
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/members/{club_member.id}/role",
        headers=headers,
        json={"role": "admin"}
    )
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_admin_cannot_promote_member_to_admin(client: TestClient, test_club: BookClub, club_admin: User, club_member: User):
    headers = get_auth_headers(client, club_admin.email)
    response = client.put(
        f"/api/v1/clubs/{test_club.id}/members/{club_member.id}/role",
        headers=headers,
        json={"role": "admin"}
    )
    assert response.status_code == 403

def test_admin_can_remove_member(client: TestClient, test_club: BookClub, club_admin: User, club_member: User):
    headers = get_auth_headers(client, club_admin.email)
    response = client.delete(f"/api/v1/clubs/{test_club.id}/members/{club_member.id}", headers=headers)
    assert response.status_code == 204

def test_admin_cannot_remove_owner(client: TestClient, test_club: BookClub, club_admin: User, club_owner: User):
    headers = get_auth_headers(client, club_admin.email)
    response = client.delete(f"/api/v1/clubs/{test_club.id}/members/{club_owner.id}", headers=headers)
    assert response.status_code == 403

def test_owner_can_transfer_ownership(client: TestClient, test_club: BookClub, club_owner: User, club_admin: User):
    headers = get_auth_headers(client, club_owner.email)
    response = client.post(
        f"/api/v1/clubs/{test_club.id}/transfer-ownership",
        headers=headers,
        json={"new_owner_id": club_admin.id}
    )
    assert response.status_code == 204

def test_owner_can_delete_club(client: TestClient, test_club: BookClub, club_owner: User):
    headers = get_auth_headers(client, club_owner.email)
    response = client.delete(f"/api/v1/clubs/{test_club.id}", headers=headers)
    assert response.status_code == 204

def test_admin_cannot_delete_club(client: TestClient, test_club: BookClub, club_admin: User):
    headers = get_auth_headers(client, club_admin.email)
    response = client.delete(f"/api/v1/clubs/{test_club.id}", headers=headers)
    assert response.status_code == 403

def test_member_cannot_delete_club(client: TestClient, test_club: BookClub, club_member: User):
    headers = get_auth_headers(client, club_member.email)
    response = client.delete(f"/api/v1/clubs/{test_club.id}", headers=headers)
    assert response.status_code == 403
