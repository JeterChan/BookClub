# Contract Documentation System PRD

**專案**: 線上讀書會平台 - 契約文件體系建立  
**版本**: 1.0  
**日期**: 2025-10-22  
**負責人**: John (PM)

---

## 1. Goals and Background Context

### Goals

基於開發團隊的需求和專案現況，本 PRD 旨在建立完整的契約文件體系，具體目標包括：

1. **建立完整的契約文件體系** - 為開發團隊提供明確的 Database Schema、API Contract 和測試規範
2. **改善開發規範和協作** - 透過標準化的契約文件減少誤解，提高前後端協作效率
3. **實現契約驅動開發 (Contract-Driven Development)** - 讓契約成為開發、測試和驗收的單一事實來源
4. **更新過時的 API 規格** - 重新建立與當前實作同步的 OpenAPI 規格文件
5. **引入 BDD 驗收標準** - 使用 Gherkin 格式的 Given-When-Then 讓非技術人員也能理解驗收條件

### Background Context

線上讀書會平台目前已經完成 Epic 1 的主要功能開發，包含用戶註冊、登入、個人檔案管理、興趣標籤和個人儀表板等功能。然而，在開發過程中我們發現了重要的文件缺口：

現有的 `api-spec.yaml` 文件建立於專案早期（Epic 1 規劃階段），內容與當前實際實作已經產生嚴重偏差。後端 API 已經演進出新的端點（如 Dashboard API、Interest Tags API、Google 帳號綁定等），但缺乏統一的契約文件來記錄這些變更。此外，雖然我們使用 SQLModel 在程式碼中定義了資料庫模型，但缺少獨立的 Schema 文件供團隊成員快速參考。測試方面，雖然有完整的單元和整合測試，但沒有以 BDD Gherkin 格式記錄的驗收標準，這讓非技術利害關係人難以理解和驗證功能需求。

這個 PRD 的目的是正式定義契約文件系統的規格和實作計畫，確保未來的開發過程能夠遵循契約驅動的最佳實踐。

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-22 | 1.0 | Initial PRD - Complete contract documentation system specification | PM John |

---

## 2. Requirements

### Functional Requirements

**FR1: 建立契約文件目錄結構**
- 在 `docs/contracts/` 下建立標準化的目錄結構
- 包含 database-schema、data-contract、gherkin、api-access-guide 等子目錄和文件
- 提供 README.md 作為契約文件的導覽和使用指南

**FR2: Database Schema 文件系統**
- 建立 `database-schema.md` 記錄所有資料表、欄位、關聯和約束
- 包含 ERD (Entity Relationship Diagram) 視覺化呈現
- 文件由 Architect 擁有和維護，Backend Dev 開發時參考使用
- 每次 Model 變更或 Alembic migration 時需要同步更新

**FR3: API Contract Access Guide**
- 撰寫 `api-access-guide.md` 說明如何訪問 FastAPI 自動生成的 API 文件
- 記錄開發和生產環境的 Swagger UI、ReDoc、OpenAPI JSON 端點
- 提供前端開發者如何生成 TypeScript types 的指引
- 說明如何匯入 OpenAPI spec 到 Postman 或其他 API 測試工具

**FR4: 刪除過時的 API Spec 文件**
- 刪除 `docs/api-spec.yaml`（已與實際代碼嚴重不同步）
- 更新 `docs/api-endpoints.md` 移除對 api-spec.yaml 的引用
- 在相關文件中說明新的 API 文件訪問方式（使用 FastAPI 自動生成）

**FR5: Data Contract 規範文件**
- 建立 `data-contract.md` 定義前後端資料格式約定
- 記錄命名規範（camelCase vs snake_case 轉換規則）
- 定義標準的 API Response 結構格式
- 記錄日期時間格式、分頁格式、錯誤回應格式等通用規範

**FR6: Gherkin BDD 規範文件系統**
- 建立 `gherkin/` 目錄結構，按 Epic 分類 Feature 文件
- 撰寫 `gherkin/README.md` 說明 Gherkin 撰寫指南和最佳實踐
- 提供 Feature 文件模板和範例
- 文件由 PM 主要負責撰寫，作為 Story 驗收標準的正式文件
- Gherkin 文件為純文件格式，不強制自動化執行

