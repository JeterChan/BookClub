from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember, MemberRole


def test_create_discussion_topic(authenticated_client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    club = BookClub(name="Test Club", description="Test Description", owner_id=test_user_for_auth.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    member = BookClubMember(book_club=club, user_id=test_user_for_auth.id, role=MemberRole.MEMBER)
    session.add(member)
    session.commit()

    response = authenticated_client.post(
        f"/api/v1/clubs/{club.id}/discussions",
        headers=auth_headers,
        json={"title": "Test Topic", "content": "Test Content"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Topic"
    assert data["content"] == "Test Content"
    assert data["owner_id"] == test_user_for_auth.id


def test_get_discussion_topics(authenticated_client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    club = BookClub(name="Test Club", description="Test Description", owner_id=test_user_for_auth.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    member = BookClubMember(book_club=club, user_id=test_user_for_auth.id, role=MemberRole.MEMBER)
    session.add(member)
    session.commit()

    authenticated_client.post(
        f"/api/v1/clubs/{club.id}/discussions",
        headers=auth_headers,
        json={"title": "Test Topic", "content": "Test Content"},
    )

    response = authenticated_client.get(f"/api/v1/clubs/{club.id}/discussions", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Topic"


def test_get_discussion_topic(authenticated_client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    club = BookClub(name="Test Club", description="Test Description", owner_id=test_user_for_auth.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    member = BookClubMember(book_club=club, user_id=test_user_for_auth.id, role=MemberRole.MEMBER)
    session.add(member)
    session.commit()

    topic_res = authenticated_client.post(
        f"/api/v1/clubs/{club.id}/discussions",
        headers=auth_headers,
        json={"title": "Test Topic", "content": "Test Content"},
    )
    topic_id = topic_res.json()["id"]

    response = authenticated_client.get(f"/api/v1/clubs/{club.id}/discussions/{topic_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Topic"
    assert data["comments"] == []


def test_create_discussion_comment(authenticated_client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    club = BookClub(name="Test Club", description="Test Description", owner_id=test_user_for_auth.id)
    session.add(club)
    session.commit()
    session.refresh(club)

    member = BookClubMember(book_club=club, user_id=test_user_for_auth.id, role=MemberRole.MEMBER)
    session.add(member)
    session.commit()

    topic_res = authenticated_client.post(
        f"/api/v1/clubs/{club.id}/discussions",
        headers=auth_headers,
        json={"title": "Test Topic", "content": "Test Content"},
    )
    topic_id = topic_res.json()["id"]

    response = authenticated_client.post(
        f"/api/v1/clubs/{club.id}/discussions/{topic_id}/comments",
        headers=auth_headers,
        json={"content": "Test Comment"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test Comment"
    assert data["owner_id"] == test_user_for_auth.id