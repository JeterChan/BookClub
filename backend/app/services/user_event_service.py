from typing import List, Optional, Tuple
from sqlmodel import Session, select, func

from app.models.event import Event, EventStatus, EventParticipant
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember
from app.schemas.user_event import UserEventRead
from app.schemas.pagination import PaginationMeta


def get_user_club_events(
    session: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    status: Optional[EventStatus] = None,
    participation: Optional[str] = None,
    club_id: Optional[int] = None
) -> Tuple[List[UserEventRead], PaginationMeta]:
    """
    獲取使用者參與讀書會的所有活動
    
    Args:
        session: 資料庫 session
        user_id: 使用者 ID
        page: 頁碼
        page_size: 每頁數量
        status: 活動狀態篩選 (published/completed/cancelled)
        participation: 參與狀態篩選 (all/registered/not_registered)
        club_id: 讀書會 ID 篩選
    
    Returns:
        (活動列表, 分頁資訊)
    """
    
    # 1. 查詢使用者加入的讀書會
    user_club_ids_query = select(BookClubMember.book_club_id).where(
        BookClubMember.user_id == user_id
    )
    
    # 2. 查詢這些讀書會的活動
    query = (
        select(
            Event,
            BookClub.name.label('club_name'),
            BookClub.cover_image_url.label('club_cover_image_url'),
            func.count(EventParticipant.user_id).label('current_participants')
        )
        .join(BookClub, Event.club_id == BookClub.id)
        .outerjoin(EventParticipant, Event.id == EventParticipant.event_id)
        .where(Event.club_id.in_(user_club_ids_query))
        .group_by(Event.id, BookClub.name, BookClub.cover_image_url)
    )
    
    # 3. 套用篩選條件
    if status:
        query = query.where(Event.status == status)
    
    if club_id:
        query = query.where(Event.club_id == club_id)
    
    # 4. 按活動時間排序（未來活動優先，然後是最近結束的）
    query = query.order_by(Event.event_datetime.asc())
    
    # 5. 計算總數（用於分頁）
    count_query = select(func.count()).select_from(
        select(Event.id)
        .where(Event.club_id.in_(user_club_ids_query))
    )
    if status:
        count_query = count_query.where(Event.status == status)
    if club_id:
        count_query = count_query.where(Event.club_id == club_id)
    
    total_items = session.exec(count_query).one()
    
    # 6. 分頁
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    results = session.exec(query).all()
    
    # 7. 查詢使用者參與狀態
    event_ids = [result[0].id for result in results]
    user_participations = {}
    if event_ids:
        participation_query = select(EventParticipant.event_id).where(
            EventParticipant.event_id.in_(event_ids),
            EventParticipant.user_id == user_id,
            EventParticipant.status == 'registered'
        )
        user_event_ids = session.exec(participation_query).all()
        user_participations = {event_id: True for event_id in user_event_ids}
    
    # 8. 組裝回應資料
    events = []
    for event, club_name, club_cover_image_url, current_participants in results:
        is_registered = event.id in user_participations
        is_organizer = event.organizer_id == user_id
        
        # 根據 participation 篩選
        if participation == 'registered' and not is_registered:
            continue
        if participation == 'not_registered' and is_registered:
            continue
        
        events.append(UserEventRead(
            id=event.id,
            title=event.title,
            description=event.description,
            event_datetime=event.event_datetime,
            meeting_url=event.meeting_url,
            club_id=event.club_id,
            club_name=club_name,
            club_cover_image_url=club_cover_image_url,
            status=event.status,
            is_registered=is_registered,
            is_organizer=is_organizer,
            current_participants=current_participants,
            max_participants=event.max_participants,
            created_at=event.created_at
        ))
    
    # 9. 建立分頁資訊
    total_pages = (total_items + page_size - 1) // page_size
    pagination = PaginationMeta(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )
    
    return events, pagination
