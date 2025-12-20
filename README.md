# 線上讀書會平台 (BookClub Platform)

一個現代化的線上讀書會管理平台，提供完整的用戶管理、社群互動和學習協作功能。

## 📋 專案概述

本專案採用前後端分離架構：
- **前端**: React 19 + TypeScript + Vite + TailwindCSS v4
- **後端**: FastAPI + SQLModel + PostgreSQL 15
- **容器化**: Docker + Docker Compose
- **狀態管理**: Zustand
- **測試框架**: Pytest (後端) + Vitest (前端)

---

## 🚀 快速開始

### 系統需求

在開始之前，請確保您的系統已安裝以下軟體：

| 軟體 | 版本需求 | 用途 |
|------|---------|------|
| [Docker](https://www.docker.com/get-started) | v20.10+ | 容器化運行後端與資料庫 |
| [Docker Compose](https://docs.docker.com/compose/install/) | v2.0+ | 多容器編排 |
| [Node.js](https://nodejs.org/) | v18+ 或 v20+ | 前端開發環境 |
| [npm](https://www.npmjs.com/) | 隨 Node.js 安裝 | 前端套件管理 |
| [Git](https://git-scm.com/) | 最新版本 | 版本控制 |

### 📥 步驟 1: 複製專案

```bash
# 複製專案儲存庫
git clone https://github.com/JeterChan/BookClub.git

# 進入專案目錄
cd SE_Test_Project
```

### ⚙️ 步驟 2: 設定後端環境變數

後端需要環境變數來配置資料庫連接、安全金鑰等設定。

```bash
# 進入後端目錄
cd backend

# 複製環境變數範例檔案
cp .env.example .env
```

編輯 `backend/.env` 檔案，根據您的需求修改以下設定：

```env
# === 資料庫設定 ===
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=bookclub_db
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/bookclub_db

# === 安全設定 ===
SECRET_KEY=your-super-secret-key-min-32-chars-please-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# === CORS 設定 ===
FRONTEND_URL=http://localhost:5173,http://localhost:5174

# === 電子郵件服務 (SendGrid - 必要) ===
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_VERIFICATION_TEMPLATE_ID=d-your_template_id
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-your_template_id

# === 圖片儲存服務 (Cloudinary - 可選) ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === Google OAuth (可選) ===
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> **⚠️ 重要提醒**：
> - 請務必修改 `SECRET_KEY` 與 `POSTGRES_PASSWORD` 為強密碼
> - **SendGrid 為必要服務**：新使用者註冊後需要透過電子郵件驗證帳號，未驗證的帳號將無法登入系統
> - Cloudinary、Google OAuth 為可選服務，如不需要可留空
> - 切勿將 `.env` 檔案提交到版本控制系統

> **💡 開發環境替代方案**：
> 
> 如果您不想設定 SendGrid，有以下選擇：
> 
> 1. **使用雲端部署版本測試**（推薦）
>    - 直接使用已部署的線上版本進行功能測試
>    - 雲端版本已完整設定所有服務，可直接註冊使用
> 
> 2. **手動修改資料庫（僅限開發環境）**
>    - 註冊帳號後，使用資料庫管理工具（如 pgAdmin、DBeaver）連接到資料庫
>    - 在 `users` 資料表中，將您的帳號的 `is_verified` 欄位值改為 `true`
>    - **⚠️ 警告**：此方法僅適用於本地開發環境測試，切勿在生產環境使用
>    - 修改後即可正常登入，無需驗證電子郵件

### 🐳 步驟 3: 啟動後端服務

使用 Docker Compose 啟動後端 API 與 PostgreSQL 資料庫：

```bash
# 確保您在 backend 目錄下
cd backend

# 啟動所有服務（背景執行）
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看服務日誌（確認啟動成功）
docker-compose logs -f
```

啟動成功後，您可以透過以下網址訪問：

| 服務 | 網址 | 說明 |
|------|------|------|
| **後端 API** | http://localhost:8000 | FastAPI 應用程式 |
| **API 文檔 (Swagger)** | http://localhost:8000/docs | 互動式 API 文檔 |
| **API 文檔 (ReDoc)** | http://localhost:8000/redoc | 替代 API 文檔介面 |
| **PostgreSQL** | localhost:5432 | 資料庫連接端口 |

### 🗄️ 步驟 4: 執行資料庫遷移

首次啟動時，需要初始化資料庫結構：

```bash
# 進入 API 容器
docker-compose exec api bash

# 執行資料庫遷移（建立所有資料表）
alembic upgrade head

# 退出容器
exit
```

### 🎨 步驟 5: 啟動前端開發伺服器

開啟**新的終端視窗**，執行以下命令：

```bash
# 從專案根目錄進入前端目錄
cd frontend

# 安裝所有 npm 依賴套件
npm install

# 啟動 Vite 開發伺服器
npm run dev
```

前端服務將在 **http://localhost:5173** 啟動。

在瀏覽器中開啟此網址，即可開始使用線上讀書會平台！

---

## 🎯 驗證安裝

完成上述步驟後，請確認：

- ✅ 後端 API 文檔可正常訪問：http://localhost:8000/docs
- ✅ 前端頁面可正常顯示：http://localhost:5173
- ✅ 可以在前端註冊新帳號並登入
- ✅ Docker 容器正常運行：`docker-compose ps` 顯示兩個容器為 `Up` 狀態

---

## 🛠️ 常用開發指令

### 後端指令（在 `backend` 目錄下執行）

```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 停止服務並刪除資料（重置資料庫）
docker-compose down -v

# 重新建置並啟動
docker-compose up --build -d

# 查看 API 日誌
docker-compose logs -f api

# 查看資料庫日誌
docker-compose logs -f db

# 進入 API 容器執行指令
docker-compose exec api bash

# 執行測試
docker-compose exec api pytest

# 執行測試並顯示覆蓋率
docker-compose exec api pytest --cov=app
```

### 前端指令（在 `frontend` 目錄下執行）

```bash
# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行 ESLint 程式碼檢查
npm run lint
```

### 資料庫遷移指令

```bash
# 進入 API 容器
docker-compose exec api bash

# 建立新的遷移腳本（當修改 SQLModel 後）
alembic revision --autogenerate -m "描述您的變更"

# 執行遷移到最新版本
alembic upgrade head

# 回退到上一個版本
alembic downgrade -1

# 查看遷移歷史
alembic history

# 查看當前版本
alembic current
```

---

## 📁 專案結構

```
SE_Test_Project/
├── backend/                      # 後端 FastAPI 應用
│   ├── alembic/                  # 資料庫遷移管理
│   │   └── versions/             # 遷移版本檔案
│   ├── app/                      # 應用程式主要代碼
│   │   ├── api/                  # API 路由和端點
│   │   │   └── v1/               # API v1 版本
│   │   ├── core/                 # 核心功能（安全、配置）
│   │   ├── db/                   # 資料庫設定
│   │   ├── models/               # SQLModel 資料模型
│   │   ├── schemas/              # Pydantic 請求/回應模式
│   │   └── services/             # 業務邏輯服務層
│   ├── tests/                    # 測試檔案
│   │   ├── unit/                 # 單元測試
│   │   └── fixtures/             # 測試資料工廠
│   ├── uploads/                  # 上傳檔案儲存目錄
│   │   ├── avatars/              # 使用者頭像
│   │   └── club_covers/          # 讀書會封面
│   ├── .env.example              # 環境變數範例
│   ├── docker-compose.yml        # Docker 編排設定
│   ├── Dockerfile                # Docker 映像檔定義
│   ├── requirements.txt          # Python 依賴套件
│   └── alembic.ini               # Alembic 設定檔
├── frontend/                     # 前端 React 應用
│   ├── src/                      # 原始碼
│   │   ├── components/           # React 可重用組件
│   │   │   ├── ui/               # UI 基礎元件
│   │   │   └── features/         # 功能性組件
│   │   ├── pages/                # 頁面組件
│   │   ├── store/                # Zustand 狀態管理
│   │   ├── services/             # API 服務層
│   │   ├── hooks/                # 自定義 React Hooks
│   │   ├── utils/                # 工具函數
│   │   ├── types/                # TypeScript 類型定義
│   │   └── assets/               # 靜態資源
│   ├── public/                   # 公開靜態檔案
│   ├── test/                     # 測試檔案
│   ├── .env.example              # 環境變數範例
│   ├── package.json              # npm 套件設定
│   ├── vite.config.ts            # Vite 建置設定
│   ├── tailwind.config.js        # TailwindCSS 設定
│   └── tsconfig.json             # TypeScript 設定
├── docs/                         # 專案文檔
│   ├── prd/                      # 產品需求文檔（分章節）
│   ├── architecture/             # 架構文檔（分章節）
│   ├── contracts/                # 契約文檔
│   │   ├── gherkin/              # BDD 測試場景（Gherkin 語法）
│   │   └── stories/              # 使用者故事
│   ├── stories/                  # 開發故事文檔
│   ├── ui-specs/                 # UI 規格說明
│   └── qa/                       # QA 文檔
├── web-bundles/                  # BMad 工作流資源
│   ├── agents/                   # AI 代理配置
│   ├── expansion-packs/          # 擴展包
│   └── teams/                    # 團隊配置
├── allure-report/                # Allure 測試報告
├── allure-results/               # Allure 測試結果
├── DEPLOYMENT_GUIDE.md           # 部署指南
├── TESTING_GUIDE.md              # 測試指南
└── README.md                     # 本文件
```

---

## 🧪 測試

本專案包含完整的單元測試套件。

### 後端測試

```bash
# 進入後端目錄
cd backend

# 執行所有測試
docker-compose exec api pytest

# 執行單元測試
docker-compose exec api pytest tests/unit/ -v

# 執行特定測試檔案
docker-compose exec api pytest tests/unit/test_auth.py -v

# 顯示測試覆蓋率
docker-compose exec api pytest --cov=app --cov-report=html

# 顯示詳細覆蓋率報告
docker-compose exec api pytest --cov=app --cov-report=term-missing
```

測試覆蓋率報告將生成在 `backend/htmlcov/index.html`。


```bash
# 進入前端目錄
cd frontend

# 執行所有測試
npm run test

# 執行測試並顯示 UI 介面（推薦）
npm run test:ui

# 生成測試覆蓋率報告
npm run test:coverage

# 執行測試（監聽模式）
npm run test -- --watch
```

---

## 🔧 開發工具與最佳實踐

### 推薦的 IDE 擴充套件

#### VS Code
- **Python**: Python extension by Microsoft
- **Pylance**: 進階 Python 語言支援
- **ESLint**: JavaScript/TypeScript 程式碼檢查
- **Prettier**: 程式碼格式化
- **Tailwind CSS IntelliSense**: TailwindCSS 自動完成
- **Docker**: Docker 容器管理

### 程式碼品質檢查

#### 後端
```bash
# 執行所有測試
docker-compose exec api pytest

# 型別檢查（如有配置 mypy）
docker-compose exec api mypy app

# 程式碼格式化（如有配置 black）
docker-compose exec api black app --check
```

#### 前端
```bash
cd frontend

# ESLint 檢查
npm run lint

# TypeScript 型別檢查
npm run build:check
```

### API 開發

- **Swagger UI**: http://localhost:8000/docs - 互動式 API 測試與文檔
- **ReDoc**: http://localhost:8000/redoc - 美觀的 API 文檔介面
- 遵循 RESTful 設計原則
- 使用 Pydantic schemas 進行請求/回應驗證
- 統一的錯誤處理格式

### 資料庫管理

#### 連線資訊
```
Host: localhost
Port: 5432
Database: bookclub_db （依 .env 設定）
User: postgres （依 .env 設定）
Password: 依 .env 設定
```

#### 推薦的資料庫管理工具
- [**pgAdmin**](https://www.pgadmin.org/) - 功能完整的 PostgreSQL 管理工具
- [**DBeaver**](https://dbeaver.io/) - 通用資料庫工具，支援多種資料庫
- [**TablePlus**](https://tableplus.com/) - 現代化的資料庫管理介面（macOS/Windows）
- [**Postico**](https://eggerapps.at/postico/) - 簡潔的 PostgreSQL 客戶端（macOS）

#### 開發環境：跳過電子郵件驗證

**⚠️ 僅限本地開發環境使用**

如果您沒有設定 SendGrid，可以手動修改資料庫來跳過電子郵件驗證流程：

1. **註冊新帳號**
   - 在前端註冊頁面建立新帳號
   - 系統會顯示需要驗證電子郵件的訊息

2. **使用資料庫管理工具連接**
   ```
   Host: localhost
   Port: 5432
   Database: bookclub_db
   User: postgres
   Password: （您在 .env 中設定的密碼）
   ```

3. **修改驗證狀態**
   - 開啟 `users` 資料表
   - 找到您剛註冊的帳號
   - 將 `is_verified` 欄位值改為 `true`
   - 儲存變更

4. **立即登入**
   - 返回前端登入頁面
   - 使用註冊的帳號密碼即可登入

> **⚠️ 重要警告**：
> - 此方法**僅適用於本地開發環境**測試
> - **切勿在生產環境**使用此方法
> - 建議使用[雲端部署版本](#-部署指南)進行完整功能測試

---

## 📚 文檔資源

本專案提供完整的技術文檔與產品文檔，協助開發者快速了解系統架構與功能規劃。

### 產品文檔 (Product Documentation)

完整的產品需求規劃與功能設計：

- **[產品需求文檔 (PRD)](./docs/prd.md)** - 完整的產品功能規劃與路線圖
  - [1. 目標與背景脈絡](./docs/prd/1-目標與背景脈絡.md)
  - [2. 功能需求](./docs/prd/2-功能需求.md)
  - [3. 非功能需求](./docs/prd/3-非功能需求.md)
  - [4. UI/UX 設計目標](./docs/prd/4-uiux-設計目標.md)
  - [5. Epic 1: 使用者管理詳細規格](./docs/prd/5-epic-1-user-stories-詳細規格.md)
  - [6. Epic 2: 讀書會管理與探索](./docs/prd/6-epic-2-讀書會管理與探索.md)
  - [7. Epic 3: 學習協作與互動](./docs/prd/7-epic-3-學習協作與互動.md)
  - [8. Epic 4: 智能互動與個人化體驗](./docs/prd/8-epic-4-智能互動與個人化體驗.md)
  - [9. 商業指標與成功標準](./docs/prd/9-商業指標與成功標準.md)

### 技術文檔 (Technical Documentation)

系統架構設計與開發規範：

- **[架構文檔](./docs/architecture.md)** - 系統架構完整設計
  - [1. 架構概覽 v4.0](./docs/architecture/1-架構概覽-v40.md)
  - [2. 後端架構詳細設計 (SQLModel)](./docs/architecture/2-後端架構詳細設計-sqlmodel.md)
  - [3. 資料庫遷移 (Alembic)](./docs/architecture/3-資料庫遷移-alembic.md)
  - [4. 開發環境 (Docker for SQLModel)](./docs/architecture/4-開發環境-docker-for-sqlmodel.md)
  - [5. 前端架構詳細設計 (Vite + React)](./docs/architecture/5-前端架構詳細設計-vite-react.md)

### 契約文檔 (Contract Documentation)

開發契約、API 規範與測試標準：

- **[契約文件體系](./docs/contracts/README.md)** - 開發契約、標準與工作流程
  - [資料庫架構 (Database Schema)](./docs/contracts/database-schema.md)
  - [API 訪問指南](./docs/contracts/api-access-guide.md)
  - [資料契約 (Data Contract)](./docs/contracts/data-contract.md)
  - [Gherkin 功能測試](./docs/contracts/gherkin/) - BDD 驗收標準
  - [維護工作流程](./docs/contracts/maintenance-workflow.md)

### 開發故事 (Development Stories)

各項功能的詳細開發規格與實作文檔：

- **[使用者故事文檔](./docs/stories/)**
  - Story 1.1: 新使用者註冊頁面
  - Story 1.2: 使用者登入頁面
  - Story 1.3: 使用者個人資料頁面
  - Story 1.4: 編輯個人資料
  - Story 1.5: 修改密碼功能
  - Story 1.6: Google OAuth 登入

### 部署與測試文檔

- **[部署指南 (DEPLOYMENT_GUIDE.md)](./DEPLOYMENT_GUIDE.md)** - Render + Vercel 部署完整流程

---

## 🛠️ 技術棧

### 後端技術
| 技術 | 版本 | 用途 |
|------|------|------|
| **FastAPI** | Latest | Web 框架 |
| **SQLModel** | Latest | ORM（結合 SQLAlchemy + Pydantic） |
| **PostgreSQL** | 15 | 關聯式資料庫 |
| **Alembic** | Latest | 資料庫遷移工具 |
| **JWT** | - | 身份驗證 |
| **OAuth 2.0** | - | 第三方登入 |
| **bcrypt** | Latest | 密碼加密 |
| **Pytest** | Latest | 測試框架 |
| **Docker** | 20.10+ | 容器化 |

### 前端技術
| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 19 | UI 框架 |
| **TypeScript** | Latest | 靜態型別檢查 |
| **Vite** | Latest | 建置工具與開發伺服器 |
| **TailwindCSS** | v4 | CSS 框架 |
| **Zustand** | 5.0+ | 輕量級狀態管理 |
| **React Router** | v7 | 路由管理 |
| **Axios** | Latest | HTTP 客戶端 |
| **React Hook Form** | Latest | 表單處理 |
| **Zod** | Latest | 資料驗證 |
| **Heroicons** | Latest | 圖示庫 |
| **Vitest** | Latest | 測試框架 |
| **React Testing Library** | Latest | 元件測試 |

### 開發工具
- **Git** - 版本控制
- **Docker Compose** - 容器編排
- **ESLint** - JavaScript/TypeScript 程式碼檢查
- **Prettier** - 程式碼格式化（可選）
- **Allure** - 測試報告生成

---

## ⚠️ 常見問題排解

### 電子郵件驗證相關

#### ❌ 註冊後無法收到驗證信
```bash
# 可能原因：
1. SendGrid API Key 未設定或設定錯誤
2. SendGrid 模板 ID 不正確
3. SendGrid 寄件者信箱未驗證

# 解決方案：
方案 1：設定 SendGrid（推薦用於正式開發）
- 前往 SendGrid 官網註冊帳號
- 取得 API Key 並設定在 .env 檔案中
- 驗證寄件者信箱
- 建立電子郵件模板並取得 Template ID

方案 2：手動修改資料庫（僅限本地測試）
- 使用資料庫管理工具連接到 PostgreSQL
- 在 users 資料表中將 is_verified 改為 true
- 詳細步驟請參考「開發環境：跳過電子郵件驗證」章節

方案 3：使用雲端部署版本（推薦用於快速測試）
- 直接使用已部署的線上版本測試功能
- 所有服務已完整設定，可正常註冊與驗證
```

#### ❌ 已註冊但無法登入（顯示帳號未驗證）
```bash
# 原因：
註冊的帳號尚未通過電子郵件驗證

# 解決方案：
1. 檢查註冊時填寫的信箱，尋找驗證信
2. 如果沒有收到驗證信，使用上述「方案 2」手動修改資料庫
3. 或使用雲端部署版本重新註冊測試
```

### 後端相關問題

#### ❌ 後端容器無法啟動
```bash
# 檢查步驟：
1. 確認 .env 檔案是否正確配置
2. 確認 5432 和 8000 端口未被佔用
   lsof -i :5432
   lsof -i :8000
3. 查看容器日誌以了解錯誤原因
   docker-compose logs api
   docker-compose logs db
```

#### ❌ 資料庫連線失敗
```bash
# 解決方案：
1. 確認 PostgreSQL 容器正在運行
   docker-compose ps
   
2. 檢查 DATABASE_URL 環境變數格式是否正確
   格式: postgresql://user:password@host:port/database
   
3. 等待資料庫完全啟動（約 5-10 秒）
   docker-compose logs -f db
   
4. 重啟服務
   docker-compose restart
```

#### ❌ 資料庫遷移失敗
```bash
# 解決方案：
1. 檢查資料庫連線是否正常
2. 確認沒有遷移腳本衝突
   docker-compose exec api alembic history
   
3. 重置資料庫（警告：會刪除所有資料）
   docker-compose down -v
   docker-compose up -d
   docker-compose exec api alembic upgrade head
```

### 前端相關問題

#### ❌ 前端無法連接後端 API
```bash
# 檢查步驟：
1. 確認後端服務正在運行
   訪問: http://localhost:8000/docs
   
2. 檢查瀏覽器控制台的 CORS 錯誤
   確認 backend/.env 中 FRONTEND_URL 包含 http://localhost:5173
   
3. 確認前端 API 基礎 URL 配置正確
   檢查 frontend/src/services/ 中的 API URL
```

#### ❌ npm install 失敗
```bash
# 解決方案：
1. 清除 npm 快取
   npm cache clean --force
   
2. 刪除 node_modules 和 package-lock.json
   rm -rf node_modules package-lock.json
   
3. 重新安裝
   npm install
   
4. 如果仍然失敗，嘗試使用 --legacy-peer-deps
   npm install --legacy-peer-deps
```

#### ❌ Vite 開發伺服器無法啟動
```bash
# 檢查步驟：
1. 確認 5173 端口未被佔用
   lsof -i :5173
   
2. 嘗試使用其他端口
   npm run dev -- --port 5174
   
3. 檢查 Node.js 版本是否符合需求（v18+）
   node --version
```

### Docker 相關問題

#### ❌ Docker 容器佔用過多磁碟空間
```bash
# 清理未使用的 Docker 資源
docker system prune -a --volumes

# 僅清理未使用的容器、網路、映像
docker system prune

# 查看磁碟使用情況
docker system df
```

#### ❌ Docker Compose 版本不相容
```bash
# 檢查 Docker Compose 版本
docker-compose --version

# 升級到最新版本（macOS with Homebrew）
brew upgrade docker-compose

# 或使用 Docker Compose V2（推薦）
docker compose version
```

---

## 🚀 部署指南

### 生產環境部署

本專案支援部署到以下平台：

#### 前端部署 - Vercel（推薦）
- ✅ 自動 CI/CD
- ✅ 全球 CDN
- ✅ 自動 HTTPS
- ✅ 免費方案可用

#### 後端部署 - Render（推薦）
- ✅ 免費 PostgreSQL 資料庫
- ✅ 自動部署
- ✅ 內建 HTTPS
- ✅ 環境變數管理

### 詳細部署步驟

請參考完整的部署指南：
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Render + Vercel 完整部署流程
- **[RENDER_SEED_GUIDE.md](./RENDER_SEED_GUIDE.md)** - 資料庫種子資料指南

---

## 📝 專案特色與功能

### ✅ 已實現功能
- ✅ **使用者管理**
  - 使用者註冊與登入（JWT 驗證）
  - Google OAuth 2.0 第三方登入
  - 個人資料管理（頭像上傳、資料編輯）
  - 密碼修改功能
  - 電子郵件驗證（SendGrid）
- ✅ **技術特色**
  - 響應式網頁設計（支援桌面、平板、手機）
  - 完整的錯誤處理與驗證
  - API 文檔自動生成（Swagger/OpenAPI）
  - 資料庫遷移管理（Alembic）
  - Docker 容器化部署
  - 完整的單元測試覆蓋

### 🔄 開發中功能
- 🔄 **讀書會管理**
  - 讀書會建立與設定
  - 讀書會搜尋與瀏覽
  - 讀書會成員管理
  - 讀書會活動排程
- 🔄 **社群互動**
  - 討論區與留言功能
  - 文章發布與分享
  - 成員互動與評論
- 🔄 **書籍管理**
  - 書籍資訊管理
  - 閱讀進度追蹤
  - 書籍推薦系統

---

## 👥 開發團隊

本專案採用 AI 輔助的協作開發模式：

| 角色 | 職責 |
|------|------|
| **PM (Product Manager)** | 專案管理、產品規劃、需求定義 |
| **Architect** | 系統架構設計、技術決策、技術選型 |
| **Developer** | 功能開發、程式實作、程式碼審查 |
| **QA (Quality Assurance)** | 品質保證、測試規劃、錯誤追蹤 |

---

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

### 提交程式碼流程

1. **Fork 本專案**
   ```bash
   # 在 GitHub 上點擊 Fork 按鈕
   ```

2. **建立功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **提交變更**
   ```bash
   git add .
   git commit -m "Add: 新增某某功能"
   ```

4. **推送到分支**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **開啟 Pull Request**
   - 在 GitHub 上開啟 Pull Request
   - 填寫詳細的變更說明
   - 等待程式碼審查

### 開發規範

請確保您的貢獻符合以下標準：

- ✅ 遵循專案的程式碼風格
- ✅ 添加適當的單元測試
- ✅ 更新相關文檔（如有需要）
- ✅ 參考 [契約文檔](./docs/contracts/) 確保符合開發標準
- ✅ Commit 訊息使用清楚的格式：
  - `Add: 新增功能`
  - `Fix: 修復錯誤`
  - `Update: 更新功能`
  - `Refactor: 重構程式碼`
  - `Docs: 更新文檔`

---

## 👥 貢獻者

感謝所有為本專案做出貢獻的人！

<a href="https://github.com/JeterChan/BookClub/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JeterChan/BookClub" alt="Contributors" />
</a>
<a href="https://github.com/jjwang1118">
  <img src="https://github.com/jjwang1118.png?size=100" width="60px;" alt=""/>
</a>
---

## 📄 授權

本專案為教育與學習用途開發。

---

## 📞 聯絡資訊

- **GitHub Repository**: [JeterChan/BookClub](https://github.com/JeterChan/BookClub)
- **問題回報**: [GitHub Issues](https://github.com/JeterChan/BookClub/issues)

---

**📅 最後更新**: 2025-12-20  
**📦 版本**: 1.0.0  
**👨‍💻 維護者**: [JeterChan](https://github.com/JeterChan)

---

## 🎓 學習資源

### 推薦閱讀
- [FastAPI 官方文檔](https://fastapi.tiangolo.com/)
- [React 官方文檔](https://react.dev/)
- [SQLModel 文檔](https://sqlmodel.tiangolo.com/)
- [TailwindCSS 文檔](https://tailwindcss.com/)
- [Docker 文檔](https://docs.docker.com/)

### 相關教學
- [RESTful API 設計最佳實踐](https://restfulapi.net/)
- [PostgreSQL 教學](https://www.postgresql.org/docs/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)

---

**祝您開發順利！** 🚀