**FR7: 契約文件維護 Workflow**
- 建立 PR Checklist Template 包含契約文件更新檢查項
- 定義契約文件更新時機和責任歸屬
- 提供契約文件審查指南（PR Review 時如何檢查）
- 建立定期審計機制（Epic 結束時檢查文件同步性）

**FR8: 為現有 Epic 1 功能補充契約文件**
- 為 Epic 1 已完成的功能撰寫 Gherkin Feature 文件
- 記錄當前 Database Schema（User, InterestTag, BookClub 等 Models）
- 記錄當前的 Data Contract（camelCase 別名、Response 格式等）
- 建立完整的契約文件基線作為後續開發參考

**FR9: (可選) CI/CD OpenAPI 快照保存**
- 設定 GitHub Actions workflow 在每次部署時保存 OpenAPI JSON 快照
- 快照保存在 `docs/contracts/generated/openapi-{version}.json`
- 使用 Git tags 標記穩定的 API 版本（如 v1.0-api, v1.1-api）
- 前端可依賴特定版本的 OpenAPI 快照進行開發

### Non-Functional Requirements

**NFR1: 契約文件可讀性**
- 所有契約文件使用 Markdown 格式（除 Gherkin 使用 .feature）
- 使用清晰的標題層級、表格、程式碼區塊和範例
- 包含目錄和交叉引用，方便快速導覽
- 適合技術和非技術人員閱讀

**NFR2: 維護成本控制**
- 採用代碼先行策略，減少文件維護負擔
- 利用工具自動生成（FastAPI OpenAPI、ERD 圖表工具）
- 契約文件更新應該是開發流程的自然一部分，不是額外負擔
- 每個文件都有明確的擁有者，避免責任不清

**NFR3: 版本控制和追溯性**
- 所有契約文件納入 Git 版本控制
- 重要變更在 Change Log 中記錄
- Database Schema 變更與 Alembic migration 版本對應
- API 契約版本與產品 Epic/Release 版本對應

**NFR4: 團隊協作友善**
- 文件結構清晰，新成員容易上手
- 提供充足的範例和模板
- 支援多角色協作（PM、Architect、Dev、QA）
- 文件位置和命名規範一致且直觀

**NFR5: 未來擴展性**
- 文件結構支援未來引入自動化驗證工具（如 Schemathesis）
- Gherkin 文件格式支援未來轉換為自動化測試（pytest-bdd）
- 預留空間記錄 Epic 2+ 的新功能契約
- 支援未來可能的微服務拆分（多 API 契約共存）

---

## 3. Technical Assumptions

### Repository Structure: **Monorepo**

當前專案採用 Monorepo 結構：
```
/SE_Test_Project/
├── backend/        # FastAPI + SQLModel + PostgreSQL
├── frontend/       # React + TypeScript + Vite
├── docs/           # 所有文件（包含新的 contracts/）
└── web-bundles/    # BMAD agents
```

**決策理由：**
- 前後端代碼共存，便於契約文件統一管理
- 所有契約文件集中在 `docs/contracts/` 下
- 支援 atomic commits（代碼 + 文件同步更新）

---

### Service Architecture: **Monolithic API (FastAPI) with Separate Frontend**

**後端：**
- FastAPI 單體應用
- SQLModel ORM + PostgreSQL 資料庫
- Alembic 管理 database migrations
- 自動生成 OpenAPI documentation

**前端：**
- React + TypeScript + Vite
- 獨立部署（與後端分離）
- 透過 REST API 與後端通訊

**契約文件影響：**
- 單一 OpenAPI spec（從 FastAPI 自動生成）
- 單一 Database Schema 文件（涵蓋所有 SQLModel models）
- 前後端透過明確的 Data Contract 協作

---

### Testing Requirements: **Unit + Integration Testing (Pytest)**

**當前測試架構：**
```
backend/tests/
├── unit/              # 單元測試（services, models）
├── integration/       # API 整合測試（endpoints）
└── conftest.py        # 測試 fixtures
```

**契約文件測試策略：**
- **Gherkin Features**: 純文件，不強制自動化
  - 作為測試設計基礎和驗收標準
  - PM 撰寫，Dev/QA 參考執行手動或自動化測試
  
