from fastapi import APIRouter
from .endpoints import auth, users, interest_tags, dashboard, book_clubs, club_members, discussions, events, user_events, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(user_events.router, prefix="/users", tags=["user-events"])
api_router.include_router(interest_tags.router, prefix="/interest-tags", tags=["interest-tags"])
api_router.include_router(dashboard.router, prefix="/users", tags=["dashboard"])
api_router.include_router(book_clubs.router, prefix="/clubs", tags=["book-clubs"])
api_router.include_router(club_members.router, prefix="/clubs", tags=["club-management"])
api_router.include_router(discussions.router, prefix="/clubs", tags=["discussions"])
api_router.include_router(events.router, prefix="", tags=["events"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
