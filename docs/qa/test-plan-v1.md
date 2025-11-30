# 線上讀書會平台 - 測試計畫 (Test Plan)

**版本**: v1.0
**日期**: 2025-11-30
**依據**: PRD v4.1 (2025-11-12)
**範圍**: Epic 1 ~ Epic 4 核心功能

---

## 1. 測試策略概述

本計畫採用 **金字塔測試策略**，重點放在後端自動化測試，確保核心邏輯與 API 的正確性。

*   **單元測試 (Unit Testing)**:
    *   **目標**: 驗證個別函數、類別 (Service, Model) 的邏輯正確性。
    *   **覆蓋範圍**: 所有 Service 層邏輯、Model 驗證、核心工具函式。
    *   **工具**: `pytest`, `pytest-mock` (Mocking)
    *   **標準**: 測試覆蓋率 > 80%，核心邏輯 100%。

*   **整合測試 (Integration Testing)**:
    *   **目標**: 驗證 API 端點 (Endpoints) 與資料庫、外部服務 (如 SendGrid, Cloudinary) 的協作。
    *   **覆蓋範圍**: 所有 API 路由 (Happy Path + 主要錯誤情境)。
    *   **工具**: `TestClient` (FastAPI), Docker (測試資料庫)。

---

## 2. 測試案例清單 (按 Epic 分類)

### Epic 1: 用戶系統

#### 1.1 註冊 (Registration)
*   **Unit (Service)**:
    *   `test_create_user_success`: 驗證密碼雜湊、資料儲存。
    *   `test_create_user_duplicate_email`: 驗證重複 Email 拋出錯誤。
    *   `test_create_user_invalid_password`: 驗證密碼強度檢查。
*   **Integration (API)**:
    *   `POST /auth/register`: 成功註冊，檢查 DB 新增記錄，檢查 Email 觸發 (Mock)。
    *   `POST /auth/register`: 重複 Email，預期 409 Conflict。

#### 1.2 登入 (Login)
*   **Unit (Service)**:
    *   `test_authenticate_success`: 驗證帳密正確回傳 User。
    *   `test_authenticate_failure`: 驗證錯誤密碼回傳 None。
*   **Integration (API)**:
    *   `POST /auth/login`: 成功登入，預期回傳 JWT Token。
    *   `POST /auth/login`: 失敗登入，預期 401 Unauthorized。

#### 1.3 個人檔案 (Profile)
*   **Unit (Service)**:
    *   `test_update_profile`: 驗證名稱、簡介更新。
    *   `test_upload_avatar`: 驗證圖片上傳邏輯 (Mock Cloudinary)。
*   **Integration (API)**:
    *   `GET /users/me/profile`: 驗證回傳資料正確性。
    *   `PUT /users/me/profile`: 驗證更新後資料變更。
    *   `POST /users/me/avatar`: 驗證頭像上傳與 URL 更新。

#### 1.4 密碼重置 (Password Reset)
*   **Unit (Service)**:
    *   `test_generate_reset_token`: 驗證 Token 生成與儲存。
    *   `test_reset_password`: 驗證新密碼設定與雜湊。
*   **Integration (API)**:
    *   `POST /auth/forgot-password`: 請求重置信。
    *   `POST /auth/reset-password`: 使用 Token 重置密碼。

---

### Epic 2: 讀書會管理

#### 2.1 建立讀書會 (Create Club)
*   **Unit (Service)**:
    *   `test_create_club`: 驗證讀書會建立，Owner 自動加入。
*   **Integration (API)**:
    *   `POST /clubs/`: 建立讀書會，驗證回傳 ID 與權限。

#### 2.2 探索讀書會 (Explore)
*   **Unit (Service)**:
    *   `test_search_clubs`: 驗證關鍵字搜尋。
    *   `test_filter_clubs`: 驗證標籤與公開/私密篩選。
*   **Integration (API)**:
    *   `GET /clubs/`: 搜尋列表，驗證分頁 (Pagination)。

#### 2.3 加入/退出 (Join/Leave)
*   **Unit (Service)**:
    *   `test_join_public_club`: 驗證直接加入。
    *   `test_apply_private_club`: 驗證建立申請單 (待審核)。
    *   `test_leave_club`: 驗證成員移除。
*   **Integration (API)**:
    *   `POST /clubs/{id}/join`: 加入流程測試。
    *   `POST /clubs/{id}/leave`: 退出流程測試。

#### 2.6 活動管理 (Events)
*   **Unit (Service) [已補強]**:
    *   `test_create_event`: 驗證活動建立。
    *   `test_join_event`: 驗證報名邏輯、人數限制、重複報名。
    *   `test_leave_event`: 驗證取消報名。
    *   `test_get_user_club_events`: 驗證儀表板活動查詢。
*   **Integration (API) [已補強]**:
    *   `POST /clubs/{id}/events`: 建立活動。
    *   `GET /clubs/{id}/events`: 活動列表。
    *   `POST /clubs/{id}/events/{eid}/join`: 報名 API。
    *   `POST /clubs/{id}/events/{eid}/leave`: 取消報名 API。

---

### Epic 3: 學習協作

#### 3.2 討論區 (Discussions)
*   **Unit (Service)**:
    *   `test_create_topic`: 驗證發表主題。
    *   `test_create_reply`: 驗證回覆主題。
*   **Integration (API)**:
    *   `GET /clubs/{id}/discussions`: 取得主題列表。
    *   `POST /clubs/{id}/discussions`: 發表主題。
    *   `POST /clubs/{id}/discussions/{tid}/replies`: 發表回覆。

---

### Epic 4: 智能互動

#### 4.1 通知系統 (Notifications)
*   **Unit (Service)**:
    *   `test_create_notification`: 驗證通知建立。
    *   `test_mark_as_read`: 驗證狀態更新。
*   **Integration (API)**:
    *   `GET /notifications`: 取得通知列表。
    *   `PATCH /notifications/{id}/read`: 標記已讀。

---

## 3. 執行計畫

1.  **自動化測試執行**:
    *   開發者在本地使用 `docker-compose exec api pytest` 執行全套測試。
    *   CI/CD (GitHub Actions) 在每次 Push/PR 時自動執行。

2.  **覆蓋率監控**:
    *   目標維持總體覆蓋率 > 80%。
    *   特別關注 Service 層的業務邏輯覆蓋率。

3.  **測試環境**:
    *   **Unit/Integration**: 使用 Docker 容器內的獨立測試資料庫 (Test DB)，每次測試後自動重置。
    *   **Staging**: 部署至 Render Staging 環境，供 QA 進行手動 E2E 測試。
