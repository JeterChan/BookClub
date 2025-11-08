# Data Contract

**版本**: 1.3  
**最後更新**: 2025-11-08  
**擁有者**: Architect Winston  
**狀態**: ✅ 已完成（Story 3.3）

---

## 📋 概述

此文件定義線上讀書會平台前後端資料格式約定，確保資料在不同層次間正確轉換和傳遞。

**涵蓋範圍**:
- Epic 1: 用戶管理與興趣標籤
- Epic 2: 讀書會管理與活動功能
- Epic 3: 討論互動功能
- 完整的資料 Model 對照表（Database ↔ Backend ↔ API ↔ Frontend）
- 密碼重置與 Email 驗證功能

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
| `email_verified` | `email_verified: bool` | `emailVerified` | `emailVerified: boolean` |
| `email_verification_token` | `email_verification_token: Optional[str]` | *(不回傳)* | *(不存在)* |
| `email_verification_token_expires_at` | `email_verification_token_expires_at: Optional[datetime]` | *(不回傳)* | *(不存在)* |
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
| `cover_image_url` | `cover_image_url: Optional[str]` | `coverImageUrl` | `coverImageUrl?: string` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |
| `updated_at` | `updated_at: datetime` | `updatedAt` | `updatedAt: string` |

### ClubTag Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `name` | `name: str` | `name` | `name: string` |
| `is_predefined` | `is_predefined: bool` | `isPredefined` | `isPredefined: boolean` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |

### DiscussionTopic Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `club_id` | `club_id: int` | `clubId` | `clubId: number` |
| `owner_id` | `owner_id: int` | `ownerId` | `ownerId: number` |
| `title` | `title: str` | `title` | `title: string` |
| `content` | `content: str` | `content` | `content: string` |
| `comment_count` | `comment_count: int` | `commentCount` | `commentCount: number` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |

### DiscussionComment Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `topic_id` | `topic_id: int` | `topicId` | `topicId: number` |
| `owner_id` | `owner_id: int` | `ownerId` | `ownerId: number` |
| `content` | `content: str` | `content` | `content: string` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |

### ClubJoinRequest Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | `id` | `id: number` |
| `book_club_id` | `book_club_id: int` | `bookClubId` | `bookClubId: number` |
| `user_id` | `user_id: int` | `userId` | `userId: number` |
| `status` | `status: str` | `status` | `status: "pending" \| "approved" \| "rejected"` |
| `created_at` | `created_at: datetime` | `createdAt` | `createdAt: string` |
| `updated_at` | `updated_at: datetime` | `updatedAt` | `updatedAt: string` |

### PasswordResetToken Model 對照

| Database Schema | Backend Model | API Response | Frontend Type |
|-----------------|---------------|--------------|---------------|
| `id` | `id: int` | *(不回傳)* | *(不存在)* |
| `user_id` | `user_id: int` | *(不回傳)* | *(不存在)* |
| `token` | `token: str` | *(不回傳)* | *(不存在)* |
| `expires_at` | `expires_at: datetime` | *(不回傳)* | *(不存在)* |
| `used` | `used: bool` | *(不回傳)* | *(不存在)* |
| `created_at` | `created_at: datetime` | *(不回傳)* | *(不存在)* |
| `ip_address` | `ip_address: Optional[str]` | *(不回傳)* | *(不存在)* |

**注意**: PasswordResetToken 僅用於後端驗證流程，不會在 API Response 中回傳。

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

---

## 🎯 Epic 2: 活動管理 API 規格

### 活動資料結構

#### EventCreate (建立活動請求)

```json
{
  "clubId": 1,
  "title": "《原子習慣》第一章討論會",
  "description": "我們將討論習慣的核心原理，以及如何建立良好的習慣系統。請大家事先閱讀第1-3章。",
  "eventDatetime": "2025-11-15T19:00:00Z",
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "maxParticipants": 20,
  "status": "draft"
}
```

**欄位說明**:
- `clubId` (integer, required): 所屬讀書會 ID
- `title` (string, required): 活動名稱，1-100 字元
- `description` (string, required): 活動描述，1-2000 字元
- `eventDatetime` (string, required): 活動時間 (ISO 8601, UTC)，必須為未來時間
- `meetingUrl` (string, required): 線上會議連結，必須為有效 URL
- `maxParticipants` (integer, optional): 參與人數上限，null = 無限制
- `status` (string, optional): 活動狀態，預設 "draft"

**Status 枚舉**: `"draft"` | `"published"` | `"completed"` | `"cancelled"`

#### EventRead (活動回應)

