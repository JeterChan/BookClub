import bcrypt
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# JWT 設定
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER = 7

def hash_password(password: str) -> str:
    """
    雜湊密碼使用 bcrypt
    
    Args:
        password: 明文密碼
        
    Returns:
        str: 雜湊後的密碼
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    驗證密碼是否正確
    
    Args:
        plain_password: 明文密碼
        hashed_password: 雜湊後的密碼
        
    Returns:
        bool: 密碼是否匹配
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    建立 JWT access token
    
    Args:
        data: 要編碼進 token 的資料（通常包含 sub: user email）
        expires_delta: token 有效期限，若為 None 則使用預設的 30 分鐘
        
    Returns:
        str: 編碼後的 JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    解碼並驗證 JWT access token
    
    Args:
        token: JWT token 字串
        
    Returns:
        Optional[dict]: 解碼後的 payload，如果 token 無效則返回 None
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# HTTPBearer security scheme for JWT authentication
security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    從 JWT token 中取得當前用戶
    
    此函式會被其他需要認證的端點使用為依賴項
    注意：為避免循環導入，實際的 User 查詢邏輯在 endpoint 中處理
    
    Args:
        credentials: HTTP Bearer token
        
    Returns:
        dict: 包含用戶資訊的 payload
        
    Raises:
        HTTPException: token 無效或過期時拋出 401 錯誤
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload
