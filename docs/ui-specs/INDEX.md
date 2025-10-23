# UI/UX 頁面規格 - 索引文件

**專案:** 線上讀書會平台  
**版本:** v1.0  
**最後更新:** 2025-10-20

---

## 📊 規格完成度總覽

| Epic | 頁面數 | 已完成 | 進行中 | 未開始 | 完成度 |
|------|--------|--------|--------|--------|---------|
| Epic 1: 用戶系統 | 5 | 5 | 0 | 0 | 100% ✅ |
| Epic 2: 讀書會管理 | 4 | 0 | 0 | 4 | 0% ⏳ |
| Epic 3: 學習協作 | 5 | 0 | 0 | 5 | 0% ⏳ |
| Epic 4 & 共用 | 3 | 0 | 0 | 3 | 0% ⏳ |
| **總計** | **17** | **5** | **0** | **12** | **29%** |

---

## 📁 Epic 1: 用戶系統頁面 (5/5) ✅

### 1. 註冊頁面 - `✅ 已完成`
- **路由:** `/register`
- **文件:** `epic1-pages-summary.md` (第1節)
- **User Story:** Epic 1.1 - 新用戶註冊體驗
- **優先級:** 🔴 高
- **關鍵功能:**
  - Email + 密碼註冊
  - Google OAuth 註冊
  - 即時表單驗證
  - 密碼強度指示器
- **API 端點:**
  - `POST /api/auth/register`
  - `GET /api/auth/check-email`
- **完成日期:** 2025-10-20

---

### 2. 登入頁面 - `✅ 已完成`
- **路由:** `/login`
- **文件:** `epic1-pages-summary.md` (第2節)
- **User Story:** Epic 1.2 - 便捷登入體驗
- **優先級:** 🔴 高
- **關鍵功能:**
  - Email + 密碼登入
  - Google OAuth 登入
  - 記住我功能
  - 登入失敗保護 (5次鎖定)
- **API 端點:**
  - `POST /api/auth/login`
  - `POST /api/auth/google`
- **完成日期:** 2025-10-20

---

### 3. 個人儀表板 - `✅ 已完成`
- **路由:** `/dashboard`
- **文件:** `epic1-pages-summary.md` (第3節)
- **User Story:** Epic 1.5 - 個人儀表板
- **優先級:** 🟡 中
- **關鍵功能:**
  - 個人資訊卡片
  - 快速操作按鈕
  - 我的讀書會列表 (最多3個)
  - 最近活動時間軸
- **API 端點:**
  - `GET /api/users/me/dashboard`
- **完成日期:** 2025-10-20

---

### 4. 個人檔案頁面 - `✅ 已完成`
- **路由:** `/profile`
- **文件:** `epic1-pages-summary.md` (第4節)
- **User Story:** Epic 1.4 - 個人檔案管理
- **優先級:** 🔴 高
- **關鍵功能:**
  - Tab 1: 基本資料編輯
  - Tab 2: 頭像上傳管理
  - Tab 3: 興趣標籤管理 (最多20個)
  - Tab 4: 隱私設定控制
- **API 端點:**
  - `PATCH /api/users/me`
  - `POST /api/users/me/avatar`
  - `PATCH /api/users/me/interests`
  - `PATCH /api/users/me/privacy`
- **完成日期:** 2025-10-20

---

### 5. 帳號設定頁面 - `✅ 已完成`
- **路由:** `/settings`
- **文件:** `epic1-pages-summary.md` (第5節)
- **User Story:** Epic 1.6 - 會話與安全管理
- **優先級:** 🟡 中
- **關鍵功能:**
  - Tab 1: 安全設定 (變更密碼、2FA、OAuth)
  - Tab 2: 活動會話管理
  - Tab 3: 隱私控制
  - Tab 4: 通知偏好
  - Tab 5: 帳號管理 (匯出/刪除)
- **API 端點:**
  - `POST /api/users/me/change-password`
  - `GET /api/users/me/sessions`
  - `DELETE /api/users/me/sessions/:id`
