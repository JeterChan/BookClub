# 合約文件維護指南

目的：說明如何在專案中維護契約（contracts）文件，包括 Gherkin 規格、Data Contract、Database Schema 與 OpenAPI snapshots。

目錄結構（主要關注）
- `docs/contracts/data-contract.md` — API 格式與回應規範
- `docs/contracts/database-schema.md` — DB schema 與 ERD
- `docs/contracts/api-access-guide.md` — 如何取得 OpenAPI / Swagger
- `docs/contracts/gherkin/` — BDD 規格（按 Epic 分類）
- `docs/contracts/PR_CONTRACT_CHECKLIST.md` — PR 檢查清單

基本流程（當你要變更 API 或資料模型時）
1. 在開發分支上實作功能變更與測試
2. 更新或新增對應的 Gherkin feature（若為新行為或行為修正）
3. 若有 schema 變更，新增 alembic migration 並更新 `database-schema.md`
4. 若 API schema 有變更，更新 OpenAPI snapshot（`/openapi.json`）並將 snapshot 附上 PR，或說明如何在本地生成
5. 更新 `data-contract.md`（若有回應結構變更）
6. 在 PR 描述中引用 `PR_CONTRACT_CHECKLIST.md` 的關鍵項並勾選

CI 與自動化建議
- 建議建立一個 CI job：
  - 生成當前分支的 OpenAPI JSON
  - 對比 main/master 的 OpenAPI snapshot
  - 若差異存在，失敗或在 PR 中列出差異，要求開發者確認
- 可建立一個簡單的腳本 `scripts/check-openapi-diff.sh` 來做比較（示例在下方）

簡單 openapi 比較範例（本腳本示例請在 CI 或本機執行）:
```bash
# 1. 啟動本地後端（或以環境變數 point 到測試環境）
# 2. curl -s http://localhost:3001/openapi.json > /tmp/openapi-current.json
# 3. git show origin/master:openapi.json > /tmp/openapi-master.json
# 4. diff /tmp/openapi-master.json /tmp/openapi-current.json || echo "OpenAPI changed"
```

維護責任
- 建議由每個改動 API 的 PR 作者負責更新相關合約文件。
- 定期審查（例如每個 Sprint 結束）合約文件一致性。

常見問題
- Q: 如果只是內部實作優化但 API 不變？
  - A: 若 API schema、狀態碼、回應欄位沒有變化，通常只需在 PR 中註明；不需要更新 contract 文件。

結語
-- 維護合約文件能顯著降低跨團隊溝通錯誤，請把合約檢查列為 PR 必做項目。
