from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User


@patch('app.services.email_service.EmailService.send_verification_email')
def test_registration_sends_verification_email(mock_send_email, client: TestClient, session: Session):
    """測試註冊新用戶時，系統會發送驗證郵件"""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "Test1234", "display_name": "Test User"}
    )
    assert response.status_code == 201
    assert "註冊成功，請至信箱查收驗證信" in response.json()["message"]
    
    # 驗證郵件發送函數被呼叫
    mock_send_email.assert_called_once()
    
    # 驗證資料庫中的用戶狀態
    user = session.query(User).filter(User.email == "test@example.com").first()
    assert user is not None
    assert not user.email_verified
    assert user.email_verification_token is not None


def test_unverified_user_cannot_login(client: TestClient, session: Session):
    """測試未驗證的用戶無法登入"""
    # 先註冊一個用戶，但不驗證
    client.post(
        "/api/v1/auth/register",
        json={"email": "unverified@example.com", "password": "Test1234", "display_name": "Unverified"}
    )
    
    # 嘗試登入
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "unverified@example.com", "password": "Test1234"}
    )
    
    assert response.status_code == 403
    assert "請先完成 Email 驗證" in response.json()["detail"]


@patch('app.services.email_service.EmailService.send_verification_email')
def test_verify_email_and_login(mock_send_email, client: TestClient, session: Session):
    """測試完整的 email 驗證流程，並成功登入"""
    # 1. 註冊
    client.post(
        "/api/v1/auth/register",
        json={"email": "verify_me@example.com", "password": "Test1234", "display_name": "To Be Verified"}
    )
    
    # 2. 從資料庫獲取驗證 token
    user = session.query(User).filter(User.email == "verify_me@example.com").first()
    assert user is not None
    token = user.email_verification_token
    assert token is not None

    # 3. 進行驗證
    response = client.get(f"/api/v1/auth/verify-email?token={token}")
    assert response.status_code == 200
    assert "Email 驗證成功" in response.json()["message"]

    # 驗證後，用戶狀態應更新
    session.refresh(user)
    assert user.email_verified
    assert user.email_verification_token is None

    # 4. 嘗試登入
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "verify_me@example.com", "password": "Test1234"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
