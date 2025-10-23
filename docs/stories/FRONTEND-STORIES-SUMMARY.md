# Frontend Stories Summary - Epic 1

**Created Date:** 2025-10-21  
**Created By:** Bob (Scrum Master)  
**Status:** Draft - Ready for Development

---

## Overview

這是配合後端 Stories 1.1-1.4 的前端實作故事。後端 API 已經完成，現在需要建立對應的使用者介面。

---

## Stories List

### ✅ Story 1.1-Frontend: 新用戶註冊頁面
- **File:** `1.1-frontend.new-user-registration-page.md`
- **Route:** `/register`
- **Backend Dependencies:** Story 1.1 (POST /api/auth/register, GET /api/auth/check-email)
- **Key Features:**
  - Email + 密碼註冊表單
  - Google OAuth 註冊
  - 即時表單驗證
  - 密碼強度指示器
  - 服務條款勾選
- **Priority:** 🔴 高
- **Complexity:** 中等

---

### ✅ Story 1.2-Frontend: 登入頁面
- **File:** `1.2-frontend.login-page.md`
- **Route:** `/login`
- **Backend Dependencies:** Story 1.2 (POST /api/auth/login)
- **Key Features:**
  - Email + 密碼登入表單
  - Google OAuth 登入
  - 記住我功能
  - 登入失敗保護（5次鎖定警告）
  - 忘記密碼連結
- **Priority:** 🔴 高
- **Complexity:** 中等

---

### ✅ Story 1.3-Frontend: 個人儀表板頁面
- **File:** `1.3-frontend.dashboard-page.md`
- **Route:** `/dashboard`
- **Backend Dependencies:** Story 1.5 (GET /api/users/me, GET /api/users/me/dashboard)
- **Key Features:**
  - 用戶資訊卡片
  - 統計數據顯示
  - 快速操作按鈕
  - 我的讀書會列表
  - 最近活動時間軸
  - 路由保護（PrivateRoute）
- **Priority:** 🟡 中
- **Complexity:** 中等
- **⚠️ Note:** Dashboard API 可能尚未實作，可先使用 mock 資料

---

### ✅ Story 1.4-Frontend: 個人檔案管理頁面
- **File:** `1.4-frontend.profile-management-page.md`
- **Route:** `/profile`
- **Backend Dependencies:** Story 1.4 (完整的 profile 和 interest tags APIs)
- **Key Features:**
  - Tab 導航設計（4個分頁）
  - 基本資料編輯
  - 頭像上傳與預覽
  - 興趣標籤管理（最多20個）
  - 隱私設定
- **Priority:** 🔴 高
- **Complexity:** 高

---

## Development Order (建議順序)

1. **Story 1.1-Frontend** (註冊頁面)
   - 原因：建立基礎 UI 元件（Input, Button, Checkbox）和 Auth 架構
   - 預估時間：2-3天

2. **Story 1.2-Frontend** (登入頁面)
   - 原因：重用 Story 1.1 的元件，完善認證流程
   - 預估時間：1-2天

3. **Story 1.3-Frontend** (儀表板)
   - 原因：建立 PrivateRoute 和載入狀態處理
   - 預估時間：2-3天
   - ⚠️ 可能需要等待 Dashboard API 或使用 mock 資料

4. **Story 1.4-Frontend** (個人檔案)
   - 原因：最複雜，需要檔案上傳和多 Tab 管理
   - 預估時間：3-4天

**Total Estimated Time:** 8-12 天

---

## Shared Components (共用元件)

以下元件會在多個 story 中重複使用：

### 建立於 Story 1.1:
- ✅ `Input.tsx` - 輸入框（用於所有表單）
- ✅ `Button.tsx` - 按鈕（用於所有頁面）
- ✅ `Checkbox.tsx` - 勾選框
- ✅ `PasswordStrengthIndicator.tsx` - 密碼強度指示器
- ✅ `authStore.ts` - 認證狀態管理（Zustand）
- ✅ `authService.ts` - 認證 API 服務層

