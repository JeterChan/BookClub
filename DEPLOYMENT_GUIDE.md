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
   - **Branch**: `master`
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

2. **(可選但建議) 本地測試打包**：
   
   在部署前先測試打包是否成功：
   
   ```bash
   cd frontend
   
   # 執行打包
   npm run build
   
   # 打包成功會看到：
   # ✓ 1071 modules transformed.
   # dist/index.html    0.45 kB
   # dist/assets/...    (各種 JS/CSS 檔案)
   # ✓ built in X.XXs
   
   # 本地預覽打包結果（模擬生產環境）
   npm run preview
   # 瀏覽器打開 http://localhost:4173 測試
   ```
   
   **注意**：Vercel 會自動執行 `npm run build`，你不需要手動打包並上傳 `dist/` 目錄。

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

#### 選項 1: 使用 Cloudinary（推薦，免費額度充足）

**免費額度**: 25 GB 儲存空間，25 GB 月流量，500,000 次轉換

**完整實作步驟**:

##### 1. 註冊 Cloudinary 帳號

1. 前往 [Cloudinary 官網](https://cloudinary.com/)
2. 點擊 **"Sign Up"** 註冊（可使用 Google/GitHub 快速註冊）
3. 完成註冊後進入 Dashboard

##### 2. 獲取 API 憑證

在 Cloudinary Dashboard 首頁會看到：

```
Cloud name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123
```

**請妥善保存這些資訊！**

##### 3. 安裝 Python 套件

```bash
cd backend
pip install cloudinary
echo "cloudinary" >> requirements.txt
```

##### 4. 設定環境變數

在 **Render Dashboard** → Backend Service → **Environment** 新增：

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | 你的 Cloud Name |
| `CLOUDINARY_API_KEY` | 你的 API Key |
| `CLOUDINARY_API_SECRET` | 你的 API Secret |

本地開發 (`backend/.env`):
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

##### 5. 修改後端程式碼

**A. 創建 Cloudinary 配置檔** (`backend/app/core/cloudinary_config.py`):

```python
import cloudinary
import cloudinary.uploader
from app.core.config import settings

# 初始化 Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file_bytes: bytes, folder: str, public_id: str = None) -> str:
    """
    上傳圖片到 Cloudinary
    
    Args:
        file_bytes: 圖片的 bytes 資料
        folder: Cloudinary 資料夾名稱 (如 'avatars', 'club_covers')
        public_id: 自定義檔案名稱（選填）
    
    Returns:
        圖片的公開 URL
    """
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=f"bookclub/{folder}",
            public_id=public_id,
            resource_type="image",
            # 自動優化圖片
            quality="auto",
            fetch_format="auto"
        )
        return result['secure_url']
    except Exception as e:
        raise Exception(f"Failed to upload image to Cloudinary: {str(e)}")


def delete_image(public_id: str) -> bool:
    """
    從 Cloudinary 刪除圖片
    
    Args:
        public_id: 完整的 public_id (包含 folder 路徑)
    
    Returns:
        是否刪除成功
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Failed to delete image: {str(e)}")
        return False
```

**B. 更新配置檔** (`backend/app/core/config.py`):

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... 現有設定 ...
    
    # Cloudinary 設定
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    class Config:
        env_file = ".env"
```

**C. 修改頭像上傳端點** (`backend/app/api/endpoints/users.py`):

```python
from app.core.cloudinary_config import upload_image, delete_image

@router.post("/me/avatar", response_model=UserProfileRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """上傳使用者頭像到 Cloudinary"""
    
    # 驗證檔案類型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="檔案必須是圖片格式")
    
    # 驗證檔案大小 (2MB)
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="圖片大小不能超過 2MB")
    
    try:
        # 上傳到 Cloudinary
        avatar_url = upload_image(
            file_bytes=content,
            folder="avatars",
            public_id=f"user_{current_user.id}"
        )
        
        # 更新資料庫
        current_user.avatar_url = avatar_url
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")
```

**D. 修改讀書會封面上傳** (類似邏輯):

```python
@router.post("/{club_id}/cover", response_model=BookClubRead)
async def upload_club_cover(
    club_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """上傳讀書會封面到 Cloudinary"""
    
    # 驗證權限（必須是擁有者或管理員）
    # ... 權限檢查邏輯 ...
    
    # 驗證檔案
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="檔案必須是圖片格式")
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="圖片大小不能超過 5MB")
    
    try:
        # 上傳到 Cloudinary
        cover_url = upload_image(
            file_bytes=content,
            folder="club_covers",
            public_id=f"club_{club_id}"
        )
        
        # 更新資料庫
        club.cover_image_url = cover_url
        session.add(club)
        session.commit()
        session.refresh(club)
        
        return club
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")
```

##### 6. 測試 Cloudinary 整合

```bash
# 本地測試
cd backend
python -c "
from app.core.cloudinary_config import upload_image
with open('test_image.jpg', 'rb') as f:
    url = upload_image(f.read(), 'test', 'test_upload')
    print(f'Uploaded: {url}')
