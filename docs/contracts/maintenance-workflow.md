# 契約文件維護流程 (Maintenance Workflow)

**版本**: 1.0  
**最後更新**: 2025-10-22  
**擁有者**: Architect Winston

---

## 📋 概述

本文件定義契約文件的維護流程，確保所有契約文件與代碼保持同步，並為團隊提供清晰的更新指引。

---

## 🔄 維護策略：代碼先行 (Code-First)

### 核心原則

我們採用 **代碼先行** 策略：

1. **先開發功能** - 完成代碼實作和測試
2. **後更新契約** - PR 提交前更新相關契約文件
3. **同步提交** - 代碼和契約文件在同一個 PR 中提交
4. **定期審計** - Epic 結束時審查文件同步性

### 為什麼選擇代碼先行？

- ✅ 避免文件成為開發瓶頸
- ✅ 契約文件反映真實實作
- ✅ 減少"文件說一套、代碼做一套"的問題
- ✅ 符合 Agile 精神

---

## 📝 契約文件更新時機

### Database Schema 更新時機

**觸發條件**:
- 新增或修改 SQLModel Model
- 執行 Alembic migration
- 變更 Table 結構或關聯

**需要更新**:
- \`docs/contracts/database-schema.md\`
- ERD 圖表（使用 Mermaid）
- Migration 版本對應表

**責任人**: Architect

---

### API Contract 更新時機

**觸發條件**:
- 新增或修改 API 端點
- 變更 Request/Response Schema
- 修改 API 行為或驗證規則

**需要更新**:
- FastAPI 自動生成（無需手動更新）
- 如有重大變更，在 commit message 中說明

**責任人**: Backend Developer

---

### Data Contract 更新時機

**觸發條件**:
- 新增資料格式約定
- 變更命名規範
- 新增通用的資料型別定義

**需要更新**:
- \`docs/contracts/data-contract.md\`

**責任人**: Architect

---

### Gherkin Features 更新時機

**觸發條件**:
- 開始新的 User Story 開發
- 修改現有功能的驗收標準

**需要更新**:
- \`docs/contracts/gherkin/epic-{n}/{story-id}.feature\`

**責任人**: Product Manager

---

**建立日期**: 2025-10-22  
**維護者**: Architect Winston  
**版本**: 1.0
