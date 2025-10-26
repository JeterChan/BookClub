# backend/app/api/endpoints/book_clubs.py
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.book_club import BookClubCreate
from app.models.club_tag import ClubTagRead
from app.schemas.book_club import BookClubReadWithDetails, PaginatedBookClubList, BookClubUpdate
from app.services import book_club_service
from app.services.user_service import UserService
from app.core.permissions import club_owner_or_admin_required
import logging

router = APIRouter()

# Dependency for user service
def get_user_service(session: Session = Depends(get_session)) -> UserService:
    return UserService(session)


@router.put("/{club_id}", response_model=BookClubReadWithDetails)
def update_book_club(
    *, 
    session: Session = Depends(get_session), 
    club_id: int, 
    book_club_update: BookClubUpdate,
    current_user: User = Depends(club_owner_or_admin_required)
) -> BookClubReadWithDetails:
    return book_club_service.update_book_club(
        session=session, 
        club_id=club_id, 
        book_club_update=book_club_update, 
        current_user=current_user
    )


@router.post("", response_model=BookClubReadWithDetails, status_code=status.HTTP_201_CREATED)
def create_book_club(
    *,
    session: Session = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
    current_user_payload: dict = Depends(get_current_user),
    book_club_data: BookClubCreate
) -> BookClubReadWithDetails:
    email = current_user_payload.get("sub")
    current_user = user_service.get_by_email(email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return book_club_service.create_book_club(
        session=session,
        current_user=current_user,
        book_club_data=book_club_data
    )


@router.get("/tags", response_model=List[ClubTagRead])
def get_available_tags(
    *,
    session: Session = Depends(get_session)
) -> List[ClubTagRead]:
    return book_club_service.get_available_tags(session)


@router.get("", response_model=PaginatedBookClubList)
def list_book_clubs(
    *,
    session: Session = Depends(get_session),
    page: int = Query(1, ge=1, description="頁碼（從 1 開始）"),
    page_size: int = Query(20, ge=1, le=100, description="每頁項目數"),
    keyword: Optional[str] = Query(None, description="搜尋關鍵字（搜尋名稱和簡介）"),
    tag_ids: Optional[str] = Query(None, description="標籤 ID 列表（逗號分隔，例如: 1,3,5）")
) -> PaginatedBookClubList:
    tag_ids_list = None
    if tag_ids:
        try:
            tag_ids_list = [int(tid.strip()) for tid in tag_ids.split(",") if tid.strip()]
        except ValueError:
            tag_ids_list = None
    
    clubs, pagination = book_club_service.list_book_clubs(
        session=session,
        page=page,
        page_size=page_size,
        keyword=keyword,
        tag_ids=tag_ids_list
    )
    
    return PaginatedBookClubList(
        items=clubs,
        pagination=pagination
    )


@router.get("/{club_id}", response_model=BookClubReadWithDetails)
def get_book_club_detail(
    *,
    session: Session = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
    club_id: int,
    current_user_payload: Optional[dict] = Depends(get_optional_current_user)
) -> BookClubReadWithDetails:
    current_user = None
    if current_user_payload:
        email = current_user_payload.get("sub")
        current_user = user_service.get_by_email(email)

    return book_club_service.get_book_club_by_id(session, club_id, current_user)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/{club_id}/join", status_code=status.HTTP_204_NO_CONTENT)
def join_club(
    *,
    session: Session = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
    club_id: int,
    current_user_payload: dict = Depends(get_current_user)
):
    logger.info(f"Attempting to join club {club_id} for user {current_user_payload.get('sub')}")
    email = current_user_payload.get("sub")
    current_user = user_service.get_by_email(email)
    if not current_user:
        logger.warning(f"User with email {email} not found in DB for join club action.")
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        book_club_service.join_book_club(session, club_id, current_user.id)
        logger.info(f"User {email} successfully joined club {club_id}")
    except HTTPException as e:
        logger.error(f"Error during join_book_club service call for user {email} and club {club_id}: {e.detail}")
        raise e
    return



@router.delete("/{club_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_club(
    *,
    session: Session = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
    club_id: int,
    current_user_payload: dict = Depends(get_current_user)
):
    email = current_user_payload.get("sub")
    current_user = user_service.get_by_email(email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    book_club_service.leave_book_club(session, club_id, current_user.id)
    return


@router.post("/{club_id}/request-join", status_code=status.HTTP_201_CREATED)
def request_to_join_club(
    *,
    session: Session = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
    club_id: int,
    current_user_payload: dict = Depends(get_current_user)
):
    email = current_user_payload.get("sub")
    current_user = user_service.get_by_email(email)
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    book_club_service.request_to_join_book_club(session, club_id, current_user.id)
    return
