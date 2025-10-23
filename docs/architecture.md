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

# 1. 架構概覽 (v4.0)

## 技術摘要
本系統採用現代化前後端分離架構。前端維持使用 **Vite + React 18 + Tailwind CSS**。後端採用 **Python 3.11+ 與 FastAPI**。資料庫互動層則選用 **SQLModel** 作為 ORM，它完美結合了 SQLAlchemy Core 的強大功能與 Pydantic 的資料驗證能力。資料庫為 **PostgreSQL**，並使用 **Alembic** 進行資料庫結構的遷移管理。整體開發與部署流程使用 Docker 與 Docker Compose 進行容器化管理。

## 平台與基礎設施選擇
- **前端**: Vite + React 18, Tailwind CSS
- **後端**: Python 3.11+, FastAPI, Uvicorn (ASGI Server)
- **資料庫**: PostgreSQL
- **ORM**: SQLModel
- **資料庫遷移**: Alembic
- **PostgreSQL 驅動**: psycopg2-binary

**選擇理由**:
- **SQLModel 與 FastAPI 的無縫整合**: 由同一作者開發，能用單一 Class 定義資料庫模型與 API Schema，大幅減少程式碼重複，提升開發效率。
- **SQLAlchemy Core 的強大底層**: 繼承了 SQLAlchemy 的穩定性、效能和強大的查詢能力。
- **Alembic**: Python 生態系中最強大、最主流的資料庫遷移工具。

---


### 資料模型與 API Schema (SQLModel 範例)

SQLModel 的核心優勢是可以用一個基礎模型，衍生出資料庫模型和 API 所需的各種資料結構。這與 PRD v2.1 中定義的功能需求 (如 FR1.9 興趣標籤) 和 Epic 2 (讀書會管理) 保持一致。

**`app/models/tag.py`**
```python
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship

# 中間表，用於 User 和 Tag 的多對多關係
class UserTagLink(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class TagBase(SQLModel):
    name: str = Field(index=True, unique=True)
    
class Tag(TagBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    users: List["User"] = Relationship(back_populates="tags", link_model=UserTagLink)

class TagRead(TagBase):
    id: int
```

**`app/models/user.py` (擴充)**
```python
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from .tag import Tag, UserTagLink # 引入 Tag 模型

# 用於 API 的基礎欄位
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# 資料庫表格模型
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    is_active: bool = True
    
    tags: List[Tag] = Relationship(back_populates="users", link_model=UserTagLink)

# 用於建立用戶的 API 輸入模型
class UserCreate(UserBase):
    password: str

# 用於讀取用戶資訊的 API 輸出模型 (包含興趣標籤)
class UserRead(UserBase):
    id: int

class UserReadWithTags(UserRead):
    tags: List[TagRead] = []
```

**`app/models/book_club.py`**
```python
from typing import Optional
from sqlmodel import Field, SQLModel

class BookClubBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    is_public: bool = True

class BookClub(BookClubBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")

class BookClubRead(BookClubBase):
    id: int
    owner_id: int
```

### RESTful API 設計範例 (FastAPI + SQLModel)

**`app/api/endpoints/auth.py`**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.user import User, UserCreate
from app.core.security import hash_password

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
def register_new_user(
    *, session: Session = Depends(get_session), user_in: UserCreate
) -> User:
    """
    Creates a new user.
    """
    db_user = session.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )
    
    hashed_password = hash_password(user_in.password)
    # user_in.dict() 會排除掉 password，因為 User 模型沒有 password 欄位
    user_data = user_in.dict(exclude_unset=True)
    del user_data["password"] # 確保 password 不會被傳入

    db_user = User(**user_data, password_hash=hashed_password)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

### 2.4 安全性設計

根據 PRD v2.1 的非功能需求 (NFR1.5)，後端需實作以下安全機制：

*   **速率限制 (Rate Limiting)**:
    *   **實作**: 使用 `slowapi` 中介軟體。
    *   **策略**: 針對認證相關端點 (如 `/login`, `/register`) 實施更嚴格的限制 (例如：每分鐘 5 次請求)，對一般 API 則採較寬鬆限制 (例如：每分鐘 60 次請求)。

