import os
import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from sqlmodel import Session

from app.models.user import User


class EmailService:
    """電子郵件服務類別，使用 SMTP 處理郵件發送"""

    def __init__(self):
        """初始化郵件服務，載入 SMTP 設定和模板引擎"""
        self.smtp_host = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.sender_email = os.getenv("SENDER_EMAIL", self.smtp_user)
        self.sender_name = os.getenv("SENDER_NAME", "BookClub")
        
        # 設定模板引擎
        template_dir = Path(__file__).parent.parent / "templates" / "email"
        self.template_env = Environment(loader=FileSystemLoader(str(template_dir)))

    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        內部方法：透過 SMTP 發送郵件

        Args:
            to_email: 收件者 Email
            subject: 郵件主旨
            html_content: HTML 郵件內容
            text_content: 純文字郵件內容（備用）

        Returns:
            bool: 發送成功返回 True，失敗返回 False
        """
        if not all([self.smtp_user, self.smtp_password]):
            print("⚠️  SMTP 憑證未設定，無法發送郵件。")
            print("請設定環境變數：SMTP_USER 和 SMTP_PASSWORD")
            return False

        try:
            # 建立郵件
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.sender_name} <{self.sender_email}>"
            message["To"] = to_email
            
            # 添加純文字版本（備用）
            if text_content:
                part1 = MIMEText(text_content, "plain", "utf-8")
                message.attach(part1)
            
            # 添加 HTML 版本
            part2 = MIMEText(html_content, "html", "utf-8")
            message.attach(part2)
            
            # 連接 SMTP 伺服器並發送
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()  # 啟用 TLS 加密
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)
            
            print(f"✅ Email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError:
            print(f"❌ SMTP 認證失敗，請檢查 SMTP_USER 和 SMTP_PASSWORD")
            return False
        except smtplib.SMTPException as e:
            print(f"❌ SMTP 錯誤，無法發送郵件至 {to_email}: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ 發送郵件失敗至 {to_email}: {str(e)}")
            return False

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

    def send_verification_email(self, user: User, token: str) -> bool:
        """
        發送包含驗證連結的電子郵件。

        Args:
            user: 接收郵件的用戶物件
            token: 用於驗證的 token

        Returns:
            bool: 發送成功返回 True，失敗返回 False
        """
        FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")
        verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
        
        # 渲染 HTML 模板
        try:
            template = self.template_env.get_template("verification.html")
            html_content = template.render(
                username=user.display_name,
                verification_url=verification_url
            )
        except Exception as e:
            print(f"❌ 載入郵件模板失敗: {str(e)}")
            # 使用簡單的 HTML 作為備用
            html_content = f"""
            <html>
                <body>
                    <h2>嗨 {user.display_name}！</h2>
                    <p>歡迎加入 BookClub！請點擊以下連結驗證您的帳號：</p>
                    <p><a href="{verification_url}">驗證帳號</a></p>
                    <p>此連結將在 24 小時後失效。</p>
                </body>
            </html>
            """
        
        # 純文字版本
        text_content = f"""
嗨 {user.display_name}，

歡迎加入 BookClub！請點擊以下連結驗證您的帳號：
{verification_url}

此連結將在 24 小時後失效。

祝您閱讀愉快！
BookClub 團隊
        """
        
        return self._send_email(
            to_email=user.email,
            subject="BookClub - 請驗證您的帳號",
            html_content=html_content,
            text_content=text_content
        )

    def send_password_reset_email(self, user: User, token: str) -> bool:
        """
        發送密碼重置郵件。

        Args:
            user: 接收郵件的用戶物件
            token: 密碼重置 token

        Returns:
            bool: 發送成功返回 True，失敗返回 False
        """
        FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")
        reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
        
        # 渲染 HTML 模板
        try:
            template = self.template_env.get_template("password_reset.html")
            html_content = template.render(
                username=user.display_name,
                reset_url=reset_url
            )
        except Exception as e:
            print(f"❌ 載入郵件模板失敗: {str(e)}")
            # 使用簡單的 HTML 作為備用
            html_content = f"""
            <html>
                <body>
                    <h2>嗨 {user.display_name}！</h2>
                    <p>我們收到了您的密碼重設請求。請點擊以下連結重設您的密碼：</p>
                    <p><a href="{reset_url}">重設密碼</a></p>
                    <p>此連結將在 1 小時後失效。</p>
                    <p>如果這不是您的操作，請忽略此郵件。</p>
                </body>
            </html>
            """
        
        # 純文字版本
        text_content = f"""
嗨 {user.display_name}，

我們收到了您的密碼重設請求。請點擊以下連結重設您的密碼：
{reset_url}

此連結將在 1 小時後失效。

如果這不是您的操作，請忽略此郵件。

BookClub 團隊
        """
        
        return self._send_email(
            to_email=user.email,
            subject="BookClub - 重設您的密碼",
            html_content=html_content,
            text_content=text_content
        )


# 建立單例實例
email_service = EmailService()
