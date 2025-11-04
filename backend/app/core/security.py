import bcrypt
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.user import User
from app.models.book_club_member import BookClubMember

# JWT 設定
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER = 7

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

security_scheme = HTTPBearer()
optional_security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    db: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> User:
    print("---LOG: Entering get_current_user dependency---")
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
    
    user = db.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user



def get_optional_current_user(
    db: Session = Depends(get_session),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security_scheme)
) -> Optional[User]:
    if not credentials:
        return None
        
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload or not payload.get("sub"):
        return None
        
    email = payload.get("sub")
    user = db.exec(select(User).where(User.email == email)).first()
    return user







def get_club_member(club_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    user_id = current_user.id



    print(f"Checking membership for user_id: {user_id} in club_id: {club_id}")



    member = db.exec(select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == user_id)).first()



    if not member:



        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this club")



    return member
