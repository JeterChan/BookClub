import pytest
from datetime import datetime
from sqlmodel import Session
from app.models.user import User


def test_user_created_at_auto_set(session: Session):
    """測試新用戶自動設定 created_at"""
    user = User(
        email="test@example.com",
        display_name="Test User",
        password_hash="hashed_password"
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # 驗證 created_at 已自動設定
    assert user.created_at is not None
    assert isinstance(user.created_at, datetime)


def test_user_updated_at_auto_set(session: Session):
    """測試新用戶自動設定 updated_at"""
    user = User(
        email="test2@example.com",
        display_name="Test User 2",
        password_hash="hashed_password"
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # 驗證 updated_at 已自動設定
    assert user.updated_at is not None
    assert isinstance(user.updated_at, datetime)


def test_user_timestamps_are_utc(session: Session):
    """測試時間戳為 UTC 時間"""
    user = User(
        email="test3@example.com",
        display_name="Test User 3",
        password_hash="hashed_password"
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # 驗證時間戳接近當前時間（允許1分鐘誤差）
    now = datetime.utcnow()
    time_diff = abs((now - user.created_at).total_seconds())
    assert time_diff < 60  # 應該在 60 秒內
    
    time_diff = abs((now - user.updated_at).total_seconds())
    assert time_diff < 60


def test_user_timestamps_not_null(session: Session):
    """測試時間戳欄位不可為空"""
    user = User(
        email="test4@example.com",
        display_name="Test User 4",
        password_hash="hashed_password"
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # 驗證時間戳不為 None
    assert user.created_at is not None
    assert user.updated_at is not None
