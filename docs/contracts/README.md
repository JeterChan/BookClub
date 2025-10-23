# Contract Documentation System

**線上讀書會平台 - 開發契約文件體系**

本目錄包含專案的所有契約文件，作為開發、測試和驗收的單一事實來源。

---

## 📚 文件導覽

### 核心契約文件

| 文件 | 用途 | 擁有者 | 更新時機 |
|------|------|--------|----------|
| [Database Schema](database-schema.md) | 資料庫結構、Models、ERD | Architect | Model 變更或 Migration 時 |
| [API Access Guide](api-access-guide.md) | 如何訪問 FastAPI 自動生成的 API 文件 | Backend Dev | API 架構變更時 |
| [Data Contract](data-contract.md) | 前後端資料格式、命名規範 | Architect | 新增資料格式約定時 |
| [Gherkin Features](gherkin/) | BDD 驗收標準（Given-When-Then） | PM | 每個 Story 開始前 |

### 流程和指南

| 文件 | 用途 |
|------|------|
| [Maintenance Workflow](maintenance-workflow.md) | 契約文件維護流程和 PR Checklist |
| [Review Guide](review-guide.md) | PR 審查時如何檢查契約文件 |
| [Audit Checklist](audit-checklist.md) | Epic 結束時的文件同步檢查 |
| [Collaboration Guide](collaboration-guide.md) | 不同角色如何使用契約文件 |

---

## 🎯 快速開始

### 我是 Frontend Developer
1. 查看 [API Access Guide](api-access-guide.md) 了解如何訪問 API 文件
2. 查看 [Data Contract](data-contract.md) 了解資料格式約定
3. 使用 `npx openapi-typescript http://localhost:3001/openapi.json -o src/types/api.ts` 生成 TypeScript types

### 我是 Backend Developer
1. 查看 [Database Schema](database-schema.md) 了解資料結構
2. 開發新功能時，確保更新相關契約文件
3. PR 提交前檢查 [Maintenance Workflow](maintenance-workflow.md) 的 Checklist

### 我是 Product Manager
1. 查看 [Gherkin README](gherkin/README.md) 了解如何撰寫 Feature 文件
2. 每個新 Story 開始前撰寫 Gherkin Feature 文件
3. 使用 [template.feature](gherkin/template.feature) 作為起點

### 我是 Architect
1. 負責維護 [Database Schema](database-schema.md)
2. Model 變更時同步更新 ERD 和文件
3. 定期審計契約文件與實作的一致性

### 我是 QA
1. 參考 [Gherkin Features](gherkin/) 了解驗收標準
2. 參考 [Data Contract](data-contract.md) 設計測試案例
3. 協助驗證契約文件與實作的一致性

---

## 📋 契約文件原則

### 代碼先行 (Code-First)
- 先開發功能，然後更新契約文件
- 契約文件反映真實實作，不是提前設計
- PR 必須包含相關契約文件的更新

### 單一事實來源
- Database Schema = 資料結構的唯一參考
- FastAPI OpenAPI = API 契約的唯一參考
- Gherkin Features = 驗收標準的唯一參考
- Data Contract = 資料格式的唯一參考

### 團隊協作
- 每個契約文件都有明確的擁有者
- 所有人都可以參考和提出改進建議
- 透過 PR 流程確保文件品質

---

## 🔗 相關資源

- [主 PRD](../prd.md) - 產品功能和路線圖
- [Contract Documentation PRD](contract-documentation-prd.md) - 契約文件體系的完整規格
- [Architecture Documentation](../architecture/) - 系統架構文件
- [API Endpoints Reference](../api-endpoints.md) - API 端點快速參考

---

**建立日期**: 2025-10-22  
**最後更新**: 2025-10-22 (Story 1.1 完成)  
**狀態**: ✅ 基礎設施已建立 - 各契約文件將在後續 Stories 中完成