*   **跨站請求偽造 (CSRF) 保護**:
    *   **策略**: 由於我們採用前後端分離架構並使用 JWT Bearer Token 進行認證，傳統基於 Cookie 的 CSRF 攻擊風險較低。我們將確保：
        1.  不使用 Cookie 進行身份驗證。
        2.  前端應用程式在發送請求時，將 JWT Token 放在 `Authorization` 標頭中。

*   **跨站腳本 (XSS) 防護**:
    *   **策略**:
        1.  **FastAPI**: FastAPI 預設會對輸出進行 HTML 編碼，可有效防止反射型 XSS。
        2.  **前端 (React)**: React 預設會對 JSX 中嵌入的內容進行轉義，防止儲存型 XSS。
        3.  **內容安全政策 (CSP)**: 將在前端部署時設定嚴格的 CSP 標頭，限制可執行的腳本來源。

### 2.5 API 路由規劃 (概覽)

此路由規劃對應 PRD v2.1 中定義的四個核心 Epics。

*   **Epic 1: 用戶系統**
    *   `POST /api/v1/auth/register`: 用戶註冊
    *   `POST /api/v1/auth/login`: 用戶登入
    *   `POST /api/v1/auth/login/google`: Google 登入
    *   `GET /api/v1/users/me`: 獲取當前用戶資訊
    *   `PUT /api/v1/users/me`: 更新用戶個人檔案 (名稱、簡介)
    *   `POST /api/v1/users/me/avatar`: 上傳頭像
    *   `PUT /api/v1/users/me/tags`: 更新用戶興趣標籤

*   **Epic 2: 讀書會管理**
    *   `POST /api/v1/clubs`: 
    *   `GET /api/v1/clubs/{clubId}`: 獲取讀書會詳細資訊
    *   `POST /api/v1/clubs/{clubId}/join`: 加入讀書會
    *   `DELETE /api/v1/clubs/{clubId}/leave`: 退出讀書會
    *   `PUT /api/v1/clubs/{clubId}`: (管理員) 更新讀書會資訊
    *   `DELETE /api/v1/clubs/{clubId}`: (擁有者) 刪除讀書會

*   **Epic 3: 學習協作**
    *   `GET /api/v1/clubs/{clubId}/discussions`: 獲取討論列表
    *   `POST /api/v1/clubs/{clubId}/discussions`: 建立新討論
    *   `GET /api/v1/clubs/{clubId}/discussions/{topicId}`: 查看討論串
    *   `POST /api/v1/clubs/{clubId}/discussions/{topicId}/comments`: 回覆討論
    *   `GET /api/v1/clubs/{clubId}/resources`: 獲取資源列表
    *   `POST /api/v1/clubs/{clubId}/resources`: 上傳資建立讀書會
    *   `GET /api/v1/clubs`: 探索/搜尋讀書會源

*   **Epic 4: 智能互動**
    *   `GET /api/v1/notifications`: 獲取通知列表
    *   `POST /api/v1/notifications/read`: 將通知標為已讀

---

## 3. 資料庫遷移 (Alembic)

我們將使用 Alembic 來管理資料庫結構的變更。

1.  **初始化 Alembic** (只需執行一次):
    ```bash
    # 在 backend/ 目錄下執行
    alembic init alembic
    ```
    這會建立 `alembic` 資料夾和 `alembic.ini` 設定檔。需要修改設定檔以指向我們的資料庫。

2.  **建立遷移腳本**:
    ```bash
    alembic revision --autogenerate -m "Create user table"
    ```
    Alembic 會比較 SQLModel 模型和資料庫的差異，自動產生遷移腳本。

3.  **應用遷移**:
    ```bash
    alembic upgrade head
    ```
    這會將最新的遷移應用到資料庫。

---

## 4. 開發環境 (Docker for SQLModel)

### a. Python 依賴 (`requirements.txt`)
```
fastapi
uvicorn[standard]
sqlmodel
alembic
psycopg2-binary
python-dotenv
bcrypt
```

### b. API Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim-bullseye

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app
COPY ./alembic ./alembic
COPY alembic.ini .

EXPOSE 8000

# 在啟動時，先執行資料庫遷移，再啟動伺服器
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