- **API Contract Testing**: 透過 Pytest integration tests
  - 測試驗證實際 API 符合預期行為
  - 間接驗證 FastAPI 生成的 OpenAPI spec 正確性
  
- **Database Schema Testing**: 透過 Alembic + Model tests
  - Migration 測試確保 schema 變更正確
  - Model tests 驗證關聯和約束

**未來可選：**
- pytest-bdd: 將 Gherkin 連接到自動化測試
- Schemathesis: 基於 OpenAPI spec 的 API contract testing

---

### Additional Technical Assumptions and Requirements

**TA1: 文件格式標準**
- 契約文件主要使用 **Markdown** (.md)
- Gherkin 使用標準 **.feature** 格式
- OpenAPI 為 **JSON** 格式（FastAPI 生成）
- ERD 圖表使用 **Mermaid** 或 **PlantUML** 嵌入 Markdown

**TA2: 版本控制策略**
- 所有契約文件納入 Git 版本控制
- Database Schema 變更與 Alembic migration 版本號對應
- API 契約版本與 Epic/Release 版本對應（如 Epic 1 完成 = v1.0）
- 使用 Git tags 標記穩定的契約版本

**TA3: 文件生成工具**
- **FastAPI**: 自動生成 OpenAPI spec (`/openapi.json`)
- **Mermaid/PlantUML**: 生成 ERD 和架構圖
- **openapi-typescript**: 前端生成 TypeScript types
- **(可選) SQLAlchemy Schema Display**: 自動從 Models 生成 Schema 文件

**TA4: 開發工具和環境**
- Swagger UI 用於 API 測試和探索 (`/docs`)
- ReDoc 用於更優雅的 API 文件呈現 (`/redoc`)
- VS Code 作為主要編輯器（支援 Markdown、Gherkin 語法高亮）
- Postman/Insomnia 用於 API 測試（可匯入 OpenAPI spec）

**TA5: 命名規範和約定**
- **後端 (Python)**: snake_case（SQLModel fields, function names）
- **前端 (TypeScript)**: camelCase（variables, functions）
- **API Response**: camelCase（使用 Pydantic `by_alias=True`）
- **Database**: snake_case（table names, column names）
- **Gherkin**: 使用自然語言，中文或英文一致性

**TA6: 文件維護 Workflow**
- **代碼先行**: 功能開發完成後更新契約文件
- **PR 必須包含**: 代碼變更 + 相關契約文件更新
- **PR Checklist**: 包含"契約文件已更新"檢查項
- **定期審計**: 每個 Epic 結束時審查文件與代碼同步性

**TA7: CI/CD 整合**
- GitHub Actions 作為 CI/CD 平台
- **(可選)** CI pipeline 保存 OpenAPI JSON 快照
- **(可選)** CI 驗證 Markdown 文件格式和連結有效性
- **(可選)** CI 執行 Alembic check 確保 migration 完整性

**TA8: 部署環境**
- **開發環境**: Docker Compose (localhost:3001)
- **生產環境**: Railway.app 或類似平台
- 兩個環境都提供可訪問的 Swagger UI 和 OpenAPI JSON

**TA9: 角色和權限**
- **Architect**: 擁有 Database Schema 文件
- **Backend Dev**: 更新代碼時同步更新契約文件
- **PM**: 擁有 Gherkin Features 和驗收標準
- **Frontend Dev**: 消費者角色，使用契約文件進行開發
- **QA**: 參考 Gherkin 和 Data Contract 執行測試

---

## 4. Epic List

### Epic 1: Contract Documentation Foundation & Epic 1 Baseline

**Goal:** 建立完整的契約文件體系並為已完成的 Epic 1 功能補充契約文件基線，使團隊能夠採用契約驅動開發方法進行後續 Epic 開發。確保開發者、PM、Architect 都有清晰的契約文件可參考，減少誤解和重工，提高協作效率。

**Deliverables:**
- ✅ 完整的 `docs/contracts/` 目錄結構
- ✅ Database Schema 文件（含 ERD）
- ✅ API Access Guide（取代過時的 api-spec.yaml）
- ✅ Data Contract 規範文件
- ✅ Epic 1 所有 Stories 的 Gherkin Feature 文件
- ✅ 契約文件維護 Workflow 和 PR Template
- ✅ 團隊協作指南

