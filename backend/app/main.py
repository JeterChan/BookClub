from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.models.user import UserProfileRead
from app.models.interest_tag import InterestTagRead

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允許的來源
    allow_credentials=True,  # 允許 cookies
    allow_methods=["*"],     # 允許所有 HTTP 方法 (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],     # 允許所有 headers
)

# 掛載靜態檔案目錄
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix="/api/v1")

# 解析 Pydantic/SQLModel 中的前向參照 (Pydantic v2)
UserProfileRead.model_rebuild()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Club API"}