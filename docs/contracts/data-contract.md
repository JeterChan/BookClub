# Data Contract

**版本**: 1.0  
**最後更新**: 2025-10-22  
**擁有者**: Architect Winston  
**狀態**: ✅ 已完成（Story 1.4）

---

## 📋 概述

此文件定義線上讀書會平台前後端資料格式約定，確保資料在不同層次間正確轉換和傳遞。

**核心原則**:
- **一致性**: 每層使用其慣用的命名規範
- **可預測性**: 轉換規則清晰且自動化
- **型別安全**: 所有資料都有明確的型別定義
- **向後兼容**: 變更遵循版本化策略

---

## 🏗️ 資料層級與命名規範

### 層級對照表

| 層級 | 命名規範 | 範例 | 說明 |
|------|---------|------|------|
| **Database** | snake_case | `created_at`, `display_name` | PostgreSQL 表格和欄位 |
| **Backend (Python)** | snake_case | `created_at`, `display_name` | SQLModel Models, 函式名稱 |
| **API Request/Response** | camelCase | `createdAt`, `displayName` | JSON 格式的 API 資料 |
| **Frontend (TypeScript)** | camelCase | `createdAt`, `displayName` | React 元件, 狀態變數 |

### 命名規範詳細說明

#### Backend (Python) - snake_case

```python
# SQLModel Model
class User(SQLModel, table=True):
    display_name: str
    created_at: datetime
    is_active: bool

# 函式命名
def get_user_profile(user_id: int) -> User:
    pass
```

#### API Response - camelCase

```python
# Pydantic Schema with alias
class UserRead(SQLModel):
    display_name: str = Field(alias="displayName")
    created_at: datetime = Field(alias="createdAt")
    is_active: bool = Field(alias="isActive")
    
    class Config:
        populate_by_name = True  # 允許兩種命名方式
```

#### Frontend (TypeScript) - camelCase

```typescript
interface User {
  displayName: string;
  createdAt: string;  // ISO 8601 字串
  isActive: boolean;
}

// 使用
const userName = user.displayName;
```

---

## 🔄 自動轉換機制

### Backend 轉換（Pydantic）

我們使用 **Pydantic Field alias** 自動轉換：

```python
from pydantic import Field
from sqlmodel import SQLModel

class DashboardStats(SQLModel):
    """儀表板統計資料"""
    clubs_count: int = Field(alias="clubsCount")
    books_read: int = Field(alias="booksRead")
    discussions_count: int = Field(alias="discussionsCount")
    
    class Config:
        populate_by_name = True
```

**轉換結果**:
- Python 代碼使用: `stats.clubs_count`
- API Response 輸出: `{"clubsCount": 10}`

### Frontend 轉換（TypeScript）

使用 `openapi-typescript` 自動生成的 types 已包含 camelCase：

```typescript
import type { components } from './types/api';

type DashboardStats = components['schemas']['DashboardStats'];

// API 回應已經是 camelCase
const stats: DashboardStats = {
  clubsCount: 10,
  booksRead: 5,
  discussionsCount: 20
};
```

---

## 📦 標準 Response 格式

### 成功回應

#### 單一資源

```json
{
  "id": 1,
  "email": "user@example.com",
  "displayName": "John Doe",
  "bio": "Book lover",
  "avatarUrl": "https://example.com/avatar.jpg",
  "isActive": true,
  "createdAt": "2025-10-22T14:30:00Z",
  "updatedAt": "2025-10-22T14:30:00Z"
}
```

#### 資源列表

```json
{
  "items": [
    {
      "id": 1,
      "name": "Python 讀書會",
      "memberCount": 15
    },
    {
      "id": 2,
      "name": "JavaScript 讀書會",
      "memberCount": 20
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 50,
    "totalPages": 3
  }
}
```

#### 操作成功

```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "displayName": "New Name"
  }
}
```

### 錯誤回應

FastAPI 自動生成的錯誤格式：

#### 驗證錯誤 (422)

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "displayName"],
      "msg": "String should have at least 1 character",
      "input": "",
      "ctx": {
        "min_length": 1
      }
    }
  ]
}
```

#### 業務邏輯錯誤 (400)

```json
{
  "detail": "Email already exists"
}
```

#### 認證錯誤 (401)

```json
{
  "detail": "Could not validate credentials"
}
```

#### 權限錯誤 (403)

```json
{
  "detail": "Account is inactive"
}
```

#### 資源不存在 (404)

```json
{
  "detail": "User not found"
}
```

---

## 📅 資料型別規範

### 日期時間

**格式**: ISO 8601 with UTC timezone

```json
{
  "createdAt": "2025-10-22T14:30:00Z",
  "updatedAt": "2025-10-22T15:45:30.123Z",
  "lockedUntil": null
}
```

**Backend 處理**:
```python
from datetime import datetime

# 建立時間（UTC）
created_at: datetime = Field(default_factory=datetime.utcnow)

# 在 Pydantic Schema 中自動序列化為 ISO 8601
```

**Frontend 處理**:
```typescript
// 解析
const date = new Date(user.createdAt);