**Value Proposition:**
- 開發者有明確的 API 和 Database 契約可參考
- PM/PO 可以用 Gherkin 清晰定義驗收標準
- 前端團隊可以基於契約並行開發，減少等待時間
- 新成員快速了解系統架構和資料結構
- 為 Epic 2+ 建立契約驅動開發的基礎

---

## 5. Epic 1 - Contract Documentation Foundation & Epic 1 Baseline

### Story 1.1: 建立契約文件目錄結構和導覽文件

**As a** 開發團隊成員  
**I want** 有一個清晰組織的契約文件目錄結構  
**So that** 我可以快速找到所需的契約文件並了解如何使用它們

#### Acceptance Criteria

1. **目錄結構已建立**: 在 `docs/contracts/` 下建立以下結構：
   ```
   docs/contracts/
   ├── README.md                    # 契約文件導覽
   ├── database-schema.md           # 資料庫 Schema（待後續 Story 填充）
   ├── data-contract.md             # 資料格式規範（待後續 Story 填充）
   ├── api-access-guide.md          # API 文件訪問指南（待後續 Story 填充）
   ├── maintenance-workflow.md      # 契約文件維護流程
   └── gherkin/
       ├── README.md                # Gherkin 撰寫指南
       ├── template.feature         # Feature 文件模板
       └── epic-1/                  # Epic 1 features（待後續 Story 填充）
   ```

2. **README.md 包含完整導覽**: 說明每個契約文件的用途、擁有者、更新時機
   - 清楚列出 Database Schema、API Contract、Data Contract、Gherkin 的位置
   - 說明各文件的目標讀者（Dev/PM/Architect/QA/Frontend）
   - 提供快速連結到各個契約文件

3. **維護流程文件已建立**: `maintenance-workflow.md` 包含：
   - 契約文件更新時機（何時需要更新哪些文件）
   - 角色和責任（誰負責維護哪些文件）
   - PR Checklist（包含契約文件檢查項）
   - 定期審計流程（Epic 結束時的文件同步檢查）

4. **Gherkin 指南已建立**: `gherkin/README.md` 包含：
   - Gherkin 語法基礎介紹
   - Given-When-Then 撰寫最佳實踐
   - Feature 文件命名規範（如 `1.1-user-registration.feature`）
   - 範例 Scenario 展示

5. **模板文件已提供**: `gherkin/template.feature` 提供可複製的 Feature 模板

---

### Story 1.2: 撰寫 Database Schema 契約文件

**As an** Architect  
**I want** 完整記錄當前的資料庫 Schema  
**So that** 開發者可以理解資料結構，設計新功能時知道如何擴展資料模型

#### Acceptance Criteria

1. **所有 Epic 1 Models 已記錄**: `database-schema.md` 包含以下 Models 的完整定義：
   - User（用戶）
   - InterestTag（興趣標籤）
   - UserInterestTag（用戶-標籤關聯表）
   - BookClub（讀書會 - 基礎結構，Epic 2 擴展）
   - BookClubMember（讀書會成員 - 基礎結構）
   - Discussion (討論 - 基礎結構)
   - Notification（通知 - 基礎結構）

2. **每個 Model 包含詳細資訊**:
   - Table 名稱
   - 所有欄位（名稱、型別、約束、預設值、說明）
   - Primary Key 和 Foreign Keys
   - Indexes
   - Relationships（與其他 Models 的關聯）
   - 範例資料（可選，幫助理解）

3. **ERD 圖表已包含**: 使用 Mermaid 或 PlantUML 建立視覺化的 Entity Relationship Diagram
   - 顯示所有 Tables 和關聯
   - 標示 Primary Keys、Foreign Keys
   - 標示關聯類型（1-to-1, 1-to-many, many-to-many）

4. **與 Alembic Migrations 對應**: 記錄當前的 Schema 版本對應的 Alembic migration ID

5. **命名規範已記錄**: 說明 Table 和 Column 命名規範（snake_case）

---

### Story 1.3: 建立 API Access Guide 並清理過時的 API Spec

**As a** Frontend Developer  
**I want** 清晰的指引告訴我如何訪問和使用 API 文件  
**So that** 我可以快速查看 API 規格並生成 TypeScript types

#### Acceptance Criteria

