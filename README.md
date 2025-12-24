# 線上讀書會平台 (BookClub Platform)

一個現代化的線上讀書會管理平台，提供完整的用戶管理、社群互動和學習協作功能。

## 🎬 Demo 影片

觀看完整功能演示：[https://youtu.be/TjyBhNho2CM](https://youtu.be/TjyBhNho2CM)

## ⚡ 快速啟動

### 🌟 方案 1：使用雲端測試環境（最推薦，零設定）

**最快速的體驗方式！** 無需任何安裝或設定，立即開始使用：

👉 **直接訪問**: [https://bookclub-frontend-rouge.vercel.app/](https://bookclub-frontend-rouge.vercel.app/)

**測試帳號**：
```
帳號：TestUser@gmail.com
密碼：TestUser1234
```

**優點**：
- ✅ **零設定**：無需安裝 Docker、Node.js 或任何開發工具
- ✅ **完整功能**：所有功能（SendGrid、Cloudinary）都已部署
- ✅ **立即使用**：開啟瀏覽器即可開始體驗
- ✅ **跨平台**：任何裝置、任何作業系統都能使用

> 💡 更多雲端環境資訊請參考：[雲端測試環境](#-雲端測試環境)

---

### 🔧 方案 2：本地開發環境設定

如果您想在本地進行開發或客製化修改，請依照以下步驟：

#### 前置要求
- Docker & Docker Compose
- Node.js (v18+)
- Git

#### 一鍵啟動

```bash
# 1. 複製專案
git clone https://github.com/JeterChan/BookClub.git
cd bookclub

# 2. 設定後端環境變數
cd backend
cp .env.example .env
# 編輯 .env 檔案，填入必要的 API Keys（SendGrid 等）
cd ..

# 3. 設定前端環境變數
cd frontend
cp .env.example .env
# 編輯 .env 檔案，設定後端 API URL
cd ..

# 4. 啟動後端（Docker）
cd backend
docker-compose up -d
cd ..

# 5. 啟動前端
cd frontend
npm install
npm run dev
```

### 訪問應用程式
- **前端**: http://localhost:5173
- **後端 API**: http://localhost:8000
- **API 文件**: http://localhost:8000/docs

> **💡 提示**：詳細的環境變數設定說明請參考下方的[快速開始](#-快速開始)章節。

---

## 📋 專案概述

本專案採用前後端分離架構：
- **前端**: React 19 + TypeScript + Vite + TailwindCSS v4
- **後端**: FastAPI + SQLModel + PostgreSQL 15
- **容器化**: Docker + Docker Compose
- **狀態管理**: Zustand
- **測試框架**: Pytest (後端) + Vitest (前端)

---

## ⚡ 快速導航

| 您想做什麼？ | 跳轉到 |
|------------|--------|
| 🌐 **直接體驗線上版** | [雲端測試環境](#-雲端測試環境) |
| 🚀 立即開始使用 | [快速開始](#-快速開始) |
| 📧 設定電子郵件服務 | [SendGrid 設定](#4--sendgrid-電子郵件服務設定必要) |
| ⚠️ 遇到問題了 | [常見問題排解](#️-常見問題排解) |
| 🔧 查看開發指令 | [常用開發指令](#️-常用開發指令) |
| 📚 閱讀完整文檔 | [文檔資源](#-文檔資源) |
| 🚀 部署到線上 | [部署指南](#-部署指南) |

> **💡 想快速體驗功能？** 直接使用[雲端測試環境](#-雲端測試環境)，無需任何設定即可立即體驗所有功能！
>
> **🔴 想本地開發？** 本專案需要 **SendGrid API** 才能完成用戶註冊流程（電子郵件驗證）。
> 如果您暫時不想設定，請參考[開發環境替代方案](#-開發環境替代方案不想設定-sendgrid)。

---

## 🌐 雲端測試環境

**想立即體驗功能而不想設定本地環境？** 我們提供了完整的雲端測試環境！

### 📍 線上測試網址

**前端網址**: [https://bookclub-frontend-rouge.vercel.app/](https://bookclub-frontend-rouge.vercel.app/)

> **⏱️ 首次使用提醒**：
> - 後端伺服器採用**免費方案部署**，閒置時會自動休眠
> - **第一次訪問**或長時間未使用後，後端需要**冷啟動**
> - 首次登入或註冊時，請耐心等待 **30-60 秒**讓後端伺服器啟動
> - 如果看到載入畫面或請求超時，請稍等片刻後重新嘗試
> - 伺服器啟動後，後續操作就會非常快速流暢！

### 🔑 測試用帳號

無需註冊，直接使用以下測試帳號登入：

```
帳號：TestUser@gmail.com
密碼：TestUser1234
```

**首次登入步驟**：
1. 開啟 [https://bookclub-frontend-rouge.vercel.app/](https://bookclub-frontend-rouge.vercel.app/)
2. 點擊「登入」按鈕
3. 輸入測試帳號與密碼
4. 點擊「登入」後，**首次可能需要等待 30-60 秒**（後端冷啟動）
5. 如果登入失敗，請稍等 30 秒後重試
6. 成功登入後，所有功能都會快速響應

### ✨ 雲端環境特色

- ✅ **完整功能**：所有功能都已部署並可正常使用
- ✅ **SendGrid 已設定**：電子郵件驗證功能完整可用
- ✅ **Cloudinary 已設定**：圖片上傳功能完整可用
- ✅ **即開即用**：無需任何本地設定或 API Key
- ✅ **測試帳號**：提供測試帳號，可直接登入體驗
- ⏱️ **免費部署**：使用免費方案，首次訪問需等待後端冷啟動（約 30-60 秒）

### 💡 使用小提示

**首次使用或長時間未使用？**
- 後端伺服器閒置時會自動休眠（免費方案特性）
- 第一次操作（登入、註冊等）時，請耐心等待 30-60 秒
- 看到載入畫面是正常的，表示後端正在啟動
- 啟動完成後，所有功能都會快速響應
- 建議：如果操作失敗，等待 30 秒後重試即可

**已經登入過？**
- 如果近期使用過（15 分鐘內），後端會保持活躍狀態
- 所有操作都會立即響應，無需等待

### 🎯 可測試的功能

使用測試帳號登入後，您可以體驗：

1. **個人資料管理**
   - 查看個人資料頁面
   - 編輯個人資料（暱稱、簡介等）
   - 上傳/更換個人頭像
   - 修改密碼

2. **帳號功能**
   - 登入/登出功能
   - 忘記密碼流程（會發送真實郵件）

3. **響應式設計**
   - 在不同裝置上測試（手機、平板、桌面）
   - 測試介面的適應性

### 💡 想註冊新帳號？

您也可以在雲端環境註冊新帳號：

1. 前往 [註冊頁面](https://bookclub-frontend-rouge.vercel.app/register)
2. 填寫註冊表單
3. 點擊「註冊」後，**首次可能需要等待 30-60 秒**（後端冷啟動）
4. 註冊成功後，系統會發送驗證信到您的電子郵件
5. 點擊驗證連結後即可登入

> **📧 注意事項**：
> - 註冊需要驗證電子郵件，請確保填寫有效的信箱地址
> - 如果註冊時看到載入畫面或超時，請等待 30 秒後重試
> - 驗證信通常會在 1-2 分鐘內送達
> - 請檢查垃圾郵件資料夾，確保沒有漏掉驗證信

### 🔄 測試環境與本地開發的差異

| 項目 | 雲端測試環境 | 本地開發環境 |
|------|------------|------------|
| **設定難度** | 🟢 無需設定 | 🟡 需要設定 Docker、Node.js 等 |
| **SendGrid** | 🟢 已完整設定 | 🔴 需要自行設定 API Key |
| **Cloudinary** | 🟢 已完整設定 | 🟡 可選設定 |
| **資料持久性** | 🟡 測試資料可能定期清理 | 🟢 完全控制 |
| **開發彈性** | 🔴 無法修改程式碼 | 🟢 可自由修改開發 |
| **適合對象** | 快速體驗、功能測試 | 程式開發、客製化修改 |

---

## 🚀 快速開始

### 📋 準備清單

在開始之前，請確認您已準備好以下項目：

| 類別 | 項目 | 必要性 | 說明 |
|------|------|--------|------|
| **軟體環境** | Docker & Docker Compose | 🔴 必要 | 用於運行後端與資料庫 |
| | Node.js (v18+) | 🔴 必要 | 用於前端開發 |
| | Git | 🔴 必要 | 版本控制工具 |
| **API 服務** | SendGrid API Key | 🔴 **必要** | **電子郵件驗證功能（註冊必須）** |
| | SendGrid 寄件者電子郵件 | 🔴 **必要** | 需在 SendGrid 完成驗證 |
| | SendGrid 電子郵件模板 | 🔴 **必要** | 驗證信與密碼重置信模板 |
| | Cloudinary API（可選） | 🟡 可選 | 圖片儲存（不設定則存本地） |

> **🔴 重點提醒**：
> - **SendGrid 為必要服務**，未設定將無法完成用戶註冊流程
> - SendGrid 免費方案每月 100 封信，足夠開發測試使用
> - 如不想立即設定，可先閱讀「開發環境替代方案」

---

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
cd bookclub
```

### ⚙️ 步驟 2: 設定後端環境變數

後端需要環境變數來配置資料庫連接、安全金鑰等設定。

```bash
# 進入後端目錄
cd backend

# 複製環境變數範例檔案
cp .env.example .env
```

#### 📝 必要設定項目

編輯 `backend/.env` 檔案，**務必**修改以下設定：

##### 1. 資料庫設定
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here  # ⚠️ 請改為強密碼
POSTGRES_DB=bookclub_db
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/bookclub_db
```

##### 2. 安全金鑰設定
```env
SECRET_KEY=your-super-secret-key-min-32-chars-please-change-in-production  # ⚠️ 請改為隨機字串
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> 💡 **生成安全金鑰**：可使用以下指令生成隨機金鑰
> ```bash
> openssl rand -hex 32
> ```

##### 3. CORS 設定
```env
FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

##### 4. 🔴 SendGrid 電子郵件服務設定（**必要**）

**本專案使用電子郵件驗證機制**，新用戶註冊後必須透過電子郵件驗證才能登入系統。因此 **SendGrid API 為必要設定**。

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx  # ⚠️ 必填
SENDGRID_FROM_EMAIL=noreply@yourdomain.com  # ⚠️ 必填（需在 SendGrid 驗證）
SENDGRID_VERIFICATION_TEMPLATE_ID=d-xxxxxxxxxxxxxxxx  # ⚠️ 必填
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-xxxxxxxxxxxxxxxx  # ⚠️ 必填
```

**如何取得 SendGrid API Key**：

**✅ 步驟 1：註冊 SendGrid 帳號**
1. 前往 [SendGrid 官網](https://sendgrid.com/)
2. 點擊 **Start for Free** 註冊免費帳號
3. 填寫基本資料並驗證電子郵件
4. 完成註冊（**不需要信用卡**）

**✅ 步驟 2：建立 API Key**
1. 登入 SendGrid 後，點擊左側選單 **Settings** → **API Keys**
2. 點擊右上角 **Create API Key** 按鈕
3. 填寫 API Key 名稱（例如：`bookclub-dev`）
4. 選擇 **Full Access**（或至少選擇 Mail Send 權限）
5. 點擊 **Create & View** 生成 API Key
6. **立即複製** API Key（格式：`SG.xxxxxxxxx...`）
   - ⚠️ **重要**：API Key 只會顯示一次，請務必立即複製並保存
7. 貼到 `backend/.env` 的 `SENDGRID_API_KEY` 欄位

**✅ 步驟 3：驗證寄件者電子郵件**
1. 點擊左側選單 **Settings** → **Sender Authentication**
2. 選擇 **Single Sender Verification**（適合開發測試）
3. 點擊 **Create New Sender**
4. 填寫寄件者資訊：
   ```
   From Name: BookClub Platform
   From Email Address: （您的電子郵件，例如：noreply@gmail.com）
   Reply To: （同上，或另一個信箱）
   Company: （可填 "Personal" 或公司名稱）
   Address, City, Country: （隨意填寫）
   ```
5. 點擊 **Save** 後，SendGrid 會發送驗證信到您填寫的信箱
6. 開啟信箱，點擊驗證連結完成驗證
7. 驗證成功後，該信箱會顯示綠色勾勾 ✅
8. 將此信箱填入 `backend/.env` 的 `SENDGRID_FROM_EMAIL`

**✅ 步驟 4：建立電子郵件模板**

**4.1 建立「帳號驗證」模板**
1. 點擊左側選單 **Email API** → **Dynamic Templates**
2. 點擊右上角 **Create a Dynamic Template**
3. 填寫模板名稱：`Account Verification`
4. 點擊 **Create** 後，複製模板 ID（格式：`d-xxxxxxxxx...`）
5. 將模板 ID 填入 `backend/.env` 的 `SENDGRID_VERIFICATION_TEMPLATE_ID`
6. 點擊 **Add Version** → 選擇 **Blank Template** → **Code Editor**
7. 貼上以下 HTML 模板：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4F46E5;">歡迎加入 BookClub！</h2>
    <p>親愛的 {{username}}，</p>
    <p>感謝您註冊 BookClub 線上讀書會平台。請點擊下方按鈕驗證您的帳號：</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{verification_url}}" 
           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            驗證帳號
        </a>
    </div>
    <p style="color: #666; font-size: 14px;">如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
    <p style="color: #4F46E5; word-break: break-all; font-size: 14px;">{{verification_url}}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">此連結將在 24 小時內有效。如果您沒有註冊此帳號，請忽略此郵件。</p>
</body>
</html>
```

8. 點擊 **Save** 儲存模板

**4.2 建立「密碼重置」模板**
1. 回到 **Dynamic Templates** 頁面
2. 重複步驟 2-6，模板名稱改為：`Password Reset`
3. 複製模板 ID 並填入 `backend/.env` 的 `SENDGRID_PASSWORD_RESET_TEMPLATE_ID`
4. 貼上以下 HTML 模板：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4F46E5;">重置您的密碼</h2>
    <p>親愛的 {{username}}，</p>
    <p>我們收到了重置您 BookClub 帳號密碼的請求。請點擊下方按鈕設定新密碼：</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{reset_url}}" 
           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            重置密碼
        </a>
    </div>
    <p style="color: #666; font-size: 14px;">如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
    <p style="color: #4F46E5; word-break: break-all; font-size: 14px;">{{reset_url}}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">此連結將在 1 小時內有效。如果您沒有要求重置密碼，請忽略此郵件，您的密碼將保持不變。</p>
</body>
</html>
```

5. 點擊 **Save** 儲存模板

**✅ 步驟 5：最終檢查 `.env` 設定**

確認 `backend/.env` 包含以下完整設定：
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@example.com
SENDGRID_VERIFICATION_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**✅ 完成！** 您已成功設定 SendGrid，可以開始測試電子郵件功能了。

> **📧 SendGrid 免費方案限制**：
> - 每月可免費發送 **100 封電子郵件**
> - 每日發送上限：100 封
> - 足夠用於開發與測試
> - 無需綁定信用卡
> - 如需更多額度，可升級付費方案或使用多個免費帳號測試

##### 5. Cloudinary 圖片儲存服務（可選）

如果需要使用頭像上傳、讀書會封面等圖片功能，請設定 Cloudinary：

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**如何取得 Cloudinary API**（可選）：
1. 前往 [Cloudinary 官網](https://cloudinary.com/) 註冊免費帳號
2. 登入後在 Dashboard 可看到 Cloud Name、API Key、API Secret
3. 複製這些資訊填入 `.env` 檔案

> 💡 **不設定 Cloudinary**：圖片將儲存在本地 `backend/uploads/` 目錄（適合開發測試）



---

#### ⚠️ 重要提醒

| 項目 | 必要性 | 說明 |
|------|--------|------|
| **SendGrid API** | 🔴 **必要** | 用於帳號驗證、密碼重置等電子郵件功能。**未設定將無法註冊新用戶** |
| **SECRET_KEY** | 🔴 **必要** | JWT 加密金鑰，務必改為強密碼（至少 32 字元） |
| **POSTGRES_PASSWORD** | 🔴 **必要** | 資料庫密碼，務必改為強密碼 |
| **Cloudinary** | 🟡 **可選** | 圖片儲存服務，不設定時圖片存於本地 |
| **Google OAuth** | 🟡 **可選** | Google 登入功能，不設定時僅支援一般註冊登入 |

> **🔒 安全性警告**：
> - 切勿將 `.env` 檔案提交到版本控制系統（已加入 `.gitignore`）
> - 生產環境必須使用強密碼與安全的 API Key
> - 定期更換 SECRET_KEY 與 API Keys

---

#### 💡 開發環境替代方案（不想設定 SendGrid？）

如果您不想立即設定 SendGrid，有以下選擇：

**方案 1：使用雲端測試環境**（🌟 最推薦）
- **網址**：[https://bookclub-frontend-rouge.vercel.app/](https://bookclub-frontend-rouge.vercel.app/)
- **測試帳號**：`TestUser@gmail.com` / 密碼：`TestUser1234`
- **優點**：
  - ✅ 無需任何本地設定或 API Key
  - ✅ 所有功能（SendGrid、Cloudinary）都已完整設定
  - ✅ 可立即體驗完整的註冊、驗證、登入流程
  - ✅ 適合快速體驗與功能測試
- 詳細資訊請見：[雲端測試環境](#-雲端測試環境)

**方案 2：手動修改資料庫**（僅限本地開發環境）
1. 先完成步驟 3～4 啟動後端服務
2. 在前端註冊新帳號（會顯示需要驗證電子郵件）
3. 使用資料庫管理工具（pgAdmin、DBeaver 等）連接到 PostgreSQL
   - Host: `localhost`
   - Port: `5432`
   - Database: `bookclub_db`（依您的設定）
   - User: `postgres`（依您的設定）
   - Password: 您在 `.env` 設定的密碼
4. 開啟 `users` 資料表
5. 找到您剛註冊的帳號，將 `is_verified` 欄位值改為 `true`
6. 返回前端即可登入

> **⚠️ 警告**：方案 2 僅適用於本地開發環境測試，**切勿在生產環境使用**

**方案 3：正式設定 SendGrid**（建議正式開發時使用）
- 按照上述步驟完整設定 SendGrid
- 可測試完整的電子郵件驗證流程
- 免費方案每月 100 封信，足夠開發測試使用

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

### 基本服務檢查

- ✅ **後端 API 文檔可正常訪問**：http://localhost:8000/docs
- ✅ **前端頁面可正常顯示**：http://localhost:5173
- ✅ **Docker 容器正常運行**：執行 `docker-compose ps` 顯示兩個容器為 `Up` 狀態

### 功能測試

- ✅ **註冊功能**：可以在前端註冊新帳號
- ✅ **電子郵件驗證**（如已設定 SendGrid）：
  - 註冊後應收到驗證信
  - 點擊驗證連結後帳號狀態變為已驗證
- ✅ **登入功能**：已驗證的帳號可以正常登入
- ✅ **個人資料**：登入後可查看與編輯個人資料

### 📧 SendGrid 設定確認

如果您已設定 SendGrid，請測試電子郵件功能：

1. **註冊新帳號**
   ```
   前往 http://localhost:5173/register
   填寫註冊表單並提交
   ```

2. **檢查電子郵件**
   - 查看您填寫的電子郵件信箱
   - 應該會收到一封來自 SendGrid 的驗證信
   - 如果沒有收到，檢查垃圾郵件資料夾

3. **驗證帳號**
   - 點擊驗證信中的連結
   - 應該會跳轉到前端並顯示驗證成功訊息

4. **登入測試**
   - 使用已驗證的帳號登入
   - 應該可以成功登入並進入系統

### ⚠️ 常見驗證問題

| 問題 | 可能原因 | 解決方案 |
|------|---------|---------|
| 註冊後顯示「請驗證電子郵件」但未收到信 | SendGrid 未正確設定 | 檢查 `.env` 中的 SendGrid 設定，確認 API Key 正確 |
| 收到驗證信但點擊連結無效 | 前端 URL 設定錯誤 | 確認 SendGrid 模板中的驗證連結格式正確 |
| 已驗證但仍無法登入 | 資料庫狀態未更新 | 檢查資料庫 `users` 表中 `is_verified` 欄位 |
| 完全無法發送郵件 | SendGrid API Key 無效或額度用盡 | 登入 SendGrid 檢查 API Key 狀態與發送額度 |

### 💡 快速測試建議

**如果您已正確設定 SendGrid**：
- 直接測試完整的註冊→驗證→登入流程

**如果您暫時未設定 SendGrid**：
- 先使用「手動修改資料庫」方案完成第一次登入測試
- 確認其他功能正常運作
- 之後再設定 SendGrid 完整測試電子郵件功能

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
bookclub/
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
- [**pgAdmin**](https://www.pgadmin.org/) - 功能完整的 PostgreSQL 管理工具（免費）
- [**DBeaver**](https://dbeaver.io/) - 通用資料庫工具，支援多種資料庫（免費）
- [**TablePlus**](https://tableplus.com/) - 現代化的資料庫管理介面（macOS/Windows）
- [**Postico**](https://eggerapps.at/postico/) - 簡潔的 PostgreSQL 客戶端（macOS）

#### 開發環境：手動驗證帳號（跳過電子郵件驗證）

**⚠️ 僅限本地開發環境使用，切勿在生產環境使用**

如果您暫時沒有設定 SendGrid，可以手動修改資料庫來跳過電子郵件驗證：

**步驟 1：註冊新帳號**
- 在前端註冊頁面 (http://localhost:5173/register) 建立新帳號
- 系統會顯示需要驗證電子郵件的訊息（可以忽略）

**步驟 2：使用資料庫管理工具連接**
1. 開啟您的資料庫管理工具（pgAdmin、DBeaver 等）
2. 建立新的連線，使用以下資訊：
   ```
   Host: localhost
   Port: 5432
   Database: bookclub_db （或您在 .env 中設定的名稱）
   Username: postgres （或您在 .env 中設定的使用者）
   Password: （您在 .env 中的 POSTGRES_PASSWORD）
   ```
3. 測試連線並儲存

**步驟 3：修改驗證狀態**
1. 連接成功後，瀏覽到 `public` schema
2. 開啟 `users` 資料表
3. 找到您剛註冊的帳號（可依 `email` 或 `username` 欄位搜尋）
4. 將該筆紀錄的 `is_verified` 欄位值從 `false` 改為 `true`
5. 儲存變更

**步驟 4：立即登入**
- 返回前端登入頁面 (http://localhost:5173/login)
- 使用註冊的帳號密碼即可成功登入
- 開始測試其他功能

**使用 SQL 指令修改**（適合進階使用者）：
```sql
-- 查看所有未驗證的用戶
SELECT id, username, email, is_verified FROM users WHERE is_verified = false;

-- 修改特定用戶的驗證狀態（請替換 your_email@example.com）
UPDATE users 
SET is_verified = true 
WHERE email = 'your_email@example.com';

-- 確認修改結果
SELECT id, username, email, is_verified FROM users WHERE email = 'your_email@example.com';
```

> **⚠️ 重要警告**：
> - 此方法**僅適用於本地開發環境**進行快速測試
> - **絕對不要在生產環境**使用此方法
> - 正式開發時，建議設定 SendGrid 以測試完整的電子郵件驗證流程
> - 或使用[雲端部署版本](#-部署指南)進行完整功能測試

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

### 🔴 電子郵件驗證相關（最常見問題）

#### ❌ 問題：註冊後無法收到驗證信

**可能原因**：
1. SendGrid API Key 未設定或設定錯誤
2. SendGrid 寄件者電子郵件未驗證
3. SendGrid 電子郵件模板 ID 不正確
4. SendGrid 免費額度已用盡

**解決步驟**：

**步驟 1：檢查 SendGrid API Key**
```bash
# 檢查 backend/.env 檔案
cat backend/.env | grep SENDGRID_API_KEY

# API Key 應該是 SG. 開頭的完整字串
# 正確範例: SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**步驟 2：驗證 SendGrid 設定**
1. 登入 [SendGrid Dashboard](https://app.sendgrid.com/)
2. 前往 **Settings** → **API Keys**，確認 API Key 狀態為 Active
3. 前往 **Settings** → **Sender Authentication**，確認寄件者電子郵件已驗證（綠色勾勾）
4. 前往 **Email API** → **Dynamic Templates**，確認模板 ID 正確

**步驟 3：檢查發送額度**
1. 在 SendGrid Dashboard 查看「Email Activity」
2. 確認免費額度未超過（免費版每月 100 封）

**步驟 4：查看後端日誌**
```bash
cd backend
docker-compose logs -f api | grep -i sendgrid
# 查看是否有 SendGrid 相關錯誤訊息
```

**步驟 5：重啟後端服務**
```bash
cd backend
docker-compose restart api
```

---

#### ❌ 問題：已註冊但無法登入（顯示帳號未驗證）

**原因**：註冊的帳號尚未通過電子郵件驗證

**解決方案**：

**方案 A：正常流程（推薦）**
1. 檢查註冊時填寫的電子郵件信箱
2. 查看收件匣與垃圾郵件資料夾
3. 點擊驗證信中的連結完成驗證

**方案 B：重新發送驗證信**
- 使用 API 文檔手動觸發重新發送（開發中功能）
- 或刪除帳號後重新註冊

**方案 C：手動修改資料庫（僅限開發環境）**
1. 使用資料庫管理工具連接到 PostgreSQL
   ```
   Host: localhost
   Port: 5432
   Database: bookclub_db
   User: postgres
   Password: （您在 .env 設定的密碼）
   ```
2. 開啟 `users` 資料表
3. 找到您的帳號，將 `is_verified` 欄位改為 `true`
4. 儲存後即可登入

> **⚠️ 警告**：方案 C 僅適用於本地開發測試，**絕對不要在生產環境使用**

---

#### ❌ 問題：不想設定 SendGrid，有其他方案嗎？

**方案 1：使用雲端測試環境**（🌟 最推薦，零設定）

**完全不需要本地設定**，立即體驗所有功能：
- **網址**：[https://bookclub-frontend-rouge.vercel.app/](https://bookclub-frontend-rouge.vercel.app/)
- **測試帳號**：`TestUser@gmail.com`
- **測試密碼**：`TestUser1234`
- **優點**：
  - ✅ 無需設定 Docker、Node.js、SendGrid 等任何環境
  - ✅ 所有服務（SendGrid、Cloudinary）都已完整設定
  - ✅ 可測試完整的註冊→驗證→登入流程
  - ✅ 可測試個人資料編輯、頭像上傳等所有功能
  - ✅ 適合快速體驗、展示、功能測試

詳細資訊請見：[雲端測試環境](#-雲端測試環境)

---

**方案 2：臨時使用手動驗證**（僅限本地開發）
1. 先不設定 SendGrid，直接啟動專案
2. 在前端註冊帳號（會顯示需驗證訊息）
3. 使用資料庫管理工具手動將 `is_verified` 改為 `true`
4. 即可正常登入測試其他功能
5. **之後仍建議設定 SendGrid 測試完整流程**

---

**方案 3：設定 SendGrid**（正式開發建議）
- 完整體驗真實的註冊驗證流程
- 免費方案足夠開發測試使用
- 設定步驟詳見「步驟 2: 設定後端環境變數」

---

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

### 🌐 立即體驗

**不想設定環境？** 直接使用我們的[雲端測試環境](https://bookclub-frontend-rouge.vercel.app/)體驗所有功能！

- 測試帳號：`TestUser@gmail.com`
- 測試密碼：`TestUser1234`

---

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
