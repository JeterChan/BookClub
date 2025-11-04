# backend/tests/integration/test_create_book_club.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_tag import ClubTag
from app.models.user import User


def test_create_public_book_club_success(
    authenticated_client: TestClient,
    session: Session,
    test_user_for_auth: User
):
    """測試認證用戶成功建立公開讀書會"""
    # Arrange: 建立標籤
    tag1 = ClubTag(name="Python", is_predefined=True)
    tag2 = ClubTag(name="程式設計", is_predefined=True)
    session.add_all([tag1, tag2])
    session.commit()
    session.refresh(tag1)
    session.refresh(tag2)
    
    # Act: 發送建立讀書會請求
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "name": "Python 進階讀書會",
            "description": "探討 Python 進階主題",
            "visibility": "public",
            "tag_ids": [tag1.id, tag2.id]
        }
    )
    
    # Assert: 檢查回應
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Python 進階讀書會"
    assert data["description"] == "探討 Python 進階主題"
    assert data["visibility"] == "public"
    assert data["owner_id"] == test_user_for_auth.id
    assert data["member_count"] == 1
    assert len(data["tags"]) == 2
    assert data["owner"]["email"] == test_user_for_auth.email
    
    # Assert: 檢查資料庫狀態
    book_club = session.exec(
        select(BookClub).where(BookClub.id == data["id"])
    ).first()
    assert book_club is not None
    assert book_club.name == "Python 進階讀書會"
    
    # Assert: 檢查自動建立的 member 記錄
    member = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == book_club.id)
        .where(BookClubMember.user_id == test_user_for_auth.id)
    ).first()
    assert member is not None
    assert member.role == MemberRole.OWNER


def test_create_private_book_club_success(
    authenticated_client: TestClient,
    session: Session,
    test_user_for_auth: User
):
    """測試認證用戶成功建立私密讀書會"""
    # Arrange
    tag = ClubTag(name="私密", is_predefined=True)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    # Act
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "name": "私密讀書會",
            "description": "只限邀請加入",
            "visibility": "private",
            "tag_ids": [tag.id]
        }
    )
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["visibility"] == "private"
    assert data["member_count"] == 1


def test_create_book_club_as_owner(
    authenticated_client: TestClient,
    session: Session,
    test_user_for_auth: User
):
    """測試建立者自動成為擁有者"""
    # Arrange
    tag = ClubTag(name="測試", is_predefined=True)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    # Act
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "name": "測試讀書會",
            "description": "測試",
            "visibility": "public",
            "tag_ids": [tag.id]
        }
    )
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    
    # 檢查資料庫中的 member 角色
    member = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == data["id"])
        .where(BookClubMember.user_id == test_user_for_auth.id)
    ).first()
    assert member.role == MemberRole.OWNER


def test_create_book_club_tag_association(
    authenticated_client: TestClient,
    session: Session
):
    """測試標籤關聯正確性"""
    # Arrange
    tags = [
        ClubTag(name="Tag1", is_predefined=True),
        ClubTag(name="Tag2", is_predefined=True),
        ClubTag(name="Tag3", is_predefined=True)
    ]
    session.add_all(tags)
    session.commit()
    for tag in tags:
        session.refresh(tag)
    
    # Act
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "name": "多標籤讀書會",
            "description": "測試多個標籤",
            "visibility": "public",
            "tag_ids": [tags[0].id, tags[2].id]
        }
    )
    
    # Assert
    assert response.status_code == 201
    data = response.json()
    assert len(data["tags"]) == 2
    tag_names = [tag["name"] for tag in data["tags"]]
    assert "Tag1" in tag_names
    assert "Tag3" in tag_names
    assert "Tag2" not in tag_names


def test_create_book_club_unauthenticated(client: TestClient):
    """測試未認證用戶無法建立讀書會 (403)"""
    # Act: 未提供認證 token
    response = client.post(
        "/api/v1/clubs",
        json={
            "name": "測試",
            "description": "測試",
            "visibility": "public",
            "tag_ids": [1]
        }
    )
    
    # Assert
    assert response.status_code == 403


def test_create_book_club_missing_required_fields(
    authenticated_client: TestClient
):
    """測試缺少必填欄位的錯誤回應 (422)"""
    # Act: 缺少 name
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "description": "測試",
            "visibility": "public",
            "tag_ids": [1]
        }
    )
    
    # Assert
    assert response.status_code == 422


def test_create_book_club_invalid_tag_ids(
    authenticated_client: TestClient
):
    """測試使用無效標籤 ID"""
    # Act: 使用不存在的標籤 ID
    response = authenticated_client.post(
        "/api/v1/clubs",
        json={
            "name": "測試讀書會",
            "description": "測試",
            "visibility": "public",
            "tag_ids": [999, 1000]
        }
    )
    
    # Assert
    assert response.status_code == 400
    assert "標籤 ID 無效" in response.json()["detail"]


def test_get_available_tags(client: TestClient, session: Session):
    """測試取得可用標籤列表（公開端點）"""
    # Arrange: 建立一些標籤
    tags = [
        ClubTag(name="文學", is_predefined=True),
        ClubTag(name="科技", is_predefined=True),
        ClubTag(name="自定義", is_predefined=False)
    ]
    session.add_all(tags)
    session.commit()
    
    # Act: 不需認證即可取得標籤
    response = client.get("/api/v1/clubs/tags")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert all("id" in tag for tag in data)
    assert all("name" in tag for tag in data)
    assert all("is_predefined" in tag for tag in data)
