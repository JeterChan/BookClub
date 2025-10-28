from sqlmodel import Session
from datetime import datetime, timedelta
from app.schemas.dashboard import (
    DashboardData,
    DashboardStats,
    DashboardClub,
    DashboardActivity,
    RelatedEntity
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
    # Mock data for demonstration
    mock_stats = DashboardStats(clubs_count=3, books_read=12, discussions_count=48)
    
    mock_clubs = [
        DashboardClub(
            id=1,
            name='科幻小說愛好者',
            cover_image=None,
            member_count=24,
            last_activity=datetime.utcnow() - timedelta(days=1)
        ),
        DashboardClub(
            id=2,
            name='推理懸疑讀書會',
            cover_image=None,
            member_count=18,
            last_activity=datetime.utcnow() - timedelta(days=2)
        ),
        DashboardClub(
            id=3,
            name='歷史文學交流',
            cover_image=None,
            member_count=32,
            last_activity=datetime.utcnow() - timedelta(days=3)
        ),
    ]
    
    mock_activities = [
        DashboardActivity(
            id=1,
            type='post_discussion',
            description='在「三體」讀書會發表了新討論',
            timestamp=datetime.utcnow() - timedelta(hours=2),
            related_entity=RelatedEntity(id=1, name='三體', link='/clubs/1')
        ),
        DashboardActivity(
            id=2,
            type='complete_book',
            description='完成閱讀《銀河便車指南》',
            timestamp=datetime.utcnow() - timedelta(hours=10)
        ),
        DashboardActivity(
            id=3,
            type='join_club',
            description='加入了「推理懸疑讀書會」',
            timestamp=datetime.utcnow() - timedelta(days=1),
            related_entity=RelatedEntity(id=2, name='推理懸疑讀書會', link='/clubs/2')
        ),
    ]
    
    return DashboardData(
        stats=mock_stats,
        clubs=mock_clubs,
        recent_activities=mock_activities
    )
