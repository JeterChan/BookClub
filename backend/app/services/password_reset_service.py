import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.core.security import hash_password, verify_password


class PasswordResetService:
    """密碼重置服務"""
    
    TOKEN_EXPIRE_HOURS = 1  # Token 有效期限 1 小時
    MAX_REQUESTS_PER_HOUR = 3  # 每小時最多 3 次請求
    
    @staticmethod
    def generate_reset_token() -> str:
        """生成安全的重置 Token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_reset_token(
        session: Session,
        user: User,
        ip_address: Optional[str] = None
    ) -> PasswordResetToken:
        """
        創建密碼重置 Token
        
        Args:
            session: 資料庫 session
            user: 用戶對象
            ip_address: 請求的 IP 地址
            
        Returns:
            PasswordResetToken: 創建的 Token 對象
            
        Raises:
            HTTPException: 如果超過請求限制
        """
        # 檢查 rate limiting
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        recent_tokens = session.exec(
            select(PasswordResetToken)
            .where(PasswordResetToken.user_id == user.id)
            .where(PasswordResetToken.created_at >= one_hour_ago)
        ).all()
        
        if len(recent_tokens) >= PasswordResetService.MAX_REQUESTS_PER_HOUR:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"您在 1 小時內已請求過多次，請稍後再試"
            )
        
        # 生成新 Token
        token_str = PasswordResetService.generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=PasswordResetService.TOKEN_EXPIRE_HOURS)
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token_str,
            expires_at=expires_at,
            ip_address=ip_address
        )
        
        session.add(reset_token)
        session.commit()
        session.refresh(reset_token)
        
        return token_str  # 返回 token 字串而不是對象
    
    @staticmethod
    def verify_reset_token(session: Session, token: str) -> Dict[str, Any]:
        """
        驗證重置 Token
        
        Args:
            session: 資料庫 session
            token: Token 字串
            
        Returns:
            Dict: {"valid": bool, "email": Optional[str], "reset_token": Optional[PasswordResetToken]}
        """
        reset_token = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.token == token)
        ).first()
        
        if not reset_token:
            return {"valid": False, "email": None, "reset_token": None}
        
        # 檢查是否已使用
        if reset_token.used:
            return {"valid": False, "email": None, "reset_token": None}
        
        # 檢查是否過期
        now = datetime.now(timezone.utc)
        if reset_token.expires_at.replace(tzinfo=timezone.utc) < now:
            return {"valid": False, "email": None, "reset_token": None}
        
        # 取得用戶 email
        user = session.exec(
            select(User).where(User.id == reset_token.user_id)
        ).first()
        
        email = user.email if user else None
        
        return {"valid": True, "email": email, "reset_token": reset_token}
    
    @staticmethod
    def reset_password(
        session: Session,
        token: str,
        new_password: str
    ) -> User:
        """
        重置密碼
        
        Args:
            session: 資料庫 session
            token: Token 字串
            new_password: 新密碼
            
        Returns:
            User: 更新後的用戶對象
            
        Raises:
            HTTPException: Token 無效或密碼不符合要求
        """
        # 驗證 Token
        verification_result = PasswordResetService.verify_reset_token(session, token)
        if not verification_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="無效的重置連結或連結已過期"
            )
        
        reset_token = verification_result["reset_token"]
        
        # 取得用戶
        user = session.get(User, reset_token.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用戶不存在"
            )
        
        # 驗證新密碼格式
        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="密碼長度至少 8 個字元"
            )
        
        # 檢查新密碼是否與舊密碼相同
        if verify_password(new_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="新密碼不能與舊密碼相同"
            )
        
        # 更新密碼
        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        
        # 標記 Token 為已使用
        reset_token.used = True
        
        session.add(user)
        session.add(reset_token)
        session.commit()
        session.refresh(user)
        
        return user
    
    @staticmethod
    def cleanup_expired_tokens(session: Session) -> int:
        """
        清理過期的 Token（可用於定期任務）
        
        Args:
            session: 資料庫 session
            
        Returns:
            int: 刪除的 Token 數量
        """
        now = datetime.now(timezone.utc)
        expired_tokens = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.expires_at < now)
        ).all()
        
        count = len(expired_tokens)
        for token in expired_tokens:
            session.delete(token)
        
        session.commit()
        return count
