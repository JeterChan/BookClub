# backend/tests/integration/test_club_membership_api.py
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub, BookClubVisibility

# Helper function to get a valid token
def get_auth_headers(client: TestClient, email: str, password: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    if response.status_code != 200:
        raise Exception(f"Failed to log in for test. Status: {response.status_code}, Detail: {response.text}")
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_join_public_club_success(client: TestClient, session: Session, test_user: User, another_user: User):
    # Create a public club owned by test_user
    public_club = BookClub(name="Public Club", visibility=BookClubVisibility.PUBLIC, owner_id=test_user.id)
    session.add(public_club)
    session.commit()
    session.refresh(public_club)

    # another_user joins the club
    auth_headers = get_auth_headers(client, another_user.email, "TestPassword456")
    response = client.post(f"/api/v1/clubs/{public_club.id}/join", headers=auth_headers)
    assert response.status_code == 204

def test_join_private_club_fail(client: TestClient, session: Session, test_user: User, another_user: User):
    private_club = BookClub(name="Private Club", visibility=BookClubVisibility.PRIVATE, owner_id=test_user.id)
    session.add(private_club)
    session.commit()

    auth_headers = get_auth_headers(client, another_user.email, "TestPassword456")
    response = client.post(f"/api/v1/clubs/{private_club.id}/join", headers=auth_headers)
    assert response.status_code == 400

def test_leave_club_success(client: TestClient, session: Session, test_user: User, another_user: User):
    public_club = BookClub(name="Public Club", visibility=BookClubVisibility.PUBLIC, owner_id=test_user.id)
    session.add(public_club)
    session.commit()
    
    # another_user joins and then leaves
    auth_headers = get_auth_headers(client, another_user.email, "TestPassword456")
    client.post(f"/api/v1/clubs/{public_club.id}/join", headers=auth_headers)
    response = client.delete(f"/api/v1/clubs/{public_club.id}/leave", headers=auth_headers)
    assert response.status_code == 204

def test_request_to_join_private_club_success(client: TestClient, session: Session, test_user: User, another_user: User):
    private_club = BookClub(name="Private Club", visibility=BookClubVisibility.PRIVATE, owner_id=test_user.id)
    session.add(private_club)
    session.commit()

    auth_headers = get_auth_headers(client, another_user.email, "TestPassword456")
    response = client.post(f"/api/v1/clubs/{private_club.id}/request-join", headers=auth_headers)
    assert response.status_code == 201

def test_get_club_detail_membership_status(client: TestClient, session: Session, test_user: User, another_user: User):
    public_club = BookClub(name="Public Club", visibility=BookClubVisibility.PUBLIC, owner_id=test_user.id)
    session.add(public_club)
    session.commit()

    # Unauthenticated
    response = client.get(f"/api/v1/clubs/{public_club.id}")
    assert response.status_code == 200
    assert response.json()["membership_status"] == "not_member"

    # Authenticated non-member
    auth_headers = get_auth_headers(client, another_user.email, "TestPassword456")
    response = client.get(f"/api/v1/clubs/{public_club.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["membership_status"] == "not_member"

    # Authenticated member
    client.post(f"/api/v1/clubs/{public_club.id}/join", headers=auth_headers)
    response = client.get(f"/api/v1/clubs/{public_club.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["membership_status"] == "member"