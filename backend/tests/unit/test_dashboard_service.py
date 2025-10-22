import pytest
from sqlmodel import Session
from app.services.dashboard_service import get_user_dashboard
from app.schemas.dashboard import DashboardData, DashboardStats


def test_get_user_dashboard_returns_default_values(session: Session):
    """測試獲取儀表板資料返回預設值（Epic 1 階段）"""
    user_id = 1
    
    # 當前階段應返回預設值
    dashboard = get_user_dashboard(session, user_id)
    
    # 驗證回傳型別
    assert isinstance(dashboard, DashboardData)
    
    # 驗證統計資料為 0
    assert dashboard.stats.clubs_count == 0
    assert dashboard.stats.books_read == 0
    assert dashboard.stats.discussions_count == 0
    
    # 驗證列表為空
    assert dashboard.clubs == []
    assert dashboard.recent_activities == []


def test_dashboard_data_structure():
    """測試儀表板資料結構符合 schema 定義"""
    # 創建測試資料
    dashboard = DashboardData(
        stats=DashboardStats(
            clubs_count=0,
            books_read=0,
            discussions_count=0
        ),
        clubs=[],
        recent_activities=[]
    )
    
    # 驗證資料結構
    assert hasattr(dashboard, 'stats')
    assert hasattr(dashboard, 'clubs')
    assert hasattr(dashboard, 'recent_activities')
    
    # 驗證統計資料結構
    assert hasattr(dashboard.stats, 'clubs_count')
    assert hasattr(dashboard.stats, 'books_read')
    assert hasattr(dashboard.stats, 'discussions_count')


def test_dashboard_stats_camelcase_alias():
    """測試統計資料 camelCase alias 轉換"""
    stats = DashboardStats(
        clubs_count=5,
        books_read=10,
        discussions_count=20
    )
    
    # 使用 model_dump 並啟用 by_alias 來測試 alias
    data = stats.model_dump(by_alias=True)
    
    # 驗證 camelCase 欄位存在
    assert 'clubsCount' in data
    assert 'booksRead' in data
    assert 'discussionsCount' in data
    
    # 驗證值正確
    assert data['clubsCount'] == 5
    assert data['booksRead'] == 10
    assert data['discussionsCount'] == 20
