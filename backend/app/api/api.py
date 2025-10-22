from fastapi import APIRouter
from .endpoints import auth, users, interest_tags, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interest_tags.router, prefix="/interest-tags", tags=["interest-tags"])
api_router.include_router(dashboard.router, prefix="/users", tags=["dashboard"])