// 顯示本地時間
const localTime = date.toLocaleString();

// 相對時間
const relativeTime = formatDistanceToNow(date);
```

### 布林值

**規範**: 使用 `true` / `false`（JSON 標準）

```json
{
  "isActive": true,
  "isPredefined": false,
  "isRead": false
}
```

❌ **禁止使用**: `1` / `0`, `"true"` / `"false"`

### Null 處理

**規範**: 
- 欄位可能為空時，值為 `null`（不是 `undefined`）
- 欄位不存在時才是 `undefined`（但 API 不應回傳 undefined）

```json
{
  "bio": null,           // 明確為空
  "avatarUrl": null,     // 尚未設定
  "googleId": null       // 未綁定 Google 帳號
}
```

### ID 型別

**規範**: 使用 `integer` (PostgreSQL SERIAL)

```json
{
  "id": 123,
  "userId": 456,
  "bookClubId": 789
}
```

**未來擴展**: 如果需要 UUID，將在 API 版本 2.0 中引入

### 枚舉 (Enum)

**規範**: 使用字串枚舉

```json
{
  "visibility": "public",     // "public" | "private"
  "role": "admin",            // "owner" | "admin" | "member"
  "type": "newPost"          // "newPost" | "newMember"
}
```

**Backend 定義**:
```python
from enum import Enum

class BookClubVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"

