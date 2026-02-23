"""
生成讀書會測試資料腳本
執行方式: docker-compose exec web python seed_book_clubs.py

此腳本會生成：
- 測試用戶
- 讀書會標籤
- 讀書會（包含成員）
- 討論主題和留言
- 活動
"""
from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User
from app.models.book_club import BookClub
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.discussion import DiscussionTopic, DiscussionComment
from app.models.event import Event, EventParticipant, EventStatus, ParticipantStatus
from datetime import datetime, timedelta
from app.core.security import hash_password
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
                    email=f"user{i}@bookclub.com",
                    password_hash=hash_password("Test1234"),  # 統一密碼: Test1234
                    display_name=f"讀者 {chr(65+i-1)}",  # A, B, C...
                    bio=f"熱愛閱讀的書友，喜歡{'小說' if i % 3 == 0 else '技術書籍' if i % 3 == 1 else '散文詩歌'}。",
                    is_active=True,
                    email_verified=True,
                    avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed=user{i}"
                )
                for i in range(1, 21)  # 增加到 20 個用戶
            ]
            session.add_all(test_users)
            session.commit()
            users = test_users
            print(f"✅ 創建了 {len(users)} 個測試用戶")
            print(f"   📧 登入帳號: user1@bookclub.com ~ user20@bookclub.com")
            print(f"   🔑 統一密碼: Test1234")
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
        
        # 5. 為每個讀書會創建討論主題
        print("\n📝 創建討論主題...")
        clubs = session.exec(select(BookClub)).all()
        discussion_templates = [
            {
                "title": "📚 本月書單推薦",
                "content": "大家好！這個月我們要讀什麼書呢？歡迎大家推薦自己喜歡的書籍，一起投票決定吧！"
            },
            {
                "title": "💭 上週讀書心得分享",
                "content": "上週的閱讀進度如何？有什麼特別的感想或收穫嗎？來聊聊吧！"
            },
            {
                "title": "🎯 讀書會活動建議",
                "content": "想聽聽大家對讀書會活動的建議，有什麼想嘗試的新形式嗎？線上讀書會、實體聚會還是混合模式？"
            },
            {
                "title": "📖 經典段落分享",
                "content": "最近讀到哪些令人印象深刻的段落？歡迎分享那些觸動你心靈的文字！"
            },
            {
                "title": "❓ 新手問題求助",
                "content": "剛加入讀書會，想請教大家一些問題。這裡的討論氛圍很好，希望能多多交流！"
            }
        ]
        
        discussion_count = 0
        comment_count = 0
        
        for club in clubs:
            # 每個讀書會創建 2-4 個討論主題
            num_topics = random.randint(2, 4)
            selected_templates = random.sample(discussion_templates, min(num_topics, len(discussion_templates)))
            
            club_members = session.exec(
                select(BookClubMember).where(BookClubMember.book_club_id == club.id)
            ).all()
            
            if not club_members:
                continue
            
            for template in selected_templates:
                # 隨機選擇一個成員作為主題創建者
                topic_author = random.choice(club_members)
                
                topic = DiscussionTopic(
                    title=template["title"],
                    content=template["content"],
                    club_id=club.id,
                    owner_id=topic_author.user_id,
                    comment_count=0
                )
                session.add(topic)
                session.flush()
                
                # 為每個討論主題添加 1-5 條留言
                num_comments = random.randint(1, 5)
                comment_templates = [
                    "我也有同感！這個想法很棒！",
                    "說得太好了，完全同意你的觀點。",
                    "有道理，我之前沒想到這個角度。",
                    "感謝分享！這對我很有幫助。",
                    "我有不同的看法，我覺得...",
                    "這個主題很有意思，可以展開討論。",
                    "推薦一下相關的延伸閱讀...",
                    "+1，我也在思考類似的問題。"
                ]
                
                for _ in range(num_comments):
                    commenter = random.choice(club_members)
                    comment_content = random.choice(comment_templates)
                    
                    comment = DiscussionComment(
                        content=comment_content,
                        topic_id=topic.id,
                        owner_id=commenter.user_id,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(0, 7))
                    )
                    session.add(comment)
                    comment_count += 1
                
                # 更新討論主題的留言數
                topic.comment_count = num_comments
                discussion_count += 1
        
        session.commit()
        print(f"✅ 創建了 {discussion_count} 個討論主題和 {comment_count} 條留言")
        
        # 6. 為每個讀書會創建活動
        print("\n📝 創建讀書會活動...")
        event_templates = [
            {
                "title": "📚 每週線上讀書會",
                "description": "每週固定時間，大家一起線上討論本週的閱讀內容。歡迎準備好讀書筆記的朋友分享心得！",
                "days_offset": 3,  # 3天後
                "max_participants": 20
            },
            {
                "title": "🎬 書籍改編電影欣賞會",
                "description": "先讀原著，再看電影，比較兩者的差異與優劣。這次我們要討論的是經典作品的電影改編。",
                "days_offset": 7,
                "max_participants": 15
            },
            {
                "title": "☕ 週末下午茶聊書會",
                "description": "輕鬆的週末午後，一起喝咖啡聊聊最近在看的書。地點在市中心的咖啡廳，實體聚會！",
                "days_offset": 10,
                "max_participants": 12
            },
            {
                "title": "✍️ 作者見面會（線上）",
                "description": "很榮幸邀請到本書作者進行線上分享！會有 Q&A 環節，歡迎準備問題。名額有限，先搶先贏！",
                "days_offset": 14,
                "max_participants": 50
            }
        ]
        
        event_count = 0
        participant_count = 0
        
        for club in clubs:
            # 每個讀書會創建 1-2 個活動
            num_events = random.randint(1, 2)
            selected_events = random.sample(event_templates, min(num_events, len(event_templates)))
            
            club_members = session.exec(
                select(BookClubMember).where(BookClubMember.book_club_id == club.id)
            ).all()
            
            if not club_members:
                continue
            
            # 找到管理員或所有者作為活動組織者
            organizers = [m for m in club_members if m.role in [MemberRole.OWNER, MemberRole.ADMIN]]
            if not organizers:
                organizers = club_members
            
            for event_template in selected_events:
                organizer = random.choice(organizers)
                event_datetime = datetime.utcnow() + timedelta(days=event_template["days_offset"])
                
                event = Event(
                    club_id=club.id,
                    title=event_template["title"],
                    description=event_template["description"],
                    event_datetime=event_datetime,
                    meeting_url="https://meet.google.com/xxx-xxxx-xxx",
                    organizer_id=organizer.user_id,
                    max_participants=event_template["max_participants"],
                    status=EventStatus.PUBLISHED,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 5))
                )
                session.add(event)
                session.flush()
                
                # 隨機添加參與者（30-70% 的成員）
                participation_rate = random.uniform(0.3, 0.7)
                num_participants = int(len(club_members) * participation_rate)
                num_participants = min(num_participants, event_template["max_participants"])
                
                selected_participants = random.sample(club_members, min(num_participants, len(club_members)))
                
                for participant_member in selected_participants:
                    participant = EventParticipant(
                        event_id=event.id,
                        user_id=participant_member.user_id,
                        status=ParticipantStatus.REGISTERED,
                        registered_at=datetime.utcnow() - timedelta(days=random.randint(0, 3))
                    )
                    session.add(participant)
                    participant_count += 1
                
                event_count += 1
        
        session.commit()
        print(f"✅ 創建了 {event_count} 個活動，共 {participant_count} 人次報名")
        
        print(f"\n📊 總計: {len(users)} 用戶, {len(tags)} 標籤, {created_count} 讀書會")
        print(f"        {discussion_count} 討論主題, {comment_count} 留言")
        print(f"        {event_count} 活動, {participant_count} 人次報名")
        print("\n✨ 測試資料生成完成！")
        print("\n🚀 快速開始：")
        print("   1. 訪問 http://localhost:5173 查看前端")
        print("   2. 使用測試帳號登入: user1@bookclub.com / Test1234")
        print("   3. 探索讀書會、參與討論、報名活動！")
        print("\n💡 提示：每個用戶密碼都是 Test1234")

if __name__ == "__main__":
    seed_data()
