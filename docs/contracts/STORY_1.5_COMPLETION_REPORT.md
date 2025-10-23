# Story 1.5 完成報告：Gherkin 功能文件

**Story ID**: 1.5  
**Story 標題**: 編寫 Epic 1 Gherkin 功能文件  
**完成日期**: 2024年  
**狀態**: ✅ 已完成

---

## 📋 Story 概述

建立 Epic 1（用戶認證與基本功能）的所有 Gherkin BDD 規格文件，作為後續 Epic 的驗證範本。

---

## ✅ 驗收標準完成狀況

### AC1: 用戶註冊功能文件 ✅
**文件**: `/docs/contracts/gherkin/epic-1/1.1-user-registration.feature`

**包含場景**:
- ✅ 成功註冊新用戶（UI 流程）
- ✅ 使用 API 成功註冊（含 camelCase 驗證）
- ✅ Email 已存在錯誤處理（400）
- ✅ 密碼格式驗證（Scenario Outline，4 種失敗案例）
- ✅ 必填欄位驗證（Scenario Outline：email, password, displayName）
- ✅ Email 格式驗證（422）
- ✅ 顯示名稱長度驗證（max 50 字元）
- ✅ 註冊後資料儲存驗證（bcrypt hash, timestamps, no googleId）

**覆蓋率**: 10 個場景，涵蓋所有成功/失敗路徑

---

### AC2: 用戶登入功能文件 ✅
**文件**: `/docs/contracts/gherkin/epic-1/1.2-user-login.feature`

**包含場景**:
- ✅ 成功登入（UI 和 API）
- ✅ 使用 Remember Me 登入（7 天 token）
- ✅ 錯誤密碼處理（401，increment failedLoginAttempts）
- ✅ 不存在的 Email（401）
- ✅ 帳號鎖定機制 - 第 5 次失敗（設定 lockedUntil）
- ✅ 嘗試登入已鎖定帳號（403，顯示解鎖時間）
- ✅ 鎖定時間過後可登入（重置 attempts）
- ✅ 非活躍帳號無法登入（isActive 檢查）
- ✅ 成功登入後重置失敗計數
- ✅ 必填欄位驗證（Scenario Outline）
- ✅ JWT Token 聲明驗證（sub, exp, HS256）
- ✅ Token 過期時間正確設定（30 min vs 7 days）

**覆蓋率**: 15 個場景，包含安全機制和 Token 刷新邏輯

---

### AC3: Google OAuth 功能文件 ✅
**文件**: `/docs/contracts/gherkin/epic-1/1.3-google-oauth.feature`

**包含場景**:
- ✅ 首次 Google 登入建立新帳號（isNewUser=true）
- ✅ 使用 API 首次 Google 登入（needsDisplayName 邏輯）
- ✅ 已有帳號的 Google 登入
- ✅ 綁定 Google 帳號到現有帳號
- ✅ 嘗試綁定已被使用的 Google 帳號（400）
- ✅ 解除綁定 Google 帳號
- ✅ 無法解除唯一的登入方式（400）
- ✅ Google ID Token 無效（401）
- ✅ Google 登入的非活躍帳號（403）
- ✅ Google 首次登入需要設定顯示名稱
- ✅ 驗證 Google ID Token 的基本流程

**覆蓋率**: 11 個場景，涵蓋 OAuth 完整生命週期

---

### AC4: 個人檔案管理功能文件 ✅
**文件**: `/docs/contracts/gherkin/epic-1/1.4-profile-management.feature`

**包含場景**:
- ✅ 查看個人檔案（camelCase 格式驗證）
- ✅ 更新顯示名稱
- ✅ 更新個人簡介
- ✅ 顯示名稱驗證失敗（Scenario Outline，3 種案例）
- ✅ 上傳頭像（multipart/form-data）
- ✅ 上傳頭像格式驗證（只允許圖片）
- ✅ 上傳頭像大小限制（5MB）
- ✅ 刪除頭像
- ✅ 新增興趣標籤
- ✅ 獲取我的興趣標籤列表
- ✅ 刪除興趣標籤
- ✅ 新增不存在的標籤自動創建
- ✅ 無法重複新增相同標籤（400）
- ✅ 標籤數量限制（max 10）

**覆蓋率**: 14 個場景，包含頭像上傳和興趣標籤管理

---

### AC5: 個人儀表板功能文件 ✅
**文件**: `/docs/contracts/gherkin/epic-1/1.5-dashboard.feature`

**包含場景**:
- ✅ 查看個人儀表板（Epic 1 階段，所有統計為 0）
- ✅ UI 顯示儀表板
- ✅ 驗證 camelCase 格式轉換（6 個欄位）
- ✅ 未驗證用戶無法訪問儀表板（401）
- ✅ 無效 Token 無法訪問（401）
- ✅ 過期 Token 無法訪問（401，重定向登入頁）
- ✅ 非活躍用戶無法訪問（403）
- ✅ 儀表板資料回應時間（<500ms）
- ✅ 儀表板空狀態友善提示
- ✅ 從儀表板導航到其他頁面
- ✅ 驗證 ISO 8601 日期時間格式
- ✅ 儀表板資料結構完整性

**覆蓋率**: 12 個場景，包含空狀態處理和性能要求

---

