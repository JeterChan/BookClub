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

### 1️⃣ Clone Project

```bash
git clone <your-repository-url>
cd Your-Folder-Name
```

### 2️⃣ 設定環境變數

在 `backend` 目錄下創建 `.env` 檔案：

```bash
cd backend
cp .env.example .env  # 如果有範例檔案
# 或手動創建 .env 檔案
```

`.env` 檔案內容範例：

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=bookclub_db

# API
DATABASE_URL=postgresql://postgres:your_password@db:5432/bookclub_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (選填)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
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
│   ├── app/              # 應用程式主要代碼
│   │   ├── api/          # API 路由和端點
│   │   ├── core/         # 核心功能（安全、配置）
│   │   ├── db/           # 資料庫設定
│   │   ├── models/       # 資料模型
│   │   ├── schemas/      # Pydantic 模式
│   │   └── services/     # 業務邏輯
│   ├── tests/            # 測試檔案
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # 前端 React 應用
│   ├── src/              # 原始碼
│   │   ├── assets/       # 靜態資源
│   │   ├── components/   # React 組件（如果有）
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── docs/                 # 專案文檔
└── README.md
```

## 🧪 測試

### 後端測試

```bash
cd backend
docker-compose exec api pytest
```

### 前端測試

```bash
cd frontend
npm run test  # 如果有配置測試
```

## 📚 文檔

### 產品文檔
- [產品需求文檔 (PRD)](./docs/prd.md) - 產品功能和路線圖
- [開發任務](./docs/development-tasks.md) - 當前開發任務追蹤

### 技術文檔
- [架構文檔](./docs/architecture.md) - 系統架構設計
- [API 端點文檔](./docs/api-endpoints.md) - API 快速參考

### 契約文檔 (Contract Documentation)
- [契約文件體系](./docs/contracts/README.md) - 開發契約和標準
  - [Database Schema](./docs/contracts/database-schema.md) - 資料庫結構
  - [API Access Guide](./docs/contracts/api-access-guide.md) - API 文件訪問指南
  - [Data Contract](./docs/contracts/data-contract.md) - 資料格式規範
  - [Gherkin Features](./docs/contracts/gherkin/) - BDD 驗收標準

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
- **樣式**: TailwindCSS
- **狀態管理**: Zustand
- **HTTP 客戶端**: Axios
- **路由**: React Router

### 開發工具
- **容器化**: Docker & Docker Compose
- **版本控制**: Git
- **程式碼規範**: ESLint, Prettier

## 🔧 開發提示

### 修改後端代碼

由於使用了 Docker volume 掛載，修改後端代碼後會自動重載（需要在 FastAPI 啟動時加上 `--reload` 參數）。

### 修改前端代碼

Vite 提供熱模組替換 (HMR)，修改代碼後瀏覽器會自動更新。

### 資料庫管理

可以使用 PostgreSQL 客戶端工具連接到本地資料庫：
- **Host**: localhost
- **Port**: 5432
- **Database**: bookclub_db（依 .env 設定）
- **User/Password**: 依 .env 設定

推薦工具：
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)
- [TablePlus](https://tableplus.com/)

## 👥 團隊

- **PM**: 專案管理與產品規劃
- **Architect**: 系統架構設計
- **Developer**: 功能開發與實作
- **QA**: 品質保證與測試

---

**最後更新**: 2025-10-16
