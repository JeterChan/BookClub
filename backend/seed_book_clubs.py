"""
生成讀書會測試資料腳本
執行方式: docker-compose exec api python seed_book_clubs.py
"""
from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User
from app.models.book_club import BookClub
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.book_club_member import BookClubMember, MemberRole
from datetime import datetime, timedelta
import random

def seed_data():
    with Session(engine) as session:
        print("🌱 開始生成測試資料...")
        
        # 1. 檢查是否已有用戶，若無則創建測試用戶
        users = session.exec(select(User)).all()
        if not users:
            print("📝 創建測試用戶...")
            test_users = [
                User(
                    email=f"user{i}@example.com",
                    password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJxQ7K5jS",  # password: "Test1234"
                    display_name=f"測試用戶 {i}",
                    bio=f"我是測試用戶 {i}，熱愛閱讀！",
                    is_active=True,
                    email_verified=True,
                    avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed=user{i}"
                )
                for i in range(1, 11)
            ]
            session.add_all(test_users)
            session.commit()
            users = test_users
            print(f"✅ 創建了 {len(users)} 個測試用戶")
        else:
            print(f"✅ 已存在 {len(users)} 個用戶")
        
        # 2. 檢查並創建標籤
        tags = session.exec(select(ClubTag)).all()
        if not tags:
            print("📝 創建讀書會標籤...")
            tag_names = [
                "程式設計", "Python", "JavaScript", "Web開發", "AI/ML",
                "小說", "散文", "詩歌", "商業", "自我成長",
                "科幻", "推理", "歷史", "哲學", "心理學"
            ]
            tags = [
                ClubTag(name=name, is_predefined=True)
                for name in tag_names
            ]
            session.add_all(tags)
            session.commit()
            print(f"✅ 創建了 {len(tags)} 個標籤")
        else:
            print(f"✅ 已存在 {len(tags)} 個標籤")
        
        # 3. 檢查是否已有讀書會
        existing_clubs = session.exec(select(BookClub)).all()
        if existing_clubs:
            print(f"⚠️  已存在 {len(existing_clubs)} 個讀書會，將只添加新的讀書會...")
        
        # 4. 生成讀書會資料
        print("📝 創建讀書會...")
        club_data = [
            {
                "name": "Python 程式設計讀書會",
                "description": "一起學習 Python 程式設計，從基礎到進階，涵蓋資料科學、網頁開發等主題。每週分享學習心得，共同成長！",
                "tags": ["程式設計", "Python", "AI/ML"],
                "members": 25
            },
            {
                "name": "JavaScript 前端開發社群",
                "description": "專注於 JavaScript 和前端框架（React, Vue, Angular）的學習與討論。分享最新技術趨勢和實戰經驗。",
                "tags": ["程式設計", "JavaScript", "Web開發"],
                "members": 18
            },
            {
                "name": "村上春樹作品研讀會",
                "description": "深入探討村上春樹的文學世界，從《挪威的森林》到《1Q84》，一起品味文字的魅力。",
                "tags": ["小說", "散文"],
                "members": 32
            },
            {
                "name": "科幻小說愛好者聯盟",
                "description": "探索無限可能的科幻世界！從經典的艾西莫夫到現代的劉慈欣，一起暢遊星際。",
                "tags": ["小說", "科幻"],
                "members": 45
            },
            {
                "name": "商業思維讀書會",
                "description": "閱讀商業經典書籍，探討企業管理、行銷策略、創新思維。適合創業者和職場人士。",
                "tags": ["商業", "自我成長"],
                "members": 28
            },
            {
                "name": "心理學入門研討",
                "description": "從《心理學與生活》開始，了解人類行為背後的科學。適合心理學初學者和愛好者。",
                "tags": ["心理學", "自我成長"],
                "members": 38
            },
            {
                "name": "推理小說俱樂部",
                "description": "東野圭吾、阿嘉莎·克莉絲蒂、福爾摩斯...一起解謎，享受推理的樂趣！",
                "tags": ["小說", "推理"],
                "members": 52
            },
            {
                "name": "哲學思考工作坊",
                "description": "從柏拉圖到尼采，探討生命的本質與意義。歡迎喜歡思考的朋友加入。",
                "tags": ["哲學"],
                "members": 15
            },
            {
                "name": "現代詩歌朗讀會",
                "description": "分享與朗讀現代詩作品，感受文字的韻律與美感。每月一次線上聚會。",
                "tags": ["詩歌", "散文"],
                "members": 22
            },
            {
                "name": "歷史故事討論社",
                "description": "從中國古代史到世界近代史，一起探索歷史的真相與啟示。",
                "tags": ["歷史"],
                "members": 30
            },
            {
                "name": "Web 全端開發學習小組",
                "description": "結合前後端技術，學習完整的 Web 應用開發。包含資料庫、API 設計、部署等。",
                "tags": ["程式設計", "Web開發", "JavaScript"],
                "members": 42
            },
            {
                "name": "AI 與機器學習讀書會",
                "description": "學習機器學習、深度學習的理論與實踐。討論最新的 AI 研究論文和應用案例。",
                "tags": ["程式設計", "Python", "AI/ML"],
                "members": 36
            },
            {
                "name": "自我成長書籍分享會",
                "description": "閱讀激勵人心的書籍，分享個人成長經驗。《原子習慣》、《心流》等經典作品。",
                "tags": ["自我成長"],
                "members": 48
            },
            {
                "name": "經典文學品讀社",
                "description": "閱讀世界經典文學作品，從莎士比亞到杜斯妥也夫斯基，提升文學素養。",
                "tags": ["小說", "散文"],
                "members": 27
            },
            {
                "name": "程式競賽準備小組",
                "description": "準備各類程式競賽（LeetCode, Codeforces），一起刷題討論演算法。",
                "tags": ["程式設計"],
                "members": 33
            }
        ]
        
        created_count = 0
        for i, data in enumerate(club_data):
            # 隨機選擇一個用戶作為創建者
            owner = random.choice(users)
            
            # 創建讀書會
            club = BookClub(
                name=data["name"],
                description=data["description"],
                visibility="public",
                owner_id=owner.id,
                cover_image_url=f"https://picsum.photos/seed/club{i+1}/800/400",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90)),
                updated_at=datetime.utcnow()
            )
            session.add(club)
            session.flush()  # 獲取 club.id
            
            # 添加標籤
            for tag_name in data["tags"]:
                tag = session.exec(select(ClubTag).where(ClubTag.name == tag_name)).first()
                if tag:
                    link = BookClubTagLink(book_club_id=club.id, tag_id=tag.id)
                    session.add(link)
            
            # 添加創建者為成員（OWNER 角色）
            owner_member = BookClubMember(
                user_id=owner.id,
                book_club_id=club.id,
                role=MemberRole.OWNER
            )
            session.add(owner_member)
            
            # 隨機添加其他成員
            target_members = data["members"] - 1  # 扣除 owner
            available_users = [u for u in users if u.id != owner.id]
            
            if len(available_users) > 0:
                num_members_to_add = min(target_members, len(available_users))
                selected_members = random.sample(available_users, num_members_to_add)
                
                for member_user in selected_members:
                    member = BookClubMember(
                        user_id=member_user.id,
                        book_club_id=club.id,
                        role=MemberRole.MEMBER
                    )
                    session.add(member)
            
            created_count += 1
            print(f"  ✅ 創建讀書會: {data['name']} ({data['members']} 成員)")
        
        session.commit()
        print(f"\n🎉 成功創建 {created_count} 個讀書會！")
        print(f"📊 總計: {len(users)} 用戶, {len(tags)} 標籤, {created_count} 讀書會")
        print("\n✨ 測試資料生成完成！現在可以訪問 http://localhost:5173/clubs 查看探索頁面")

if __name__ == "__main__":
    seed_data()
