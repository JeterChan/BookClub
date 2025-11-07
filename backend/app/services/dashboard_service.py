from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from typing import List
from app.schemas.dashboard import (
    DashboardData,
    DashboardStats,
    DashboardClub,
    DashboardActivity,
    RelatedEntity
)
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember
from app.models.discussion import DiscussionComment
from app.models.event import Event, EventStatus


def get_user_dashboard(session: Session, user_id: int) -> DashboardData:
    """
    獲取用戶儀表板資料
    
    Args:
        session: 資料庫 session
        user_id: 用戶 ID
        
    Returns:
        DashboardData: 包含統計、讀書會列表和最近活動的儀表板資料
    """
    # 計算當前時間
    now = datetime.utcnow()
    
    # 自動更新過期活動的狀態為 COMPLETED
    # 查詢所有 PUBLISHED 但時間已過的活動
    expired_events = session.exec(
        select(Event)
        .where(
            Event.status == EventStatus.PUBLISHED,
            Event.event_datetime < now
        )
    ).all()
    
    # 批量更新為 COMPLETED 狀態
    for event in expired_events:
        event.status = EventStatus.COMPLETED
        event.updated_at = now
    
    # 提交更新
    if expired_events:
        session.commit()
    
    # 獲取用戶加入的讀書會統計
    clubs_count = session.exec(
        select(func.count(BookClubMember.book_club_id))
        .where(BookClubMember.user_id == user_id)
    ).one()
    
    # 獲取用戶的總留言數（在所有討論話題下的留言）
    discussions_count = session.exec(
        select(func.count(DiscussionComment.id))
        .where(DiscussionComment.owner_id == user_id)
    ).one()
    
    # 獲取本週活動數（用戶參加的讀書會的本週活動）
    # 計算本週的開始時間（週一 00:00:00）
    now = datetime.utcnow()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 查詢本週活動：用戶加入的讀書會中，本週的已發布或已完成活動
    weekly_events = session.exec(
        select(func.count(Event.id))
        .join(BookClubMember, Event.club_id == BookClubMember.book_club_id)
        .where(
            BookClubMember.user_id == user_id,
            Event.event_datetime >= start_of_week,
            Event.event_datetime < start_of_week + timedelta(days=7),
            Event.status.in_([EventStatus.PUBLISHED, EventStatus.COMPLETED])
        )
    ).one()
    
    # 創建統計數據
    stats = DashboardStats(
        clubs_count=clubs_count,
        books_read=0,  # TODO: 當書籍模型實現後填充
        discussions_count=discussions_count,
        weekly_events=weekly_events
    )
    
    # 獲取用戶的讀書會列表
    user_clubs_query = (
        select(BookClub, BookClubMember)
        .join(BookClubMember, BookClub.id == BookClubMember.book_club_id)
        .where(BookClubMember.user_id == user_id)
        .order_by(BookClub.updated_at.desc())
    )
    
    results = session.exec(user_clubs_query).all()
    
    clubs: List[DashboardClub] = []
    for book_club, membership in results:
        # 計算成員數量
        member_count = session.exec(
            select(func.count(BookClubMember.user_id))
            .where(BookClubMember.book_club_id == book_club.id)
        ).one()
        
        # 計算活動統計
        # 總活動數（已發布或已完成的活動）
        total_events = session.exec(
            select(func.count(Event.id))
            .where(
                Event.club_id == book_club.id,
                Event.status.in_([EventStatus.PUBLISHED, EventStatus.COMPLETED])
            )
        ).one()
        
        # 已完成的活動數（狀態為 COMPLETED 或活動時間在過去的 PUBLISHED）
        completed_events = session.exec(
            select(func.count(Event.id))
            .where(
                Event.club_id == book_club.id,
                (
                    (Event.status == EventStatus.COMPLETED) |
                    ((Event.status == EventStatus.PUBLISHED) & (Event.event_datetime < now))
                )
            )
        ).one()
        
        # 未來的活動數（PUBLISHED 且時間在未來）
        upcoming_events = session.exec(
            select(func.count(Event.id))
            .where(
                Event.club_id == book_club.id,
                Event.status == EventStatus.PUBLISHED,
                Event.event_datetime >= now
            )
        ).one()
        
        # 計算進度百分比
        progress_percentage = 0.0
        if total_events > 0:
            progress_percentage = (completed_events / total_events) * 100
        
        # 判斷讀書會狀態
        club_status = "planning"  # 預設：規劃中（無活動）
        if total_events > 0:
            if upcoming_events > 0:
                club_status = "active"  # 進行中（有未來活動）
            else:
                club_status = "completed"  # 已完成（所有活動都在過去）
        
        clubs.append(DashboardClub(
            id=book_club.id,
            name=book_club.name,
            cover_image=book_club.cover_image_url,
            member_count=member_count,
            last_activity=book_club.updated_at,
            total_events=total_events,
            completed_events=completed_events,
            upcoming_events=upcoming_events,
            progress_percentage=round(progress_percentage, 1),
            status=club_status
        ))
    
    # 活動記錄 - 目前使用 Mock 數據，未來將從活動表獲取
    # TODO: 當活動記錄系統實現後，從數據庫獲取真實活動
    mock_activities: List[DashboardActivity] = []
    
    return DashboardData(
        stats=stats,
        clubs=clubs,
        recent_activities=mock_activities
    )
