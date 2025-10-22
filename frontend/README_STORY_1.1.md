# Story 1.1-Frontend: 新用戶註冊頁面

## 🎯 功能概述

實作新用戶註冊頁面，包含：
- ✅ Email + 密碼註冊
- ✅ 即時表單驗證
- ✅ 密碼強度指示器
- ✅ 響應式設計（手機/平板/桌面）
- ✅ 完整錯誤處理
- ⏸️ Google OAuth（延後實作）

## 🚀 快速開始

### 前置需求
- Node.js 18+
- 後端 API 運行於 `http://localhost:8000`

### 啟動開發服務器

```bash
cd frontend
npm install
npm run dev
```

訪問: http://localhost:5174/register

## 📁 檔案結構

```
frontend/src/
├── pages/
│   ├── Register.tsx          # 註冊頁面主元件
│   └── Dashboard.tsx         # 儀表板佔位頁面
├── components/
│   ├── ui/
│   │   ├── Input.tsx         # 輸入框元件
│   │   ├── Button.tsx        # 按鈕元件
│   │   └── Checkbox.tsx      # 勾選框元件
│   └── forms/
│       └── PasswordStrengthIndicator.tsx  # 密碼強度指示器
├── services/
│   ├── api.ts                # Axios 客戶端
│   └── authService.ts        # 認證 API 服務
├── store/
│   └── authStore.ts          # Zustand 認證狀態
├── types/
│   └── auth.ts               # TypeScript 型別定義
└── App.tsx                   # 路由配置
```

## 🧪 測試

### 手動測試
參考 `frontend/MANUAL_TEST_CHECKLIST.md` 完整測試清單

### 快速測試用例

**有效註冊資料:**
```
顯示名稱: TestUser123
Email: test_$(date +%s)@example.com
密碼: Test1234
確認密碼: Test1234
服務條款: ✓
```

**驗證錯誤測試:**
- 顯示名稱太短: `a`
- 無效 Email: `invalid-email`
- 弱密碼: `test` (缺少大寫和數字)
- 密碼不一致: 輸入不同的確認密碼

## 🔧 技術細節

### 核心技術棧
- **React** 19.1.1 + TypeScript
- **React Hook Form** 7.53.0 - 表單管理
- **Zod** 4.1.12 - 表單驗證
- **Zustand** 5.0.8 - 狀態管理
- **Tailwind CSS** 4.1.14 - 樣式
- **Axios** 1.12.2 - API 請求

### 表單驗證規則

**顯示名稱:**
- 長度: 2-50 字元
- 格式: 字母、數字、中文、底線
- 正則: `/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/`

**Email:**
- 標準 Email 格式驗證

**密碼:**
- 長度: 至少 8 字元
- 包含: 大寫字母 + 小寫字母 + 數字
- 正則: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

**密碼強度計算:**
```typescript
分數系統（0-5）:
+1: 長度 >= 8
+1: 長度 >= 12
+1: 包含大小寫字母
+1: 包含數字
+1: 包含特殊字元

0-2: 弱 (紅色)
3-4: 中 (黃色)
5: 強 (綠色)
```

## 🔌 API 端點

### POST /api/auth/register
註冊新用戶

**Request:**
```json
{
  "display_name": "TestUser",
  "email": "test@example.com",
  "password": "Test1234"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "display_name": "TestUser"
  }
}
```

**Error (400):**
```json
{
  "detail": "Email already registered"
}
```

### GET /api/auth/check-email
檢查 Email 是否可用（未實作防抖）

**Query:** `?email=test@example.com`

**Response:**
```json
{
  "available": false,
  "message": "Email already registered"
}
```

## 🐛 已知問題與限制

1. **Google OAuth 未實作**
   - 需要 Google Cloud 專案設定
   - 需要 Client ID 和憑證
   - 預計在後續 sprint 實作

2. **Email 可用性檢查無防抖**
   - 目前未實作即時 Email 檢查
   - 可選功能，不影響核心流程

3. **單元測試未包含**
   - 建議在 Epic 1 完成後統一撰寫測試
   - 手動測試清單已提供

## 📝 開發筆記

### TypeScript 配置
此專案使用 `verbatimModuleSyntax: true`，所有**類型導入**必須使用：
```typescript
import type { User, TokenResponse } from '../types/auth';
```

### Tailwind CSS v4
使用新的 `@import` 語法：
```css
@import "tailwindcss";
```

### 狀態管理
- Auth tokens 支援 `localStorage` (記住我) 和 `sessionStorage`
- 使用 Zustand 管理認證狀態
- 頁面載入時自動初始化認證狀態

## 🎨 UI/UX 特性

- **響應式斷點:**
  - Mobile: 375px+
  - Tablet: 768px+
  - Desktop: 1024px+

- **無障礙特性:**
  - 所有輸入框有 ARIA 標籤
  - 錯誤訊息有 `role="alert"`
  - 支援鍵盤導航（Tab, Enter）
  - Focus 狀態明顯視覺反饋

- **視覺反饋:**
  - Loading 狀態 < 300ms 顯示
  - Toast 通知（成功/錯誤）
  - 即時表單驗證
  - 密碼強度即時更新

## 📞 聯絡與支援

如有問題，請查看：
1. `MANUAL_TEST_CHECKLIST.md` - 完整測試指南
2. Story 文件: `docs/stories/1.1-frontend.new-user-registration-page.md`
3. 技術架構: `docs/architecture/5-前端架構詳細設計-vite-react.md`

---

**Story Status:** ✅ Ready for Review  
**Last Updated:** 2025-10-21  
**Developer:** James (Dev Agent)