"
```

##### 7. 部署到 Render

```bash
git add .
git commit -m "Add Cloudinary integration"
git push origin master
```

Render 會自動重新部署並套用新的環境變數。

---

#### 選項 2: 使用 Google Cloud Storage（適合大規模應用）

**免費額度**: 5 GB 儲存空間，1 GB 月出站流量

**完整實作步驟**:

##### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊頂部的專案選單 → **"New Project"**
3. 輸入專案名稱（如 `bookclub-storage`）
4. 點擊 **"Create"**

##### 2. 啟用 Cloud Storage API

1. 在左側選單選擇 **"APIs & Services"** → **"Library"**
2. 搜尋 **"Cloud Storage API"**
3. 點擊並啟用

##### 3. 建立 Storage Bucket

1. 左側選單選擇 **"Cloud Storage"** → **"Buckets"**
2. 點擊 **"Create Bucket"**
3. 設定：
   - **Name**: `bookclub-images-[unique-suffix]`（必須全球唯一）
   - **Location type**: Region（選擇最近的區域）
   - **Storage class**: Standard
   - **Access control**: Fine-grained
   - **Protection tools**: None（測試用）
4. 點擊 **"Create"**

##### 4. 建立 Service Account

1. 左側選單 → **"IAM & Admin"** → **"Service Accounts"**
2. 點擊 **"Create Service Account"**
3. 填寫：
   - **Name**: `bookclub-storage-uploader`
   - **Description**: `Service account for uploading images`
4. 點擊 **"Create and Continue"**
5. 授予角色：
   - 選擇 **"Storage Object Admin"**
6. 點擊 **"Done"**

##### 5. 建立並下載金鑰

1. 找到剛建立的 Service Account → 點擊 email
2. 切換到 **"Keys"** 標籤
3. 點擊 **"Add Key"** → **"Create new key"**
4. 選擇 **JSON** 格式
5. 點擊 **"Create"** → 自動下載 JSON 檔案

**⚠️ 重要**: 妥善保管此 JSON 檔案，它包含敏感憑證！

##### 6. 設定 Bucket 公開存取

1. 回到 Bucket 頁面 → 點擊你的 Bucket
2. 切換到 **"Permissions"** 標籤
3. 點擊 **"Grant Access"**
4. 新增成員：
   - **New principals**: `allUsers`
   - **Role**: Storage Object Viewer
5. 點擊 **"Save"**

這樣上傳的圖片才能被公開訪問。

##### 7. 安裝 Python 套件

```bash
cd backend
pip install google-cloud-storage
echo "google-cloud-storage" >> requirements.txt
```

##### 8. 設定環境變數

**Render 環境變數**（Dashboard → Environment）:

| Key | Value |
|-----|-------|
| `GCS_BUCKET_NAME` | 你的 Bucket 名稱 |
| `GCS_CREDENTIALS_JSON` | 將下載的 JSON 檔案內容**完整複製貼上**（整個 JSON 字串）|

**本地開發** (`backend/.env`):
```env
GCS_BUCKET_NAME=bookclub-images-xxxxx
GCS_CREDENTIALS_PATH=path/to/your/service-account-key.json
```

##### 9. 修改後端程式碼

**A. 創建 GCS 配置檔** (`backend/app/core/gcs_config.py`):

```python
import os
import json
from google.cloud import storage
from google.oauth2 import service_account
from app.core.config import settings

