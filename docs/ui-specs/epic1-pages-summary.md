# Epic 1: 用戶系統頁面 - 完整規格摘要

**版本:** v1.0  
**日期:** 2025-10-20  
**設計者:** Sally (UX Expert)

---

## 📚 頁面總覽

| # | 頁面名稱 | 路由 | User Story | 優先級 | 狀態 |
|---|---------|------|------------|--------|------|
| 1 | 註冊頁面 | `/register` | Epic 1.1 | 高 | ✅ 規格完成 |
| 2 | 登入頁面 | `/login` | Epic 1.2 | 高 | ✅ 規格完成 |
| 3 | 個人儀表板 | `/dashboard` | Epic 1.5 | 中 | ✅ 規格完成 |
| 4 | 個人檔案 | `/profile` | Epic 1.4 | 高 | ✅ 規格完成 |
| 5 | 帳號設定 | `/settings` | Epic 1.6 | 中 | ✅ 規格完成 |

---

## �� 設計目標

### 用戶體驗目標
- **簡單直觀**: 新用戶 5 分鐘內完成註冊
- **安全可靠**: 清晰的安全提示與密碼強度指示
- **響應迅速**: 所有操作在 300ms 內給予反饋
- **無障礙**: 符合 WCAG AA 標準

### 技術目標
- **效能**: 首次載入 < 3 秒
- **兼容性**: 支援 Chrome 90+, Firefox 88+, Safari 14+
- **RWD**: 手機、平板、桌面完美適配
- **測試覆蓋**: 關鍵流程 100% E2E 測試

---

## 📄 頁面規格詳細內容

### 1. 註冊頁面 (`/register`)

**核心功能:**
- Email + 密碼註冊
- Google OAuth 註冊
- 即時表單驗證
- 密碼強度指示器

**關鍵元件:**
```typescript
interface RegisterFormData {
  displayName: string;      // 2-50字元，必填
  email: string;            // Email格式，必填
  password: string;         // 8+字元，需大小寫+數字，必填
  confirmPassword: string;  // 與password一致
  agreedToTerms: boolean;   // 必須勾選
}
```

**API 端點:**
- `POST /api/auth/register` - 提交註冊
- `GET /api/auth/check-email` - 檢查Email是否已存在

**驗證規則:**
- 顯示名稱: 2-50字元，僅字母/數字/中文/底線
- 密碼: 至少8字元，包含大小寫字母和數字
- Email: 標準Email格式驗證

**成功流程:**
註冊 → 自動登入 → 儲存 tokens → 導向 `/dashboard`

---

### 2. 登入頁面 (`/login`)

**核心功能:**
- Email + 密碼登入
- Google OAuth 登入
- 記住我功能
- 忘記密碼連結

**安全機制:**
- 5次失敗後鎖定15分鐘
- 剩餘嘗試次數提示
- CSRF Token 保護

**API 端點:**
- `POST /api/auth/login` - 提交登入
- `POST /api/auth/google` - Google OAuth

**存儲策略:**
- 勾選「記住我」: localStorage (持久化)
- 未勾選: sessionStorage (關閉瀏覽器清除)

---

### 3. 個人儀表板 (`/dashboard`)

**核心功能:**
- 個人資訊卡片 (頭像、名稱、統計)
- 快速操作按鈕
- 我的讀書會列表 (最多3個)
- 最近活動時間軸

**數據展示:**
```typescript
interface DashboardData {
  user: UserProfile;
  stats: {
    clubsCount: number;      // 參加的讀書會數
    booksRead: number;       // 閱讀的書籍數
    discussionsCount: number; // 參與的討論數
  };
  clubs: ClubSummary[];      // 最多顯示3個
  recentActivities: Activity[]; // 最近10筆
}
```

**快速操作:**
- 🔍 探索讀書會 → `/clubs`
- ➕ 建立讀書會 → `/clubs/create`
- ⚙️ 帳號設定 → `/settings`

---

### 4. 個人檔案頁面 (`/profile`)

**核心功能 (4個Tab):**

#### Tab 1: 基本資料
- 顯示名稱編輯 (2-50字元)
- 個人簡介編輯 (0-500字元)
- Email 顯示 (只讀)

#### Tab 2: 頭像設定
- 頭像預覽與上傳
- 支援格式: JPG, PNG
- 大小限制: 最大 2MB
- 圖片裁切功能

#### Tab 3: 興趣標籤
- 預設標籤選擇 (18個常用標籤)
- 自訂標籤新增
- 最多選擇 20 個標籤
- 每個標籤最多 50 字元

#### Tab 4: 隱私設定
- 個人檔案可見性 (公開/好友/私密)
- Email 顯示控制
- 讀書會顯示控制
- 私訊接收控制

**API 端點:**
- `PATCH /api/users/me` - 更新基本資料
- `POST /api/users/me/avatar` - 上傳頭像
- `DELETE /api/users/me/avatar` - 移除頭像
- `PATCH /api/users/me/interests` - 更新興趣標籤
- `PATCH /api/users/me/privacy` - 更新隱私設定

---

### 5. 帳號設定頁面 (`/settings`)

**核心功能 (5個Tab):**