### c. Docker Compose (`backend/docker-compose.yml`)
```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bookclub_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ..  # 建置上下文是專案根目錄
      dockerfile: backend/Dockerfile # Dockerfile 的路徑
    ports:
      - '8000:8000'
    depends_on:
      - db
    volumes:
      - ./app:/usr/src/app/app # 掛載原始碼以實現熱重載
    environment:
      DATABASE_URL: "postgresql://user:password@db:5432/bookclub_dev"

volumes:
  postgres_data:

---

## 5. 前端架構詳細設計 (Vite + React)

前端將採用基於元件的現代化架構，以 Vite 作為建置工具，搭配 React 18 框架和 TypeScript。

### a. 前端專案結構 (`/frontend/src/`)
```
/frontend/
├── src/
│   ├── assets/         # 靜態資源，如圖片、字體
│   ├── components/     # 可重用的 UI 元件 (e.g., Button, Input, Card)
│   │   └── ui/         # 基礎 UI 元件 (Shadcn/UI 風格)
│   ├── pages/          # 頁面級元件 (e.g., HomePage, LoginPage, ProfilePage)
│   ├── services/       # API 請求層 (e.g., authService.ts, userService.ts)
│   ├── store/          # 狀態管理 (Redux Toolkit)
│   │   ├── slices/     # 各個功能的 slice (e.g., authSlice.ts)
│   │   └── store.ts    # Redux store 設定
│   ├── types/          # 全域 TypeScript 型別定義
│   ├── utils/          # 共用工具函式
│   ├── App.tsx         # 應用程式主元件，包含路由設定
│   ├── main.tsx        # 應用程式進入點
│   └── index.css       # 全域樣式
├── public/             # 公開靜態檔案
├── package.json        # 專案依賴與腳本
├── vite.config.ts      # Vite 設定檔
└── tsconfig.json       # TypeScript 設定檔
```

### b. 關鍵技術選擇與實踐

*   **狀態管理 (State Management)**:
    *   **選擇**: **Redux Toolkit**
    *   **理由**: 作為 React 生態系中最成熟的狀態管理方案，Redux Toolkit 提供了可預測的狀態容器，並簡化了 Redux 的樣板程式碼。其 `createSlice` 功能可以輕鬆定義 state, reducers 和 actions，`configureStore` 則自動整合了 Redux DevTools 和常用 middleware，非常適合管理複雜的應用程式狀態，例如使用者認證資訊、讀書會資料等。

*   **路由 (Routing)**:
    *   **選擇**: **React Router DOM (v6)**
    *   **理由**: 這是 React 官方推薦的路由解決方案，提供宣告式的路由定義方式，支援巢狀路由、動態路由參數等功能，能輕鬆建構單頁應用程式 (SPA) 的導航體驗。

*   **API 通訊 (API Communication)**:
    *   **選擇**: **Axios**
    *   **實踐**: 在 `src/services` 目錄下建立 API 客戶端實例。透過攔截器 (interceptors) 統一處理請求標頭 (如 `Authorization` token)、錯誤處理和回應資料轉換，避免在每個元件中重複撰寫相同的邏輯。

*   **樣式 (Styling)**:
    *   **選擇**: **Tailwind CSS**
    *   **理由**: 採用 Utility-First 的方法，讓我們能快速建構客製化 UI，而無需離開 HTML。搭配 PostCSS 和 Autoprefixer，能確保樣式的跨瀏覽器相容性。我們將結合 `clsx` 或 `tailwind-merge` 函式庫來動態組合和管理 CSS class。

*   **表單處理 (Form Handling)**:
    *   **選擇**: **React Hook Form**
    *   **理由**: 透過非受控元件 (Uncontrolled Components) 的方式提升表單效能，並提供簡單易用的 Hook (`useForm`) 來管理表單狀態、驗證 (可整合 Zod) 和提交，大幅簡化複雜表單的開發。

*   **開發與建置工具 (Dev & Build Tool)**:
    *   **選擇**: **Vite**
    *   **理由**: 利用瀏覽器原生的 ES Modules 支持，提供極速的開發伺服器啟動時間和熱模組更新 (HMR) 速度。在生產環境中，使用 Rollup 進行打包，提供高效能的優化輸出。
```