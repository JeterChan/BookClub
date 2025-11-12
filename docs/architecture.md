# 線上讀書會平台 - 系統架構文件

# 線上讀書會平台 - 系統架構（索引）

本文件已拆分為多個子章節，請透過以下連結瀏覽最新、單一來源的版本：

- 1. 架構概覽 (v4.0)
    - docs/architecture/1-架構概覽-v40.md
- 2. 後端架構詳細設計 (SQLModel)
    - docs/architecture/2-後端架構詳細設計-sqlmodel.md
- 3. 資料庫遷移 (Alembic)
    - docs/architecture/3-資料庫遷移-alembic.md
- 4. 開發環境 (Docker for SQLModel)
    - docs/architecture/4-開發環境-docker-for-sqlmodel.md
- 5. 前端架構詳細設計 (Vite + React)
    - docs/architecture/5-前端架構詳細設計-vite-react.md

建議：未來請僅維護上述子文件，避免同時在本索引頁撰寫實際內容，以降低重複與文件漂移風險。

---

# 1. 架構概覽 (v5.0) - 2025年11月更新

## 技術摘要
本系統採用現代化前後端分離架構。前端使用 **Vite + React 19 + Tailwind CSS 4**，搭配 **Zustand** 進行狀態管理。後端採用 **Python 3.11+ 與 FastAPI**。資料庫互動層使用 **SQLModel** 作為 ORM，完美結合 SQLAlchemy Core 的強大功能與 Pydantic 的資料驗證能力。資料庫為 **PostgreSQL 15**，使用 **Alembic** 進行資料庫結構的遷移管理。整體開發與部署流程使用 Docker 與 Docker Compose 進行容器化管理。部署平台採用 **Render (後端)** 與 **Vercel (前端)**。

## 平台與基礎設施選擇

### 後端技術棧
- **框架**: FastAPI + Uvicorn (ASGI Server)
- **語言**: Python 3.11+
- **資料庫**: PostgreSQL 15
- **ORM**: SQLModel
- **資料庫遷移**: Alembic
- **資料庫驅動**: psycopg2-binary
- **認證**: JWT (python-jose) + bcrypt
- **檔案上傳**: Cloudinary (圖片儲存)
- **Email 服務**: SendGrid
- **容器化**: Docker + Docker Compose
- **部署平台**: Render

### 前端技術棧
- **建置工具**: Vite 7
- **框架**: React 19
- **語言**: TypeScript 5.9
- **狀態管理**: Zustand 5.0
- **路由**: React Router DOM 7
- **HTTP 客戶端**: Axios 1.12
- **表單處理**: React Hook Form 7 + Zod 4
- **樣式**: Tailwind CSS 4 + clsx + tailwind-merge
- **動畫**: Framer Motion 12
- **UI 通知**: React Hot Toast 2.6
- **圖示**: Heroicons 2
- **測試**: Vitest 4 + React Testing Library
- **部署平台**: Vercel

**選擇理由**:
- **SQLModel 與 FastAPI 的無縫整合**: 由同一作者開發，能用單一 Class 定義資料庫模型與 API Schema，大幅減少程式碼重複，提升開發效率。
- **SQLAlchemy Core 的強大底層**: 繼承了 SQLAlchemy 的穩定性、效能和強大的查詢能力。
- **Alembic**: Python 生態系中最強大、最主流的資料庫遷移工具。
- **Zustand 取代 Redux Toolkit**: 更輕量、更簡潔的狀態管理方案，減少樣板程式碼。
- **React 19**: 最新版本，支援 Server Components 和改進的並發特性。
- **Tailwind CSS 4**: 新一代 CSS 框架，效能更好、DX 更佳。

---

## 2. 後端架構詳細設計

### 2.1 專案結構

