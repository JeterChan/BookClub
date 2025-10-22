# backend/app/api/endpoints/interest_tags.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel

from app.db.session import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.interest_tag import InterestTagRead, InterestTagCreate
from app.services.interest_tag_service import interest_tag_service

router = APIRouter()

@router.get("", response_model=List[InterestTagRead])
def get_all_tags(
    predefined_only: bool = False,
    search: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """獲取所有興趣標籤，可依預設或名稱搜尋"""
    return interest_tag_service.get_all_tags(session, predefined_only, search)

@router.post("", response_model=InterestTagRead, status_code=status.HTTP_201_CREATED)
def create_custom_tag(
    tag_data: InterestTagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """創建一個新的自定義興趣標籤"""
    try:
        return interest_tag_service.create_custom_tag(session, tag_data.name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
