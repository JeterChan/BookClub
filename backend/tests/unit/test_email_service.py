from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session

from app.services.email_service import EmailService
from app.models.user import User


def test_generate_verification_token(session: Session):
    """測試是否能成功為用戶產生 email 驗證 token"""
    # 建立一個測試用戶
    test_user = User(
        email="test@example.com",
        display_name="Test User",
        password_hash="a_hash"
    )
    session.add(test_user)
    session.commit()
    session.refresh(test_user)

    # 產生 token
    token = EmailService.generate_verification_token(session, test_user)

    # 驗證 token 是否已儲存
    assert token is not None
    assert test_user.email_verification_token == token
    assert test_user.email_verification_token_expires_at is not None

    # 驗證過期時間是否在未來約 24 小時
    expected_expiry = datetime.utcnow() + timedelta(hours=24)
    assert test_user.email_verification_token_expires_at > datetime.utcnow()
    assert abs((test_user.email_verification_token_expires_at - expected_expiry).total_seconds()) < 60 # 允許 1 分鐘誤差


@patch('app.services.email_service.SendGridAPIClient')
def test_send_verification_email(mock_sendgrid_client, session: Session):
    """測試發送驗證郵件的功能是否正常呼叫 SendGrid API"""
    # 建立一個 mock SendGrid client
    mock_api = MagicMock()
    mock_sendgrid_client.return_value = mock_api

    # 建立測試用戶
    test_user = User(
        email="test@example.com",
        display_name="Test User",
        password_hash="a_hash"
    )
    token = "test_token_string"

    # 呼叫發送郵件函數
    EmailService.send_verification_email(test_user, token)

    # 驗證 SendGrid client 是否被正確呼叫
    mock_sendgrid_client.assert_called_once()
    mock_api.send.assert_called_once()

    # 驗證發送的郵件內容
    sent_message = mock_api.send.call_args[0][0]
    assert sent_message.to[0].email == "test@example.com"
    assert sent_message.template_id is not None
    assert sent_message.dynamic_template_data['display_name'] == "Test User"
    assert token in sent_message.dynamic_template_data['verification_url']