```
backend/
├── alembic/                    # 資料庫遷移檔案
│   ├── versions/              # 遷移版本檔案
│   └── env.py                 # Alembic 環境設定
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI 應用程式進入點
│   ├── api/
│   │   ├── api.py            # 路由聚合
│   │   └── endpoints/        # API 端點模組
│   │       ├── auth.py       # 認證相關 API
│   │       ├── users.py      # 使用者資訊 API
│   │       ├── book_clubs.py # 讀書會 CRUD
│   │       ├── club_members.py # 成員管理
│   │       ├── discussions.py  # 討論區
│   │       ├── events.py       # 活動管理
│   │       ├── user_events.py  # 使用者活動
│   │       ├── interest_tags.py # 興趣標籤
│   │       ├── notifications.py # 通知
│   │       └── dashboard.py    # 儀表板
│   ├── core/
│   │   ├── config.py         # 應用程式設定
│   │   └── security.py       # JWT、密碼處理
│   ├── db/
│   │   └── session.py        # 資料庫連線管理
│   ├── models/               # SQLModel 資料模型
│   │   ├── user.py
│   │   ├── book_club.py
│   │   ├── book_club_member.py
│   │   ├── club_join_request.py
│   │   ├── club_tag.py
│   │   ├── interest_tag.py
│   │   ├── discussion.py
│   │   ├── event.py
│   │   ├── notification.py
│   │   └── password_reset.py
│   ├── schemas/              # 額外的 Pydantic schemas
│   └── services/             # 業務邏輯層
├── tests/
│   ├── unit/                 # 單元測試
│   └── integration/          # 整合測試
├── uploads/                  # 本地檔案上傳 (開發用)
│   ├── avatars/
│   └── club_covers/
├── alembic.ini              # Alembic 設定檔
├── docker-compose.yml       # Docker Compose 設定
├── Dockerfile               # Docker 映像檔定義
├── requirements.txt         # Python 依賴
└── .env                     # 環境變數 (不提交至 Git)
```

### 2.2 核心依賴套件

```txt
# Web 框架
fastapi
uvicorn[standard]

# 資料庫
sqlmodel
alembic
psycopg2-binary

# 安全性
python-jose[cryptography]>=3.3.0
bcrypt

# 工具
python-dotenv
python-multipart

# 檔案處理
Pillow
cloudinary

# Email
sendgrid>=6.11.0

# 測試
pytest
pytest-cov
httpx
```

### 2.3 資料模型與 API Schema (SQLModel 範例)

SQLModel 的核心優勢是可以用一個基礎模型，衍生出資料庫模型和 API 所需的各種資料結構。這與 PRD v2.1 中定義的功能需求 (如 FR1.9 興趣標籤) 和 Epic 2 (讀書會管理) 保持一致。

#### 使用者模型 (User)

**`app/models/user.py`**
```python
from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from .interest_tag import UserInterestTag

class UserBase(SQLModel):
    email: str = Field(max_length=255, unique=True, index=True)
    display_name: str = Field(max_length=50)
    
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    
    bio: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    
    # 帳號保護機制欄位
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None)
    
    # Email 驗證相關欄位
    email_verified: bool = Field(default=False)
    email_verification_token: Optional[str] = Field(default=None, max_length=255, index=True)
    
    # 時間戳欄位
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owned_clubs: List["BookClub"] = Relationship(back_populates="owner")
    memberships: List["BookClubMember"] = Relationship(back_populates="user")
    threads: List["DiscussionTopic"] = Relationship(back_populates="author")
    posts: List["DiscussionComment"] = Relationship(back_populates="owner")
    notifications: List["Notification"] = Relationship(back_populates="recipient")
    interest_tags: List["InterestTag"] = Relationship(back_populates="users", link_model=UserInterestTag)
    organized_events: List["Event"] = Relationship(back_populates="organizer")
    event_participations: List["EventParticipant"] = Relationship(back_populates="user")

# 用於建立用戶的 API 輸入模型
class UserCreate(UserBase):
    password: str

# 用於讀取用戶資訊的 API 輸出模型
class UserRead(UserBase):
    id: int
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
```

#### 興趣標籤模型 (InterestTag)

**`app/models/interest_tag.py`**
```python
from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class UserInterestTag(SQLModel, table=True):
    """用戶興趣標籤關聯表（多對多中間表）"""
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    tag_id: int = Field(foreign_key="interesttag.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InterestTag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True, index=True)
    is_predefined: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    users: List["User"] = Relationship(back_populates="interest_tags", link_model=UserInterestTag)

class InterestTagRead(SQLModel):
    """興趣標籤讀取 schema"""
    id: int
    name: str
    is_predefined: bool
```

#### 讀書會模型 (BookClub)