- **完成日期:** 2025-10-20

---

## 📁 Epic 2: 讀書會管理頁面 (0/4) ⏳

### 6. 讀書會探索頁面 - `⏳ 未開始`
- **路由:** `/clubs`
- **文件:** 待建立
- **User Story:** Epic 2.2 - 探索與查看讀書會
- **優先級:** 🔴 高
- **規劃功能:**
  - 卡片網格顯示公開讀書會
  - 關鍵字搜尋
  - 主題標籤篩選
  - 排序功能 (最新/熱門/成員數)
  - 無限滾動載入
- **預計開始:** 2025-10-21

---

### 7. 讀書會詳細頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId`
- **文件:** 待建立
- **User Story:** Epic 2.2, 2.3, 2.4
- **優先級:** 🔴 高
- **規劃功能:**
  - 封面橫幅與基本資訊
  - Tab 導航 (概覽/討論/成員/資源)
  - 加入/退出功能
  - 管理員操作 (僅管理員可見)
- **預計開始:** 2025-10-22

---

### 8. 建立讀書會頁面 - `⏳ 未開始`
- **路由:** `/clubs/create`
- **文件:** 待建立
- **User Story:** Epic 2.1 - 建立讀書會
- **優先級:** 🔴 高
- **規劃功能:**
  - 多步驟表單 (基本資訊 → 預覽 → 完成)
  - 封面圖片上傳
  - 標籤選擇
  - 公開/私密設定
- **預計開始:** 2025-10-23

---

### 9. 讀書會設定頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/settings`
- **文件:** 待建立
- **User Story:** Epic 2.4 - 管理讀書會
- **優先級:** 🟡 中
- **規劃功能:**
  - 基本資訊編輯
  - 成員管理 (角色分配、移除)
  - 加入請求審核
  - 讀書會刪除
- **預計開始:** 2025-10-24

---

## 📁 Epic 3: 學習協作頁面 (0/5) ⏳

### 10. 討論區列表頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/discussions`
- **User Story:** Epic 3.2 - 讀書會內部討論區

### 11. 討論串詳細頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/discussions/:topicId`
- **User Story:** Epic 3.2 - 讀書會內部討論區

### 12. 建立討論頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/discussions/new`
- **User Story:** Epic 3.2 - 讀書會內部討論區

### 13. 資源檔案庫頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/resources`
- **User Story:** Epic 3.3 - 資源分享與協作筆記

### 14. 閱讀進度頁面 - `⏳ 未開始`
- **路由:** `/clubs/:clubId/progress`
- **User Story:** Epic 3.1 - 讀書進度追蹤

---

## 📁 Epic 4 & 共用頁面 (0/3) ⏳

### 15. 通知中心頁面 - `⏳ 未開始`
- **路由:** `/notifications`
- **User Story:** Epic 4.1 - 通知與提醒功能

### 16. 全站搜尋頁面 - `⏳ 未開始`
- **路由:** `/search`
- **User Story:** 共用功能

### 17. 用戶公開檔案頁面 - `⏳ 未開始`
- **路由:** `/users/:userId`
- **User Story:** 共用功能

---

## 📋 待辦事項

### 高優先級 (本週)
- [ ] 與後端團隊確認 Epic 1 API 端點
- [ ] 建立共用 UI 組件庫
- [ ] 開始 Epic 2 頁面規格撰寫

### 中優先級 (下週)
- [ ] 建立 Figma 設計稿 (Epic 1)
- [ ] E2E 測試腳本規劃
- [ ] 無障礙測試清單

### 低優先級 (未來)
- [ ] Epic 3 & 4 頁面規格撰寫
- [ ] 動畫效果設計
- [ ] 暗色模式設計

---

## 🔗 快速連結

- [Epic 1 完整規格](./epic1-pages-summary.md)
- [PRD 文件](../prd.md)
- [API 規格](../api-spec.yaml)
- [架構文件](../architecture.md)

---

**維護者:** Sally (UX Expert)  
**聯繫方式:** ux-expert@bookclub.dev
