from fastapi import FastAPI
from app.api.api import api_router

app = FastAPI(title="Book Club API")

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Book Club API"}