class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
```

**Frontend 使用**:
```typescript
type Visibility = "public" | "private";
type MemberRole = "owner" | "admin" | "member";
```

---

## 🔑 特殊欄位約定

### 時間戳欄位

所有 Model 的時間戳欄位使用統一命名：

| Backend (Python) | API Response | 說明 |
|------------------|--------------|------|
| `created_at` | `createdAt` | 資源建立時間（UTC） |
| `updated_at` | `updatedAt` | 資源最後更新時間（UTC） |
| `deleted_at` | `deletedAt` | 軟刪除時間（如適用） |
| `locked_until` | `lockedUntil` | 帳號鎖定至此時間 |

**範例**:
```json
{
  "id": 1,
  "displayName": "John Doe",
  "createdAt": "2025-10-15T10:00:00Z",
  "updatedAt": "2025-10-22T14:30:00Z"
}
```

### 審計欄位

目前 Epic 1 不包含，預計 Epic 3+ 引入：

| Backend (Python) | API Response | 說明 |
|------------------|--------------|------|
| `created_by` | `createdBy` | 建立者用戶 ID |
| `updated_by` | `updatedBy` | 最後更新者用戶 ID |

### 軟刪除欄位

目前 Epic 1 不包含，預計 Epic 4+ 引入：

| Backend (Python) | API Response | 說明 |
|------------------|--------------|------|
| `is_deleted` | `isDeleted` | 是否已刪除（布林值） |
| `deleted_at` | `deletedAt` | 刪除時間（如已刪除） |

### 分頁欄位

**Request Query Parameters** (snake_case in URL):
```
GET /api/book-clubs?page=1&page_size=20&sort_by=created_at&order=desc
```

**Response** (camelCase):
```json
{
  "items": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 📊 範例對照表

### User Model 完整對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `email` | `email: str` | `email` | `email: string` |
| `display_name` | `display_name: str` | `displayName` | `displayName: string` |
| `password_hash` | `password_hash: str` | *(不回傳)* | *(不存在)* |
| `google_id` | `google_id: Optional[str]` | `googleId` | `googleId?: string` |
| `oauth_provider` | `oauth_provider: Optional[str]` | `oauthProvider` | `oauthProvider?: string` |
| `bio` | `bio: Optional[str]` | `bio` | `bio?: string` |
| `avatar_url` | `avatar_url: Optional[str]` | `avatarUrl` | `avatarUrl?: string` |
| `is_active` | `is_active: bool` | `isActive` | `isActive: boolean` |
| `failed_login_attempts` | `failed_login_attempts: int` | *(不回傳)* | *(不存在)* |
| `locked_until` | `locked_until: Optional[datetime]` | *(不回傳)* | *(不存在)* |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |
| `updated_at` | `updated_at: datetime` | `updatedAt` | `updatedAt: string` |

### InterestTag Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `name` | `name: str` | `name` | `name: string` |
| `is_predefined` | `is_predefined: bool` | `isPredefined` | `isPredefined: boolean` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |

### BookClub Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `name` | `name: str` | `name` | `name: string` |
| `description` | `description: Optional[str]` | `description` | `description?: string` |
| `visibility` | `visibility: BookClubVisibility` | `visibility` | `visibility: "public" \| "private"` |
| `owner_id` | `owner_id: int` | `ownerId` | `ownerId: number` |

---

## 🛠️ 實作指引

### Backend: 如何定義 Schema

```python
from pydantic import Field
from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional

class UserProfileRead(SQLModel):
    """用戶個人檔案讀取 Schema"""
    id: int
    email: str
    display_name: str = Field(alias="displayName")
    bio: Optional[str] = None
    avatar_url: Optional[str] = Field(default=None, alias="avatarUrl")
    is_active: bool = Field(alias="isActive")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    
    class Config:
        populate_by_name = True  # 允許 snake_case 和 camelCase
```

### Backend: Response 序列化

FastAPI 自動處理序列化，確保使用 `response_model`:

```python
@router.get("/users/me", response_model=UserProfileRead)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """獲取當前用戶個人檔案"""
    return current_user  # Pydantic 自動轉換為 camelCase
```

### Frontend: 使用生成的 Types

```typescript
import type { components } from './types/api';

type UserProfile = components['schemas']['UserProfileRead'];

// API 請求
const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// 使用
const profile = await fetchUserProfile();
console.log(profile.displayName);  // camelCase
console.log(profile.createdAt);     // ISO 8601 string
```

---

## ⚠️ 常見陷阱與最佳實踐

### ❌ 避免的做法

**1. 混用命名規範**
```typescript
// ❌ 錯誤：混用 snake_case 和 camelCase
interface User {
  displayName: string;  // camelCase
  created_at: string;   // snake_case - 錯誤！
}
```

**2. 手動轉換欄位名稱**
```python
# ❌ 錯誤：手動構建 dict
return {
    "displayName": user.display_name,  # 容易出錯
    "createdAt": user.created_at.isoformat()
}
```

**3. 使用錯誤的日期格式**
```json
// ❌ 錯誤：不是 ISO 8601
{
  "createdAt": "2025/10/22 14:30:00"  // 應該是 "2025-10-22T14:30:00Z"
}
```

### ✅ 推薦的做法

**1. 使用 Pydantic Schema**
```python
# ✅ 正確：使用 Pydantic 自動轉換
@router.get("/users/me", response_model=UserProfileRead)
def get_profile(user: User = Depends(get_current_user)):
    return user  # Pydantic 處理所有轉換
```

**2. 使用生成的 TypeScript Types**
```typescript
// ✅ 正確：使用 openapi-typescript 生成的 types
import type { components } from './types/api';
type User = components['schemas']['UserProfileRead'];
```

**3. 使用 ISO 8601 處理日期**
```python
# ✅ 正確：Pydantic 自動處理 datetime
from datetime import datetime

class User(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## 🔄 版本化與變更管理

### Breaking Changes

以下變更視為 **Breaking Changes**，需要 API 版本升級：

- ✗ 移除欄位
- ✗ 重新命名欄位
- ✗ 改變欄位型別（如 `string` → `integer`）
- ✗ 將可選欄位改為必填
- ✗ 改變枚舉值

### Non-Breaking Changes

以下變更為 **Non-Breaking Changes**，可在同版本中更新：

- ✓ 新增欄位（必須為可選）
- ✓ 將必填欄位改為可選
- ✓ 新增枚舉值（如果系統可處理未知值）
- ✓ 更新文件和註解

### 變更流程

1. **Backend Dev** 修改 Pydantic Schema
2. **Frontend Dev** 重新生成 TypeScript types: `npm run generate-types`
3. **檢查變更**: `git diff src/types/api.ts`
4. **更新代碼**: 根據 TypeScript 錯誤提示修改
5. **更新此文件**: 記錄新增的欄位和約定

---

## 📚 相關資源

### 內部文件
- [Database Schema](database-schema.md) - 資料庫結構（snake_case）
- [API Access Guide](api-access-guide.md) - 如何訪問 API 文件
- [Maintenance Workflow](maintenance-workflow.md) - 契約更新流程

### 外部文件
- [Pydantic Field Aliases](https://docs.pydantic.dev/latest/concepts/fields/#field-aliases)
- [FastAPI Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

---

## 🆘 FAQ

### Q: 為什麼不統一使用 camelCase 或 snake_case？

**A**: 
- **Python 生態**: PEP 8 規範使用 snake_case
- **JavaScript 生態**: 慣例使用 camelCase
- **最佳實踐**: 尊重各語言的慣例，使用自動轉換避免錯誤

### Q: 新增欄位時應該怎麼做？

**A**:
1. 在 SQLModel Model 中新增欄位（snake_case）
2. 在 Pydantic Schema 中添加 `Field(alias="camelCase")`
3. 建立 Alembic migration
4. 前端重新生成 types
5. 更新 Data Contract 文件

### Q: 如何處理巢狀物件？

**A**: 
巢狀物件也遵循相同規則：
```python
class BookClubDetail(SQLModel):
    id: int
    name: str
    owner: UserProfileRead  # 巢狀物件，也使用 camelCase alias
```

### Q: Query Parameters 使用什麼命名？

**A**:
URL 中使用 **snake_case**（HTTP 慣例）：
```
GET /api/users?page_size=20&sort_by=created_at
```

但 Response Body 使用 **camelCase**。

---

**建立日期**: 2025-10-22  
**維護者**: Architect Winston  
**版本**: 1.0  
**下次審查**: Epic 2 開始前
