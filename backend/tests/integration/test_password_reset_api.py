# backend/tests/integration/test_password_reset_api.py
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.services.user_service import UserService
from app.services.password_reset_service import PasswordResetService
from app.models.user import UserCreate
from app.models.password_reset import PasswordResetToken


@pytest.fixture(name="verified_user")
def verified_user_fixture(session: Session):
    """創建已驗證的測試用戶"""
    user_data = UserCreate(
        email="reset-test@example.com",
        password="OldPassword123",
        display_name="Reset Test User"
    )
    user_service = UserService(session)
    user = user_service.create(user_data)
    user.email_verified = True
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


class TestForgotPasswordAPI:
    """忘記密碼 API 整合測試"""

    def test_forgot_password_existing_user(self, client: TestClient, verified_user):
        """測試為存在的用戶請求密碼重置"""
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": verified_user.email}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "如果該 email 已註冊" in data["message"]

    def test_forgot_password_nonexistent_user(self, client: TestClient):
        """測試為不存在的用戶請求密碼重置 (應返回相同訊息)"""
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "nonexistent@example.com"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "如果該 email 已註冊" in data["message"]

    def test_forgot_password_invalid_email_format(self, client: TestClient):
        """測試無效的 email 格式"""
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "not-an-email"}
        )
        
        # Pydantic 的 EmailStr 會驗證格式，但如果沒有使用 EmailStr 則會返回 200
        # 為了安全性，即使格式錯誤也返回成功訊息
        assert response.status_code in [200, 422]

    def test_forgot_password_rate_limiting(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試速率限制"""
        # 發送 3 次請求 (應該成功)
        for i in range(3):
            response = client.post(
                "/api/v1/auth/forgot-password",
                json={"email": verified_user.email}
            )
            assert response.status_code == 200

        # 第 4 次請求應該返回 429 (速率限制)
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": verified_user.email}
        )
        assert response.status_code == 429
        assert "請求過多次" in response.json()["detail"]


class TestVerifyResetTokenAPI:
    """驗證重置 Token API 整合測試"""

    def test_verify_valid_token(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試驗證有效的 token"""
        # 創建一個 reset token
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        response = client.get(
            f"/api/v1/auth/verify-reset-token?token={token}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["email"] == verified_user.email

    def test_verify_invalid_token(self, client: TestClient):
        """測試驗證無效的 token"""
        response = client.get(
            "/api/v1/auth/verify-reset-token?token=invalid-token-123"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["email"] is None

    def test_verify_expired_token(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試驗證過期的 token"""
        # 創建一個過期的 token
        token_str = PasswordResetService.generate_reset_token()
        expired_token = PasswordResetToken(
            user_id=verified_user.id,
            token=token_str,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2),
            used=False,
            ip_address="192.168.1.1"
        )
        session.add(expired_token)
        session.commit()
        
        response = client.get(
            f"/api/v1/auth/verify-reset-token?token={token_str}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_verify_used_token(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試驗證已使用的 token"""
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        # 標記為已使用
        from sqlmodel import select
        reset_token = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).first()
        reset_token.used = True
        session.add(reset_token)
        session.commit()
        
        response = client.get(
            f"/api/v1/auth/verify-reset-token?token={token}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False


class TestResetPasswordAPI:
    """重置密碼 API 整合測試"""

    def test_reset_password_success(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試成功重置密碼"""
        # 創建 reset token
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        new_password = "NewSecurePassword123"
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": new_password}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "密碼重置成功" in data["message"]
        
        # 驗證可以使用新密碼登入
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": verified_user.email,
                "password": new_password,
                "remember_me": False
            }
        )
        assert login_response.status_code == 200

    def test_reset_password_invalid_token(self, client: TestClient):
        """測試使用無效 token 重置密碼"""
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "invalid-token", "new_password": "NewPassword123"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "無效的重置連結" in data["detail"]

    def test_reset_password_expired_token(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試使用過期 token 重置密碼"""
        # 創建過期 token
        token_str = PasswordResetService.generate_reset_token()
        expired_token = PasswordResetToken(
            user_id=verified_user.id,
            token=token_str,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2),
            used=False,
            ip_address="192.168.1.1"
        )
        session.add(expired_token)
        session.commit()
        
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token_str, "new_password": "NewPassword123"}
        )
        
        assert response.status_code == 400
        assert "無效的重置連結" in response.json()["detail"]

    def test_reset_password_too_short(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試密碼太短"""
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "short"}
        )
        
        assert response.status_code == 400
        assert "密碼長度至少 8 個字元" in response.json()["detail"]

    def test_reset_password_same_as_old(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試新密碼與舊密碼相同"""
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "OldPassword123"}
        )
        
        assert response.status_code == 400
        assert "新密碼不能與舊密碼相同" in response.json()["detail"]

    def test_reset_password_token_used_once(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試 token 只能使用一次"""
        token = PasswordResetService.create_reset_token(
            session, verified_user, ip_address="192.168.1.1"
        )
        
        # 第一次重置成功
        response1 = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "NewPassword123"}
        )
        assert response1.status_code == 200
        
        # 第二次使用相同 token 應該失敗
        response2 = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "AnotherPassword456"}
        )
        assert response2.status_code == 400
        assert "無效的重置連結" in response2.json()["detail"]


class TestPasswordResetEndToEnd:
    """端到端測試完整的密碼重置流程"""

    def test_complete_password_reset_flow(
        self, client: TestClient, verified_user, session: Session
    ):
        """測試完整的密碼重置流程"""
        # Step 1: 請求密碼重置
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": verified_user.email}
        )
        assert response.status_code == 200
        
        # Step 2: 從資料庫獲取 token (模擬從 email 點擊連結)
        from sqlmodel import select
        reset_token_record = session.exec(
            select(PasswordResetToken)
            .where(PasswordResetToken.user_id == verified_user.id)
            .order_by(PasswordResetToken.created_at.desc())
        ).first()
        
        assert reset_token_record is not None
        token = reset_token_record.token
        
        # Step 3: 驗證 token
        verify_response = client.get(
            f"/api/v1/auth/verify-reset-token?token={token}"
        )
        assert verify_response.status_code == 200
        assert verify_response.json()["valid"] is True
        
        # Step 4: 重置密碼
        new_password = "BrandNewPassword789"
        reset_response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": new_password}
        )
        assert reset_response.status_code == 200
        
        # Step 5: 使用新密碼登入
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": verified_user.email,
                "password": new_password,
                "remember_me": False
            }
        )
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()
        
        # Step 6: 驗證舊密碼不能再使用
        old_login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": verified_user.email,
                "password": "OldPassword123",
                "remember_me": False
            }
        )
        assert old_login_response.status_code == 401
