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


def get_user_dashboard(session: Session, user_id: int) -> DashboardData:
    """
    獲取用戶儀表板資料
    
    Args:
        session: 資料庫 session
        user_id: 用戶 ID
        
    Returns:
        DashboardData: 包含統計、讀書會列表和最近活動的儀表板資料
    """
    # 獲取用戶加入的讀書會統計
    clubs_count = session.exec(
        select(func.count(BookClubMember.book_club_id))
        .where(BookClubMember.user_id == user_id)
    ).one()
    
    # 創建統計數據
    stats = DashboardStats(
        clubs_count=clubs_count,
        books_read=0,  # TODO: 當書籍模型實現後填充
        discussions_count=0  # TODO: 當討論模型實現後填充
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
        
        clubs.append(DashboardClub(
            id=book_club.id,
            name=book_club.name,
            cover_image=book_club.cover_image_url,
            member_count=member_count,
            last_activity=book_club.updated_at
        ))
    
    # 活動記錄 - 目前使用 Mock 數據，未來將從活動表獲取
    # TODO: 當活動記錄系統實現後，從數據庫獲取真實活動
    mock_activities: List[DashboardActivity] = []
    
    return DashboardData(
        stats=stats,
        clubs=clubs,
        recent_activities=mock_activities
    )