#### Tab 1: 安全設定
- **變更密碼**: 需提供當前密碼
- **兩步驟驗證 (2FA)**: 啟用/停用
- **連結的帳號**: Google OAuth 綁定/解綁

#### Tab 2: 活動會話
- 顯示所有活動裝置/瀏覽器
- 顯示位置、IP、上次活動時間
- 單一裝置登出
- 批量登出其他所有裝置

#### Tab 3: 隱私控制
- 檔案可見性設定
- 資料分享控制
- 搜尋可見性

#### Tab 4: 通知偏好
- Email 通知開關
- 推播通知開關
- 通知類型細項控制

#### Tab 5: 帳號管理
- 匯出個人資料
- 帳號刪除 (需密碼確認)

**會話資料結構:**
```typescript
interface Session {
  id: string;
  device: string;          // "MacBook Pro"
  browser: string;         // "Chrome 120"
  location: string;        // "台北市, 台灣"
  ipAddress: string;       // "1.2.3.4"
  lastActive: string;      // ISO 8601
  isCurrent: boolean;      // 是否為當前裝置
}
```

**API 端點:**
- `POST /api/users/me/change-password` - 變更密碼
- `GET /api/users/me/sessions` - 取得活動會話
- `DELETE /api/users/me/sessions/:id` - 登出特定裝置
- `DELETE /api/users/me/sessions/others` - 登出其他所有裝置
- `DELETE /api/users/me` - 刪除帳號

---

## 🎨 共用設計元素

### 表單元件
```tsx
// 標準輸入框
<input className="w-full px-4 py-3 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

// 主要按鈕
<button className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg
                   hover:bg-blue-800 active:scale-98 transition-all
                   disabled:bg-gray-400 disabled:cursor-not-allowed" />

// 次要按鈕
<button className="px-4 py-2 border-2 border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-all" />
```

### Toast 通知
```typescript
// 成功
toast.success('操作成功！', { duration: 3000 });

// 錯誤
toast.error('操作失敗，請稍後再試', { duration: 5000 });

// 警告
toast.warning('請注意...', { duration: 4000 });
```

### 載入狀態
```tsx
// 骨架屏
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<svg className="animate-spin h-5 w-5 text-blue-600" />
```

---

## 📱 響應式設計

### 斷點定義
- **手機**: < 768px
- **平板**: 768px - 1023px
- **桌面**: ≥ 1024px

### 關鍵調整
```typescript
// 容器寬度
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

// 網格佈局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 文字大小
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">

// 間距
<div className="p-4 sm:p-6 lg:p-8">
```

---

## ♿ 無障礙設計

### ARIA 標籤
```tsx
<button aria-label="關閉對話框" />
<input aria-required="true" aria-invalid={!!error} />
<div role="alert" aria-live="polite">{errorMessage}</div>
```

### 鍵盤導航
- Tab: 在可聚焦元素間移動
- Enter/Space: 觸發按鈕
- Escape: 關閉彈窗/清除輸入
- Arrow Keys: 在選項間移動

### 對比度
- 正文文字: 至少 4.5:1
- 大標題: 至少 3:1
- 互動元件: 清晰的焦點指示器

---

## 🚀 效能優化

### 程式碼分割
```typescript
// 路由層級的 lazy loading
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 圖片優化
- 使用 WebP 格式 (fallback PNG/JPG)
- 懶載入: `loading="lazy"`
- 響應式圖片: `srcset` 和 `sizes`

### API 快取
```typescript
// React Query 快取策略
useQuery('user-profile', fetchProfile, {
  staleTime: 5 * 60 * 1000,  // 5分鐘內不重新請求
  cacheTime: 10 * 60 * 1000, // 快取保留10分鐘
});
```

### 防抖與節流
```typescript
// 搜尋輸入防抖 300ms
const debouncedSearch = useDebouncedCallback(search, 300);

// 滾動事件節流 100ms
const throttledScroll = useThrottledCallback(onScroll, 100);
```

---

## 🧪 測試策略

### 單元測試
- 表單驗證邏輯
- 狀態管理 (Zustand stores)
- 工具函數 (formatters, validators)

### 整合測試
- API 請求/回應處理
- 錯誤邊界
- 路由導航

### E2E 測試 (關鍵流程)
1. 完整註冊流程
2. 登入 → 編輯檔案 → 登出
3. 變更密碼流程
4. 頭像上傳流程

---

## 📦 依賴套件

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4",
    "axios": "^1.12.2",
    "zustand": "^5.0.8",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/react": "^19.1.16",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.9.3",
    "vite": "^7.1.7"
  }
}
```

**推薦額外套件:**
- `react-hook-form` - 表單管理
- `react-hot-toast` - Toast 通知
- `@tanstack/react-query` - API 狀態管理
- `lucide-react` - Icon 組件
- `date-fns` - 日期處理

---

## 🔗 相關文件連結

- [完整 PRD 文件](../prd.md)
- [API 規格文件](../api-spec.yaml)
- [架構文件](../architecture.md)
- [開發任務清單](../development-tasks.md)

---

**文件狀態:** ✅ 已完成  
**建立日期:** 2025-10-20  
**最後更新:** 2025-10-20  
**維護者:** Sally (UX Expert)
