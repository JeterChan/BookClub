import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.notification import Notification, NotificationType
from app.models.user import User


def test_get_notifications_returns_user_notifications(client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    """測試獲取通知列表返回當前用戶的通知"""
    # 創建另一個用戶
    user2 = User(email="user2@test.com", hashed_password="hash", display_name="User 2")
    session.add(user2)
    session.commit()
    
    # 為 test_user_for_auth 創建通知（使用非權限相關的通知類型）
    notif1 = Notification(
        recipient_id=test_user_for_auth.id,
        type=NotificationType.NEW_POST,
        content={"topic_title": "Topic 1", "author_name": "Author 1"}
    )
    notif2 = Notification(
        recipient_id=test_user_for_auth.id,
        type=NotificationType.NEW_POST,
        content={"topic_title": "Topic 2", "author_name": "Author 2"},
        is_read=True
    )
    # 為 user2 創建通知（不應該被返回）
    notif3 = Notification(
        recipient_id=user2.id,
        type=NotificationType.NEW_POST,
        content={"topic_title": "Topic 3", "author_name": "Author 3"}
    )
    
    session.add_all([notif1, notif2, notif3])
    session.commit()
    
    # 獲取通知
    response = client.get("/api/v1/notifications/", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    
    # 應該只返回 test_user_for_auth 的通知
    assert len(data) == 2
    assert all(n['recipient_id'] == test_user_for_auth.id for n in data)


def test_get_notifications_filters_by_read_status(client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    """測試通知列表可以按已讀/未讀狀態篩選"""
    # 創建已讀和未讀通知（使用非權限相關的通知類型）
    notif1 = Notification(
        recipient_id=test_user_for_auth.id,
        type=NotificationType.NEW_POST,
        content={"topic_title": "Topic 1", "author_name": "Author 1"},
        is_read=False
    )
    notif2 = Notification(
        recipient_id=test_user_for_auth.id,
        type=NotificationType.NEW_POST,
        content={"topic_title": "Topic 2", "author_name": "Author 2"},
        is_read=True
    )
    
    session.add_all([notif1, notif2])
    session.commit()
    
    # 只獲取未讀通知
    response = client.get("/api/v1/notifications/?is_read=false", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]['is_read'] == False
    
    # 只獲取已讀通知
    response = client.get("/api/v1/notifications/?is_read=true", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]['is_read'] == True


def test_mark_notification_as_read_success(client: TestClient, session: Session, test_user_for_auth: User, auth_headers: dict):
    """測試成功標記通知為已讀"""
    notif = Notification(
        recipient_id=test_user_for_auth.id,
        type=NotificationType.NEW_MEMBER,
        content={"club_name": "Club 1"},
        is_read=False
    )
    session.add(notif)
    session.commit()
    
    # 標記為已讀
    response = client.post(f"/api/v1/notifications/{notif.id}/read", headers=auth_headers)
    assert response.status_code == 204
    
    # 驗證已更新
    session.refresh(notif)
    assert notif.is_read == True


def test_mark_notification_as_read_wrong_user(client: TestClient, session: Session, auth_headers: dict):
    """測試無法標記其他用戶的通知為已讀"""
    user2 = User(email="user2@test.com", hashed_password="hash", display_name="User 2")
    session.add(user2)
    session.commit()
    
    # 創建屬於 user2 的通知
    notif = Notification(
        recipient_id=user2.id,
        type=NotificationType.NEW_MEMBER,
        content={"club_name": "Club 1"}
    )
    session.add(notif)
    session.commit()
    
    # 嘗試標記為已讀（使用 test_user_for_auth 的 token）
    response = client.post(f"/api/v1/notifications/{notif.id}/read", headers=auth_headers)
    assert response.status_code == 404
