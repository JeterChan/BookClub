# 📦 BookClub 部署指南

本指南將帶你完成將 Backend 部署到 Render，Frontend 部署到 Vercel 的完整流程。

---

## 🎯 部署架構

- **Backend (FastAPI)**: Render (Free Tier)
- **Database (PostgreSQL)**: Render PostgreSQL (Free Tier)
- **Frontend (React + Vite)**: Vercel (Free Tier)

---

## 📋 前置準備

### 1. 確認帳號
- [ ] GitHub 帳號（用於連接 Render 和 Vercel）
- [ ] [Render 帳號](https://render.com/) - 註冊並登入
- [ ] [Vercel 帳號](https://vercel.com/) - 註冊並登入

### 2. 推送程式碼到 GitHub
```bash
# 確認所有變更都已提交
git status

# 提交尚未提交的變更
git add .
git commit -m "Prepare for deployment"

# 推送到 GitHub
git push origin feature/backend
```

---

## 🚀 Part 1: 部署 Backend 到 Render

### 步驟 1: 創建 PostgreSQL 資料庫

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 **"New +"** → 選擇 **"PostgreSQL"**
3. 填寫資料庫設定：
   - **Name**: `bookclub-db`
   - **Database**: `bookclub_db`
   - **User**: `bookclub_user`
   - **Region**: 選擇最近的區域（建議 Oregon）
   - **Plan**: 選擇 **Free**
4. 點擊 **"Create Database"**
5. 等待資料庫建立完成（約 1-2 分鐘）
6. **重要**: 記錄以下資訊（在 Database 詳細頁面的 "Connections" 區塊）：
   - **Internal Database URL** (給 Render 服務使用)
   - **External Database URL** (選填，供本地連接測試)

### 步驟 2: 部署 Backend Web Service

1. 回到 Render Dashboard，點擊 **"New +"** → 選擇 **"Web Service"**
2. 連接你的 GitHub Repository：
   - 選擇 **"Build and deploy from a Git repository"**
   - 點擊 **"Connect GitHub"** 並授權 Render 訪問你的倉庫
   - 選擇 **BookClub** repository
3. 配置 Web Service：
   - **Name**: `bookclub-backend`
   - **Region**: 與資料庫相同區域（Oregon）
   - **Branch**: `feature/backend`
   - **Root Directory**: `backend`
   - **Runtime**: **Python 3**
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: 選擇 **Free**

4. 設定環境變數（點擊 **"Environment"** 或 **"Advanced"**）：
   
   新增以下環境變數：

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | 從步驟 1 複製的 **Internal Database URL** |
   | `SECRET_KEY` | 生成一個隨機密鑰（見下方指令）|
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
   | `PYTHON_VERSION` | `3.11.0` |
   | `FRONTEND_URL` | 稍後填寫 Vercel URL（暫時留空）|

   **生成 SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   複製輸出的密鑰並貼到 `SECRET_KEY` 欄位

5. 點擊 **"Create Web Service"**

6. 等待部署完成（首次部署約 5-10 分鐘）
   - 可以在 "Logs" 查看部署進度
   - 看到 `Uvicorn running on http://0.0.0.0:XXXX` 表示成功

7. **記錄 Backend URL**:
   - 部署成功後，在服務頁面頂部會顯示 URL
   - 格式: `https://bookclub-backend-xxxx.onrender.com`
   - **複製這個 URL**，稍後 Frontend 會用到

8. **測試 Backend**:
   ```bash
   curl https://your-backend-url.onrender.com/
   # 應該返回: {"message":"Welcome to the Book Club API"}
   ```

### ⚠️ Render Free Tier 注意事項

- **冷啟動**: Free tier 服務閒置 15 分鐘後會休眠，下次訪問需要 30-60 秒喚醒
- **每月限制**: 750 小時免費運行時間（足夠單一服務全月運行）
- **資料庫**: PostgreSQL Free tier 在 90 天後會過期（需要重新創建）

---

## 🎨 Part 2: 部署 Frontend 到 Vercel

### 步驟 1: 準備 Frontend

1. 確認 `frontend/.env.example` 已創建（已完成）

### 步驟 2: 部署到 Vercel

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - 點擊 **"Import Git Repository"**
   - 選擇你的 **BookClub** repository
   - 點擊 **"Import"**

4. 配置專案設定：
   - **Project Name**: `bookclub-frontend`（或你喜歡的名稱）
   - **Framework Preset**: Vite（應該會自動偵測）
   - **Root Directory**: 點擊 **"Edit"** → 選擇 `frontend`
   - **Build Command**: `npm run build`（預設）
   - **Output Directory**: `dist`（預設）
   - **Install Command**: `npm install`（預設）

5. **設定環境變數**（重要！）:
   
   點擊 **"Environment Variables"** 展開，新增：

   | Name | Value |
   |------|-------|
   | `VITE_API_BASE_URL` | 從 Part 1 步驟 7 複製的 Backend URL<br/>例如: `https://bookclub-backend-xxxx.onrender.com` |

6. 點擊 **"Deploy"**

7. 等待部署完成（首次約 2-3 分鐘）
   - Vercel 會自動安裝依賴、執行 build 並部署

8. **記錄 Frontend URL**:
   - 部署成功後會顯示預覽畫面
   - 點擊 **"Visit"** 或複製 URL
   - 格式: `https://bookclub-frontend-xxxx.vercel.app`

### 步驟 3: 更新 Backend CORS 設定

1. 回到 **Render Dashboard** → 你的 Backend Service
2. 進入 **"Environment"** 設定
3. 新增或更新環境變數：
   
   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | 從步驟 2.8 複製的 **Vercel URL** |

4. 儲存後 Render 會自動重新部署（約 1-2 分鐘）

### 步驟 4: 測試完整應用

1. 開啟你的 Vercel URL: `https://bookclub-frontend-xxxx.vercel.app`
2. 測試以下功能：
   - ✅ 註冊新帳號
   - ✅ 登入
   - ✅ 瀏覽讀書會
   - ✅ 創建讀書會（如果需要上傳圖片，見下方 "圖片上傳" 章節）

---

## 📸 圖片上傳處理（重要！）

### 問題說明

目前程式碼將圖片儲存在本地 `uploads/` 目錄，但 Render Free tier 的檔案系統是**臨時性的**（重新部署後會消失）。

### 解決方案選項

#### 選項 1: 使用雲端儲存服務（推薦）

**推薦使用 Cloudinary**（免費額度充足）:

1. 註冊 [Cloudinary](https://cloudinary.com/)
2. 獲取 API 憑證（Cloud Name, API Key, API Secret）
3. 安裝套件:
   ```bash
   cd backend
   pip install cloudinary
   echo "cloudinary" >> requirements.txt
   ```
4. 修改程式碼以使用 Cloudinary 上傳

**其他選項**: AWS S3, Google Cloud Storage, Azure Blob Storage

#### 選項 2: 暫時禁用圖片上傳

如果只是測試，可以暫時使用預設圖片或禁用上傳功能。

#### 選項 3: 使用 Render Disk（付費）

升級到 Render 付費方案可以使用持久化儲存。

---

## 🔄 後續更新流程

### 更新 Backend

```bash
# 1. 修改程式碼
git add .
git commit -m "Update backend"
git push origin feature/backend

# 2. Render 會自動偵測並重新部署
```

### 更新 Frontend

```bash
# 1. 修改程式碼
git add .
git commit -m "Update frontend"  
git push origin feature/backend

# 2. Vercel 會自動偵測並重新部署
```

### 手動觸發部署

- **Render**: Dashboard → 你的服務 → 點擊 "Manual Deploy" → "Deploy latest commit"
- **Vercel**: Dashboard → 你的專案 → "Deployments" → 點擊最新的 commit 旁邊的 "Redeploy"

---

## 🐛 疑難排解

### Backend 部署失敗

#### 檢查 Logs
1. Render Dashboard → 你的服務 → "Logs"
2. 常見錯誤：
   - **ModuleNotFoundError**: 檢查 `requirements.txt` 是否包含所有依賴
   - **Database connection error**: 檢查 `DATABASE_URL` 環境變數
   - **Alembic migration failed**: 手動執行 migration（見下方）

#### 手動執行 Database Migration
```bash
# 在 Render Dashboard 中打開 Shell
# 服務頁面 → "Shell" 標籤

alembic upgrade head
```

### Frontend 無法連接 Backend

1. **檢查環境變數**: Vercel Dashboard → 專案 → "Settings" → "Environment Variables"
   - 確認 `VITE_API_BASE_URL` 正確設定
2. **檢查 CORS**: 
   - 開啟瀏覽器開發者工具 → Console
   - 查看是否有 CORS 錯誤
   - 確認 Backend 的 `FRONTEND_URL` 環境變數正確
3. **重新部署 Frontend**:
   ```bash
   # 修改任意檔案觸發重新部署
   git commit --allow-empty -m "Redeploy"
   git push
   ```

### Render Free Tier 休眠問題

**症狀**: 首次訪問時 Frontend 顯示 "Network Error" 或超時

**解決方法**:
1. 等待 30-60 秒讓 Render 喚醒服務
2. 重新整理頁面

**防止休眠**（選填）:
- 使用 cron job 服務定期 ping Backend（如 [cron-job.org](https://cron-job.org/)）
- 設定每 10 分鐘訪問一次 `https://your-backend-url.onrender.com/`

---

## 📊 監控與維護

### Render 監控
- **Dashboard**: 查看服務狀態、CPU、記憶體使用
- **Logs**: 即時查看應用程式日誌
- **Metrics**: 查看請求數、響應時間

### Vercel 監控  
- **Analytics**: 查看訪問統計（需啟用）
- **Deployment Logs**: 查看建置日誌
- **Runtime Logs**: 查看 Edge Functions 執行日誌

---

## 🎓 最佳實踐

1. **使用環境變數**: 絕不將敏感資訊（密鑰、密碼）寫死在程式碼中
2. **分支策略**: 
   - `main/master`: 生產環境
   - `staging`: 測試環境
   - `feature/*`: 功能開發
3. **監控錯誤**: 整合 Sentry 或其他錯誤追蹤服務
4. **自動化測試**: 在 CI/CD 中加入測試（GitHub Actions）
5. **備份資料庫**: 定期備份 PostgreSQL（Render 提供手動備份功能）

---

## 📚 相關文件

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## ✅ 部署檢查清單

### Backend (Render)
- [ ] PostgreSQL 資料庫已創建
- [ ] Backend Service 已創建
- [ ] 所有環境變數已設定
- [ ] 資料庫 migration 成功執行
- [ ] API 端點可訪問（測試 `/` 端點）
- [ ] `FRONTEND_URL` 已設定為 Vercel URL

### Frontend (Vercel)
- [ ] 專案已從 GitHub 匯入
- [ ] Root Directory 設定為 `frontend`
- [ ] `VITE_API_BASE_URL` 環境變數已設定
- [ ] 部署成功完成
- [ ] 可以訪問首頁
- [ ] 可以成功註冊/登入

### 功能測試
- [ ] 使用者註冊與登入
- [ ] Dashboard 正常顯示
- [ ] 讀書會列表載入
- [ ] 討論區功能運作
- [ ] 個人資料更新

---

## 🆘 需要幫助？

如果遇到問題：
1. 查看本指南的「疑難排解」章節
2. 檢查 Render 和 Vercel 的日誌
3. 查閱官方文件
4. 在專案 Issues 中回報問題

祝部署順利！🚀