def get_gcs_client():
    """初始化 Google Cloud Storage 客戶端"""
    
    # 生產環境（Render）：從環境變數讀取 JSON 字串
    if hasattr(settings, 'GCS_CREDENTIALS_JSON') and settings.GCS_CREDENTIALS_JSON:
        credentials_dict = json.loads(settings.GCS_CREDENTIALS_JSON)
        credentials = service_account.Credentials.from_service_account_info(
            credentials_dict
        )
        return storage.Client(credentials=credentials)
    
    # 本地開發：從檔案路徑讀取
    elif hasattr(settings, 'GCS_CREDENTIALS_PATH') and settings.GCS_CREDENTIALS_PATH:
        credentials = service_account.Credentials.from_service_account_file(
            settings.GCS_CREDENTIALS_PATH
        )
        return storage.Client(credentials=credentials)
    
    else:
        raise Exception("GCS credentials not configured")


def upload_image_to_gcs(file_bytes: bytes, filename: str, folder: str) -> str:
    """
    上傳圖片到 Google Cloud Storage
    
    Args:
        file_bytes: 圖片的 bytes 資料
        filename: 檔案名稱
        folder: GCS 資料夾路徑 (如 'avatars', 'club_covers')
    
    Returns:
        圖片的公開 URL
    """
    try:
        client = get_gcs_client()
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        
        # 完整路徑
        blob_path = f"{folder}/{filename}"
        blob = bucket.blob(blob_path)
        
        # 上傳檔案
        blob.upload_from_string(
            file_bytes,
            content_type='image/jpeg'  # 根據實際檔案類型調整
        )
        
        # 設定為公開可讀
        blob.make_public()
        
        # 返回公開 URL
        return blob.public_url
        
    except Exception as e:
        raise Exception(f"Failed to upload to GCS: {str(e)}")


def delete_image_from_gcs(blob_path: str) -> bool:
    """
    從 GCS 刪除圖片
    
    Args:
        blob_path: 完整的 blob 路徑 (如 'avatars/user_123.jpg')
    
    Returns:
        是否刪除成功
    """
    try:
        client = get_gcs_client()
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        blob = bucket.blob(blob_path)
        blob.delete()
        return True
    except Exception as e:
        print(f"Failed to delete from GCS: {str(e)}")
        return False
```

**B. 更新配置檔** (`backend/app/core/config.py`):

```python
from typing import Optional

class Settings(BaseSettings):
    # ... 現有設定 ...
    
    # Google Cloud Storage 設定
    GCS_BUCKET_NAME: Optional[str] = None
    GCS_CREDENTIALS_JSON: Optional[str] = None  # 生產環境
    GCS_CREDENTIALS_PATH: Optional[str] = None  # 本地開發
    
    class Config:
        env_file = ".env"
```

**C. 修改上傳端點** (使用 GCS):

```python
from app.core.gcs_config import upload_image_to_gcs
import uuid

@router.post("/me/avatar", response_model=UserProfileRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """上傳使用者頭像到 Google Cloud Storage"""
    
    # 驗證檔案
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="檔案必須是圖片格式")
    
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="圖片大小不能超過 2MB")
    
    try:
        # 生成唯一檔名
        file_extension = file.filename.split('.')[-1]
        filename = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # 上傳到 GCS
        avatar_url = upload_image_to_gcs(
            file_bytes=content,
            filename=filename,
            folder="avatars"
        )
        
        # 更新資料庫
        current_user.avatar_url = avatar_url
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")
```

##### 10. 測試 GCS 整合

```bash
# 本地測試
cd backend
python -c "
from app.core.gcs_config import upload_image_to_gcs
with open('test_image.jpg', 'rb') as f:
    url = upload_image_to_gcs(f.read(), 'test.jpg', 'test')
    print(f'Uploaded: {url}')
