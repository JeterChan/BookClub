from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Session, select, func, col
from fastapi import HTTPException, status
import re
import math

from app.models.event import (
    Event, EventCreate, EventRead, EventUpdate, EventStatus, 
    EventParticipant, ParticipantStatus,
    EventListItem, EventListResponse, PaginationMetadata, OrganizerInfo
)
from app.models.book_club_member import BookClubMember
from app.models.user import User


def validate_event_datetime(event_datetime: datetime) -> None:
    """驗證活動時間必須為未來時間"""
    # 確保比較的兩個 datetime 都是 aware（有時區信息）
    now = datetime.now(timezone.utc)
    
    # 如果傳入的 datetime 是 naive，轉換為 UTC aware
    if event_datetime.tzinfo is None:
        event_datetime = event_datetime.replace(tzinfo=timezone.utc)
    
    if event_datetime <= now:
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
        HTTPException: 403 - 非讀書會管理員
        HTTPException: 404 - 讀書會不存在
        HTTPException: 400 - 活動時間為過去時間或 URL 格式錯誤
    """
    # 驗證用戶是讀書會管理員（owner 或 admin）
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == club_id)
        .where(BookClubMember.user_id == current_user.id)
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您不是此讀書會的成員"
        )
    
    if membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有讀書會管理員可以建立活動"
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
            current_participants=int(participant_count),  # 確保為整數類型
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


def get_event_detail(
    session: Session,
    current_user: User,
    club_id: int,
    event_id: int
):
    """
    取得活動詳細資訊
    
    Args:
        session: 資料庫 session
        current_user: 當前使用者
        club_id: 讀書會 ID
        event_id: 活動 ID
        
    Returns:
        EventDetail: 活動詳細資訊
        
    Raises:
        HTTPException: 如果讀書會不存在、不是成員、活動不存在或活動不屬於該讀書會
    """
    from ..models.book_club import BookClub
    from ..models.book_club_member import BookClubMember
    from ..models.event import Event, EventParticipant, ParticipantStatus, OrganizerInfo, EventDetail
    
    # 檢查讀書會是否存在
    club = session.get(BookClub, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="讀書會不存在")
    
    # 檢查是否為讀書會成員
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.user_id == current_user.id)
        .where(BookClubMember.book_club_id == club_id)
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="您不是此讀書會成員")
    
    # 取得活動
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")
    
    if event.club_id != club_id:
        raise HTTPException(status_code=404, detail="活動不屬於此讀書會")
    
    # 取得參與者數量
    participant_count = session.exec(
        select(func.count(EventParticipant.user_id))
        .where(EventParticipant.event_id == event_id)
        .where(EventParticipant.status == ParticipantStatus.REGISTERED)
    ).one()
    
    # 檢查使用者是否已參與
    is_participating = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .where(EventParticipant.user_id == current_user.id)
        .where(EventParticipant.status == ParticipantStatus.REGISTERED)
    ).first() is not None
    
    # 取得發起人資訊
    organizer = session.get(User, event.organizer_id)
    
    return EventDetail(
        id=event.id,
        club_id=event.club_id,
        title=event.title,
        description=event.description,
        event_datetime=event.event_datetime,
        meeting_url=event.meeting_url,
        current_participants=int(participant_count),
        max_participants=event.max_participants,
        status=event.status,
        organizer=OrganizerInfo(
            id=organizer.id,
            display_name=organizer.display_name,
            avatar_url=organizer.avatar_url
        ),
        is_organizer=event.organizer_id == current_user.id,
        is_participating=is_participating,
        created_at=event.created_at
    )


def join_event(
    session: Session,
    current_user: User,
    club_id: int,
    event_id: int
):
    """
    加入活動
    
    Args:
        session: 資料庫 session
        current_user: 當前使用者
        club_id: 讀書會 ID
        event_id: 活動 ID
        
    Returns:
        EventDetail: 更新後的活動資訊
        
    Raises:
        HTTPException: 如果讀書會不存在或不是成員或活動不存在或活動不屬於該讀書會或活動已結束或已達人數上限或已經參與
    """
    from ..models.book_club import BookClub
    from ..models.book_club_member import BookClubMember
    from ..models.event import Event, EventParticipant, ParticipantStatus, EventStatus
    
    # 檢查讀書會是否存在
    club = session.get(BookClub, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="讀書會不存在")
    
    # 檢查是否為讀書會成員
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.user_id == current_user.id)
        .where(BookClubMember.book_club_id == club_id)
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="您不是此讀書會成員")
    
    # 取得活動
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")
    
    if event.club_id != club_id:
        raise HTTPException(status_code=404, detail="活動不屬於此讀書會")
    
    # 檢查活動是否為已發布狀態
    if event.status != EventStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="活動尚未發布")
    
    # 檢查活動是否已結束
    now = datetime.now(timezone.utc)
    if event.event_datetime.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=400, detail="活動已結束，無法加入")
    
    # 檢查是否已經參與
    existing_participation = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .where(EventParticipant.user_id == current_user.id)
        .where(EventParticipant.status == ParticipantStatus.REGISTERED)
    ).first()
    
    if existing_participation:
        raise HTTPException(status_code=400, detail="您已經參與此活動")
    
    # 檢查人數上限
    if event.max_participants:
        participant_count = session.exec(
            select(func.count(EventParticipant.user_id))
            .where(EventParticipant.event_id == event_id)
            .where(EventParticipant.status == ParticipantStatus.REGISTERED)
        ).one()
        
        if participant_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="活動人數已滿")
    
    # 建立參與記錄
    participation = EventParticipant(
        event_id=event_id,
        user_id=current_user.id,
        status=ParticipantStatus.REGISTERED
    )
    session.add(participation)
    session.commit()
    
    # 返回更新後的活動資訊
    return get_event_detail(session, current_user, club_id, event_id)


def leave_event(
    session: Session,
    current_user: User,
    club_id: int,
    event_id: int
):
    """
    退出活動
    
    Args:
        session: 資料庫 session
        current_user: 當前使用者
        club_id: 讀書會 ID
        event_id: 活動 ID
        
    Returns:
        EventDetail: 更新後的活動資訊
        
    Raises:
        HTTPException: 如果讀書會不存在或不是成員或活動不存在或活動不屬於該讀書會或未參與活動或活動已結束
    """
    from ..models.book_club import BookClub
    from ..models.book_club_member import BookClubMember
    from ..models.event import Event, EventParticipant, ParticipantStatus
    
    # 檢查讀書會是否存在
    club = session.get(BookClub, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="讀書會不存在")
    
    # 檢查是否為讀書會成員
    membership = session.exec(
        select(BookClubMember)
        .where(BookClubMember.user_id == current_user.id)
        .where(BookClubMember.book_club_id == club_id)
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="您不是此讀書會成員")
    
    # 取得活動
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")
    
    if event.club_id != club_id:
        raise HTTPException(status_code=404, detail="活動不屬於此讀書會")
    
    # 檢查活動是否已結束
    now = datetime.now(timezone.utc)
    if event.event_datetime.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=400, detail="活動已結束，無法退出")
    
    # 檢查是否已經參與
    participation = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .where(EventParticipant.user_id == current_user.id)
        .where(EventParticipant.status == ParticipantStatus.REGISTERED)
    ).first()
    
    if not participation:
        raise HTTPException(status_code=400, detail="您尚未參與此活動")
    
    # 刪除參與記錄（或者可以改為更新狀態為 CANCELLED）
    session.delete(participation)
    session.commit()
    
    # 返回更新後的活動資訊
    return get_event_detail(session, current_user, club_id, event_id)


def update_event(
    session: Session,
    current_user: User,
    club_id: int,
    event_id: int,
    event_data: EventUpdate
) -> EventRead:
    """
    更新活動資訊
    
    Args:
        session: 資料庫 session
        current_user: 當前用戶
        club_id: 讀書會 ID
        event_id: 活動 ID
        event_data: 更新的活動資料
        
    Returns:
        EventRead: 更新後的活動資料
        
    Raises:
        HTTPException: 403 - 非活動發起人或管理員
        HTTPException: 404 - 活動不存在或讀書會不存在
        HTTPException: 400 - 驗證失敗
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
            detail="只有讀書會成員可以修改活動"
        )
    
    # 取得活動
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    
    if event.club_id != club_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不屬於此讀書會"
        )
    
    # 檢查權限：活動發起人或讀書會管理員/擁有者
    is_organizer = event.organizer_id == current_user.id
    is_admin = membership.role in ["owner", "admin"]
    
    if not (is_organizer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有活動發起人或讀書會管理員可以修改活動"
        )
    
    # 更新欄位（只更新有提供的欄位）
    if event_data.title is not None:
        if len(event_data.title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="活動名稱不能為空"
            )
        event.title = event_data.title.strip()
    
    if event_data.description is not None:
        if len(event_data.description.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="活動描述不能為空"
            )
        event.description = event_data.description.strip()
    
    if event_data.event_datetime is not None:
        validate_event_datetime(event_data.event_datetime)
        event.event_datetime = event_data.event_datetime
    
    if event_data.meeting_url is not None:
        validate_meeting_url(event_data.meeting_url)
        event.meeting_url = event_data.meeting_url
    
    if event_data.max_participants is not None:
        # 檢查是否小於目前報名人數
        current_count = session.exec(
            select(func.count(EventParticipant.user_id))
            .where(EventParticipant.event_id == event_id)
            .where(EventParticipant.status == ParticipantStatus.REGISTERED)
        ).one()
        
        if event_data.max_participants < current_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"人數上限不能小於目前報名人數 ({current_count})"
            )
        event.max_participants = event_data.max_participants
    
    if event_data.status is not None:
        event.status = event_data.status
    
    # 更新修改時間
    event.updated_at = datetime.utcnow()
    
    session.add(event)
    session.commit()
    session.refresh(event)
    
    # 計算報名人數
    participant_count = session.exec(
        select(func.count(EventParticipant.user_id))
        .where(EventParticipant.event_id == event.id)
        .where(EventParticipant.status == ParticipantStatus.REGISTERED)
    ).one()
    
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
        participant_count=participant_count
    )


