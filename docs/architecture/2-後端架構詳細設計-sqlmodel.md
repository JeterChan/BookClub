# 2. 後端架構詳細設計 (SQLModel)

## FastAPI 專案結構 (v4.0)
```
/backend/
├── app/                      # 主要的應用程式目錄
│   ├── api/                  # API 路由模組
│   │   ├── endpoints/        # 各個資源的端點 (auth.py, users.py)
│   │   └── api.py            # 主路由器
│   ├── core/                 # 核心配置 (config.py, security.py)
│   ├── db/                   # 資料庫 session 管理
│   │   └── session.py
│   ├── models/               # SQLModel 資料庫模型 (user.py, book_club.py)
│   ├── schemas/              # Pydantic API 資料結構 (可與 models 結合)
│   └── main.py               # FastAPI 應用程式進入點
├── alembic/                  # Alembic 遷移檔案目錄
├── tests/                    # 測試目錄
├── .env
├── Dockerfile
└── requirements.txt          # Python 依賴列表
```

## 資料模型與 API Schema (SQLModel 範例)

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

## RESTful API 設計範例 (FastAPI + SQLModel)

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
    *   `POST /api/v1/clubs`: 建立讀書會
    *   `GET /api/v1/clubs`: 探索/搜尋讀書會
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
    *   `POST /api/v1/clubs/{clubId}/resources`: 上傳資源

*   **Epic 4: 智能互動**
    *   `GET /api/v1/notifications`: 獲取通知列表
    *   `POST /api/v1/notifications/read`: 將通知標為已讀

---
