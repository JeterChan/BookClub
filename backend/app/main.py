from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.api.api import api_router
from app.models.user import UserProfileRead
from app.models.interest_tag import InterestTagRead
import os
import re

app = FastAPI(title="Book Club API")

# CORS 設定
origins = [
    "http://localhost:5173",  # Vite 預設 port
    "http://localhost:5174",  # 備用 port
    "http://localhost:5175",  # 備用 port
    "http://localhost:3000",  # 常見的前端 port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:3000",
]

# 生產環境：從環境變數讀取允許的前端 URL（支援多個 URL，用逗號分隔）
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # 支援多個 URL，用逗號或空格分隔
    frontend_urls = [url.strip() for url in frontend_url.replace(',', ' ').split() if url.strip()]
    origins.extend(frontend_urls)
    print(f"✅ Loaded frontend URLs: {frontend_urls}")

# Vercel 專案名稱（從環境變數讀取）
vercel_project_name = os.getenv("VERCEL_PROJECT_NAME", "")

# 自訂 CORS 驗證函數
def is_allowed_origin(origin: str) -> bool:
    """驗證來源是否被允許"""
    # 檢查是否在允許清單中
    if origin in origins:
        return True
    
    # 檢查是否為 Vercel deployment URLs
    if vercel_project_name:
        # 支援以下 Vercel URL 格式：
        # 1. Production: https://project-name.vercel.app
        # 2. Preview: https://project-name-git-branch.vercel.app
        # 3. Unique: https://project-name-xxxx.vercel.app
        vercel_patterns = [
            rf"^https://{re.escape(vercel_project_name)}\.vercel\.app$",
            rf"^https://{re.escape(vercel_project_name)}-[a-z0-9-]+\.vercel\.app$",
        ]
        for pattern in vercel_patterns:
            if re.match(pattern, origin):
                print(f"✅ Matched Vercel origin: {origin}")
                return True
    
    # 開發模式：允許所有 Vercel preview deployments（僅用於測試）
    if os.getenv("ALLOW_ALL_VERCEL", "false").lower() == "true":
        vercel_pattern = r"^https://.*\.vercel\.app$"
        if re.match(vercel_pattern, origin):
            print(f"⚠️ Allowed Vercel preview (dev mode): {origin}")
            return True
    
    print(f"❌ Rejected origin: {origin}")
    return False

# 決定是否使用萬用字元（當設定 Vercel 或 dev mode 時）
use_wildcard = bool(vercel_project_name) or os.getenv("ALLOW_ALL_VERCEL", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if use_wildcard else origins,  # 如果需要動態驗證則用 *
    allow_credentials=True,  # 允許 cookies
    allow_methods=["*"],     # 允許所有 HTTP 方法 (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],     # 允許所有 headers
)

# 如果使用萬用字元，加入自訂驗證中間件
if use_wildcard:
    class CORSValidationMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            origin = request.headers.get("origin")
            if origin and not is_allowed_origin(origin):
                # 記錄被拒絕的來源（但仍允許請求通過，由 CORS middleware 處理）
                print(f"⚠️ Warning: Unexpected origin: {origin}")
            response = await call_next(request)
            return response
    
    app.add_middleware(CORSValidationMiddleware)

# 掛載靜態檔案目錄
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix="/api/v1")

# 解析 Pydantic/SQLModel 中的前向參照 (Pydantic v2)
UserProfileRead.model_rebuild()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Club API"}