**`app/models/book_club.py`**
```python
from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum
from .club_tag import BookClubTagLink

class BookClubVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

class BookClub(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    visibility: BookClubVisibility = Field(default=BookClubVisibility.PUBLIC, max_length=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)
    
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owner: "User" = Relationship(back_populates="owned_clubs")
    members: List["BookClubMember"] = Relationship(back_populates="book_club")
    threads: List["DiscussionTopic"] = Relationship(back_populates="book_club")
    tags: List["ClubTag"] = Relationship(back_populates="book_clubs", link_model=BookClubTagLink)
    events: List["Event"] = Relationship(back_populates="book_club")

class BookClubCreate(SQLModel):
    """建立讀書會請求 schema"""
    name: str = Field(max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    visibility: BookClubVisibility = Field(default=BookClubVisibility.PUBLIC)
    tag_ids: List[int] = Field(min_length=1)
    cover_image_url: Optional[str] = Field(None, max_length=255)
```

#### 活動模型 (Event)

**`app/models/event.py`**
```python
from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Event(SQLModel, table=True):
    """活動資料表"""
    id: Optional[int] = Field(default=None, primary_key=True)
    club_id: int = Field(foreign_key="bookclub.id", index=True)
    title: str = Field(max_length=100)
    description: str = Field(max_length=2000)
    event_datetime: datetime = Field(index=True)
    meeting_url: str = Field(max_length=500)
    organizer_id: int = Field(foreign_key="user.id")
    max_participants: Optional[int] = Field(default=None)
    status: EventStatus = Field(default=EventStatus.DRAFT, max_length=20, index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    book_club: "BookClub" = Relationship(back_populates="events")
    organizer: "User" = Relationship(back_populates="organized_events")
    participants: List["EventParticipant"] = Relationship(back_populates="event")
```

#### 通知模型 (Notification)

**`app/models/notification.py`**
```python
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from enum import Enum
from datetime import datetime

class NotificationType(str, Enum):
    NEW_POST = "NEW_POST"
    NEW_MEMBER = "NEW_MEMBER"
    EVENT_CREATED = "EVENT_CREATED"

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: dict = Field(sa_column=Column(JSON))
    type: NotificationType = Field(max_length=50)
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    recipient_id: int = Field(foreign_key="user.id")
    recipient: "User" = Relationship(back_populates="notifications")
```

### 2.4 RESTful API 設計範例 (FastAPI + SQLModel)

**`app/main.py` - 應用程式進入點與 CORS 設定**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
import os

app = FastAPI(title="Book Club API")

# CORS 設定 - 支援開發與生產環境
origins = [
    "http://localhost:5173",  # Vite 開發伺服器
    "http://localhost:3000",
]

