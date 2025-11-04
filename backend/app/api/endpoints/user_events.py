from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import EventStatus
from app.schemas.user_event import PaginatedUserEventList
from app.services.user_event_service import get_user_club_events

router = APIRouter()


@router.get("/me/events", response_model=PaginatedUserEventList)
def get_my_club_events(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="頁碼（從 1 開始）"),
    page_size: int = Query(20, ge=1, le=100, description="每頁項目數"),
    status: Optional[EventStatus] = Query(None, description="活動狀態篩選"),
    participation: Optional[str] = Query(
        None, 
        description="參與狀態篩選 (all/registered/not_registered)"
    ),
    club_id: Optional[int] = Query(None, description="讀書會 ID 篩選")
):
    """
    獲取當前使用者參與讀書會的所有活動
    
    - 包含使用者所有讀書會的活動
    - 可依狀態、參與情況、讀書會篩選
    - 支援分頁
    """
    events, pagination = get_user_club_events(
        session=session,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        status=status,
        participation=participation,
        club_id=club_id
    )
    
    return PaginatedUserEventList(
        items=events,
        pagination=pagination
    )
