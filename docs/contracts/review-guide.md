# Contract Documentation Review Guide

**版本**: 1.0  
**最後更新**: 2025-10-22  
**目標讀者**: PR Reviewers, Tech Leads, Architects

---

## 📋 概述

本指南協助 PR Reviewers 檢查契約文件的完整性和正確性。當開發者提交包含功能或資料結構變更的 PR 時，Reviewer 必須驗證相關的契約文件已被適當更新。

**核心原則**:
- 契約文件與代碼必須**同步**
- 契約文件必須**準確**反映實際行為
- 契約文件必須**完整**涵蓋所有相關變更
- 契約文件必須**清晰**易於理解

---

## 🎯 Review Checklist Overview

### 快速檢查清單

在審查 PR 時，依序檢查以下項目：

1. ✅ **PR Template 已填寫**: 開發者已勾選契約文件檢查清單
2. ✅ **變更類型識別**: 確認此 PR 是否影響 Database/API/Features
3. ✅ **相關文件已更新**: 檢查對應的契約文件是否包含在 PR 中
4. ✅ **文件內容正確**: 驗證文件內容與代碼變更一致
5. ✅ **文件格式良好**: 確保文件遵循格式規範

---

## 🗄️ Database Schema Review

### 何時需要檢查？

PR 包含以下變更時必須檢查 Database Schema:
- ✅ 新增/修改/刪除 SQLModel Model
- ✅ 新增/修改/刪除 Model 欄位
- ✅ 變更 ForeignKey、Relationships
- ✅ 新增/修改 Indexes
- ✅ 執行 Alembic migration

### 檢查項目

#### 1. 文件是否包含在 PR 中？

```bash
# 檢查 PR 是否修改了 database-schema.md
git diff --name-only origin/main | grep "docs/contracts/database-schema.md"
```

如果 PR 包含 Model 變更但**沒有**更新 `database-schema.md`，要求開發者補充。

#### 2. Model 定義是否完整？

檢查文件中的 Model 定義是否包含：
- [ ] Table 名稱
- [ ] 所有欄位（名稱、型別、約束）
- [ ] Primary Key 和 Foreign Keys
- [ ] Relationships（back_populates）
- [ ] Indexes（如適用）
- [ ] 欄位說明和用途

**範例**:
```markdown
### User Model

**Table Name**: `users`

| 欄位名稱 | 型別 | 約束 | 說明 |
|---------|------|------|------|
| id | Integer | PK, Auto-increment | 用戶唯一識別碼 |
| email | String(255) | Unique, Not Null | 用戶 Email |
| display_name | String(50) | Not Null | 顯示名稱 |
| ... | ... | ... | ... |
```

#### 3. ERD 圖表是否更新？

如果 PR 涉及：
- 新增 Table
- 新增/修改 Relationships
- 變更 Foreign Keys

ERD 圖表必須更新以反映新的結構。

**檢查方式**:
- 查看 Mermaid/PlantUML 代碼是否包含新的 Table
- 驗證關聯線（1-to-1, 1-to-many, many-to-many）是否正確

#### 4. Alembic Migration ID 是否記錄？

檢查文件是否記錄對應的 Alembic migration:

```markdown
**對應 Migration**: `abc123def456_add_google_oauth_fields` (2025-10-20)
```

**驗證方式**:
```bash
# 檢查 migration 文件是否存在
ls backend/alembic/versions/ | grep "add_google_oauth_fields"
```

#### 5. 命名規範是否一致？

- [ ] Table 名稱使用 snake_case
- [ ] 欄位名稱使用 snake_case
- [ ] 關聯名稱清晰且遵循規範（如 `owner_id`, `book_club_id`）

---

## 🔄 Data Contract Review

### 何時需要檢查？

PR 包含以下變更時必須檢查 Data Contract:
- ✅ 新增/修改 API Response Schema
- ✅ 新增/修改 Pydantic Model 的 Field alias
- ✅ 變更日期時間格式
- ✅ 新增/修改錯誤回應格式
- ✅ 變更分頁或列表回應格式

