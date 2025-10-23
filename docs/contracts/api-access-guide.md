# API Access Guide

**版本**: 1.0  
**最後更新**: 2025-10-22  
**擁有者**: Backend Team  
**狀態**: ✅ 已完成（Story 1.3）

---

## 📋 概述

本指南說明如何訪問和使用線上讀書會平台的 API 文件。我們採用 **FastAPI 自動生成 OpenAPI** 的方式，無需手動維護 API spec 文件。

### 為什麼使用 FastAPI 自動生成？

✅ **代碼即文件** - API 定義直接從代碼生成，永遠同步  
✅ **自動更新** - 每次部署自動更新文件  
✅ **互動式測試** - Swagger UI 提供即時測試功能  
✅ **多種格式** - 支援 Swagger UI、ReDoc、OpenAPI JSON  
✅ **零維護成本** - 無需手動更新 YAML 文件

---

## 🌐 訪問 API 文件

### 開發環境 (本地)

確保後端服務已啟動：
```bash
cd backend
docker-compose up -d
```

訪問以下任一端點：

| 文件類型 | URL | 說明 |
|---------|-----|------|
| **Swagger UI** | http://localhost:3001/docs | 互動式 API 文件，可直接測試 |
| **ReDoc** | http://localhost:3001/redoc | 更優雅的文件呈現，適合閱讀 |
| **OpenAPI JSON** | http://localhost:3001/openapi.json | 原始 OpenAPI 規格（JSON 格式） |

### 生產環境

| 文件類型 | URL | 說明 |
|---------|-----|------|
| **Swagger UI** | https://api.bookclub.railway.app/docs | 互動式 API 文件 |
| **ReDoc** | https://api.bookclub.railway.app/redoc | 優雅的文件呈現 |
| **OpenAPI JSON** | https://api.bookclub.railway.app/openapi.json | 原始規格 JSON |

---

## 🛠️ 使用 Swagger UI 測試 API

### 1. 開啟 Swagger UI
訪問 http://localhost:3001/docs

### 2. 認證（如需要）
1. 點擊右上角的 **Authorize** 按鈕
2. 在彈出視窗中輸入 Bearer Token
3. 格式：`Bearer YOUR_ACCESS_TOKEN`
4. 點擊 **Authorize**

### 3. 測試端點
1. 展開想要測試的端點
2. 點擊 **Try it out**
3. 填寫必要參數
4. 點擊 **Execute**
5. 查看回應結果

### 4. 查看 Schema
- 每個端點顯示 Request Body 和 Response 的 Schema
- Schema 自動從 Pydantic Models 生成
- 點擊 Schema 可展開查看詳細欄位定義

---

## 📥 下載 OpenAPI Spec

### 方法 1: 使用 curl

**開發環境**:
```bash
curl http://localhost:3001/openapi.json -o openapi.json
```

**生產環境**:
```bash
curl https://api.bookclub.railway.app/openapi.json -o openapi.json
```

### 方法 2: 使用 wget

```bash
wget http://localhost:3001/openapi.json
```

### 方法 3: 瀏覽器直接下載

1. 訪問 http://localhost:3001/openapi.json
2. 瀏覽器會顯示或下載 JSON 文件
3. 右鍵 → 另存為

---

## 🔄 生成 TypeScript Types

### 安裝 openapi-typescript

```bash
cd frontend
npm install -D openapi-typescript
```

### 生成 Types（開發環境）

**選項 A: 從本地 API 端點生成**（推薦）
```bash
npx openapi-typescript http://localhost:3001/openapi.json --output src/types/api.ts
```

**選項 B: 先下載後生成**
```bash
# 1. 下載 OpenAPI spec
curl http://localhost:3001/openapi.json -o openapi.json

# 2. 從本地文件生成
npx openapi-typescript openapi.json --output src/types/api.ts
```

### 生成 Types（生產環境）

```bash
npx openapi-typescript https://api.bookclub.railway.app/openapi.json --output src/types/api.ts
```

### 使用生成的 Types

