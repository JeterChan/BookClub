# 合約文件變更檢查清單

此檢查清單供 PR 作者與 Reviewer 使用，確保所有與合約（契約）相關的變更都有適當的文件、測試與回退計畫。

作者事項（提交前）
- [ ] 有無修改 API 行為？若有：更新 `docs/contracts/data-contract.md` 並在 PR 中說明改動差異
- [ ] 有無新增或修改 OpenAPI schema？若有：附上 openapi snapshot 或說明如何產生
- [ ] 是否新增或更新 Gherkin feature（`docs/contracts/gherkin`）來覆蓋主要成功及錯誤路徑
- [ ] 若有資料庫變更：
  - [ ] 包含 migration script 或 alembic 指令
  - [ ] 更新 `docs/contracts/database-schema.md`（必要時）
- [ ] 是否檢查 response 格式（camelCase, ISO 8601, no sensitive fields）
- [ ] 是否在 PR 描述寫明向下相容性影響與遷移步驟
- [ ] 是否包含/更新相應的自動化測試（unit/integration）或列出手動驗證步驟

Reviewer 指引
- [ ] API contract：檢查路徑、方法、狀態碼、回應結構是否符合 data-contract
- [ ] 權限與安全：檢查 auth、token、OAuth 流程、rate-limiting 與錯誤處理
- [ ] 效能與 DB：若為查詢變更，檢查是否有非必要的 N+1 或缺少索引
- [ ] 檔案上傳：檢查檔案大小/格式限制與儲存位置（uploads/）
- [ ] 測試：確認測試是否足夠覆蓋主要路徑
- [ ] 文檔：檢查 docs/contracts 與 api-endpoints.md 是否同步
- [ ] 回退計畫：如果此 PR 有破壞性更改，請要求提交回退步驟

快速驗證清單（Reviewer 可複製到 PR review comment）
```
- Confirmed API path/method/status codes against data-contract
- Confirmed JSON response keys use camelCase and no sensitive fields leaked
- Confirmed OpenAPI snapshot updated if schema changed
- Confirmed migrations and DB schema updates included if needed
- Confirmed tests added/updated or manual test steps provided
```

附註
- 此檢查清單可在團隊流程中做為 PR 模板的補充。若需要，可整合到 CI 作業中，在 PR 開啟時自動檢查 OpenAPI snapshot 差異。