```json
{
  "id": 1,
  "clubId": 1,
  "title": "《原子習慣》第一章討論會",
  "description": "我們將討論習慣的核心原理...",
  "eventDatetime": "2025-11-15T19:00:00Z",
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "maxParticipants": 20,
  "currentParticipants": 8,
  "status": "published",
  "organizer": {
    "id": 5,
    "displayName": "張小明",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "isOrganizer": false,
  "isParticipating": true,
  "canRegister": true,
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T10:00:00Z"
}
```

**計算欄位**:
- `currentParticipants` (integer): 當前報名人數 (status='registered')
- `isOrganizer` (boolean): 當前用戶是否為發起人
- `isParticipating` (boolean): 當前用戶是否已報名
- `canRegister` (boolean): 當前是否可報名（考慮人數限制、活動狀態等）

#### EventUpdate (更新活動請求)

```json
{
  "title": "《原子習慣》第一章討論會（更新）",
  "description": "更新後的描述...",
  "eventDatetime": "2025-11-15T20:00:00Z",
  "meetingUrl": "https://zoom.us/j/123456789",
  "maxParticipants": 25,
  "status": "published"
}
```

**規則**:
- 所有欄位皆為 optional
- 只能更新未開始且未取消的活動
- 狀態轉換規則：
  - `draft` → `published` ✅
  - `published` → `cancelled` ✅
  - `published` → `draft` ❌
  - `completed` → 任何狀態 ❌

#### EventParticipantRead (參與者資訊)

```json
{
  "eventId": 1,
  "userId": 10,
  "user": {
    "id": 10,
    "displayName": "李小華",
    "avatarUrl": "https://example.com/avatar2.jpg"
  },
  "status": "registered",
  "registeredAt": "2025-11-02T08:30:00Z"
}
```

#### EventListResponse (活動列表回應)

```json
{
  "items": [
    {
      "id": 1,
      "title": "《原子習慣》討論會",
      "eventDatetime": "2025-11-15T19:00:00Z",
      "currentParticipants": 8,
      "maxParticipants": 20,
      "status": "published",
      "organizer": {
        "id": 5,
        "displayName": "張小明"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 15,
    "totalPages": 1
  }
}
```

---

### API 端點規格

#### 1. 建立活動

```
POST /api/clubs/{club_id}/events
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be a member of the club

**Request Body**: EventCreate (JSON)

**Success Response** (201 Created):
```json
{
  "message": "Event created successfully",
  "data": EventRead
}
```

**Error Responses**:
- `400 Bad Request`: 時間為過去、URL 格式錯誤
- `401 Unauthorized`: 未登入
- `403 Forbidden`: 非讀書會成員
- `404 Not Found`: 讀書會不存在
- `422 Unprocessable Entity`: 驗證失敗

---

#### 2. 取得活動列表

```
GET /api/clubs/{club_id}/events
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be a member of the club

**Query Parameters**:
- `status` (string, optional): 篩選狀態 (`published`, `completed`, `cancelled`)
- `page` (integer, optional): 頁碼，預設 1
- `page_size` (integer, optional): 每頁筆數，預設 20，最大 100
- `sort_by` (string, optional): 排序欄位，預設 `event_datetime`
- `order` (string, optional): 排序方向 (`asc`, `desc`)，預設 `asc`

**Success Response** (200 OK):
```json
EventListResponse
```

**預設行為**:
- 只顯示 `status = 'published'` 的活動（除非用 status 參數篩選）
- 按活動時間升序排列（最近的活動在前）
- 自動區分「即將舉行」（未來時間）和「已結束」（過去時間但 status 仍為 published）

---

#### 3. 取得單一活動詳情

```
GET /api/clubs/{club_id}/events/{event_id}
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be a member of the club

**Success Response** (200 OK):
```json
EventRead
```

**Error Responses**:
- `401 Unauthorized`: 未登入
- `403 Forbidden`: 非讀書會成員
- `404 Not Found`: 活動或讀書會不存在

---

#### 4. 更新活動

```
PATCH /api/clubs/{club_id}/events/{event_id}
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be the organizer

**Request Body**: EventUpdate (JSON, partial)

**Success Response** (200 OK):
```json
{
  "message": "Event updated successfully",
  "data": EventRead
}
```

**Business Rules**:
- 只有發起人可以更新
- 只能更新未開始且未取消的活動
- 更新後通知所有已報名者

**Error Responses**:
- `400 Bad Request`: 活動已開始或已取消
- `401 Unauthorized`: 未登入
- `403 Forbidden`: 非活動發起人
- `404 Not Found`: 活動不存在

---

#### 5. 取消活動

