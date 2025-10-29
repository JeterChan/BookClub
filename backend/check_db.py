#!/usr/bin/env python3
"""
查詢資料庫狀態
"""
from sqlmodel import Session, select, text
from app.db.session import engine
from app.models.user import User
from app.models.book_club import BookClub
from app.models.interest_tag import InterestTag

def check_database():
    with Session(engine) as session:
        # 查詢所有資料表
        print("📊 資料表列表:\n")
        tables_query = text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' ORDER BY table_name"
        )
        tables = session.exec(tables_query).all()
        for table in tables:
            print(f"  - {table}")
        
        print("\n" + "="*60 + "\n")
        
        # 查詢各表記錄數
        print("📈 資料表記錄數量:\n")
        
        user_count = len(session.exec(select(User)).all())
        print(f"👤 User (用戶): {user_count} 筆")
        
        club_count = len(session.exec(select(BookClub)).all())
        print(f"📚 BookClub (讀書會): {club_count} 筆")
        
        tag_count = len(session.exec(select(InterestTag)).all())
        print(f"🏷️  InterestTag (興趣標籤): {tag_count} 筆")
        
        # 如果有用戶，顯示詳細資訊
        if user_count > 0:
            print("\n" + "="*60 + "\n")
            print("👥 用戶詳細資訊:\n")
            users = session.exec(select(User)).all()
            for user in users:
                verified = "✅" if user.email_verified else "❌"
                print(f"  ID: {user.id}")
                print(f"  Email: {user.email}")
                print(f"  顯示名稱: {user.display_name}")
                print(f"  Email 已驗證: {verified}")
                print(f"  建立時間: {user.created_at}")
                print("-" * 60)

if __name__ == "__main__":
    check_database()
