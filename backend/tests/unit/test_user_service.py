import pytest
from sqlmodel import Session
from app.services.user_service import UserService
from app.models.user import User, UserCreate


def test_authenticate_unverified_user(session: Session):
    """測試未驗證 email 的用戶無法登入"""
    # 建立一個未驗證的用戶
    user_data = UserCreate(email="unverified@example.com", password="ValidPassword123", display_name="Unverified")
    user = UserService.create(session, user_data)
    user.email_verified = False
    session.add(user)
    session.commit()

    # 嘗試登入
    with pytest.raises(ValueError, match="請先完成 Email 驗證"):
        UserService.authenticate(session, "unverified@example.com", "ValidPassword123")


def test_authenticate_verified_user(session: Session):
    """測試已驗證 email 的用戶可以成功登入"""
    # 建立一個已驗證的用戶
    user_data = UserCreate(email="verified@example.com", password="ValidPassword123", display_name="Verified")
    user = UserService.create(session, user_data)
    user.email_verified = True
    session.add(user)
    session.commit()

    # 嘗試登入
    authenticated_user = UserService.authenticate(session, "verified@example.com", "ValidPassword123")
    
    assert authenticated_user is not None
    assert authenticated_user.email == "verified@example.com"
