from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import Optional

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import EventCreate, EventRead, EventUpdate, EventListResponse, EventStatus, EventListItem, EventDetail
from app.services import event_service

router = APIRouter()


@router.post(
    "/clubs/{club_id}/events",
    response_model=EventRead,
    status_code=status.HTTP_201_CREATED,
    summary="建立讀書會活動",
    description="讀書會管理員可以建立活動，填寫活動名稱、時間、會議連結、討論內容等資訊"
)
def create_club_event(
    club_id: int,
    event_data: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> EventRead:
    """
    建立讀書會活動
    
    - **club_id**: 讀書會 ID
    - **event_data**: 活動資料
        - **title**: 活動名稱（1-100 字元）
        - **description**: 活動描述（1-2000 字元）
        - **eventDatetime**: 活動時間（ISO 8601 格式，必須為未來時間）
        - **meetingUrl**: 會議連結（有效 HTTPS URL）
        - **maxParticipants**: 人數上限（選填）
        - **status**: 活動狀態（draft 或 published）
    
    **權限要求**: 需要是讀書會管理員（owner 或 admin）
    
    **錯誤碼**:
    - 400: 活動時間為過去時間或 URL 格式錯誤
    - 403: 非讀書會管理員
    - 404: 讀書會不存在
    """
    try:
        return event_service.create_event(
            session=session,
            current_user=current_user,
            club_id=club_id,
            event_data=event_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"建立活動時發生錯誤: {str(e)}"
        )


@router.get(
    "/clubs/{club_id}/events",
    response_model=EventListResponse,
    summary="查詢讀書會活動列表",
    description="讀書會成員可以查看該會的活動列表，支援分頁和狀態篩選"
)
def get_club_events(
    club_id: int,
    status: Optional[EventStatus] = Query(None, description="活動狀態篩選"),
    page: int = Query(1, ge=1, description="頁碼（從 1 開始）"),
    page_size: int = Query(20, ge=1, le=100, description="每頁筆數（最大 100）"),
    sort_by: str = Query("event_datetime", description="排序欄位"),
    order: str = Query("asc", pattern="^(asc|desc)$", description="排序方向"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> EventListResponse:
    """
    查詢讀書會活動列表
    
    - **club_id**: 讀書會 ID
    - **status**: 活動狀態篩選（選填，預設只顯示 published）
    - **page**: 頁碼（從 1 開始，預設 1）
    - **page_size**: 每頁筆數（1-100，預設 20）
    - **sort_by**: 排序欄位（event_datetime 或 created_at，預設 event_datetime）
    - **order**: 排序方向（asc 或 desc，預設 asc）
    
    **權限要求**: 需要是讀書會成員
    
    **錯誤碼**:
    - 403: 非讀書會成員
    - 404: 讀書會不存在
    """
    try:
        return event_service.list_events(
            session=session,
            current_user=current_user,
            club_id=club_id,
            status_filter=status,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            order=order
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"查詢活動列表時發生錯誤: {str(e)}"
        )


@router.get("/clubs/{club_id}/events/{event_id}", response_model=EventDetail)
def get_club_event_detail(
    club_id: int,
    event_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> EventDetail:
    """
    取得活動詳細資訊
    
    權限：讀書會成員
    """
    return event_service.get_event_detail(
        session=session,
        current_user=current_user,
        club_id=club_id,
        event_id=event_id
    )


@router.post("/clubs/{club_id}/events/{event_id}/join", response_model=EventDetail)
def join_club_event(
    club_id: int,
    event_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> EventDetail:
    """
    加入活動
    
    權限：讀書會成員
    """
    return event_service.join_event(
        session=session,
        current_user=current_user,
        club_id=club_id,
        event_id=event_id
    )


@router.post("/clubs/{club_id}/events/{event_id}/leave", response_model=EventDetail)
def leave_club_event(
    club_id: int,
    event_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> EventDetail:
    """
    退出活動
    
    權限：讀書會成員
    """
    return event_service.leave_event(
        session=session,
        current_user=current_user,
        club_id=club_id,
        event_id=event_id
    )


@router.put(
    "/clubs/{club_id}/events/{event_id}",
    response_model=EventRead,
    summary="更新活動資訊",
    description="活動發起人或讀書會管理員可以更新活動的名稱、時間、描述等資訊"
)
def update_club_event(
    club_id: int,
    event_id: int,
    event_data: EventUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> EventRead:
    """
    更新活動資訊
    
    - **club_id**: 讀書會 ID
    - **event_id**: 活動 ID
    - **event_data**: 更新的活動資料（所有欄位都是選填）
        - **title**: 活動名稱（選填）
        - **description**: 活動描述（選填）
        - **eventDatetime**: 活動時間（選填，必須為未來時間）
        - **meetingUrl**: 會議連結（選填）
        - **maxParticipants**: 人數上限（選填，不能小於目前報名人數）
        - **status**: 活動狀態（選填）
    
    **權限要求**: 活動發起人或讀書會管理員（owner/admin）
    
    **錯誤碼**:
    - 400: 驗證失敗（時間為過去、人數上限小於報名人數等）
    - 403: 非活動發起人或管理員
    - 404: 活動或讀書會不存在
    """
    try:
        return event_service.update_event(
            session=session,
            current_user=current_user,
            club_id=club_id,
            event_id=event_id,
            event_data=event_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新活動時發生錯誤: {str(e)}"
        )


@router.delete(
    "/clubs/{club_id}/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="刪除活動",
    description="活動發起人或讀書會管理員可以刪除尚未開始的活動"
)
def delete_club_event(
    club_id: int,
    event_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    刪除活動
    
    - **club_id**: 讀書會 ID
    - **event_id**: 活動 ID
    
    **權限要求**: 活動發起人或讀書會管理員（owner/admin）
    
    **限制**: 只能刪除尚未開始的活動
    
    **錯誤碼**:
    - 400: 活動已開始，無法刪除
    - 403: 無權限刪除
    - 404: 活動或讀書會不存在
    """
    try:
        event_service.delete_event(
            session=session,
            current_user=current_user,
            club_id=club_id,
            event_id=event_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"刪除活動時發生錯誤: {str(e)}"
        )