1. **API Access Guide 已建立**: `api-access-guide.md` 包含：
   - 說明 FastAPI 自動生成 OpenAPI 的優勢
   - 開發環境的 Swagger UI、ReDoc、OpenAPI JSON 端點
   - 生產環境的 API 文件訪問方式
   - 如何使用 openapi-typescript 生成前端 types
   - 如何將 OpenAPI spec 匯入 Postman/Insomnia

2. **過時的 api-spec.yaml 已刪除**: `docs/api-spec.yaml` 文件已移除

3. **api-endpoints.md 已更新**: 移除對 api-spec.yaml 的引用，改為指向 API Access Guide
   - 更新"開發工具"部分的說明
   - 指引開發者使用 FastAPI Swagger UI 而非 swagger-ui-serve

4. **實際操作範例已提供**:
   - curl 命令範例（從 /openapi.json 下載 spec）
   - npx openapi-typescript 完整命令
   - Postman 匯入步驟截圖或詳細說明

5. **版本化策略已說明**: 文件中說明如何使用 Git tags 標記穩定的 API 版本（如 v1.0-api）

---

### Story 1.4: 撰寫 Data Contract 規範文件

**As a** Frontend Developer  
**I want** 明確的前後端資料格式約定  
**So that** 我知道如何處理 API 回應中的欄位名稱和資料格式

#### Acceptance Criteria

1. **命名規範已定義**: `data-contract.md` 包含：
   - 後端 Python 使用 snake_case
   - 前端 TypeScript 使用 camelCase
   - API Response 使用 camelCase（透過 Pydantic `alias`）
   - Database 使用 snake_case
   - 轉換範例（created_at → createdAt）

2. **標準 Response 格式已定義**:
   - 成功回應格式（包含 data、metadata 等欄位）
   - 錯誤回應格式（包含 error code、message、details）
   - 分頁回應格式（包含 items、pagination metadata）
   - 範例 JSON 展示

3. **資料型別規範已記錄**:
   - 日期時間格式（ISO 8601, UTC）
   - 布林值（true/false，非 1/0）
   - null vs undefined 處理
   - ID 型別（integer, UUID, 或其他）

4. **特殊欄位約定已說明**:
   - 時間戳欄位（createdAt, updatedAt）
   - 軟刪除欄位（deletedAt, isDeleted）
   - 審計欄位（createdBy, updatedBy）

5. **範例對照表已提供**: 展示後端 Model、Database Schema、API Response 的對應關係

---

### Story 1.5: 為 Epic 1 功能撰寫 Gherkin Feature 文件

**As a** Product Manager  
**I want** 為所有 Epic 1 已完成的功能撰寫 Gherkin Feature 文件  
**So that** 我們有正式的驗收標準記錄，並為未來 Epics 建立 Gherkin 撰寫範例

#### Acceptance Criteria

1. **Story 1.1 Feature 已撰寫**: `gherkin/epic-1/1.1-user-registration.feature`
   - 包含成功註冊的 Scenario
   - 包含 Email 已存在的錯誤 Scenario
   - 包含密碼格式驗證的 Scenario
   - 包含必填欄位驗證的 Scenario

2. **Story 1.2 Feature 已撰寫**: `gherkin/epic-1/1.2-user-login.feature`
   - 包含成功登入的 Scenario
   - 包含錯誤密碼的 Scenario
   - 包含帳號鎖定的 Scenario（多次失敗）
   - 包含 Token 刷新的 Scenario

3. **Story 1.3 Feature 已撰寫**: `gherkin/epic-1/1.3-google-oauth.feature`
   - 包含首次 Google 登入建立帳號的 Scenario
   - 包含已有帳號的 Google 登入 Scenario
   - 包含綁定 Google 帳號的 Scenario
   - 包含解除綁定的 Scenario

4. **Story 1.4 Feature 已撰寫**: `gherkin/epic-1/1.4-profile-management.feature`
   - 包含查看個人檔案的 Scenario
   - 包含更新顯示名稱和簡介的 Scenario
   - 包含上傳頭像的 Scenario
   - 包含管理興趣標籤的 Scenario

5. **Story 1.5 Feature 已撰寫**: `gherkin/epic-1/1.5-dashboard.feature`
   - 包含查看個人儀表板的 Scenario
   - 包含驗證 camelCase 格式的 Scenario
   - 包含 Epic 1 階段空資料的 Scenario