```typescript
import type { paths, components } from './types/api';

// 使用端點的請求和回應類型
type RegisterRequest = paths['/api/auth/register']['post']['requestBody']['content']['application/json'];
type RegisterResponse = paths['/api/auth/register']['post']['responses']['200']['content']['application/json'];

// 使用 Schema 定義的類型
type User = components['schemas']['User'];
type BookClub = components['schemas']['BookClub'];

// 實際使用範例
const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### 自動化 Type 生成（推薦）

在 `frontend/package.json` 中添加 script：

```json
{
  "scripts": {
    "generate-types": "openapi-typescript http://localhost:3001/openapi.json --output src/types/api.ts",
    "generate-types:prod": "openapi-typescript https://api.bookclub.railway.app/openapi.json --output src/types/api.ts"
  }
}
```

使用：
```bash
npm run generate-types          # 從本地生成
npm run generate-types:prod     # 從生產環境生成
```

---

## 🧪 匯入 Postman / Insomnia

### Postman

1. **開啟 Postman**
2. 點擊左側 **Import** 按鈕
3. 選擇 **Link** 標籤
4. 輸入 OpenAPI URL：
   - 開發: `http://localhost:3001/openapi.json`
   - 生產: `https://api.bookclub.railway.app/openapi.json`
5. 點擊 **Continue**
6. 選擇匯入選項（建議保持預設）
7. 點擊 **Import**

**匯入後**:
- 所有端點會自動建立
- Request Schema 已預填
- 可以建立 Environment 設定 Base URL 和 Token

### Insomnia

1. **開啟 Insomnia**
2. 點擊左上角 **Create** → **Import from URL**
3. 輸入 OpenAPI URL：
   - 開發: `http://localhost:3001/openapi.json`
   - 生產: `https://api.bookclub.railway.app/openapi.json`
4. 點擊 **Fetch and Import**
5. 選擇匯入位置（新 Workspace 或現有）
6. 點擊 **Import**

---

## 📌 版本化策略

### 使用 Git Tags 標記穩定版本

當 API 達到穩定里程碑時，使用 Git Tag 標記：

```bash
# 標記版本
git tag -a v1.0-api -m "API v1.0 - Epic 1 完成"
git push origin v1.0-api

# 查看所有 API 版本
git tag -l "v*-api"
```

### 保存 OpenAPI Snapshot（可選）

在重要版本發布時，保存 OpenAPI JSON 快照：

```bash
# 建立 snapshots 目錄
mkdir -p docs/api-snapshots

# 保存當前版本
curl http://localhost:3001/openapi.json -o docs/api-snapshots/v1.0-openapi.json

# 提交到 Git
git add docs/api-snapshots/v1.0-openapi.json
git commit -m "docs: Add API v1.0 OpenAPI snapshot"
```

### 版本命名規範

- `v1.0-api` - Epic 1 完成（用戶認證、個人資料）
- `v2.0-api` - Epic 2 完成（讀書會管理）
- `v3.0-api` - Epic 3 完成（討論功能）

---

## 🔍 OpenAPI Schema 說明

### Response Schema 命名規則

FastAPI 自動生成的 Schema 名稱通常為：
- `{ModelName}` - 基礎 Model（如 `User`, `BookClub`）
- `{ModelName}Response` - 包裝後的 Response（如 `UserResponse`）
- `{ModelName}Create` - 創建請求（如 `UserCreate`）
- `{ModelName}Update` - 更新請求（如 `UserUpdate`）

### Pydantic Models 對應

OpenAPI Schema 直接對應 `backend/app/schemas/` 中的 Pydantic Models：

| Python Model | OpenAPI Schema | 說明 |
|--------------|----------------|------|
| `schemas.user.UserCreate` | `UserCreate` | 註冊請求 |
| `schemas.user.User` | `User` | 用戶資料 |
| `schemas.user.UserUpdate` | `UserUpdate` | 更新請求 |
| `schemas.auth.Token` | `Token` | JWT Token |
| `schemas.book_club.BookClub` | `BookClub` | 讀書會資料 |

### 欄位命名轉換

- **Python (Backend)**: `created_at`, `display_name` (snake_case)
- **OpenAPI Schema**: `createdAt`, `displayName` (camelCase)
- **TypeScript (Frontend)**: `createdAt`, `displayName` (camelCase)

轉換由 Pydantic 的 `by_alias=True` 和 `Field(alias="...")` 自動處理。

---

## 🚀 實際操作範例

### 範例 1: 查看註冊端點的 Schema

1. 訪問 http://localhost:3001/docs
2. 找到 **POST /api/auth/register**
3. 展開端點查看：
   - **Request Body**: `UserCreate` Schema
   - **Responses**: `200` 回應使用 `User` Schema