# 從環境變數讀取前端 URL (生產環境)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.extend([url.strip() for url in frontend_url.split(',')])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 路由
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Club API"}
```

**`app/api/api.py` - API 路由聚合**
```python
from fastapi import APIRouter
from .endpoints import (
    auth, users, interest_tags, dashboard, 
    book_clubs, club_members, discussions, 
    events, user_events, notifications
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interest_tags.router, prefix="/interest-tags", tags=["interest-tags"])
api_router.include_router(dashboard.router, prefix="/users", tags=["dashboard"])
api_router.include_router(book_clubs.router, prefix="/clubs", tags=["book-clubs"])
api_router.include_router(club_members.router, prefix="/clubs", tags=["club-management"])
api_router.include_router(discussions.router, prefix="/clubs", tags=["discussions"])
api_router.include_router(events.router, prefix="", tags=["events"])
api_router.include_router(user_events.router, prefix="/users", tags=["user-events"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
```

**`app/api/endpoints/auth.py` - 認證 API 範例**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.user import User, UserCreate, UserRead
from app.core.security import hash_password, verify_password, create_access_token
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
def register_new_user(
    *, session: Session = Depends(get_session), user_in: UserCreate
) -> User:
    """註冊新使用者"""
    db_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if db_user:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )
    
    hashed_password = hash_password(user_in.password)
    user_data = user_in.dict(exclude={"password"})
    db_user = User(**user_data, password_hash=hashed_password)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post("/login")
def login(
    *, session: Session = Depends(get_session), 
    email: str, password: str, remember_me: bool = False
):
    """使用者登入"""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )
    
    # 建立 JWT token
    expires_delta = timedelta(days=7) if remember_me else timedelta(hours=1)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=expires_delta
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
```

### 2.5 安全性設計

根據 PRD v2.1 的非功能需求 (NFR1.5)，後端實作以下安全機制：

#### JWT 認證
**`app/core/security.py`**
```python
import bcrypt
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

# JWT 設定
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER = 7

def hash_password(password: str) -> str:
    """使用 bcrypt 雜湊密碼"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證密碼"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """建立 JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """解碼 JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

security_scheme = HTTPBearer()
```

#### 安全機制摘要

*   **密碼雜湊**: 使用 **bcrypt** 雜湊使用者密碼，確保密碼不會以明文儲存。
*   **JWT 認證**: 使用 **python-jose** 產生和驗證 JWT tokens，支援「記住我」功能（7天有效期）。
*   **帳號鎖定機制**: User 模型包含 `failed_login_attempts` 和 `locked_until` 欄位，實作登入失敗次數限制。
*   **Email 驗證**: 支援 Email 驗證流程（`email_verified`, `email_verification_token` 欄位）。

*   **CORS (跨域資源共享)**:
    *   開發環境：允許本地 localhost 和 127.0.0.1 的多個 port (5173-5175, 3000)
    *   生產環境：從環境變數 `FRONTEND_URL` 讀取允許的前端 URL
    *   支援 Vercel preview deployments 的動態來源驗證
    *   允許 credentials (cookies)、所有 HTTP 方法和所有 headers

*   **跨站請求偽造 (CSRF) 保護**:
    *   採用 JWT Bearer Token 認證，不使用 Cookie，降低 CSRF 風險
    *   前端將 JWT Token 放在 `Authorization` 標頭中

*   **跨站腳本 (XSS) 防護**:
    *   FastAPI 預設對輸出進行 HTML 編碼
    *   前端 React 預設對 JSX 內容進行轉義
    *   生產環境設定嚴格的 CSP (Content Security Policy) 標頭

### 2.6 API 路由規劃

此路由規劃對應 PRD v2.1 中定義的四個核心 Epics。

#### Epic 1: 用戶系統
*   `POST /api/v1/auth/register`: 用戶註冊
*   `POST /api/v1/auth/login`: 用戶登入
*   `GET /api/v1/users/me`: 獲取當前用戶資訊
*   `PUT /api/v1/users/me`: 更新用戶個人檔案
*   `POST /api/v1/users/me/avatar`: 上傳頭像
*   `PUT /api/v1/users/me/interest-tags`: 更新用戶興趣標籤
*   `GET /api/v1/interest-tags`: 取得所有興趣標籤
*   `POST /api/v1/interest-tags`: 建立新興趣標籤

#### Epic 2: 讀書會管理
*   `POST /api/v1/clubs`: 建立讀書會
*   `GET /api/v1/clubs`: 探索/搜尋讀書會（支援分頁、篩選）
*   `GET /api/v1/clubs/{clubId}`: 獲取讀書會詳細資訊
*   `PUT /api/v1/clubs/{clubId}`: (管理員) 更新讀書會資訊
*   `DELETE /api/v1/clubs/{clubId}`: (擁有者) 刪除讀書會
*   `POST /api/v1/clubs/{clubId}/join`: 申請加入讀書會
*   `DELETE /api/v1/clubs/{clubId}/members/{userId}`: 移除成員
*   `GET /api/v1/clubs/{clubId}/members`: 取得成員列表
*   `POST /api/v1/clubs/{clubId}/cover`: 上傳讀書會封面

#### Epic 3: 學習協作
*   `GET /api/v1/clubs/{clubId}/discussions`: 獲取討論列表
*   `POST /api/v1/clubs/{clubId}/discussions`: 建立新討論
*   `GET /api/v1/clubs/{clubId}/discussions/{topicId}`: 查看討論串
*   `POST /api/v1/clubs/{clubId}/discussions/{topicId}/comments`: 回覆討論

#### Epic 4: 活動與通知
*   `GET /api/v1/clubs/{clubId}/events`: 取得讀書會活動列表
*   `POST /api/v1/clubs/{clubId}/events`: 建立活動
*   `GET /api/v1/events/{eventId}`: 取得活動詳情
*   `PUT /api/v1/events/{eventId}`: 更新活動
*   `POST /api/v1/events/{eventId}/register`: 報名活動
*   `DELETE /api/v1/events/{eventId}/register`: 取消報名
*   `GET /api/v1/users/me/events`: 取得使用者的活動（已報名）
*   `GET /api/v1/notifications`: 獲取通知列表
*   `POST /api/v1/notifications/{notificationId}/read`: 標記通知已讀
*   `POST /api/v1/notifications/read-all`: 全部標為已讀

#### 儀表板
*   `GET /api/v1/users/me/dashboard`: 取得使用者儀表板資料（統計、最新動態）

---

## 3. 資料庫遷移 (Alembic)

我們使用 Alembic 來管理資料庫結構的變更，確保開發、測試和生產環境的資料庫架構保持同步。

### 3.1 Alembic 設定

**`alembic.ini`**
```ini
[alembic]
script_location = alembic
sqlalchemy.url = %(DATABASE_URL)s # 從環境變數讀取

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### 3.2 使用 Alembic 的工作流程

1.  **建立遷移腳本** (自動偵測模型變更):
    ```bash
    alembic revision --autogenerate -m "Add user and book_club tables"
    ```
    Alembic 會比較 SQLModel 模型和資料庫的差異，自動產生遷移腳本於 `alembic/versions/` 目錄。

2.  **檢視遷移腳本**: 
    在 `alembic/versions/` 目錄中檢查生成的 Python 檔案，確認遷移邏輯正確。

3.  **應用遷移** (升級資料庫):
    ```bash
    alembic upgrade head
    ```
    將最新的遷移應用到資料庫，建立或更新表格結構。

4.  **回滾遷移** (降級資料庫):
    ```bash
    alembic downgrade -1  # 回滾一個版本
    ```

5.  **查看遷移歷史**:
    ```bash
    alembic history
    alembic current  # 查看目前版本
    ```

### 3.3 Docker 環境中的自動遷移

在 Docker Compose 環境中，API 容器啟動時會自動執行遷移：

**`backend/Dockerfile` (CMD 部分)**
```bash
CMD ["sh", "-c", "while ! nc -z db 5432; do echo 'Waiting for database...'; sleep 1; done; echo 'Database is ready!'; alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

此指令會：
1. 等待 PostgreSQL 資料庫準備就緒
2. 執行 `alembic upgrade head` 自動應用所有遷移
3. 啟動 FastAPI 應用程式

---

## 4. 開發環境 (Docker + Docker Compose)

### 4.1 依賴管理

**`backend/requirements.txt`**
```
# Web 框架
fastapi
uvicorn[standard]

# 資料庫
sqlmodel
alembic
psycopg2-binary

# 安全性
python-jose[cryptography]>=3.3.0
bcrypt
python-dotenv
python-multipart

# 檔案處理
Pillow
cloudinary

# Email
sendgrid>=6.11.0

# 測試
pytest
pytest-cov
httpx
```

### 4.2 Dockerfile

**`backend/Dockerfile`**
```dockerfile
FROM python:3.11-slim-bullseye

# 設定工作目錄為專案根目錄
WORKDIR /usr/src/app

# 安裝系統依賴 (psycopg2 需要 libpq-dev, netcat 用於健康檢查)
RUN apt-get update && apt-get install -y libpq-dev gcc netcat-openbsd && rm -rf /var/lib/apt/lists/*

# 僅複製 requirements.txt 以利用 Docker 快取
COPY backend/requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製整個專案
COPY . .

# 設定工作目錄為 backend 資料夾
WORKDIR /usr/src/app/backend

EXPOSE 8000

# 啟動時等待資料庫、執行遷移、啟動伺服器
CMD ["sh", "-c", "while ! nc -z db 5432; do echo 'Waiting for database...'; sleep 1; done; echo 'Database is ready!'; alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

### 4.3 Docker Compose

**`backend/docker-compose.yml`**
```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ..  # 建置上下文為專案根目錄
      dockerfile: backend/Dockerfile
    ports:
      - '8000:8000'
    depends_on:
      - db
    volumes:
      - ../:/usr/src/app  # 掛載整個專案根目錄以實現熱重載
    working_dir: /usr/src/app/backend
    environment:
      PYTHONPATH: /usr/src/app/backend
    env_file:
      - .env  # 從 .env 讀取環境變數

volumes:
  postgres_data:
```

### 4.4 環境變數設定

**`backend/.env.example`**
```bash
# 資料庫設定
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=bookclub_dev
DATABASE_URL=postgresql://user:password@db:5432/bookclub_dev

# JWT 設定
SECRET_KEY=your-secret-key-here-change-in-production

# 前端 URL (CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary (檔案上傳)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid (Email)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@bookclub.com
```

### 4.5 啟動開發環境

```bash
# 在 backend/ 目錄下
cd backend

# 複製環境變數範本
cp .env.example .env

# 編輯 .env 檔案，填入實際的設定值
# nano .env 或使用其他編輯器

# 啟動所有服務
docker-compose up --build

# 背景執行
docker-compose up -d

# 查看日誌
docker-compose logs -f api

# 停止服務
docker-compose down

# 停止並清除所有資料（包含資料庫）
docker-compose down -v
```

### 4.6 本地開發（不使用 Docker）

```bash
# 建立虛擬環境
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements.txt

# 設定環境變數 (需要本地 PostgreSQL)
export DATABASE_URL="postgresql://user:password@localhost:5432/bookclub_dev"
export SECRET_KEY="your-secret-key"

# 執行遷移
alembic upgrade head

# 啟動開發伺服器
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 5. 前端架構詳細設計 (Vite + React 19)

前端採用基於元件的現代化架構，使用 Vite 7 作為建置工具，搭配 React 19 框架和 TypeScript。

### 5.1 前端專案結構

**`/frontend/src/`**
```
/frontend/
├── src/
│   ├── assets/              # 靜態資源 (圖片、字體)
│   ├── components/          # 可重用的 UI 元件
│   │   ├── ui/             # 基礎 UI 元件 (Button, Input, Card, Modal 等)
│   │   ├── layout/         # 佈局元件 (Header, Footer, Sidebar)
│   │   └── ...             # 功能性元件
│   ├── pages/              # 頁面級元件
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ClubPage.tsx
│   │   ├── ExplorePage.tsx
│   │   └── ...
│   ├── services/           # API 請求層
│   │   ├── api.ts          # API 基礎設定 (已廢棄，改用 apiClient.ts)
│   │   ├── apiClient.ts    # Axios 客戶端實例
│   │   ├── authService.ts  # 認證相關 API
│   │   ├── profileService.ts
│   │   ├── bookClubService.ts
│   │   ├── clubManagementService.ts
│   │   ├── clubService.ts
│   │   ├── dashboardService.ts
│   │   ├── eventService.ts
│   │   ├── notificationService.ts
│   │   └── userEventService.ts
│   ├── store/              # 狀態管理 (Zustand)
│   │   ├── authStore.ts    # 認證狀態
│   │   ├── bookClubStore.ts
│   │   ├── clubManagementStore.ts
│   │   ├── clubStore.ts
│   │   ├── notificationStore.ts
│   │   └── __tests__/      # Store 單元測試
│   ├── hooks/              # 自訂 React Hooks
│   ├── types/              # TypeScript 型別定義
│   ├── utils/              # 共用工具函式
│   ├── test/               # 測試設定
│   │   └── setup.ts        # Vitest 測試設定
│   ├── App.tsx             # 應用程式主元件 (路由設定)
│   ├── main.tsx            # 應用程式進入點
│   └── index.css           # 全域樣式 (Tailwind)
├── public/                 # 公開靜態檔案
├── package.json            # 專案依賴與腳本
├── vite.config.ts          # Vite 設定
├── tsconfig.json           # TypeScript 設定
├── tailwind.config.js      # Tailwind CSS 設定
└── vercel.json             # Vercel 部署設定
```

### 5.2 關鍵技術選擇與實踐

#### 狀態管理 - Zustand

**選擇理由**: 
- 比 Redux Toolkit 更輕量、更簡潔
- 不需要 Provider 包裹
- 更少的樣板程式碼
- 更好的 TypeScript 支援
- 更直觀的 API

**實作範例** - `src/store/authStore.ts`:
```typescript
import { create } from 'zustand';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../services/profileService';
import type { TokenResponse } from '../types/auth';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface AuthActions {
  login: (tokens: TokenResponse, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  // Actions
  login: async (tokens, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', tokens.access_token);
    set({ 
      accessToken: tokens.access_token, 
      isAuthenticated: true,
    });

    try {
      const userProfile = await profileService.getProfile();
      set({ user: userProfile, isInitializing: false });
    } catch (error) {
      set({ user: null, isInitializing: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    set({ 
      user: null, 
      accessToken: null, 
      isAuthenticated: false 
    });
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token') || 
                  sessionStorage.getItem('access_token');
    
    if (token) {
      set({ accessToken: token, isAuthenticated: true });
      try {
        const userProfile = await profileService.getProfile();
        set({ user: userProfile, isInitializing: false });
      } catch (error) {
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false, 
          isInitializing: false 
        });
      }
    } else {
      set({ isInitializing: false });
    }
  },

  setUser: (user) => set({ user }),
}));
```

#### 路由 - React Router DOM v7

**`src/App.tsx`** (簡化範例):
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 受保護的路由 */}
        <Route path="/profile" element={
          isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
        } />
        <Route path="/clubs/:id" element={<ClubPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### API 通訊 - Axios

**`src/services/apiClient.ts`**:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動添加 JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || 
                sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 回應攔截器：處理 401 未授權錯誤
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && 
        error.config.url !== '/api/v1/auth/login') {
      // 清除 token 並重導向到登入頁
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 樣式 - Tailwind CSS 4

**`tailwind.config.js`**:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
```

使用 `clsx` 和 `tailwind-merge` 進行動態樣式組合：
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 表單處理 - React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少需要 6 個字元'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // 處理登入邏輯
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">登入</button>
    </form>
  );
}
```

#### 測試 - Vitest + React Testing Library

**`vite.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

### 5.3 建置與部署

#### 開發環境
```bash
npm run dev          # 啟動開發伺服器 (port 5173)
npm run lint         # ESLint 檢查
npm run test         # 執行測試
npm run test:ui      # 測試 UI
npm run test:coverage # 測試覆蓋率
```

#### 生產環境建置
```bash
npm run build        # 建置生產版本 (輸出到 dist/)
npm run preview      # 預覽生產版本
```

#### Vercel 部署設定

**`vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-backend-api.render.com"
  }
}
```

部署到 Vercel：
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生產環境部署
vercel --prod
```

### 5.4 環境變數

**`.env.local`** (開發環境):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

**生產環境**: 在 Vercel Dashboard 中設定環境變數
- `VITE_API_BASE_URL`: 後端 API URL (例如: https://bookclub-api.render.com)

---

## 6. 部署架構

### 6.1 部署平台

#### 後端 - Render
- **服務類型**: Web Service
- **運行時**: Python 3.11
- **建置指令**: `pip install -r requirements.txt`
- **啟動指令**: `sh build.sh` (執行遷移) + `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **資料庫**: Render PostgreSQL (Managed Database)
- **環境變數**: 
  - `DATABASE_URL` (自動提供)
  - `SECRET_KEY`
  - `FRONTEND_URL`
  - `CLOUDINARY_*` (檔案上傳)
  - `SENDGRID_API_KEY` (Email)

**`backend/build.sh`**:
```bash
#!/usr/bin/env bash
# 在部署時執行資料庫遷移
alembic upgrade head
```

**`backend/render.yaml`** (Infrastructure as Code):
```yaml
services:
  - type: web
    name: bookclub-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "sh build.sh && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: bookclub-db
          property: connectionString

databases:
  - name: bookclub-db
    databaseName: bookclub
    user: bookclub_user
```

#### 前端 - Vercel
- **框架檢測**: 自動識別 Vite + React
- **建置指令**: `npm run build`
- **輸出目錄**: `dist`
- **環境變數**: 
  - `VITE_API_BASE_URL`: 後端 API URL
- **部署**: 連接 GitHub repository，自動部署 main/master 分支
- **預覽部署**: 每個 Pull Request 自動建立預覽環境

### 6.2 環境區分

| 環境 | 後端 URL | 前端 URL | 資料庫 | 用途 |
|------|---------|---------|--------|------|
| **開發 (Local)** | http://localhost:8000 | http://localhost:5173 | Docker PostgreSQL | 本地開發 |
| **預覽 (Staging)** | Render Preview | Vercel Preview | Render PostgreSQL | Pull Request 預覽 |
| **生產 (Production)** | https://bookclub-api.onrender.com | https://bookclub.vercel.app | Render PostgreSQL (Prod) | 正式環境 |

---

## 7. 測試策略

### 7.1 後端測試

#### 測試結構
```
backend/tests/
├── conftest.py              # Pytest fixtures
├── unit/                    # 單元測試
│   ├── test_security.py     # 安全功能測試
│   └── test_models.py       # 模型驗證測試
└── integration/             # 整合測試
    ├── test_auth_api.py     # 認證 API 測試
    ├── test_club_management_api.py  # 讀書會管理測試
    ├── test_event_api.py    # 活動 API 測試
    └── ...
```

**執行測試**:
```bash
cd backend

# 執行所有測試
pytest

# 執行特定測試檔案
pytest tests/integration/test_auth_api.py -v

# 產生覆蓋率報告
pytest --cov=app --cov-report=html

# 只執行整合測試
pytest tests/integration/
```

### 7.2 前端測試

#### 測試類型
1. **單元測試**: Store、Hooks、Utils
2. **元件測試**: UI 元件行為
3. **整合測試**: 頁面流程測試

**執行測試**:
```bash
cd frontend

# 執行所有測試
npm run test

# 執行測試 UI
npm run test:ui

# 產生覆蓋率報告
npm run test:coverage
```

---

## 8. 效能優化與監控

### 8.1 後端效能優化

1. **資料庫查詢優化**
   - 使用索引 (index=True)
   - 避免 N+1 查詢問題
   - 分頁查詢減少資料傳輸量

2. **快取策略**
   - 考慮使用 Redis 快取熱門讀書會資料

3. **非同步處理**
   - 使用 FastAPI 的 async/await
   - 背景任務處理 Email 發送

### 8.2 前端效能優化

1. **程式碼分割 (Code Splitting)**
   - React.lazy() + Suspense 實現路由級別的懶載入

2. **圖片最佳化**
   - 使用 Cloudinary 自動調整圖片大小
   - WebP 格式支援
   - Lazy loading

3. **狀態管理最佳化**
   - Zustand 的選擇性訂閱
   - 避免不必要的重新渲染

4. **建置優化**
   - Vite 的 tree-shaking
   - 生產環境自動 minify 和壓縮

### 8.3 監控與日誌

**建議工具**:
- **後端**: Sentry (錯誤追蹤)、Render Metrics (資源使用)
- **前端**: Sentry (錯誤追蹤)、Vercel Analytics (效能)
- **資料庫**: Render PostgreSQL Dashboard (查詢分析)

---

## 9. 安全性檢查清單

- [x] 密碼使用 bcrypt 雜湊
- [x] JWT token 加密與驗證
- [x] CORS 正確設定
- [x] 環境變數不提交到版本控制 (.env 在 .gitignore)
- [x] SQL Injection 防護 (SQLModel 參數化查詢)
- [x] XSS 防護 (React 自動轉義)
- [x] 輸入驗證 (Pydantic 模型驗證)
- [x] HTTPS 強制使用 (生產環境)
- [x] API 版本控制 (/api/v1)
- [x] 帳號鎖定機制 (登入失敗次數限制 - 模型已準備)

---

## 10. 未來擴展性考量

### 10.1 功能擴展
- **即時通訊**: WebSocket 實現即時聊天室
- **推薦系統**: 基於興趣標籤的讀書會推薦演算法
- **行動應用**: React Native 或 Flutter 開發移動端
- **國際化 (i18n)**: 多語言支援

### 10.2 架構擴展
- **微服務化**: 將單體後端拆分為多個微服務
- **訊息佇列**: Redis Queue 處理非同步任務
- **搜尋引擎**: 整合 Elasticsearch 提升搜尋效能
- **CDN**: Cloudflare 加速靜態資源

### 10.3 規模化考量
- **負載平衡**: 多個 API 實例
- **資料庫優化**: 讀寫分離、垂直/水平分割
- **快取層**: Redis Cluster
- **監控與告警**: Prometheus + Grafana

---

## 11. 變更歷史

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|---------|------|
| v5.0 | 2025-11-11 | 更新為實際專案實作版本，包含完整的技術棧、專案結構、測試策略、部署架構 | Winston (Architect) |
| v4.0 | 2024-XX-XX | 採用 SQLModel + Alembic 架構，拆分為多個子文件 | - |

---

## 12. 參考資源

### 官方文件
- [FastAPI 文件](https://fastapi.tiangolo.com/)
- [SQLModel 文件](https://sqlmodel.tiangolo.com/)
- [Alembic 文件](https://alembic.sqlalchemy.org/)
- [React 文件](https://react.dev/)
- [Vite 文件](https://vitejs.dev/)
- [Zustand 文件](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS 文件](https://tailwindcss.com/)

### 部署平台
- [Render 文件](https://render.com/docs)
- [Vercel 文件](https://vercel.com/docs)

### 最佳實踐
- [12-Factor App](https://12factor.net/)
- [REST API 設計指南](https://restfulapi.net/)

---

**文件維護說明**: 本架構文件應隨專案演進持續更新，確保文件與實際實作保持同步。主要章節已拆分為獨立文件（見索引），本文件作為快速參考指南。

---