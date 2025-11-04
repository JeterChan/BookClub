# BookClub 前端專案報告

**Report Date:** 2025-01-04  
**Version:** 1.0  
**Author:** Development Team

---

## 📋 目錄

1. [專案概覽](#專案概覽)
2. [技術棧](#技術棧)
3. [專案架構](#專案架構)
4. [功能模組](#功能模組)
5. [狀態管理](#狀態管理)
6. [路由系統](#路由系統)
7. [UI/UX 設計](#uiux-設計)
8. [測試策略](#測試策略)
9. [開發狀態](#開發狀態)
10. [已知問題與改進方向](#已知問題與改進方向)

---

## 📖 專案概覽

### 基本資訊

- **專案名稱**: BookClub Frontend
- **框架**: React 19.1.1 + TypeScript
- **建置工具**: Vite 7.1.7
- **包管理器**: npm
- **開發模式**: SPA (Single Page Application)

### 專案目標

打造一個現代化、響應式的讀書會管理平台前端應用，支援：
- ✅ 社團創建與管理
- ✅ 討論區與留言系統
- ✅ 會員管理與權限控制
- ✅ 個人帳戶管理
- ✅ 響應式設計 (Mobile-first)

---

## 🛠️ 技術棧

### 核心框架

| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 19.1.1 | UI 框架 |
| **TypeScript** | 5.9.3 | 型別檢查 |
| **Vite** | 7.1.7 | 建置工具與開發伺服器 |
| **React Router DOM** | 7.9.4 | 路由管理 |

### 狀態管理

| 技術 | 版本 | 用途 |
|------|------|------|
| **Zustand** | 5.0.8 | 輕量級全域狀態管理 |
| **React Hook Form** | 7.53.0 | 表單狀態管理 |

### UI 與樣式

| 技術 | 版本 | 用途 |
|------|------|------|
| **Tailwind CSS** | 4.1.14 | Utility-first CSS 框架 |
| **PostCSS** | 8.5.6 | CSS 後處理器 |
| **clsx + tailwind-merge** | - | 動態 className 管理 |
| **React Hot Toast** | 2.6.0 | 通知系統 |

### 資料驗證

| 技術 | 版本 | 用途 |
|------|------|------|
| **Zod** | 4.1.12 | Schema 驗證 |
| **@hookform/resolvers** | 5.2.2 | 表單驗證整合 |

### HTTP 請求

| 技術 | 版本 | 用途 |
|------|------|------|
| **Axios** | 1.12.2 | HTTP 客戶端 |

### 測試框架

| 技術 | 版本 | 用途 |
|------|------|------|
| **Vitest** | 4.0.1 | 單元測試框架 |
| **@testing-library/react** | 16.3.0 | React 元件測試 |
| **@testing-library/user-event** | 14.6.1 | 使用者互動模擬 |
| **jsdom** | 27.0.1 | DOM 模擬環境 |

### 第三方整合

| 技術 | 版本 | 用途 |
|------|------|------|
| **@react-oauth/google** | 0.12.1 | Google OAuth 登入 |

---

## 🏗️ 專案架構

### 目錄結構

```
frontend/
├── public/                  # 靜態資源
├── src/
│   ├── App.tsx             # 主應用程式與路由配置
│   ├── main.tsx            # 應用程式入口
│   ├── index.css           # 全域樣式
│   │
│   ├── assets/             # 圖片、字型等資源
│   │
│   ├── components/         # 可重用元件
│   │   ├── clubs/          # 社團相關元件
│   │   │   ├── ClubCard.tsx
│   │   │   ├── ClubInfoSettings.tsx
│   │   │   ├── JoinRequestList.tsx
│   │   │   ├── MemberManagement.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TagFilter.tsx
│   │   │   └── TransferOwnership.tsx
│   │   ├── common/         # 通用元件
│   │   ├── dashboard/      # 儀表板元件
│   │   ├── forms/          # 表單元件
│   │   ├── profile/        # 個人資料元件
│   │   ├── ui/             # UI 基礎元件
│   │   ├── Header.tsx      # 全域導航列
│   │   └── Logo.tsx        # Logo 元件
│   │
│   ├── pages/              # 頁面元件
│   │   ├── mainpage/       # 主頁面
│   │   ├── dashboard/      # 儀表板
│   │   ├── account/        # 帳戶設定
│   │   ├── auth/           # 認證頁面
│   │   ├── club/           # 社團頁面
│   │   │   ├── index.tsx   # 社團目錄
│   │   │   ├── Detail.tsx  # 社團詳情
│   │   │   ├── Create.tsx  # 創建社團
│   │   │   ├── Management.tsx  # 社團管理 (4 tabs)
│   │   │   └── ClubDiscussions.tsx
│   │   ├── discussions/    # 討論區
│   │   │   ├── index.tsx   # 討論列表
│   │   │   ├── Detail.tsx  # 討論詳情
│   │   │   └── New.tsx     # 新增討論
│   │   └── CommentEdit.tsx # 編輯留言
│   │
│   ├── store/              # Zustand 狀態管理
│   │   ├── authStore.ts    # 認證狀態
│   │   ├── bookClubStore.ts # 社團狀態
│   │   └── clubManagementStore.ts # 社團管理狀態
│   │
│   ├── services/           # API 服務
│   ├── hooks/              # 自定義 Hooks
│   ├── types/              # TypeScript 型別定義
│   ├── utils/              # 工具函數
│   ├── test/               # 測試設定
│   └── __tests__/          # 測試檔案
│
├── docs/                   # 專案文件
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── eslint.config.js
```

### 設計模式

#### 1. **元件化設計 (Component-Based Architecture)**
- **Page Components**: 頁面級元件，負責佈局與資料流
- **Feature Components**: 功能模組元件，包含業務邏輯
- **UI Components**: 可重用的基礎元件

#### 2. **狀態管理模式**
- **全域狀態**: 使用 Zustand 管理認證、社團資料等
- **本地狀態**: 使用 React useState/useReducer
- **表單狀態**: 使用 React Hook Form
- **Cross-tab Sync**: 透過 storage events 同步不同分頁的登入狀態

#### 3. **路由保護機制**
- `ProtectedRoute` 元件包裝需要認證的路由
- 未登入自動重定向至主頁面
- 支援記住登入狀態 (localStorage/sessionStorage)

---

## 🎯 功能模組

### 1. 認證系統 (Authentication)

**路徑**: `/` (主頁面 Auth Modal)

**功能**:
- ✅ 使用者註冊
- ✅ 使用者登入
- ✅ Google OAuth 登入
- ✅ 記住登入狀態
- ✅ 跨分頁同步登入狀態
- ✅ 自動登出機制

**技術實作**:
```typescript
// authStore.ts - Zustand Store
- isAuthenticated: boolean
- user: User | null
- accessToken: string | null
- refreshToken: string | null
- rememberMe: boolean
- initialize(): 從儲存恢復狀態
- login(): 登入並儲存 token
- logout(): 清除狀態與儲存
- syncFromStorage(): 同步跨分頁狀態
```

---

### 2. 儀表板 (Dashboard)

**路徑**: `/dashboard` (🔒 需登入)

**功能**: 4 個 Tab
- **基本資訊 Tab**: 我加入的社團、最新討論、活動通知
- **我的社團 Tab**: 創建的社團、加入的社團、收藏的社團
- **討論紀錄 Tab**: 我的發文、我的回覆
- **留言紀錄 Tab**: 所有留言、編輯/刪除留言

**元件**:
- `pages/dashboard/index.tsx` - 主儀表板
- `components/dashboard/*` - Tab 內容元件

---

### 3. 社團系統 (Club Management)

#### 3.1 社團目錄 (Club Directory)

**路徑**: `/clubs`

**功能**:
- ✅ 瀏覽所有社團
- ✅ 搜尋社團 (名稱、標籤)
- ✅ 篩選社團 (分類、標籤)
- ✅ 排序社團 (最新、熱門、成員數)
- ✅ 分頁載入

**元件**:
- `pages/club/index.tsx` - 社團目錄頁
- `components/clubs/ClubCard.tsx` - 社團卡片
- `components/clubs/SearchBar.tsx` - 搜尋列
- `components/clubs/TagFilter.tsx` - 標籤篩選器

---

#### 3.2 社團詳情 (Club Detail)

**路徑**: `/clubs/:id`

**功能**:
- ✅ 顯示社團資訊 (名稱、描述、分類、標籤、封面)
- ✅ 顯示成員列表
- ✅ 顯示最新公告
- ✅ 加入/退出社團
- ✅ 收藏/取消收藏社團
- ✅ **返回按鈕** (`navigate(-1)`)
- ✅ 前往社團管理 (創建者/管理員)
- ✅ 前往社團討論區

**元件**:
- `pages/club/Detail.tsx` (384 lines)

**關鍵實作**:
```typescript
// 返回按鈕 (lines 183-195)
<button onClick={() => navigate(-1)}>
  <svg>← 返回</svg>
</button>
```

---

#### 3.3 創建社團 (Club Create)

**路徑**: `/clubs/create` (🔒 需登入)

**功能**:
- ✅ 輸入社團名稱、描述
- ✅ 選擇分類
- ✅ 新增標籤
- ✅ 上傳封面圖片
- ✅ 表單驗證 (React Hook Form + Zod)

**元件**:
- `pages/club/Create.tsx`

---

#### 3.4 社團管理 (Club Management) ⭐ **核心功能**

**路徑**: `/clubs/:id/management` (🔒 需登入 + 成員)

**功能**: **4 個 Tab** (權限分級)

##### Tab 1: 社團資訊 (Club Info)
- **權限**: 所有成員可查看，管理員/創建者可編輯
- **功能**:
  - 編輯社團名稱、描述
  - 修改分類
  - 管理標籤
  - 更換封面圖片

**元件**: `components/clubs/ClubInfoSettings.tsx`

---

##### Tab 2: 成員管理 (Member Management)
- **權限**: 管理員/創建者
- **功能**:
  - ✅ 顯示成員列表 (6 位 Mock 成員)
  - ✅ **變更成員角色** (管理員 ↔ 普通成員)
  - ✅ **批次更新角色** (Set-based 變更追蹤)
  - ✅ 刪除成員
  - ✅ **藍色漸層滾動條** (max-height: 600px)
  - ✅ 顯示待處理變更數量

**元件**: `components/clubs/MemberManagement.tsx` (309 lines)

**關鍵實作**:
```typescript
// 使用 Set 追蹤變更的成員
const [changedMembers, setChangedMembers] = useState<Set<number>>(new Set());

// 角色選擇下拉式選單
<select onChange={(e) => handleRoleChange(member.id, e.target.value)}>
  <option value="admin">管理員</option>
  <option value="member">普通成員</option>
</select>

// 批次更新按鈕
<button disabled={changedMembers.size === 0}>
  儲存變更 ({changedMembers.size})
</button>
```

**滾動條樣式**:
```css
/* 自定義藍色漸層滾動條 */
.member-list::-webkit-scrollbar {
  width: 10px;
}
.member-list::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #e0f2fe, #dbeafe);
}
.member-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-radius: 5px;
}
.member-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
}
```

---

##### Tab 3: 加入申請 (Join Requests)
- **權限**: 管理員/創建者
- **功能**:
  - ✅ 顯示加入申請列表 (6 個 Mock 申請)
  - ✅ **核准申請** ("確認" 按鈕)
  - ✅ **拒絕申請** ("取消" 按鈕)
  - ✅ 從列表移除已處理申請
  - ✅ **綠色漸層滾動條** (max-height: 600px)
  - ✅ Set-based 處理追蹤

**元件**: `components/clubs/JoinRequestList.tsx` (153 lines)

**關鍵實作**:
```typescript
// 使用 Set 追蹤已處理的申請
const [processedRequests, setProcessedRequests] = useState<Set<number>>(new Set());

// 核准/拒絕按鈕
const handleApprove = (id: number) => {
  setProcessedRequests(prev => new Set(prev).add(id));
  toast.success('已核准加入申請');
};

const handleReject = (id: number) => {
  setProcessedRequests(prev => new Set(prev).add(id));
  toast.success('已拒絕加入申請');
};

// 過濾掉已處理的申請
const visibleRequests = mockRequests.filter(r => !processedRequests.has(r.id));
```

**滾動條樣式**:
```css
/* 自定義綠色漸層滾動條 */
.request-list::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #d1fae5, #a7f3d0);
}
.request-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #10b981, #059669);
}
```

---

##### Tab 4: 轉移擁有權 (Transfer Ownership)
- **權限**: 🔴 **僅創建者**
- **功能**:
  - ✅ **簡化版兩欄位表單** (使用者名稱 + Email)
  - ✅ 精確驗證目標成員存在性
  - ✅ 確認對話框
  - ✅ 黃色警告風格

**元件**: `components/clubs/TransferOwnership.tsx` (120 lines，從原本 302 lines 簡化)

**關鍵實作**:
```typescript
// 兩欄位驗證邏輯
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // 從成員列表中找到符合的成員
  const targetMember = mockMembers.find(
    m => m.username === targetUsername && m.email === targetEmail
  );
  
  if (!targetMember) {
    toast.error('找不到符合的成員，請確認使用者名稱和 Email');
    return;
  }
  
  // 確認對話框
  if (window.confirm(`確定要將社團轉讓給 ${targetMember.name}？`)) {
    toast.success('擁有權轉移成功！');
    navigate('/dashboard');
  }
};
```

**Tab 可見性控制**:
```typescript
// Management.tsx (lines 48, 65-68)
const isOwner = detailClub?.membership_status === 'owner' || id === '1'; // Mock mode

const baseTabs = [
  { id: 'info', name: '社團資訊' },
  { id: 'members', name: '成員管理' },
  { id: 'requests', name: '加入申請' },
];

const ownerOnlyTab = { id: 'transfer', name: '轉移擁有權' };

const tabs = isOwner ? [...baseTabs, ownerOnlyTab] : baseTabs;
```

---

### 4. 討論系統 (Discussion System)

#### 4.1 社團討論區 (Club Discussions)

**路徑**: `/club/:id/discussions`

**功能**:
- ✅ 顯示該社團的所有討論
- ✅ 搜尋/篩選討論
- ✅ 查看討論詳情
- ✅ 新增討論 (需登入)

**元件**:
- `pages/club/ClubDiscussions.tsx`

---

#### 4.2 全站討論區 (All Discussions)

**路徑**: `/discussions`

**功能**:
- ✅ 顯示所有公開討論
- ✅ 搜尋/篩選
- ✅ 查看詳情
- ✅ 新增討論 (需登入)

**元件**:
- `pages/discussions/index.tsx`

---

#### 4.3 討論詳情 (Discussion Detail)

**路徑**: `/discussions/:id`

**功能**:
- ✅ 顯示討論內容 (支援 Markdown)
- ✅ 顯示留言列表
- ✅ 新增留言 (需登入)
- ✅ 編輯留言 (作者)
- ✅ 刪除留言 (作者)
- ✅ 按讚留言
- ✅ 編輯討論 (作者)
- ✅ 刪除討論 (作者)

**元件**:
- `pages/discussions/Detail.tsx`

---

#### 4.4 新增討論 (New Discussion)

**路徑**: `/discussions/new` (🔒 需登入)

**功能**:
- ✅ Markdown 編輯器
- ✅ 預覽模式
- ✅ 選擇所屬社團
- ✅ 標籤管理

**元件**:
- `pages/discussions/New.tsx`

---

#### 4.5 編輯留言 (Comment Edit)

**路徑**: `/comments/:id/edit` (🔒 需登入 + 作者)

**功能**:
- ✅ 編輯留言內容
- ✅ Markdown 支援
- ✅ 儲存/取消

**元件**:
- `pages/CommentEdit.tsx`

---

### 5. 帳戶中心 (Account)

**路徑**: `/account` (🔒 需登入)

**功能**: 6 個 Tab
- **基本資料 Tab**: 頭像上傳、興趣標籤、偏好設定
- **我的社團 Tab**: 管理我的社團列表
- **討論紀錄 Tab**: 查看我參與的討論
- **留言紀錄 Tab**: 管理我的所有留言
- **通知設定 Tab**: 配置通知偏好
- **帳戶設定 Tab**: 變更 Email、密碼、登出

**Modal 對話框**:
- 上傳頭像
- 編輯標籤
- 偏好設定
- 變更 Email
- 變更密碼

**元件**:
- `pages/account/index.tsx` - 主頁
- `components/profile/*` - 個人資料元件

---

## 🗄️ 狀態管理

### Zustand Stores

#### 1. authStore.ts - 認證狀態

```typescript
interface AuthState {
  // 狀態
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;

  // Actions
  initialize: () => void;
  login: (tokens: Tokens, user: User, rememberMe: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  syncFromStorage: () => void;
}
```

**功能**:
- ✅ 初始化認證狀態 (從 localStorage/sessionStorage)
- ✅ 登入/登出管理
- ✅ Token 儲存與自動刷新
- ✅ 跨分頁同步 (storage events)
- ✅ 記住登入選項

---

#### 2. bookClubStore.ts - 社團狀態

```typescript
interface BookClubState {
  // 狀態
  clubs: Club[];
  detailClub: Club | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchClubs: () => Promise<void>;
  fetchClubDetail: (id: number) => Promise<void>;
  createClub: (data: ClubData) => Promise<void>;
  updateClub: (id: number, data: ClubData) => Promise<void>;
  joinClub: (id: number) => Promise<void>;
  leaveClub: (id: number) => Promise<void>;
}
```

**功能**:
- ✅ 社團列表管理
- ✅ 社團詳情快取
- ✅ 加入/退出社團
- ✅ 創建/更新社團
- ✅ 錯誤處理

---

#### 3. clubManagementStore.ts - 社團管理狀態

```typescript
interface ClubManagementState {
  // 成員管理
  members: Member[];
  fetchMembers: (clubId: number) => Promise<void>;
  updateMemberRole: (memberId: number, role: string) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;

  // 加入申請
  joinRequests: JoinRequest[];
  fetchJoinRequests: (clubId: number) => Promise<void>;
  approveRequest: (requestId: number) => Promise<void>;
  rejectRequest: (requestId: number) => Promise<void>;

  // 社團資訊
  updateClubInfo: (clubId: number, data: ClubInfo) => Promise<void>;
  transferOwnership: (clubId: number, targetUserId: number) => Promise<void>;
}
```

**功能**:
- ✅ 成員列表與角色管理
- ✅ 加入申請處理
- ✅ 社團資訊更新
- ✅ 擁有權轉移

---

## 🛣️ 路由系統

### 路由結構 (App.tsx)

#### 公開路由 (7 個)

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/` | Mainpage | 主頁面 (未登入) |
| `/clubs` | ClubDirectory | 社團目錄 |
| `/clubs/:id` | ClubDetail | 社團詳情 |
| `/club/:id/discussions` | ClubDiscussions | 社團討論區 |
| `/discussions` | Discussions | 全站討論 |
| `/discussions/:id` | DiscussionDetail | 討論詳情 |
| `*` | Navigate to `/` | 404 重定向 |

#### 受保護路由 (6 個) 🔒 需登入

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/dashboard` | Dashboard | 儀表板 |
| `/account` | Account | 帳戶設定 |
| `/clubs/create` | ClubCreate | 創建社團 |
| `/clubs/:id/management` | ClubManagement | 社團管理 (4 tabs) |
| `/discussions/new` | DiscussionNew | 新增討論 |
| `/comments/:id/edit` | CommentEdit | 編輯留言 |

### 路由保護機制

```typescript
// ProtectedRoute Component (App.tsx lines 20-28)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
```

### 認證初始化流程

```typescript
// App.tsx lines 37-67
useEffect(() => {
  // 從 localStorage/sessionStorage 恢復認證狀態
  initialize();
}, [initialize]);

useEffect(() => {
  // 監聽 storage 事件以同步不同分頁的登入狀態
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'access_token' || e.key === null) {
      syncFromStorage();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [syncFromStorage]);

// 顯示載入畫面直到認證狀態初始化完成
if (isInitializing) {
  return <div className="loading-spinner">載入中...</div>;
}
```

---

## 🎨 UI/UX 設計

### 設計系統

#### 品牌色彩

```javascript
// tailwind.config.js
colors: {
  brand: {
    primary: '#04c0f4',   // 主品牌色 (淺藍色)
    light: '#cfecf4',     // 淺色變體
    dark: '#0398c4',      // 深色變體
    50: '#e6f9fd',
    100: '#cfecf4',
    200: '#9fd9ea',
    // ... 完整色階
  }
}
```

#### 響應式設計

**Breakpoints** (Tailwind 預設):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**設計原則**:
- ✅ Mobile-first 開發方式
- ✅ 流暢的過渡動畫
- ✅ 一致的間距系統
- ✅ 可訪問性考量 (ARIA labels)

---

### 自定義滾動條設計

#### 成員管理 - 藍色漸層滾動條

```css
/* MemberManagement.tsx - 藍色主題 */
.member-list {
  max-height: 600px;
  overflow-y: auto;
}

.member-list::-webkit-scrollbar {
  width: 10px;
}

.member-list::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #e0f2fe, #dbeafe);
  border-radius: 5px;
}

.member-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-radius: 5px;
}

.member-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
}
```

#### 加入申請 - 綠色漸層滾動條

```css
/* JoinRequestList.tsx - 綠色主題 */
.request-list::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, #d1fae5, #a7f3d0);
}

.request-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #10b981, #059669);
}

.request-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #059669, #047857);
}
```

---

### 通知系統

使用 **React Hot Toast** 提供一致的通知體驗：

```typescript
import toast from 'react-hot-toast';

// 成功通知
toast.success('操作成功！');

// 錯誤通知
toast.error('操作失敗，請重試');

// 一般訊息
toast('這是一般訊息');

// 載入中
const loadingToast = toast.loading('處理中...');
// 完成後
toast.success('完成！', { id: loadingToast });
```

---

## 🧪 測試策略

### 測試框架配置

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',      // 模擬瀏覽器環境
    globals: true,             // 全域測試函數
    setupFiles: './src/test/setup.ts',  // 測試設定檔
  },
})
```

### 測試類型

#### 1. 單元測試 (Unit Tests)
- **目標**: 測試獨立的函數與 Hooks
- **工具**: Vitest
- **範圍**: `src/__tests__/`, `src/*/tests__/`

#### 2. 元件測試 (Component Tests)
- **目標**: 測試 React 元件渲染與互動
- **工具**: @testing-library/react
- **範例**:
  ```typescript
  // ClubCard.test.tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import ClubCard from './ClubCard';
  
  describe('ClubCard', () => {
    it('renders club information', () => {
      render(<ClubCard club={mockClub} />);
      expect(screen.getByText(mockClub.name)).toBeInTheDocument();
    });
    
    it('handles click event', async () => {
      const onClick = vi.fn();
      render(<ClubCard club={mockClub} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });
  });
  ```

#### 3. 整合測試 (Integration Tests)
- **目標**: 測試多個元件與狀態管理的互動
- **範例**: 測試完整的登入流程、社團加入流程

### 測試覆蓋率

**目標覆蓋率**:
- 整體: > 70%
- 關鍵業務邏輯: > 90%
- UI 元件: > 60%

**執行測試**:
```bash
npm run test           # 執行測試
npm run test:ui        # UI 模式
npm run test:coverage  # 生成覆蓋率報告
```

---

## 📊 開發狀態

### 已完成功能 ✅

#### 核心功能
- ✅ 認證系統 (登入/註冊/登出)
- ✅ Google OAuth 登入
- ✅ 跨分頁認證同步
- ✅ 受保護路由機制

#### 社團系統
- ✅ 社團目錄 (搜尋/篩選/排序)
- ✅ 社團詳情 (包含返回按鈕)
- ✅ 創建社團
- ✅ **社團管理 4 Tab 系統**:
  - ✅ 社團資訊編輯
  - ✅ 成員管理 (角色變更、批次更新、刪除)
  - ✅ 加入申請處理 (核准/拒絕)
  - ✅ 轉移擁有權 (簡化版)
- ✅ 自定義滾動條 (藍色/綠色漸層)
- ✅ Mock 資料系統 (用於前端開發)

#### 討論系統
- ✅ 社團討論區
- ✅ 全站討論區
- ✅ 討論詳情
- ✅ 新增討論
- ✅ 編輯留言

#### 帳戶系統
- ✅ 儀表板 (4 tabs)
- ✅ 帳戶設定 (6 tabs)
- ✅ 個人資料管理

#### UI/UX
- ✅ 響應式設計 (Mobile-first)
- ✅ 品牌色彩系統
- ✅ 通知系統 (React Hot Toast)
- ✅ 載入狀態處理
- ✅ 錯誤狀態處理

---

### 開發中功能 🚧

- 🚧 後端 API 整合 (目前使用 Mock 資料)
- 🚧 圖片上傳功能
- 🚧 Markdown 編輯器優化
- 🚧 單元測試撰寫
- 🚧 E2E 測試設置

---

### 待開發功能 📋

#### 社團功能
- 📋 社團公告系統
- 📋 社團資源庫
- 📋 社團進度追蹤
- 📋 社團活動行事曆

#### 討論功能
- 📋 討論置頂/精華
- 📋 討論標籤系統
- 📋 討論搜尋優化
- 📋 留言樓層回覆

#### 通知功能
- 📋 即時通知 (WebSocket)
- 📋 Email 通知
- 📋 推播通知

#### 其他
- 📋 多語言支援 (i18n)
- 📋 深色模式
- 📋 無障礙優化 (a11y)
- 📋 PWA 支援

---

## ⚠️ 已知問題與改進方向

### 已知問題

#### 1. Mock 資料硬編碼
**問題**: 目前使用硬編碼的 Mock 資料，未串接後端 API

**影響**:
- 無法持久化資料
- 無法測試真實網路狀況
- 刷新頁面後資料重置

**解決方案**:
```typescript
// 目前 (Mock)
const mockMembers = [
  { id: 1, name: '王小明', role: 'admin' },
  // ...
];

// 改進 (API)
const { data: members, isLoading } = useQuery({
  queryKey: ['members', clubId],
  queryFn: () => api.getClubMembers(clubId),
});
```

**優先級**: 🔴 高

---

#### 2. 錯誤處理不完整
**問題**: 部分 API 呼叫缺少完整的錯誤處理

**影響**:
- 網路錯誤時使用者體驗不佳
- 缺少重試機制

**解決方案**:
```typescript
// 添加錯誤邊界 (Error Boundary)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// API 層添加重試邏輯
const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    return await axios(url, options);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
```

**優先級**: 🟡 中

---

#### 3. 效能優化空間
**問題**: 部分大型列表未實作虛擬滾動

**影響**:
- 成員數量 > 100 時可能出現效能問題
- 初次渲染時間較長

**解決方案**:
```typescript
// 使用 react-window 實作虛擬列表
import { FixedSizeList } from 'react-window';

const MemberList = ({ members }) => (
  <FixedSizeList
    height={600}
    itemCount={members.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <MemberItem member={members[index]} style={style} />
    )}
  </FixedSizeList>
);
```

**優先級**: 🟡 中

---

#### 4. 測試覆蓋率不足
**問題**: 目前測試覆蓋率 < 50%

**影響**:
- 重構風險較高
- 回歸測試不完整

**解決方案**:
- 為核心業務邏輯撰寫單元測試
- 為關鍵流程撰寫整合測試
- 設置 CI/CD 流程強制覆蓋率門檻

**優先級**: 🟡 中

---

### 改進方向

#### 1. 效能優化
- [ ] 實作代碼分割 (Code Splitting)
  ```typescript
  const Dashboard = lazy(() => import('./pages/dashboard'));
  const ClubManagement = lazy(() => import('./pages/club/Management'));
  ```
- [ ] 圖片懶載入與優化
- [ ] 使用 React Query 管理伺服器狀態
- [ ] 實作虛擬滾動 (react-window)

#### 2. 開發體驗
- [ ] 添加 Storybook 元件文件
- [ ] 設置 Husky + lint-staged (Git hooks)
- [ ] 完善 ESLint + Prettier 配置
- [ ] 添加 commit 規範 (Conventional Commits)

#### 3. 使用者體驗
- [ ] 添加骨架屏 (Skeleton Loading)
- [ ] 優化表單驗證回饋
- [ ] 添加操作確認對話框
- [ ] 改善無障礙體驗 (ARIA)

#### 4. 安全性
- [ ] 實作 CSRF Token
- [ ] 添加 Content Security Policy (CSP)
- [ ] 實作 XSS 防護
- [ ] Token 自動刷新機制

---

## 📈 專案統計

### 程式碼規模 (估計)

| 分類 | 檔案數 | 程式碼行數 (估計) |
|------|--------|-------------------|
| **Pages** | ~15 | ~3,000 |
| **Components** | ~30 | ~5,000 |
| **Store** | 3 | ~800 |
| **Services** | ~5 | ~600 |
| **Utils/Hooks** | ~10 | ~500 |
| **Tests** | ~20 | ~1,500 |
| **設定檔** | ~8 | ~300 |
| **總計** | **~91** | **~11,700** |

### 依賴套件

- **生產依賴**: 12 個
- **開發依賴**: 18 個
- **總計**: 30 個

---

## 🚀 建置與部署

### 開發環境

```bash
# 安裝依賴
npm install

# 啟動開發伺服器 (http://localhost:5173)
npm run dev

# 執行測試
npm run test

# 執行 Linting
npm run lint
```

### 生產建置

```bash
# TypeScript 型別檢查 + Vite 建置
npm run build

# 預覽生產建置
npm run preview
```

### 環境變數

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# .env.production
VITE_API_BASE_URL=https://api.bookclub.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📚 參考文件

### 內部文件
- [專案架構文件](./architecture.md)
- [介面流程圖](./INTERFACE_FLOWCHARTS.md)
- [介面流程總覽](./design/flow-overview.md)
- [前端 CSS 指南](./frontend-css-guide.md)
- [PRD 文件](./prd.md)
- [API 存取指南](./contracts/api-access-guide.md)
- [資料契約](./contracts/data-contract.md)

### 外部資源
- [React 官方文件](https://react.dev/)
- [Vite 官方文件](https://vitejs.dev/)
- [Tailwind CSS 官方文件](https://tailwindcss.com/)
- [Zustand 文件](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Router 文件](https://reactrouter.com/)

---

## 👥 團隊與貢獻

### 開發團隊
- **前端開發**: Development Team
- **UI/UX 設計**: Design Team
- **測試**: QA Team

### 貢獻指南
1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📝 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0 | 2025-01-04 | 初始版本 - 完整前端專案報告 |

---

## 📞 聯絡資訊

- **專案倉庫**: [GitHub Repository]
- **問題追蹤**: [GitHub Issues]
- **技術文件**: [Documentation Site]

---

**Report Generated:** 2025-01-04  
**Report Version:** 1.0  
**Framework Version:** React 19.1.1 + Vite 7.1.7  
**Last Updated:** 2025-01-04
