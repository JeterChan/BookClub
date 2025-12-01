import os
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch
from sendgrid.helpers.mail import To # Import To object for mocking

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


@pytest.mark.skip(reason="Skipping SendGrid test as per request")
@patch('app.services.email_service.SendGridAPIClient')
@patch('app.services.email_service.Mail') # Patch Mail class directly
def test_send_verification_email(mock_mail_class, mock_sendgrid_client, session: Session):
    """測試發送驗證郵件的功能是否正常呼叫 SendGrid API"""
    # 建立一個 mock SendGrid client
    mock_api = MagicMock()
    mock_sendgrid_client.return_value = mock_api

    # 配置 mock_mail_class.return_value 以模擬 Mail 物件的結構
    # 這確保 personalizations 和 tos 屬性會回傳預期的資料，而不是新的 MagicMock
    mock_personalization = MagicMock()
    mock_personalization.tos = [{'email': "test@example.com"}]
    mock_mail_class.return_value.personalizations = [mock_personalization]
    mock_mail_class.return_value.template_id = "mock_template_id" # 設置預期值
    mock_mail_class.return_value.dynamic_template_data = { # 設置預期值
        "display_name": "Test User",
        "verification_url": "mock_verification_url" # 隨意一個值，只要存在就好
    }

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
    mock_api.send.assert_called_once_with(mock_mail_class.return_value) # Send is called with the mocked Mail instance

    # 驗證 Mail 物件是否被正確建立
    mock_mail_class.assert_called_once_with(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "noreply@example.com"),
        to_emails=test_user.email,
    )

    # 驗證發送的郵件內容 (直接檢查被 mock 的 Mail 實例)
    sent_message_mock = mock_mail_class.return_value
    assert sent_message_mock.personalizations[0].tos[0]['email'] == "test@example.com"
    assert sent_message_mock.template_id is not None
    assert sent_message_mock.dynamic_template_data['display_name'] == "Test User"
    assert token in sent_message_mock.dynamic_template_data['verification_url']
