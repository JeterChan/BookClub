# backend/app/api/endpoints/book_clubs.py
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException, UploadFile, File, Form
from sqlmodel import Session

from app.db.session import get_session
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.book_club import BookClubCreate
from app.models.club_tag import ClubTagRead
from app.schemas.book_club import BookClubReadWithDetails, PaginatedBookClubList, BookClubUpdate
from app.services import book_club_service
from app.services.user_service import UserService
from app.services.club_management_service import ClubManagementService
from app.core.permissions import club_owner_or_admin_required, club_owner_required
import logging
import json

router = APIRouter()

# Dependency for user service
def get_user_service(session: Session = Depends(get_session)) -> UserService:
    return UserService(session)

def get_club_management_service(session: Session = Depends(get_session)) -> ClubManagementService:
    return ClubManagementService(session)


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


@router.post("/{club_id}/cover", response_model=BookClubReadWithDetails)
def update_club_cover(
    *,
    session: Session = Depends(get_session),
    club_id: int,
    cover_image: UploadFile = File(...),
    current_user: User = Depends(club_owner_or_admin_required)
) -> BookClubReadWithDetails:
    """
    更新讀書會封面圖片
    
    Args:
        club_id: 讀書會 ID
        cover_image: 封面圖片檔案
        current_user: 當前使用者（需為擁有者或管理員）
    
    Returns:
        更新後的讀書會詳細資訊
    """
    return book_club_service.update_club_cover(
        session=session,
        club_id=club_id,
        cover_image=cover_image,
        current_user=current_user
    )


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_club(
    *,
    club_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    current_user: User = Depends(club_owner_required)
):
    service.delete_club(club_id=club_id, current_user=current_user)
    return


@router.post("", response_model=BookClubReadWithDetails, status_code=status.HTTP_201_CREATED)
def create_book_club(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    visibility: str = Form(...),
    tag_ids: str = Form(...),
    cover_image: Optional[UploadFile] = File(None)
) -> BookClubReadWithDetails:
    # 解析 tag_ids
    try:
        tag_ids_list = json.loads(tag_ids)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="tag_ids 格式錯誤")
    
    # 建立 BookClubCreate 物件
    book_club_data = BookClubCreate(
        name=name,
        description=description,
        visibility=visibility,
        tag_ids=tag_ids_list
    )
    
    return book_club_service.create_book_club(
        session=session,
        current_user=current_user,
        book_club_data=book_club_data,
        cover_image=cover_image
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
    tag_ids: Optional[str] = Query(None, description="標籤 ID 列表（逗號分隔，例如: 1,3,5）"),
    my_clubs: bool = Query(False, description="是否只顯示我的讀書會"),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> PaginatedBookClubList:
    tag_ids_list = None
    if tag_ids:
        try:
            tag_ids_list = [int(tid.strip()) for tid in tag_ids.split(",") if tid.strip()]
        except ValueError:
            tag_ids_list = None
    
    # 如果請求我的讀書會但未登入，返回錯誤
    if my_clubs and not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="請先登入")
    
    clubs, pagination = book_club_service.list_book_clubs(
        session=session,
        page=page,
        page_size=page_size,
        keyword=keyword,
        tag_ids=tag_ids_list,
        user_id=current_user.id if my_clubs and current_user else None,
        current_user=current_user
    )
    
    return PaginatedBookClubList(
        items=clubs,
        pagination=pagination
    )


@router.get("/{club_id}", response_model=BookClubReadWithDetails)
def get_book_club_detail(
    *,
    session: Session = Depends(get_session),
    club_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> BookClubReadWithDetails:
    return book_club_service.get_book_club_by_id(session, club_id, current_user)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/{club_id}/join")
def join_club(
    *,
    session: Session = Depends(get_session),
    club_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    加入讀書會：
    - 公開讀書會：直接加入，返回 {"joined": true, "requires_approval": false}
    - 私密讀書會：創建加入請求，返回 {"joined": false, "requires_approval": true}
    """
    logger.info(f"Attempting to join club {club_id} for user {current_user.email}")
    try:
        result = book_club_service.join_book_club(session, club_id, current_user.id)
        # 如果返回 None，表示公開讀書會直接加入
        if result is None:
            logger.info(f"User {current_user.email} successfully joined public club {club_id}")
            return {"joined": True, "requires_approval": False}
        else:
            # 返回 ClubJoinRequest，表示私密讀書會需要審核
            logger.info(f"User {current_user.email} created join request for private club {club_id}")
            return {"joined": False, "requires_approval": True}
    except HTTPException as e:
        logger.error(f"Error during join_book_club service call for user {current_user.email} and club {club_id}: {e.detail}")
        raise e



@router.delete("/{club_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_club(
    *,
    session: Session = Depends(get_session),
    club_id: int,
    current_user: User = Depends(get_current_user)
):
    book_club_service.leave_book_club(session, club_id, current_user.id)
    return
