# backend/tests/integration/test_interest_tags_api.py
from fastapi.testclient import TestClient
from sqlmodel import Session


def test_get_all_tags(client: TestClient, session: Session):
    """測試獲取所有標籤，包括預設的"""
    from app.models.interest_tag import InterestTag
    session.add(InterestTag(name="Test Tag 1", is_predefined=True))
    session.commit()

    response = client.get("/api/interest-tags")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_custom_tag_api(authenticated_client: TestClient, auth_headers: dict):
    """測試創建自定義標籤的 API"""
    tag_name = "My API Tag"
    response = authenticated_client.post("/api/interest-tags", headers=auth_headers, json={"name": tag_name})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == tag_name
    assert data["is_predefined"] is False

def test_add_and_remove_user_interest_tag_api(authenticated_client: TestClient, auth_headers: dict):
    """測試為用戶新增和移除興趣標籤的完整流程"""
    # 1. Create a new tag to use
    tag_response = authenticated_client.post("/api/interest-tags", headers=auth_headers, json={"name": "Tag for User"})
    assert tag_response.status_code == 201
    tag_id = tag_response.json()["id"]

    # 2. Add the tag to the user
    response_add = authenticated_client.post(
        "/api/users/me/interest-tags", 
        headers=auth_headers, 
        json={"tag_id": tag_id}
    )
    assert response_add.status_code == 200
    tags_list = response_add.json()
    assert any(t["id"] == tag_id for t in tags_list)

    # 3. Verify the tag is in the user's profile
    response_profile = authenticated_client.get("/api/users/me/profile", headers=auth_headers)
    profile_data = response_profile.json()
    assert any(t["id"] == tag_id for t in profile_data["interest_tags"])

    # 4. Remove the tag from the user
    response_delete = authenticated_client.delete(f"/api/users/me/interest-tags/{tag_id}", headers=auth_headers)
    assert response_delete.status_code == 204

    # 5. Verify the tag is no longer in the user's profile
    response_profile_after = authenticated_client.get("/api/users/me/profile", headers=auth_headers)
    profile_data_after = response_profile_after.json()
    assert not any(t["id"] == tag_id for t in profile_data_after["interest_tags"])

def test_create_tag_unauthenticated_fails(client: TestClient):
    """測試未認證用戶無法創建標籤"""
    response = client.post("/api/interest-tags", json={"name": "Unauthorized Tag"})
    assert response.status_code == 403 # Forbidden