### 檢查項目

#### 1. camelCase Alias 是否正確設定？

檢查 PR 中的 Pydantic Schema 是否正確使用 `Field(alias="...")`：

**代碼範例**:
```python
class UserRead(SQLModel):
    display_name: str = Field(alias="displayName")
    created_at: datetime = Field(alias="createdAt")
    is_active: bool = Field(alias="isActive")
```

**文件驗證**: `data-contract.md` 應包含對應的對照表：

| Backend (Python) | API Response | Frontend (TypeScript) |
|------------------|--------------|----------------------|
| `display_name` | `displayName` | `displayName` |
| `created_at` | `createdAt` | `createdAt` |
| `is_active` | `isActive` | `isActive` |

#### 2. Response 格式是否記錄？

如果 PR 新增新的 API 端點或修改回應格式，檢查：

- [ ] 成功回應格式範例
- [ ] 錯誤回應格式範例
- [ ] 狀態碼說明（200, 201, 400, 401, 404 等）

**範例**:
```markdown
### POST /api/users/register

**Success Response (201)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "displayName": "John Doe",
  "isActive": true,
  "createdAt": "2025-10-22T10:30:00Z"
}
```
```

#### 3. 資料型別是否一致？

檢查文件中的資料型別約定：
- [ ] 日期時間使用 ISO 8601（如 `"2025-10-22T10:30:00Z"`）
- [ ] 布林值使用 `true`/`false`（非 `1`/`0`）
- [ ] null 處理方式清晰
- [ ] ID 型別一致（integer 或 UUID）

#### 4. 範例是否實際可用？

檢查文件中的 JSON 範例：
- [ ] 語法正確（有效的 JSON）
- [ ] 欄位名稱使用 camelCase
- [ ] 資料型別正確
- [ ] 與實際 API 回應一致

**驗證方式**:
```bash
# 啟動 backend 並測試實際 API
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer <token>" | jq .
```

比對實際回應與文件範例是否一致。

---

## 🥒 Gherkin Feature Review

### 何時需要檢查？

PR 包含以下變更時必須檢查 Gherkin Features:
- ✅ 新增新功能
- ✅ 修改現有功能的行為
- ✅ 變更驗證規則
- ✅ 變更錯誤處理邏輯
- ✅ 變更使用者流程

### 檢查項目

#### 1. Feature 文件是否存在？

檢查 PR 是否包含新增或更新的 `.feature` 文件：

```bash
# 檢查是否有 .feature 文件變更
git diff --name-only origin/main | grep ".feature$"
```

#### 2. Feature 描述是否清晰？

每個 Feature 應包含：
```gherkin
# language: zh-TW
功能: 用戶註冊
  作為一個新用戶
  我想要註冊一個帳號
  以便我可以使用平台的功能
```

檢查：
- [ ] 使用"作為...我想要...以便..."格式
- [ ] 清楚說明使用者價值
- [ ] 語言一致（中文或英文）

#### 3. Scenarios 是否涵蓋所有路徑？

檢查是否包含：
- [ ] **Happy Path**: 成功場景
- [ ] **Error Handling**: 錯誤處理場景
- [ ] **Edge Cases**: 邊界條件
- [ ] **Validation**: 驗證失敗場景

**範例**:
```gherkin
場景: 成功註冊新用戶
  假設 我在註冊頁面
  當 我填寫有效的註冊資料
  那麼 我應該看到成功訊息
  
場景: Email 已存在
  假設 資料庫已存在 "test@example.com"
  當 我使用 "test@example.com" 註冊
  那麼 我應該看到錯誤訊息 "Email already exists"