6. **所有 Features 使用一致的風格**: 
   - 使用中文或英文保持一致
   - 遵循 Gherkin 最佳實踐（清晰的 Given-When-Then）
   - 包含 Feature 描述說明使用者價值

---

### Story 1.6: 建立契約文件維護工具和 PR Template

**As a** Development Team  
**I want** PR Template 和 Checklist 工具  
**So that** 我在提交代碼時不會忘記更新相關的契約文件

#### Acceptance Criteria

1. **PR Template 已建立**: `.github/pull_request_template.md` 包含契約文件檢查項：
   ```markdown
   ## Contract Documentation Checklist
   - [ ] Database Schema 是否需要更新？（如有 Model 變更）
   - [ ] Data Contract 是否需要更新？（如有新的資料格式約定）
   - [ ] Gherkin Feature 是否需要更新/新增？（如有功能變更）
   - [ ] API 行為變更是否記錄在 Commit message？
   ```

2. **契約文件審查指南已建立**: `docs/contracts/review-guide.md` 包含：
   - PR Reviewer 如何檢查契約文件是否完整
   - 常見遺漏項目的檢查清單
   - 契約文件品質標準（清晰、完整、準確）

3. **定期審計 Checklist 已建立**: `docs/contracts/audit-checklist.md` 包含：
   - Epic 結束時的契約文件同步檢查項目
   - Database Schema 與 Alembic migrations 一致性檢查
   - Gherkin Features 與實際功能對應檢查
   - Data Contract 與 API 實作一致性檢查

4. **團隊協作指南已建立**: `docs/contracts/collaboration-guide.md` 說明：
   - 不同角色（PM/Architect/Dev/QA）如何使用契約文件
   - 契約文件在 Scrum 流程中的位置（Sprint Planning、Review、Retro）
   - 跨團隊協作場景（前後端、Dev-QA）

5. **README 已更新**: 專案根目錄的 README.md 包含契約文件的連結和簡介

---

### Story 1.7 (可選): 設定 CI Workflow 保存 OpenAPI 快照

**As a** Frontend Developer  
**I want** 穩定版本的 OpenAPI spec 快照保存在 repo 中  
**So that** 我可以依賴特定版本的 API 契約進行開發，即使後端正在開發新功能

#### Acceptance Criteria

1. **GitHub Actions Workflow 已建立**: `.github/workflows/save-openapi-snapshot.yml`
   - 在 main branch push 或 tag push 時觸發
   - 啟動 backend API（使用 Docker Compose）
   - 等待健康檢查通過
   - 下載 `/openapi.json` 並保存到 `docs/contracts/generated/`

2. **快照命名規範已定義**: 
   - 使用版本號命名：`openapi-v1.0.json`（對應 Git tag）
   - 或使用日期：`openapi-2025-10-22.json`
   - 或使用 commit hash：`openapi-abc1234.json`

3. **快照保存目錄已建立**: `docs/contracts/generated/.gitkeep`

4. **文件已說明快照用途**: API Access Guide 中說明：
   - 如何使用快照版本進行開發
   - 何時使用 live `/openapi.json` vs 快照版本
   - 快照的更新頻率（每個 Epic 完成時）

5. **Git tags 策略已定義**: 文件說明如何標記穩定的 API 版本（如 `v1.0-api`, `v1.1-api`）

---

## 6. Next Steps

### For Architect

**Objective:** Execute this Contract Documentation PRD to establish the complete contract documentation infrastructure.

**Recommended Approach:**
1. Start with Story 1.1 to create the directory structure and foundational guides
2. Execute Stories 1.2-1.4 in parallel (Database Schema, API Guide, Data Contract)
3. Coordinate with PM for Story 1.5 (Gherkin Features)
4. Complete Story 1.6 to establish maintenance workflow
5. Evaluate Story 1.7 (CI/CD) based on team needs

**Key Deliverables:**
- Complete `docs/contracts/` directory with all documentation
- Updated project references to new contract system
- Team-ready workflow and templates for ongoing maintenance

---

**Document Status**: ✅ Complete - Ready for execution  
**Created**: 2025-10-22  
**Approved by**: PM John
