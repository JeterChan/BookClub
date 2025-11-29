# 線上讀書會平台

一個現代化的線上讀書會管理平台，提供完整的用戶管理、社群互動和學習協作功能。

## 📋 專案概述

本專案採用前後端分離架構：
- **前端**: React + TypeScript + Vite + TailwindCSS
- **後端**: FastAPI + SQLModel + PostgreSQL
- **容器化**: Docker + Docker Compose

## 🚀 快速開始

### 前置需求

確保你的開發環境已安裝：
- [Docker](https://www.docker.com/get-started) (推薦 v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (推薦 v2.0+)
- [Node.js](https://nodejs.org/) (v18+ 或 v20+)
- [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 1️⃣ 複製專案

```bash
git clone https://github.com/JeterChan/BookClub.git
cd SE_Test_Project
```

### 2️⃣ 設定環境變數

在 `backend` 目錄下創建 `.env` 檔案：

```bash
cd backend
cp .env.example .env
```

`.env` 檔案內容範例（請參考 `.env.example`）：

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=bookclub_db
DATABASE_URL=postgresql://postgres:your_password@db:5432/bookclub_db

# Security
SECRET_KEY=your-secret-key-here-please-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS & Frontend
FRONTEND_URL=http://localhost:5173,http://localhost:5174

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_VERIFICATION_TEMPLATE_ID=d-your_template_id
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-your_template_id

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3️⃣ 啟動後端服務 (Docker)

在 `backend` 目錄下執行：

```bash
cd backend

# 啟動所有服務（PostgreSQL + FastAPI）
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

**服務端口：**
- 後端 API: http://localhost:8000
- API 文檔 (Swagger): http://localhost:8000/docs
- PostgreSQL: localhost:5432

#### 資料庫遷移

首次啟動或更新資料庫結構時：

```bash
# 進入 API 容器
docker-compose exec api bash

# 執行資料庫遷移
alembic upgrade head

# 退出容器
exit
```

#### 常用 Docker 指令

```bash
# 停止服務
docker-compose down

# 停止並刪除資料卷（清空資料庫）
docker-compose down -v

# 重新建置並啟動
docker-compose up --build -d

# 查看 API 日誌
docker-compose logs -f api

# 查看資料庫日誌
docker-compose logs -f db
```

### 4️⃣ 啟動前端開發伺服器

開啟新的終端視窗，在專案根目錄執行：

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

前端服務將在 http://localhost:5173 啟動（Vite 預設端口）

#### 其他前端指令

```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 程式碼檢查
npm run lint
```

## 📁 專案結構

```
SE_Test_Project/
├── backend/               # 後端 FastAPI 應用
│   ├── alembic/          # 資料庫遷移腳本
│   │   └── versions/     # 遷移版本檔案
│   ├── app/              # 應用程式主要代碼
│   │   ├── api/          # API 路由和端點
│   │   ├── core/         # 核心功能（安全、配置）
│   │   ├── db/           # 資料庫設定
│   │   ├── models/       # SQLModel 資料模型
│   │   ├── schemas/      # Pydantic 請求/回應模式
│   │   └── services/     # 業務邏輯服務層
│   ├── tests/            # 測試檔案
│   │   ├── unit/         # 單元測試
│   │   └── integration/  # 整合測試
│   ├── uploads/          # 上傳檔案儲存目錄
│   │   ├── avatars/      # 使用者頭像
│   │   └── club_covers/  # 讀書會封面
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/             # 前端 React 應用
│   ├── src/              # 原始碼
│   │   ├── components/   # React 可重用組件
│   │   ├── pages/        # 頁面組件
│   │   ├── store/        # Zustand 狀態管理
│   │   ├── services/     # API 服務層
│   │   ├── hooks/        # 自定義 React Hooks
│   │   ├── utils/        # 工具函數
│   │   ├── types/        # TypeScript 類型定義
│   │   └── assets/       # 靜態資源
│   ├── public/           # 公開靜態檔案
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/                 # 專案文檔
│   ├── prd/              # 產品需求文檔（分章節）
│   ├── architecture/     # 架構文檔（分章節）
│   ├── contracts/        # 契約文檔
│   │   ├── gherkin/      # BDD 測試場景
│   │   └── stories/      # 使用者故事
│   ├── stories/          # 開發故事文檔
│   ├── ui-specs/         # UI 規格說明
│   └── qa/               # QA 文檔
├── web-bundles/          # BMad 工作流資源
│   ├── agents/           # AI 代理配置
│   ├── expansion-packs/  # 擴展包
│   └── teams/            # 團隊配置
└── README.md
```

## 🧪 測試

### 後端測試

```bash
cd backend

# 在 Docker 容器中執行測試
docker-compose exec api pytest

# 執行特定測試檔案
docker-compose exec api pytest tests/unit/test_auth.py

# 顯示測試覆蓋率
docker-compose exec api pytest --cov=app
```

### 前端測試

```bash
cd frontend

# 執行所有測試
npm run test

# 執行測試並顯示 UI 介面
npm run test:ui

# 生成測試覆蓋率報告
npm run test:coverage
```

## 📚 文檔

### 產品文檔
- [產品需求文檔 (PRD)](./docs/prd.md) - 完整的產品功能規劃與路線圖
  - [目標與背景脈絡](./docs/prd/1-目標與背景脈絡.md)
  - [功能需求](./docs/prd/2-功能需求.md)
  - [非功能需求](./docs/prd/3-非功能需求.md)
  - [UI/UX 設計目標](./docs/prd/4-uiux-設計目標.md)
  - [Epic 1: 使用者故事詳細規格](./docs/prd/5-epic-1-user-stories-詳細規格.md)
  - [Epic 2: 讀書會管理與探索](./docs/prd/6-epic-2-讀書會管理與探索.md)
  - [Epic 3: 學習協作與互動](./docs/prd/7-epic-3-學習協作與互動.md)
  - [Epic 4: 智能互動與個人化體驗](./docs/prd/8-epic-4-智能互動與個人化體驗.md)
  - [商業指標與成功標準](./docs/prd/9-商業指標與成功標準.md)

### 技術文檔
- [架構文檔](./docs/architecture.md) - 系統架構完整設計
  - [架構概覽](./docs/architecture/1-架構概覽-v40.md)
  - [後端架構詳細設計](./docs/architecture/2-後端架構詳細設計-sqlmodel.md)
  - [資料庫遷移](./docs/architecture/3-資料庫遷移-alembic.md)
  - [開發環境](./docs/architecture/4-開發環境-docker-for-sqlmodel.md)
  - [前端架構詳細設計](./docs/architecture/5-前端架構詳細設計-vite-react.md)

### 契約文檔 (Contract Documentation)
- [契約文件體系](./docs/contracts/README.md) - 開發契約、標準與工作流程
  - [資料庫架構](./docs/contracts/database-schema.md) - 完整資料庫結構定義
  - [API 訪問指南](./docs/contracts/api-access-guide.md) - API 文件訪問方式
  - [資料契約](./docs/contracts/data-contract.md) - 前後端資料格式規範
  - [Gherkin 功能測試](./docs/contracts/gherkin/) - BDD 驗收標準
  - [維護工作流程](./docs/contracts/maintenance-workflow.md) - 契約維護指南

### 開發故事
- [使用者故事文檔](./docs/stories/) - 各項功能的詳細開發故事
  - Story 1.1: 新使用者註冊頁面
  - Story 1.2: 使用者登入頁面
  - Story 1.3: 使用者個人資料頁面
  - Story 1.4: 編輯個人資料
  - Story 1.5: 修改密碼功能
  - Story 1.6: Google OAuth 登入

## 🛠️ 技術棧

### 後端
- **框架**: FastAPI
- **ORM**: SQLModel
- **資料庫**: PostgreSQL 15
- **遷移工具**: Alembic
- **認證**: JWT + OAuth 2.0
- **密碼加密**: bcrypt

### 前端
- **框架**: React 19
- **語言**: TypeScript
- **建置工具**: Vite
- **樣式**: TailwindCSS v4
- **狀態管理**: Zustand
- **HTTP 客戶端**: Axios
- **路由**: React Router v7
- **表單處理**: React Hook Form + Zod
- **UI 元件**: Heroicons
- **測試**: Vitest + React Testing Library

### 開發工具
- **容器化**: Docker & Docker Compose
- **版本控制**: Git
- **程式碼規範**: ESLint, Prettier

## 🔧 開發提示

### 修改後端代碼

由於使用了 Docker volume 掛載，修改後端代碼後會自動重載。FastAPI 在開發模式下已啟用 `--reload` 參數。

### 修改前端代碼

Vite 提供熱模組替換 (HMR)，修改代碼後瀏覽器會自動更新，無需手動重新整理。

### 環境變數管理

- 後端環境變數：`backend/.env`
- 前端環境變數：使用 Vite 的 `import.meta.env`
- 永遠不要將 `.env` 檔案提交到版本控制

### API 開發

- API 端點自動生成文檔：http://localhost:8000/docs
- 替代文檔介面：http://localhost:8000/redoc
- 遵循 RESTful 設計原則
- 使用 Pydantic schemas 進行資料驗證

### 資料庫管理

#### 連線資訊
- **Host**: localhost
- **Port**: 5432
- **Database**: bookclub_db（依 .env 設定）
- **User/Password**: 依 .env 設定

#### 資料庫遷移工作流程

```bash
# 進入 API 容器
docker-compose exec api bash

# 建立新的遷移腳本
alembic revision --autogenerate -m "描述您的變更"

# 執行遷移
alembic upgrade head

# 回退遷移
alembic downgrade -1

# 查看遷移歷史
alembic history

# 查看當前版本
alembic current
```

#### 推薦的資料庫管理工具
- [pgAdmin](https://www.pgadmin.org/) - 功能完整的 PostgreSQL 管理工具
- [DBeaver](https://dbeaver.io/) - 通用資料庫工具，支援多種資料庫
- [TablePlus](https://tableplus.com/) - 現代化的資料庫管理介面（macOS）
- [Postico](https://eggerapps.at/postico/) - 簡潔的 PostgreSQL 客戶端（macOS）

### 程式碼品質

#### 後端
```bash
# 執行測試
docker-compose exec api pytest

# 檢查型別
docker-compose exec api mypy app

# 格式化程式碼（如有配置）
docker-compose exec api black app
```

#### 前端
```bash
cd frontend

# 執行 ESLint 檢查
npm run lint

# 執行測試
npm run test

# TypeScript 型別檢查
npm run build:check
```

### 常見問題排解

#### 後端容器無法啟動
1. 檢查 `.env` 檔案是否正確配置
2. 確認 5432 端口未被佔用
3. 查看容器日誌：`docker-compose logs api`

#### 資料庫連線失敗
1. 確認 PostgreSQL 容器正在運行：`docker-compose ps`
2. 檢查 `DATABASE_URL` 環境變數格式
3. 等待資料庫完全啟動（約 5-10 秒）

#### 前端無法連接後端 API
1. 確認後端服務正在運行：http://localhost:8000/docs
2. 檢查 CORS 設定（參考 `backend/CORS_CONFIG.md`）
3. 確認 API 基礎 URL 配置正確

#### 資料庫遷移失敗
1. 檢查資料庫連線
2. 確認沒有未提交的遷移衝突
3. 必要時重置資料庫：`docker-compose down -v && docker-compose up -d`

## 👥 團隊

- **PM (Product Manager)**: 專案管理與產品規劃
- **Architect**: 系統架構設計與技術決策
- **Developer**: 功能開發與實作
- **QA (Quality Assurance)**: 品質保證與測試

## 👥 貢獻者

感謝所有為本專案做出貢獻的人！

<a href="https://github.com/JeterChan/BookClub/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JeterChan/BookClub" alt="Contributors" />
</a>
<a href="https://github.com/jjwang1118">
  <img src="https://github.com/jjwang1118.png?size=100" width="60px;" alt=""/>
</a>

## 🚀 部署

### 前端部署 (Vercel)
前端應用已配置為可部署至 Vercel 平台，相關配置請參考 `frontend/vercel.json`。

### 後端部署 (Render)
後端應用可部署至 Render 平台：
- 部署指南：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 資料庫種子資料：[RENDER_SEED_GUIDE.md](./RENDER_SEED_GUIDE.md)

## 📝 專案特色

### 已實現功能
- ✅ 使用者註冊與登入（含 JWT 驗證）
- ✅ Google OAuth 2.0 第三方登入
- ✅ 個人資料管理（頭像上傳、資料編輯）
- ✅ 密碼修改功能
- ✅ 響應式網頁設計
- ✅ 前後端完整的錯誤處理
- ✅ API 文檔自動生成（Swagger/OpenAPI）
- ✅ 資料庫遷移管理（Alembic）
- ✅ Docker 容器化部署

### 開發中功能
- 🔄 讀書會建立與管理
- 🔄 讀書會搜尋與瀏覽
- 🔄 讀書會成員管理
- 🔄 討論區與留言功能
- 🔄 書籍管理與推薦

## 🤝 貢獻指南

1. Fork 本專案
2. 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

請確保：
- 遵循專案的程式碼風格
- 添加適當的測試
- 更新相關文檔
- 參考契約文檔確保符合開發標準

## 📄 授權

本專案為教育與學習用途。

---

**最後更新**: 2025-11-04
**版本**: 1.0.0
**維護者**: JeterChan