```

#### 4. Given-When-Then 是否清晰？

檢查每個 Scenario 的結構：
- [ ] **Given**: 清楚設定前置條件
- [ ] **When**: 明確描述動作
- [ ] **Then**: 可驗證的結果

避免：
- ❌ 模糊的描述（"系統應該正常運作"）
- ❌ 過於技術的細節（"JWT token 的 sub claim 應該是..."）
- ❌ 混合多個概念在一個步驟中

#### 5. 與代碼變更是否一致？

如果 PR 修改了功能行為，檢查：
- [ ] Gherkin Scenario 反映新的行為
- [ ] 錯誤訊息與實際 API 回應一致
- [ ] 驗證規則與代碼邏輯一致

**驗證方式**:
1. 閱讀 PR 的代碼變更
2. 對照 Gherkin Scenario 的描述
3. 確認 Scenario 準確描述了新的行為

---

## 📚 API Endpoints Documentation Review

### 何時需要檢查？

PR 包含以下變更時必須檢查 API Endpoints:
- ✅ 新增/修改/刪除 API 端點
- ✅ 變更端點的 HTTP 方法
- ✅ 變更端點的 URL 路徑
- ✅ 變更認證要求

### 檢查項目

#### 1. 端點是否記錄在 api-endpoints.md？

檢查新增的端點是否包含：
- [ ] HTTP 方法和路徑
- [ ] 簡短描述
- [ ] 認證要求（是否需要 JWT token）
- [ ] Request body（如適用）
- [ ] Response 範例

#### 2. FastAPI docstring 是否完整？

檢查代碼中的端點是否有清晰的 docstring：

```python
@router.post("/users/register", response_model=UserRead)
def register_user(user_data: UserCreate):
    """
    註冊新用戶
    
    建立一個新的用戶帳號。Email 必須唯一且未被使用。
    密碼將被加密儲存。
    
    - **email**: 有效的 Email 地址
    - **password**: 至少 8 個字元，包含大小寫字母和數字
    - **displayName**: 顯示名稱（2-50 字元）
    """
    # ...
```

這些 docstring 會自動出現在 Swagger UI 中。

#### 3. Swagger UI 是否正確顯示？

**手動驗證**:
1. 啟動 backend
2. 訪問 `http://localhost:3001/docs`
3. 找到新增/修改的端點
4. 檢查：
   - [ ] 端點路徑正確
   - [ ] Request/Response Schema 正確
   - [ ] 描述清晰
   - [ ] 範例資料合理

---

## 🚨 常見問題和遺漏項目

### Database Schema 常見問題

❌ **忘記更新 ERD 圖表**
- 新增 Table 但未更新視覺化關聯圖

❌ **欄位說明不完整**
- 只列出欄位名稱和型別，缺少用途說明

❌ **Relationship 描述不清**
- 未說明關聯類型（1-to-1, 1-to-many）
- 未記錄 back_populates

❌ **Migration ID 缺失**
- 未記錄對應的 Alembic migration

### Data Contract 常見問題

❌ **忘記 camelCase alias**
- 新增欄位但忘記設定 `Field(alias="...")`

❌ **範例與實際不符**
- 文件範例使用 snake_case，但實際 API 回傳 camelCase

❌ **錯誤回應格式不一致**
- 不同端點使用不同的錯誤格式

❌ **日期格式不統一**
- 有些用 ISO 8601，有些用其他格式

### Gherkin Feature 常見問題

❌ **Scenarios 太少**
- 只有 Happy Path，缺少錯誤處理場景

❌ **描述過於技術**
- 使用技術術語而非業務語言（"當 JWT token 過期" vs "當我的登入過期"）

❌ **Given-When-Then 不清晰**
- 步驟混亂，不遵循 BDD 模式

❌ **與實際行為不符**
- 文件說回傳 200，實際代碼回傳 201

---

## ✅ Review 通過標準

一個 PR 的契約文件可以通過 Review 需要滿足：

### 必要條件（Must Have）