```
POST /api/clubs/{club_id}/events/{event_id}/cancel
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be the organizer

**Success Response** (200 OK):
```json
{
  "message": "Event cancelled successfully",
  "data": EventRead
}
```

**Business Rules**:
- 只有發起人可以取消
- 取消後通知所有已報名者
- 取消後不可恢復

---

#### 6. 報名參加活動

```
POST /api/clubs/{club_id}/events/{event_id}/register
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be a member of the club

**Success Response** (200 OK):
```json
{
  "message": "Successfully registered for the event",
  "data": EventParticipantRead
}
```

**Business Rules**:
- 必須是讀書會成員
- 活動狀態必須為 `published`
- 不能重複報名
- 檢查人數限制

**Error Responses**:
- `400 Bad Request`: 活動已額滿、活動已結束、已報名過
- `401 Unauthorized`: 未登入
- `403 Forbidden`: 非讀書會成員
- `404 Not Found`: 活動不存在

---

#### 7. 取消報名

```
DELETE /api/clubs/{club_id}/events/{event_id}/register
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be registered for the event

**Success Response** (200 OK):
```json
{
  "message": "Successfully unregistered from the event"
}
```

**Business Rules**:
- 必須已報名
- 活動開始前才能取消
- 取消後 `status` 更新為 `cancelled`（軟刪除，保留記錄）

**Error Responses**:
- `400 Bad Request`: 活動已開始、未報名
- `401 Unauthorized`: 未登入
- `404 Not Found`: 活動或報名記錄不存在

---

#### 8. 取得活動參與者列表

```
GET /api/clubs/{club_id}/events/{event_id}/participants
```

**Authentication**: Required (Bearer Token)  
**Authorization**: Must be a member of the club

**Query Parameters**:
- `status` (string, optional): 篩選狀態 (`registered`, `cancelled`)，預設 `registered`

**Success Response** (200 OK):
```json
{
  "items": [EventParticipantRead],
  "totalCount": 8
}
```

---

### 通知觸發規則

以下情況會自動發送通知：

| 事件 | 接收者 | 通知類型 |
|------|--------|---------|
| 活動發布 | 讀書會所有成員 | `EVENT_CREATED` |
| 活動更新 | 所有已報名者 | `EVENT_UPDATED` |
| 活動取消 | 所有已報名者 | `EVENT_CANCELLED` |
| 活動開始前 1 小時 | 所有已報名者 | `EVENT_REMINDER` |
| 有人報名 | 活動發起人 | `NEW_PARTICIPANT` |

**通知內容範例**:
```json
{
  "type": "EVENT_REMINDER",
  "content": {
    "eventId": 1,
    "eventTitle": "《原子習慣》討論會",
    "eventDatetime": "2025-11-15T19:00:00Z",
    "meetingUrl": "https://meet.google.com/abc-defg-hij",
    "message": "活動即將在 1 小時後開始"
  },
  "isRead": false,
  "createdAt": "2025-11-15T18:00:00Z"
}
```

---

### 定時任務

需要實作以下定時任務：

#### 1. 活動提醒任務
- **執行頻率**: 每 15 分鐘
- **邏輯**: 查詢 1 小時後開始的活動，發送提醒給已報名者
- **去重**: 使用 Redis 或資料庫標記已發送提醒的活動

#### 2. 活動狀態更新任務
- **執行頻率**: 每 1 小時
- **邏輯**: 將已過期的 `published` 活動更新為 `completed`

```python
# 偽代碼
def update_completed_events():
    events = Event.query.filter(
        Event.status == "published",
        Event.event_datetime < datetime.utcnow()
    ).all()
    
    for event in events:
        event.status = "completed"
        db.commit()
