import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User


def test_get_dashboard_authenticated_user_success(authenticated_client: TestClient, test_user_for_auth: User, auth_headers: dict):
    """測試認證用戶成功獲取儀表板（200）"""
    response = authenticated_client.get("/api/users/me/dashboard", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # 驗證回應結構
    assert "stats" in data
    assert "clubs" in data
    assert "recentActivities" in data  # camelCase
    
    # 驗證統計資料（當前階段應為預設值 0）
    assert data["stats"]["clubsCount"] == 0
    assert data["stats"]["booksRead"] == 0
    assert data["stats"]["discussionsCount"] == 0
    
    # 驗證列表為空陣列
    assert data["clubs"] == []
    assert data["recentActivities"] == []


def test_get_dashboard_unauthenticated_user_rejected(client: TestClient):
    """測試未認證用戶拒絕存取（403）"""
    response = client.get("/api/users/me/dashboard")
    
    assert response.status_code == 403


def test_dashboard_response_camelcase_format(authenticated_client: TestClient, test_user_for_auth: User, auth_headers: dict):
    """測試回應格式為 camelCase"""
    response = authenticated_client.get("/api/users/me/dashboard", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # 驗證所有欄位使用 camelCase
    assert "clubsCount" in data["stats"]
    assert "booksRead" in data["stats"]
    assert "discussionsCount" in data["stats"]
    assert "recentActivities" in data
    
    # 確保沒有 snake_case 欄位
    assert "clubs_count" not in data["stats"]
    assert "books_read" not in data["stats"]
    assert "discussions_count" not in data["stats"]
    assert "recent_activities" not in data


def test_dashboard_stats_are_zero_in_epic1(authenticated_client: TestClient, test_user_for_auth: User, auth_headers: dict):
    """測試統計資料為預設值（0）- Epic 1 階段"""
    response = authenticated_client.get("/api/users/me/dashboard", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Epic 1 階段所有統計應為 0
    stats = data["stats"]
    assert stats["clubsCount"] == 0
    assert stats["booksRead"] == 0
    assert stats["discussionsCount"] == 0


def test_dashboard_lists_are_empty_in_epic1(authenticated_client: TestClient, test_user_for_auth: User, auth_headers: dict):
    """測試 clubs 和 activities 為空陣列 - Epic 1 階段"""
    response = authenticated_client.get("/api/users/me/dashboard", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # Epic 1 階段列表應為空
    assert isinstance(data["clubs"], list)
    assert len(data["clubs"]) == 0
    
    assert isinstance(data["recentActivities"], list)
    assert len(data["recentActivities"]) == 0


def test_dashboard_invalid_token_rejected(client: TestClient):
    """測試無效 token 被拒絕"""
    invalid_headers = {"Authorization": "Bearer invalid_token_123"}
    response = client.get("/api/users/me/dashboard", headers=invalid_headers)
    
    assert response.status_code == 401