1. ✅ **完整性**: 所有相關的契約文件都已更新
2. ✅ **準確性**: 文件內容與代碼變更一致
3. ✅ **一致性**: 遵循既定的命名規範和格式
4. ✅ **可讀性**: 文件清晰易懂，有足夠的範例

### 加分項（Nice to Have）

1. ➕ **範例豐富**: 提供多個使用場景範例
2. ➕ **視覺化**: 包含圖表、表格幫助理解
3. ➕ **交叉引用**: 文件間互相連結，方便導覽
4. ➕ **變更日誌**: 記錄重要變更和版本

---

## 🔄 Review 流程建議

### Step 1: 快速掃描（2 分鐘）
- 檢查 PR template 是否填寫
- 識別變更類型（Database/API/Feature）
- 確認相關文件是否包含在 PR 中

### Step 2: 代碼審查（10-15 分鐘）
- 審查實際代碼變更
- 理解新功能或修改的行為
- 記錄需要在契約文件中反映的項目

### Step 3: 文件審查（5-10 分鐘）
- 逐一檢查本指南中的檢查項目
- 對照代碼驗證文件準確性
- 檢查格式和可讀性

### Step 4: 手動驗證（5 分鐘，可選）
- 啟動 backend，測試實際 API
- 訪問 Swagger UI 檢查文件
- 驗證 Response 格式與文件一致

### Step 5: 提供反饋
- 如果發現問題，明確指出需要補充的內容
- 提供具體的改進建議
- 如果一切正常，Approve PR

---

## 📝 Review Comment 範例

### 良好的 Comment 範例

✅ **具體且有建設性**:
```
請更新 `docs/contracts/database-schema.md`，新增 `BookClubMember` 的 `role` 欄位說明。

建議格式：
| role | String(20) | Not Null, Default: 'member' | 成員角色：owner/admin/member |
```

✅ **提供參考**:
```
`data-contract.md` 中缺少新端點 POST /api/book-clubs 的 Response 格式範例。
可以參考 POST /api/users/register 的格式。
```

### 不良的 Comment 範例

❌ **模糊不清**:
```
契約文件好像沒更新？
```

❌ **沒有提供指引**:
```
文件不對。
```

---

## 🆘 常見問題 FAQ

### Q: 如果開發者忘記更新契約文件怎麼辦？

**A**: 
1. Request Changes 並明確指出需要更新的文件
2. 提供具體的檢查清單和範例
3. 如果是小改動，可以建議開發者直接在 PR 中追加 commit
4. 對於大改動，建議開發者先更新文件再重新提交

### Q: 如何判斷變更是否需要更新契約文件？

**A**: 
遵循以下原則：
- 如果變更影響 Database Schema → 更新 `database-schema.md`
- 如果變更影響 API Request/Response → 更新 `data-contract.md`
- 如果變更影響功能行為 → 更新 Gherkin Feature
- 如果不確定，詢問開發者或在 Review 中討論

### Q: 契約文件可以晚點補充嗎？

**A**: 
**不建議**。契約文件應該與代碼變更同步提交，原因：
- 避免文件債務累積
- 確保文件在 merge 時已是最新狀態
- 方便其他團隊成員（如前端）立即使用新的契約

特殊情況下（如緊急修復），可以建立 follow-up issue 補充文件。

### Q: 如果文件與代碼不一致，應該相信哪一個？

**A**: 
**相信代碼**。契約文件是代碼的反映，不是代碼的定義。
- 如果發現不一致，要求開發者修正文件使其與代碼一致
- 如果代碼行為不符合需求，那是代碼問題，應修正代碼

---

## 📚 相關資源

- [Maintenance Workflow](maintenance-workflow.md) - 契約文件維護流程
- [Data Contract](data-contract.md) - 資料格式規範
- [Database Schema](database-schema.md) - 資料庫結構文件
- [Gherkin Writing Guide](gherkin/README.md) - Gherkin 撰寫指南

---

**版本**: 1.0  
**維護者**: Architect Winston  
**最後審查**: 2025-10-22