"
```

##### 11. 部署到 Render

```bash
git add .
git commit -m "Add Google Cloud Storage integration"
git push origin master
```

---

#### 選項 3: 暫時禁用圖片上傳

如果只是測試，可以暫時使用預設圖片或禁用上傳功能。

#### 選項 4: 使用 Render Disk（付費）

升級到 Render 付費方案（$7/月起）可以使用持久化儲存。

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

## ❓ 常見問題 (FAQ)

### Q: 部署前需要手動執行 `npm run build` 嗎？

**A**: **不需要**。Vercel 會自動執行打包流程：

1. 自動偵測到 Vite 專案
2. 執行 `npm install` 安裝依賴
3. 執行 `npm run build` 打包應用
4. 部署 `dist/` 目錄到 CDN

但**建議在部署前本地測試打包**，確保沒有錯誤：

```bash
cd frontend
npm run build        # 測試打包
npm run preview      # 預覽打包結果
```

### Q: 為什麼 `build` script 不執行 TypeScript 檢查？

**A**: 專案的 `build` script 設定為：

```json
"build": "vite build"
"build:check": "tsc -b && vite build"  // 有類型檢查的版本
```

這是為了：
- **快速部署**：跳過 TypeScript 檢查，加速建置時間
- **避免測試檔案錯誤**：測試檔案的類型錯誤不會阻擋部署
- **運行時安全**：Vite 仍會轉譯 TypeScript，只是不做嚴格類型檢查

如果需要類型檢查，可以在本地執行 `npm run build:check`。

### Q: `dist/` 目錄需要提交到 Git 嗎？

**A**: **不需要**。`dist/` 是打包產物，已在 `.gitignore` 中忽略。Vercel 會在雲端重新打包，不需要提交打包後的檔案。

### Q: Vercel 如何知道要打包什麼？

**A**: Vercel 讀取 `package.json` 的 `build` script：

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

並自動偵測 Vite 的配置（`vite.config.ts`），知道輸出目錄是 `dist/`。

### Q: 打包後的檔案大小是多少？

**A**: 以本專案為例：
- **原始大小**: ~314 KB (index.js)
- **Gzip 壓縮後**: ~104 KB
- **總體資產**: ~600 KB (包含 CSS、圖片等)

Vite 會自動：
- 程式碼分割 (Code Splitting)
- Tree Shaking (移除未使用的程式碼)
- 壓縮與最小化
- 現代瀏覽器優化

### Q: `vercel.json` 中的 `env` 區塊是什麼？

**A**: `vercel.json` 的 `env` 區塊用於引用 Vercel Secrets，語法是：

```json
"env": {
  "VITE_API_BASE_URL": "@secret_name"
}
```

`@secret_name` 引用的是在 Vercel Dashboard 創建的 Secret。

**但不推薦這種方式**，因為：
- 需要額外創建 Secret
- 設定較複雜
- 直接在 Dashboard 設定環境變數更直觀

**推薦做法**：
1. 移除 `vercel.json` 的 `env` 區塊
2. 直接在 Vercel Dashboard → Settings → Environment Variables 設定
3. 這樣更靈活，可以針對不同環境（Production / Preview / Development）設定不同值

### Q: `vercel.json` 是必要的嗎？

**A**: 對於 SPA（單頁應用）是**必要的**，但可以很簡單：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

這確保所有路由（如 `/clubs/123`）都返回 `index.html`，讓 React Router 處理前端路由。

**不需要的欄位**（Vercel 會自動偵測）：
- `buildCommand`
- `outputDirectory`  
- `framework`

---

## 🆘 需要幫助？

如果遇到問題：
1. 查看本指南的「疑難排解」章節
2. 檢查 Render 和 Vercel 的日誌
3. 查閱官方文件
4. 在專案 Issues 中回報問題

祝部署順利！🚀