```

---

### Backend Model 定義參考

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ParticipantStatus(str, Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"

class Event(SQLModel, table=True):
    """活動資料表"""
    id: Optional[int] = Field(default=None, primary_key=True)
    club_id: int = Field(foreign_key="bookclub.id", index=True)
    title: str = Field(max_length=100)
    description: str = Field(max_length=2000)
    event_datetime: datetime = Field(index=True)
    meeting_url: str = Field(max_length=255)
    organizer_id: int = Field(foreign_key="user.id")
    max_participants: Optional[int] = None
    status: EventStatus = Field(default=EventStatus.DRAFT, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    book_club: "BookClub" = Relationship(back_populates="events")
    organizer: "User" = Relationship(back_populates="organized_events")
    participants: List["EventParticipant"] = Relationship(back_populates="event")

class EventParticipant(SQLModel, table=True):
    """活動參與者關聯表"""
    event_id: int = Field(foreign_key="event.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    status: ParticipantStatus = Field(default=ParticipantStatus.REGISTERED)
    registered_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    event: Event = Relationship(back_populates="participants")
    user: "User" = Relationship(back_populates="event_participations")

# Pydantic Schemas with camelCase alias
class EventCreate(SQLModel):
    club_id: int = Field(alias="clubId")
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=2000)
    event_datetime: datetime = Field(alias="eventDatetime")
    meeting_url: str = Field(alias="meetingUrl")
    max_participants: Optional[int] = Field(default=None, alias="maxParticipants")
    status: EventStatus = Field(default=EventStatus.DRAFT)
    
    class Config:
        populate_by_name = True

class EventRead(SQLModel):
    id: int
    club_id: int = Field(alias="clubId")
    title: str
    description: str
    event_datetime: datetime = Field(alias="eventDatetime")
    meeting_url: str = Field(alias="meetingUrl")
    max_participants: Optional[int] = Field(alias="maxParticipants")
    current_participants: int = Field(alias="currentParticipants")
    status: EventStatus
    organizer: "UserProfileRead"
    is_organizer: bool = Field(alias="isOrganizer")
    is_participating: bool = Field(alias="isParticipating")
    can_register: bool = Field(alias="canRegister")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    
    class Config:
        populate_by_name = True
```

---

**新增日期**: 2025-11-01  
**維護者**: PM John, Architect Winston  
**版本**: 1.3  
**Epic**: Epic 3 - 讀書會討論與互動 (包含 Epic 2.6 活動管理)  
**最後更新**: 2025-11-08

---

## 🎯 Epic 3: 討論功能 API 規格補充

### 討論主題與回覆

討論功能已在 Epic 3.2 和 3.3 完成實作，相關 API 端點：

- `POST /api/clubs/{club_id}/topics` - 建立討論主題
- `GET /api/clubs/{club_id}/topics` - 取得討論主題列表
- `GET /api/clubs/{club_id}/topics/{topic_id}` - 取得單一討論主題
- `PATCH /api/clubs/{club_id}/topics/{topic_id}` - 更新討論主題
- `DELETE /api/clubs/{club_id}/topics/{topic_id}` - 刪除討論主題
- `POST /api/clubs/{club_id}/topics/{topic_id}/comments` - 新增回覆
- `GET /api/clubs/{club_id}/topics/{topic_id}/comments` - 取得回覆列表
- `PATCH /api/clubs/{club_id}/topics/{topic_id}/comments/{comment_id}` - 更新回覆
- `DELETE /api/clubs/{club_id}/topics/{topic_id}/comments/{comment_id}` - 刪除回覆

詳細規格請參考 [CONTRACT_DOCUMENTATION_PRD_SUMMARY.md](CONTRACT_DOCUMENTATION_PRD_SUMMARY.md)。

---

## 📜 版本歷史

### Version 1.3 (2025-11-08)
**狀態**: ✅ Epic 3 完成

**新增內容**:
- 新增 `DiscussionTopic` 和 `DiscussionComment` Model 對照表
- 新增 `ClubTag` 和 `BookClubTagLink` Model 對照表
- 新增 `ClubJoinRequest` Model 對照表
- 新增 `PasswordResetToken` Model 對照表（僅後端使用）
- User Model 新增 email 驗證相關欄位：
  - `email_verified` / `emailVerified`
  - `email_verification_token` (不回傳前端)
  - `email_verification_token_expires_at` (不回傳前端)
- BookClub Model 新增欄位：
  - `cover_image_url` / `coverImageUrl`
  - `created_at` / `createdAt`
  - `updated_at` / `updatedAt`
- 補充 Epic 3 討論功能 API 規格說明

**資料庫遷移**:
- Schema Version: `b5b7ed9af23c`
- 已套用 13 個 Alembic migrations

---

### Version 1.1 (2025-11-01)
**狀態**: ✅ Epic 2.6 完成

**新增內容**:
- 新增 Epic 2: 活動管理 API 規格
- 新增 `Event` 和 `EventParticipant` Model 定義
- 定義活動狀態枚舉和參與者狀態枚舉
- 新增活動相關 API 端點規格
- 定義活動通知觸發規則
- 定義定時任務需求

---

### Version 1.0 (2025-10-22)
**狀態**: ✅ Epic 1 完成

**初始內容**:
- 定義資料層級與命名規範
- 定義 Backend (snake_case) 和 Frontend (camelCase) 轉換機制
- 標準 Response 格式定義
- 資料型別規範（日期、布林、Null、ID、枚舉）
- 特殊欄位約定（時間戳、分頁）
- User、InterestTag、BookClub Model 完整對照
- 實作指引與最佳實踐
- 版本化與變更管理流程

---