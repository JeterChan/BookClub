# backend/tests/integration/test_profile_api.py
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User


import base64

VALID_PNG_BYTES = base64.b64decode(b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')

def test_get_my_profile(authenticated_client: TestClient, auth_headers: dict):
    """測試成功獲取個人檔案"""
    response = authenticated_client.get("/api/users/me/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert "interest_tags" in data
    assert isinstance(data["interest_tags"], list)

def test_update_my_profile(authenticated_client: TestClient, auth_headers: dict):
    """測試成功更新個人檔案"""
    update_data = {"display_name": "Integration Test Name", "bio": "Bio from test."}
    response = authenticated_client.put("/api/users/me/profile", headers=auth_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == update_data["display_name"]
    assert data["bio"] == update_data["bio"]

def test_upload_avatar_api(authenticated_client: TestClient, auth_headers: dict):
    """測試頭像上傳 API"""
    # Create a dummy file for upload
    files = {"file": ("test_avatar.png", VALID_PNG_BYTES, "image/png")}
    
    response = authenticated_client.post("/api/users/me/avatar", headers=auth_headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert "avatar_url" in data
    assert data["avatar_url"].startswith("/uploads/avatars/")

    # Clean up the created file
    avatar_path = data["avatar_url"].lstrip("/")
    import os
    if os.path.exists(avatar_path):
        os.remove(avatar_path)

def test_get_profile_unauthenticated_fails(client: TestClient):
    """測試未認證用戶無法獲取檔案"""
    response = client.get("/api/users/me/profile")
    assert response.status_code == 403 # Forbidden
