# backend/tests/unit/test_password_reset_service.py
import pytest
from datetime import datetime, timedelta, timezone
from sqlmodel import Session
from app.services.password_reset_service import PasswordResetService
from app.services.user_service import UserService
from app.models.user import UserCreate
from app.models.password_reset import PasswordResetToken
from fastapi import HTTPException


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """創建測試用戶"""
    user_data = UserCreate(
        email="test@example.com",
        password="OldPassword123",
        display_name="Test User"
    )
    user_service = UserService(session)
    user = user_service.create(user_data)
    user.email_verified = True
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


class TestPasswordResetService:
    """PasswordResetService 單元測試"""

    def test_generate_reset_token(self):
        """測試 token 生成"""
        token = PasswordResetService.generate_reset_token()
        
        assert token is not None
        assert len(token) > 20  # 應該是一個足夠長的隨機字串
        assert isinstance(token, str)
        
        # 生成兩個 token 應該不同
        token2 = PasswordResetService.generate_reset_token()
        assert token != token2

    def test_create_reset_token_success(self, session: Session, test_user):
        """測試成功創建重置 token"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        assert token is not None
        assert isinstance(token, str)
        
        # 驗證資料庫中的記錄
        from sqlmodel import select
        reset_token = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).first()
        
        assert reset_token is not None
        assert reset_token.user_id == test_user.id
        assert reset_token.used is False
        assert reset_token.ip_address == "192.168.1.1"
        # 比較時確保都使用 timezone-aware datetime
        assert reset_token.expires_at.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc)

    def test_create_reset_token_rate_limit(self, session: Session, test_user):
        """測試速率限制 (每小時最多 3 次)"""
        # 創建 3 個 token
        for i in range(3):
            PasswordResetService.create_reset_token(
                session, test_user, ip_address=f"192.168.1.{i}"
            )
        
        # 第 4 次應該失敗
        with pytest.raises(HTTPException) as exc_info:
            PasswordResetService.create_reset_token(
                session, test_user, ip_address="192.168.1.4"
            )
        
        assert exc_info.value.status_code == 429
        assert "已請求過多次" in exc_info.value.detail

    def test_verify_reset_token_valid(self, session: Session, test_user):
        """測試驗證有效的 token"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        result = PasswordResetService.verify_reset_token(session, token)
        
        assert result["valid"] is True
        assert result["email"] == test_user.email
        assert result["reset_token"] is not None

    def test_verify_reset_token_invalid(self, session: Session):
        """測試驗證無效的 token"""
        result = PasswordResetService.verify_reset_token(session, "invalid-token")
        
        assert result["valid"] is False
        assert result["email"] is None
        assert result["reset_token"] is None

    def test_verify_reset_token_expired(self, session: Session, test_user):
        """測試驗證過期的 token"""
        # 創建一個已過期的 token
        token_str = PasswordResetService.generate_reset_token()
        expired_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_str,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2),
            used=False,
            ip_address="192.168.1.1"
        )
        session.add(expired_token)
        session.commit()
        
        result = PasswordResetService.verify_reset_token(session, token_str)
        
        assert result["valid"] is False
        assert result["email"] is None

    def test_verify_reset_token_already_used(self, session: Session, test_user):
        """測試驗證已使用的 token"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        # 標記為已使用
        from sqlmodel import select
        reset_token = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).first()
        reset_token.used = True
        session.add(reset_token)
        session.commit()
        
        result = PasswordResetService.verify_reset_token(session, token)
        
        assert result["valid"] is False
        assert result["email"] is None

    def test_reset_password_success(self, session: Session, test_user):
        """測試成功重置密碼"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        new_password = "NewPassword456"
        user = PasswordResetService.reset_password(session, token, new_password)
        
        assert user is not None
        assert user.id == test_user.id
        
        # 驗證 token 已標記為使用
        from sqlmodel import select
        reset_token = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).first()
        assert reset_token.used is True
        
        # 驗證可以使用新密碼登入
        user_service = UserService(session)
        authenticated = user_service.authenticate(test_user.email, new_password)
        assert authenticated is not None

    def test_reset_password_invalid_token(self, session: Session):
        """測試使用無效 token 重置密碼"""
        with pytest.raises(HTTPException) as exc_info:
            PasswordResetService.reset_password(
                session, "invalid-token", "NewPassword456"
            )
        
        assert exc_info.value.status_code == 400
        assert "無效的重置連結" in exc_info.value.detail

    def test_reset_password_too_short(self, session: Session, test_user):
        """測試密碼太短"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            PasswordResetService.reset_password(session, token, "short")
        
        assert exc_info.value.status_code == 400
        assert "密碼長度至少 8 個字元" in exc_info.value.detail

    def test_reset_password_same_as_old(self, session: Session, test_user):
        """測試新密碼與舊密碼相同"""
        token = PasswordResetService.create_reset_token(
            session, test_user, ip_address="192.168.1.1"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            PasswordResetService.reset_password(
                session, token, "OldPassword123"
            )
        
        assert exc_info.value.status_code == 400
        assert "新密碼不能與舊密碼相同" in exc_info.value.detail

    def test_cleanup_expired_tokens(self, session: Session, test_user):
        """測試清理過期的 tokens"""
        # 創建一個有效的 token
        valid_token = PasswordResetToken(
            user_id=test_user.id,
            token=PasswordResetService.generate_reset_token(),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used=False,
            ip_address="192.168.1.1"
        )
        
        # 創建兩個過期的 tokens
        expired_token1 = PasswordResetToken(
            user_id=test_user.id,
            token=PasswordResetService.generate_reset_token(),
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2),
            used=False,
            ip_address="192.168.1.2"
        )
        
        expired_token2 = PasswordResetToken(
            user_id=test_user.id,
            token=PasswordResetService.generate_reset_token(),
            expires_at=datetime.now(timezone.utc) - timedelta(hours=3),
            used=False,
            ip_address="192.168.1.3"
        )
        
        session.add(valid_token)
        session.add(expired_token1)
        session.add(expired_token2)
        session.commit()
        
        # 執行清理
        deleted_count = PasswordResetService.cleanup_expired_tokens(session)
        
        assert deleted_count == 2
        
        # 驗證只剩下有效的 token
        from sqlmodel import select
        remaining = session.exec(select(PasswordResetToken)).all()
        assert len(remaining) == 1
        assert remaining[0].token == valid_token.token