### 範例 2: 測試註冊功能

1. 在 Swagger UI 中展開 **POST /api/auth/register**
2. 點擊 **Try it out**
3. 填寫 Request Body：
```json
{
  "email": "test@example.com",
  "password": "SecurePass123",
  "displayName": "測試用戶"
}
```
4. 點擊 **Execute**
5. 查看 Response（狀態碼、Response Body）

### 範例 3: 生成前端 Types 並使用

```bash
# 1. 生成 Types
cd frontend
npx openapi-typescript http://localhost:3001/openapi.json --output src/types/api.ts

# 2. 在代碼中使用
```

```typescript
// src/services/authService.ts
import type { components } from '../types/api';

type UserCreate = components['schemas']['UserCreate'];
type User = components['schemas']['User'];

export const register = async (data: UserCreate): Promise<User> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};
```

---

## 📚 相關資源

### FastAPI 文件
- [FastAPI OpenAPI 支援](https://fastapi.tiangolo.com/tutorial/metadata/)
- [Swagger UI 自定義](https://fastapi.tiangolo.com/tutorial/metadata/#docs-urls)
- [Pydantic Models](https://docs.pydantic.dev/)

### OpenAPI 工具
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Swagger Editor](https://editor.swagger.io/)

### 內部文件
- [Database Schema](database-schema.md) - 資料庫結構
- [Data Contract](data-contract.md) - 前後端資料格式約定
- [Maintenance Workflow](maintenance-workflow.md) - API 更新流程

---

## 💡 最佳實踐

### 1. 開發時
- ✅ 保持後端服務運行，隨時查看最新 API 文件
- ✅ 在 Swagger UI 中測試端點後再寫前端代碼
- ✅ 定期重新生成 TypeScript types（當後端 API 變更時）

### 2. 部署前
- ✅ 確認 API 文件在生產環境可訪問
- ✅ 生成並檢查 TypeScript types 無錯誤
- ✅ 更新 Postman Collection（如團隊使用）

### 3. 文件維護
- ✅ 後端代碼變更時，Docstrings 同步更新
- ✅ 重要版本發布時，保存 OpenAPI Snapshot
- ✅ PR 中包含 API 變更說明（如有）

### 4. 團隊協作
- ✅ Frontend Dev: 參考 Swagger UI，使用生成的 Types
- ✅ Backend Dev: 確保 Pydantic Models 有清晰的 docstrings
- ✅ QA: 使用 Postman Collection 測試所有端點

---

## 🆘 常見問題

### Q: 為什麼不使用手動維護的 api-spec.yaml？

**A**: 手動維護的問題：
- ❌ 代碼和文件容易不同步
- ❌ 需要額外維護成本
- ❌ 容易出現人為錯誤
- ❌ 每次 API 變更都要更新兩處

FastAPI 自動生成的優勢：
- ✅ 代碼即文件，永遠同步
- ✅ 零維護成本
- ✅ 直接從 Python type hints 生成
- ✅ 互動式測試功能

### Q: 如何知道 API 何時變更？

**A**: 三種方式：
1. **PR 描述** - Backend Dev 在 PR 中說明 API 變更
2. **Git Diff** - 比較 OpenAPI snapshots
3. **重新生成 Types** - 前端重新生成 types，TypeScript 會提示錯誤

### Q: 生成的 TypeScript types 太大怎麼辦？

**A**: 
- `openapi-typescript` 生成的是類型定義，不會增加打包體積
- Types 在編譯時使用，runtime 不包含
- 如果確實太大，可以只匯入需要的類型

### Q: 如何在 CI/CD 中自動生成 Types？

**A**: 在 GitHub Actions 中添加步驟：

```yaml
- name: Generate TypeScript Types
  run: |
    cd frontend
    npm install -D openapi-typescript
    npx openapi-typescript ${{ secrets.API_URL }}/openapi.json --output src/types/api.ts
    
- name: Check for type changes
  run: |
    if [[ -n $(git status -s) ]]; then
      echo "API types have changed!"
      git diff src/types/api.ts
    fi
```

---

**建立日期**: 2025-10-22  
**維護者**: Backend Team + Frontend Team  
**版本**: 1.0  
**下次審查**: Epic 2 開始前
