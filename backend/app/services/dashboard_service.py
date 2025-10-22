from sqlmodel import Session
from app.schemas.dashboard import (
    DashboardData,
    DashboardStats,
    DashboardClub,
    DashboardActivity
)


def get_user_dashboard(session: Session, user_id: int) -> DashboardData:
    """
    獲取用戶儀表板資料
    
    當前階段（Epic 1）：返回預設值
    未來擴展：當 Epic 2-3 實作後，填充真實資料
    
    Args:
        session: 資料庫 session
        user_id: 用戶 ID
        
    Returns:
        DashboardData: 包含統計、讀書會列表和最近活動的儀表板資料
    """
    # TODO (Epic 2): 從 BookClubMember 表統計用戶參加的讀書會數
    # from app.models.book_club import BookClubMember
    # clubs_count = session.query(BookClubMember).filter_by(user_id=user_id).count()
    clubs_count = 0
    
    # TODO (Epic 3): 從 Reading 表統計閱讀完成的書籍數
    # from app.models.reading import Reading
    # books_read = session.query(Reading).filter_by(user_id=user_id, completed=True).count()
    books_read = 0
    
    # TODO (Epic 3): 從 DiscussionPost 表統計用戶參與的討論數
    # from app.models.discussion import DiscussionPost
    # discussions_count = session.query(DiscussionPost).filter_by(author_id=user_id).count()
    discussions_count = 0
    
    # TODO (Epic 2): 查詢用戶的讀書會列表（最多3個）
    # from app.models.book_club import BookClub
    # clubs = session.query(BookClub).join(BookClubMember).filter(
    #     BookClubMember.user_id == user_id
    # ).order_by(BookClub.updated_at.desc()).limit(3).all()
    clubs = []
    
    # TODO (Epic 3): 查詢用戶最近活動（最多10筆）
    # from app.models.activity import Activity
    # activities = session.query(Activity).filter_by(user_id=user_id).order_by(
    #     Activity.created_at.desc()
    # ).limit(10).all()
    recent_activities = []
    
    return DashboardData(
        stats=DashboardStats(
            clubs_count=clubs_count,
            books_read=books_read,
            discussions_count=discussions_count
        ),
        clubs=clubs,
        recent_activities=recent_activities
    )