### AC6: 一致的風格和格式 ✅
**驗證項目**:
- ✅ 所有功能文件使用中文（zh-TW）
- ✅ 使用 `# language: zh-TW` 標記
- ✅ 使用 Given-When-Then 模式
- ✅ 每個功能都有 "作為...我想要...以便..." 的描述
- ✅ 包含 Background 區塊設定測試資料
- ✅ 使用 Scenario Outline 處理參數化測試
- ✅ JSON 範例使用 doc strings (`"""json`)
- ✅ 表格資料使用 Gherkin 表格語法

---

## 📊 交付成果統計

| 功能文件 | 場景數 | 行數 | 涵蓋的驗收標準 |
|---------|-------|------|--------------|
| 1.1-user-registration.feature | 10 | ~140 | AC1 |
| 1.2-user-login.feature | 15 | ~200 | AC2 |
| 1.3-google-oauth.feature | 11 | ~160 | AC3 |
| 1.4-profile-management.feature | 14 | ~180 | AC4 |
| 1.5-dashboard.feature | 12 | ~170 | AC5 |
| **總計** | **62** | **~850** | **AC1-AC6** |

---

## 🎯 關鍵特性

### 1. 全面的場景覆蓋
- **成功路徑**: 所有主要功能的正常流程
- **錯誤處理**: 驗證失敗、權限錯誤、狀態衝突
- **安全檢查**: 帳號鎖定、Token 驗證、權限控制
- **資料驗證**: camelCase 格式、ISO 8601 日期、欄位長度

### 2. 資料契約整合
- 所有 API 回應驗證 camelCase 格式
- 資料庫欄位名稱 (snake_case) 到 API (camelCase) 的轉換驗證
- 敏感資料（如 passwordHash）不出現在回應中
- 標準錯誤格式檢查

### 3. 技術深度
- JWT Token 結構驗證（sub, exp, algorithm）
- bcrypt 密碼雜湊驗證
- 帳號鎖定機制（5 次失敗 → 15 分鐘鎖定）
- Google OAuth 流程（idToken 驗證、帳號綁定/解綁）
- 檔案上傳（multipart/form-data、格式/大小限制）

### 4. 可讀性和可維護性
- 使用中文撰寫，團隊更易理解
- Background 區塊減少重複設定
- Scenario Outline 簡化參數化測試
- 清晰的 Given-When-Then 結構

---

## 🔗 與其他合約文件的關聯

### Database Schema (`database-schema.md`)
- Gherkin 場景驗證資料庫欄位（如 failedLoginAttempts, lockedUntil）
- 驗證資料表關聯（user_interest_tags）

### Data Contract (`data-contract.md`)
- 所有 API 回應驗證 camelCase 格式
- 驗證標準錯誤回應結構
- ISO 8601 日期格式驗證

### API Access Guide (`api-access-guide.md`)
- Gherkin 場景作為 API 端點的行為規格
- 可用於產生 API 文件範例

---

## 💡 後續 Epic 使用建議

### 1. 作為範本
複製並修改現有場景，適應新功能：
```bash
cp 1.1-user-registration.feature ../epic-2/2.1-book-club-creation.feature
# 修改 Feature 描述和場景內容
```

### 2. 驗證檢查清單
在開發新功能時，確保：
- [ ] 成功路徑場景
- [ ] 錯誤處理場景
- [ ] 權限檢查場景
- [ ] 資料驗證場景
- [ ] camelCase 格式驗證
- [ ] 資料庫狀態驗證

### 3. PR 審查
使用 Gherkin 場景作為：
- 功能完整性檢查
- API 回應格式驗證
- 邊界條件測試確認

---

## 📁 文件結構

```
docs/contracts/gherkin/epic-1/
├── 1.1-user-registration.feature      # 用戶註冊
├── 1.2-user-login.feature             # 用戶登入
├── 1.3-google-oauth.feature           # Google OAuth
├── 1.4-profile-management.feature     # 個人檔案管理
└── 1.5-dashboard.feature              # 個人儀表板
```

---

## ✨ 品質指標

- ✅ **語言一致性**: 100% 使用中文（zh-TW）
- ✅ **格式一致性**: 所有文件遵循相同結構
- ✅ **覆蓋率**: 所有驗收標準完全覆蓋
- ✅ **可讀性**: 非技術人員也能理解場景
- ✅ **技術準確性**: 與實際 API 實作對齊

---

## 🎓 學習價值

這些 Gherkin 文件不僅是測試規格，也是：
- **新團隊成員的學習資源**: 快速理解功能行為
- **API 使用範例**: 包含實際請求/回應 JSON
- **業務邏輯文件**: 記錄帳號鎖定、Token 過期等規則
- **跨團隊溝通工具**: PM、QA、Dev 共同語言

---

## 🔄 下一步行動

### 立即行動
1. ✅ Story 1.5 完成
2. ⏭️ 進行 Story 1.6: 建立 PR 模板
3. ⏭️ 考慮執行 Story 1.7: CI 工作流程（可選）

### 長期維護
- 隨著 API 實作更新 Gherkin 場景
- 新增 Epic 2、Epic 3 的功能文件
- 定期審查場景與實作的一致性

---

**報告生成**: Winston（架構師）  
**下一個 Story**: 1.6 - 建立 PR 模板與合約文件檢查清單
