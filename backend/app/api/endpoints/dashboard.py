from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.dashboard import DashboardData
from app.services import dashboard_service

router = APIRouter()


@router.get("/me/dashboard", response_model=DashboardData, response_model_by_alias=True)
def get_my_dashboard(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> DashboardData:
    """
    獲取當前用戶的儀表板資料
    
    當前階段（Epic 1）：
    - 返回預設統計資料（全部為 0）
    - 返回空的讀書會列表
    - 返回空的最近活動列表
    
    未來擴展（Epic 2-3 實作後）：
    - Epic 2: 填充真實的讀書會統計和列表
    - Epic 3: 填充真實的閱讀/討論統計和最近活動
    
    Returns:
        DashboardData: 儀表板完整資料（含統計、讀書會、活動）
        - 回應格式使用 camelCase（透過 alias 轉換）
    """
    return dashboard_service.get_user_dashboard(session, current_user.id)
