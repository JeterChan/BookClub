import os
import secrets
from datetime import datetime, timedelta

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from sqlmodel import Session

from app.models.user import User


class EmailService:
    """電子郵件服務類別，使用 SendGrid 處理郵件發送"""

    @staticmethod
    def generate_verification_token(session: Session, user: User) -> str:
        """
        產生、儲存並返回一個新的電子郵件驗證 token。

        Args:
            session: 資料庫 session
            user: 要為其產生 token 的用戶物件

        Returns:
            str: 產生的驗證 token
        """
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)

        user.email_verification_token = token
        user.email_verification_token_expires_at = expires_at
        session.add(user)
        session.commit()

        return token

    @staticmethod
    def send_verification_email(user: User, token: str) -> None:
        """
        使用 SendGrid 發送包含驗證連結的電子郵件。

        Args:
            user: 接收郵件的用戶物件
            token: 用於驗證的 token
        """
        # 從環境變數讀取 SendGrid 設定
        SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
        SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@example.com")
        SENDGRID_TEMPLATE_ID = os.getenv("SENDGRID_VERIFICATION_TEMPLATE_ID")
        FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")

        if SENDGRID_API_KEY:
            print(f"DEBUG: Loaded API Key starts with: {SENDGRID_API_KEY[:5]}...") # 只印出前 5 個字元
        else:
            print("DEBUG: SENDGRID_API_KEY is NOT loaded (None).")

        if not all([SENDGRID_API_KEY, SENDGRID_TEMPLATE_ID]):
            print("SendGrid API Key 或 Template ID 未設定，無法發送郵件。")
            # 在生產環境中，這裡應該拋出一個更明確的錯誤或使用日誌記錄
            return

        # 建立驗證連結
        verification_url = f"{FRONTEND_URL}/verify-email?token={token}"

        # 建立郵件訊息
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=user.email,
        )

        # 設定動態模板資料
        message.dynamic_template_data = {
            "display_name": user.display_name,
            "verification_url": verification_url,
        }
        message.template_id = SENDGRID_TEMPLATE_ID

        # 發送郵件
        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            print(f"Verification email sent to {user.email}, Status Code: {response.status_code}")
        except Exception as e:
            print(f"Failed to send email to {user.email} using SendGrid: {e}")
            # 在開發環境中，我們只記錄錯誤但不中斷流程
            # 在生產環境中，您應該啟用此 raise 或使用適當的錯誤處理
            # raise
            pass
