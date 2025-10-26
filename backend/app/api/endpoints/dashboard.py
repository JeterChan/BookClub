from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.dashboard import DashboardData
from app.services import dashboard_service
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me/dashboard", response_model=DashboardData, response_model_by_alias=True)
def get_my_dashboard(
    *,
    session: Session = Depends(get_session),
    current_user_payload: dict = Depends(get_current_user)
) -> DashboardData:
    email = current_user_payload.get("sub")
    current_user = UserService.get_by_email(session, email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return dashboard_service.get_user_dashboard(session, current_user.id)