def delete_event(
    session: Session,
    current_user: User,
    club_id: int,
    event_id: int
) -> None:
    """
    刪除活動
    
    Args:
        session: 資料庫 session
        current_user: 當前用戶
        club_id: 讀書會 ID
        event_id: 活動 ID
        
    Raises:
        HTTPException: 403 - 非活動發起人或管理員
        HTTPException: 404 - 活動不存在或讀書會不存在
        HTTPException: 400 - 活動已開始無法刪除
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
            detail="只有讀書會成員可以刪除活動"
        )
    
    # 取得活動
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    
    if event.club_id != club_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不屬於此讀書會"
        )
    
    # 檢查權限：活動發起人或讀書會管理員/擁有者
    is_organizer = event.organizer_id == current_user.id
    is_admin = membership.role in ["owner", "admin"]
    
    if not (is_organizer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有活動發起人或讀書會管理員可以刪除活動"
        )
    
    # 檢查活動是否已開始
    now = datetime.now(timezone.utc)
    event_time = event.event_datetime
    if event_time.tzinfo is None:
        event_time = event_time.replace(tzinfo=timezone.utc)
    
    if event_time < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活動已開始或結束，無法刪除"
        )
    
    # 刪除所有參與記錄
    participants = session.exec(
        select(EventParticipant).where(EventParticipant.event_id == event_id)
    ).all()
    for participant in participants:
        session.delete(participant)
    
    # 刪除活動
    session.delete(event)
    session.commit()
