from typing import Optional
from datetime import datetime
from sqlmodel import Session, select, func, col
from fastapi import HTTPException, status
import re
import math

from app.models.event import (
    Event, EventCreate, EventRead, EventStatus, 
    EventParticipant, ParticipantStatus,
    EventListItem, EventListResponse, PaginationMetadata, OrganizerInfo
)
from app.models.book_club_member import BookClubMember
from app.models.user import User


def validate_event_datetime(event_datetime: datetime) -> None:
    """驗證活動時間必須為未來時間"""
    if event_datetime <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活動時間必須為未來時間"
        )


def validate_meeting_url(meeting_url: str) -> None:
    """
    驗證會議連結格式
    支援：Google Meet, Zoom, Microsoft Teams, 其他 HTTPS URL
    """
    # 基本 URL 格式驗證
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    
    if not url_pattern.match(meeting_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="會議連結格式無效，必須為有效的 URL"
        )
    
    # 確保是 HTTPS（更安全）
    if not meeting_url.startswith('https://'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="會議連結必須使用 HTTPS 協議"
        )


def create_event(
    session: Session,
    current_user: User,
    club_id: int,
    event_data: EventCreate
) -> EventRead:
    """
    建立讀書會活動
    
    Args:
        session: 資料庫 session
        current_user: 當前用戶
        club_id: 讀書會 ID
        event_data: 活動資料
        
    Returns:
        EventRead: 建立的活動資料
        
    Raises:
        HTTPException: 403 - 非讀書會成員
        HTTPException: 404 - 讀書會不存在
        HTTPException: 400 - 活動時間為過去時間或 URL 格式錯誤
    """
    # 驗證用戶是讀書會成員
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == club_id)
        .where(BookClubMember.user_id == current_user.id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有讀書會成員可以建立活動"
        )
    
    # 驗證活動時間為未來時間
    validate_event_datetime(event_data.event_datetime)
    
    # 驗證會議 URL 格式
    validate_meeting_url(event_data.meeting_url)
    
    # 建立 Event 實例
    event = Event(
        club_id=club_id,
        title=event_data.title,
        description=event_data.description,
        event_datetime=event_data.event_datetime,
        meeting_url=event_data.meeting_url,
        organizer_id=current_user.id,
        max_participants=event_data.max_participants,
        status=event_data.status
    )
    
    session.add(event)
    session.commit()
    session.refresh(event)
    
    # 若 status = 'published'，觸發通知
    if event.status == EventStatus.PUBLISHED:
        from app.services.notification_service import notify_event_created
        notify_event_created(session, event)
    
    # 返回 EventRead 資料
    return EventRead(
        id=event.id,
        club_id=event.club_id,
        title=event.title,
        description=event.description,
        event_datetime=event.event_datetime,
        meeting_url=event.meeting_url,
        organizer_id=event.organizer_id,
        max_participants=event.max_participants,
        status=event.status,
        created_at=event.created_at,
        updated_at=event.updated_at,
        participant_count=0  # 新建活動，參與人數為 0
    )


def list_events(
    session: Session,
    current_user: User,
    club_id: int,
    status_filter: Optional[EventStatus] = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "event_datetime",
    order: str = "asc"
) -> EventListResponse:
    """
    查詢讀書會活動列表
    
    Args:
        session: 資料庫 session
        current_user: 當前用戶
        club_id: 讀書會 ID
        status_filter: 活動狀態篩選（None = 只顯示 published）
        page: 頁碼（從 1 開始）
        page_size: 每頁筆數（最大 100）
        sort_by: 排序欄位
        order: 排序方向（asc/desc）
        
    Returns:
        EventListResponse: 活動列表 + 分頁資訊
        
    Raises:
        HTTPException: 403 - 非讀書會成員
        HTTPException: 404 - 讀書會不存在
    """
    # 驗證用戶是讀書會成員
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == club_id)
        .where(BookClubMember.user_id == current_user.id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有讀書會成員可以查看活動列表"
        )
    
    # 限制 page_size 最大值
    page_size = min(page_size, 100)
    
    # 建立基礎查詢
    query = select(Event).where(Event.club_id == club_id)
    
    # 狀態篩選（預設只顯示 published）
    if status_filter:
        query = query.where(Event.status == status_filter)
    else:
        query = query.where(Event.status == EventStatus.PUBLISHED)
    
    # 計算總數
    count_query = select(func.count()).select_from(Event).where(Event.club_id == club_id)
    if status_filter:
        count_query = count_query.where(Event.status == status_filter)
    else:
        count_query = count_query.where(Event.status == EventStatus.PUBLISHED)
    
    total_items = session.exec(count_query).one()
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0
    
    # 排序
    if sort_by == "event_datetime":
        if order == "desc":
            query = query.order_by(col(Event.event_datetime).desc())
        else:
            query = query.order_by(col(Event.event_datetime).asc())
    elif sort_by == "created_at":
        if order == "desc":
            query = query.order_by(col(Event.created_at).desc())
        else:
            query = query.order_by(col(Event.created_at).asc())
    
    # 分頁
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # 執行查詢
    events = session.exec(query).all()
    
    # 組裝回應資料
    items = []
    for event in events:
        # 查詢發起人資訊
        organizer = session.get(User, event.organizer_id)
        
        # 計算目前參與人數
        participant_count = session.exec(
            select(func.count())
            .select_from(EventParticipant)
            .where(EventParticipant.event_id == event.id)
            .where(EventParticipant.status == ParticipantStatus.REGISTERED)
        ).one()
        
        # 檢查當前用戶是否為發起人
        is_organizer = event.organizer_id == current_user.id
        
        # 檢查當前用戶是否已報名
        participation = session.exec(
            select(EventParticipant)
            .where(EventParticipant.event_id == event.id)
            .where(EventParticipant.user_id == current_user.id)
            .where(EventParticipant.status == ParticipantStatus.REGISTERED)
        ).first()
        is_participating = participation is not None
        
        items.append(EventListItem(
            id=event.id,
            club_id=event.club_id,
            title=event.title,
            event_datetime=event.event_datetime,
            current_participants=participant_count,
            max_participants=event.max_participants,
            status=event.status,
            organizer=OrganizerInfo(
                id=organizer.id,
                display_name=organizer.display_name,
                avatar_url=organizer.avatar_url
            ),
            is_organizer=is_organizer,
            is_participating=is_participating,
            created_at=event.created_at
        ))
    
    return EventListResponse(
        items=items,
        pagination=PaginationMetadata(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages
        )
    )
