#!/usr/bin/env python3
"""
手動驗證用戶的腳本
"""
import os
from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User

def verify_user(email: str):
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        
        if not user:
            print(f"❌ 找不到帳號: {email}")
            return
        
        if user.email_verified:
            print(f"✅ 帳號已經驗證過了: {email}")
            return
        
        if user.email_verification_token:
            print(f"\n📧 找到驗證 token!")
            print(f"Email: {user.email}")
            print(f"Token: {user.email_verification_token}")
            print(f"\n🔗 驗證連結:")
            print(f"http://localhost:5173/verify-email?token={user.email_verification_token}")
            print(f"\n請在瀏覽器中打開上面的連結來驗證帳號。")
        else:
            print(f"⚠️  沒有找到驗證 token，可能需要重新發送驗證郵件")

if __name__ == "__main__":
    email = "jjwang1118@gmail.com"
    print(f"正在查詢帳號: {email}\n")
    verify_user(email)