### 建立於 Story 1.3:
- ✅ `PrivateRoute.tsx` - 路由保護元件
- ✅ `Card.tsx` - 卡片元件
- ✅ `Avatar.tsx` - 頭像元件
- ✅ `SkeletonCard.tsx` - 骨架屏

### 建立於 Story 1.4:
- ✅ `Tabs.tsx` - Tab 導航元件
- ✅ `FileUpload.tsx` - 檔案上傳元件
- ✅ `TagSelector.tsx` - 標籤選擇元件
- ✅ `Textarea.tsx` - 多行文字輸入

---

## Tech Stack Summary

### Core Technologies:
- **React:** 19.1.1
- **TypeScript:** 5.9.3
- **Vite:** 7.1.7
- **React Router DOM:** 7.9.4
- **Tailwind CSS:** 4.1.14

### State Management:
- **Zustand:** 5.0.8 (輕量級狀態管理)

### Form Handling:
- **React Hook Form:** 7.53.0
- **Zod:** 4.1.12 (表單驗證)
- **@hookform/resolvers:** (整合 Zod 與 RHF)

### API & Data:
- **Axios:** 1.12.2

### UI/UX:
- **react-hot-toast:** Toast 通知
- **clsx + tailwind-merge:** 動態 className 管理

---

## API Endpoints Summary

### 認證相關:
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/check-email` - 檢查 Email 是否可用

### 用戶相關:
- `GET /api/users/me` - 取得當前用戶資訊
- `GET /api/users/me/dashboard` - 取得儀表板資料 ⚠️ 可能未實作
- `GET /api/users/me/profile` - 取得完整檔案
- `PUT /api/users/me/profile` - 更新基本資料
- `POST /api/users/me/avatar` - 上傳頭像

### 興趣標籤相關:
- `GET /api/interest-tags` - 取得所有標籤
- `POST /api/interest-tags` - 創建自定義標籤
- `POST /api/users/me/interest-tags` - 新增用戶標籤
- `DELETE /api/users/me/interest-tags/{tag_id}` - 移除用戶標籤

---

## Environment Setup

### Required Environment Variables:
```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000
```

### Additional Dependencies to Install:
```bash
npm install react-hot-toast @hookform/resolvers
```

---

## Testing Strategy

### Unit Tests:
- UI 元件測試（Input, Button, Checkbox, etc.）
- 表單驗證邏輯測試
- API Service 測試（使用 MSW mocking）

### Integration Tests:
- 完整頁面渲染測試
- 表單提交流程測試
- 路由導航測試

### E2E Tests (建議):
- 註冊 → 登入 → 儀表板流程
- 個人檔案編輯流程
- 頭像上傳流程

### Testing Tools:
- **Vitest** - 測試運行器
- **React Testing Library** - 元件測試
- **MSW (Mock Service Worker)** - API Mocking

---

## Responsive Design Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px

所有頁面必須在三種尺寸下完美呈現。

---

## Accessibility Requirements

- ✅ ARIA 標籤（aria-label, aria-invalid, aria-describedby）
- ✅ 鍵盤導航支援（Tab, Enter, Escape）
- ✅ 螢幕閱讀器相容
- ✅ 色彩對比度 WCAG AA 標準

---

## Performance Goals

- ✅ 首次載入 < 3秒
- ✅ 互動反饋 < 300ms
- ✅ Lighthouse Score > 90

---

## Next Steps

1. **Dev Agent** 按照建議順序依序實作 Stories 1.1-1.4
2. 每個 Story 完成後標記為 "Ready for Review"
3. **QA Agent** 進行測試和驗收
4. 完成後可繼續開發 Story 1.5 (前端) 或 Epic 1.6

---

## Notes

- ⚠️ **Dashboard API** 可能尚未實作，Story 1.3 可使用 mock 資料先完成前端
- ✅ 所有後端 API (Stories 1.1-1.4) 已完成並通過 QA
- 🎯 前端開發重點：建立可重用的 UI 元件庫
- 📝 記得更新 Dev Agent Record 和 File List

---

**Created by Bob (Scrum Master) 🏃**  
**Ready for James (Dev Agent) to pick up! 💪**
