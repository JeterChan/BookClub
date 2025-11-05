from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status, UploadFile

from app.models.book_club import BookClub, BookClubCreate, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole, MembershipStatus
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.user import User
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.schemas.book_club import BookClubReadWithDetails, BookClubUpdate
from app.models.club_tag import ClubTagRead
from app.core.cloudinary_config import upload_image, delete_image, extract_public_id_from_url


def upload_club_cover_to_cloudinary(upload_file: UploadFile, club_id: int) -> str:
    """
    上傳讀書會封面圖片到 Cloudinary
    
    Args:
        upload_file: 上傳的圖片檔案
        club_id: 讀書會 ID，用於生成 public_id
    
    Returns:
        Cloudinary CDN URL
        
    Raises:
        Exception: 當上傳失敗時拋出異常
    """
    # 讀取檔案內容
    upload_file.file.seek(0)
    file_content = upload_file.file.read()
    
    # 上傳到 Cloudinary
    try:
        cover_url = upload_image(
            file_bytes=file_content,
            folder="club_covers",
            public_id=f"club_{club_id}"
        )
        return cover_url
    except Exception as e:
        raise Exception(f"讀書會封面上傳失敗: {str(e)}")


def update_club_cover(
    session: Session,
    *,
    club_id: int,
    cover_image: UploadFile,
    current_user: User
) -> BookClubReadWithDetails:
    """
    更新讀書會封面圖片
    
    Args:
        session: 資料庫 session
        club_id: 讀書會 ID
        cover_image: 新的封面圖片
        current_user: 當前使用者
    
    Returns:
        更新後的讀書會詳細資訊
    """
    # 取得讀書會
    book_club = session.get(BookClub, club_id)
    if not book_club:
        raise HTTPException(status_code=404, detail="讀書會不存在")
    
    # 如果已有封面，先刪除舊的 Cloudinary 圖片
    if book_club.cover_image_url:
        old_public_id = extract_public_id_from_url(book_club.cover_image_url)
        if old_public_id:
            delete_image(old_public_id)
    
    # 上傳新封面
    try:
        cover_url = upload_club_cover_to_cloudinary(cover_image, club_id)
        book_club.cover_image_url = cover_url
        
        session.add(book_club)
        session.commit()
        session.refresh(book_club)
        
        return get_book_club_by_id(session=session, club_id=club_id, current_user=current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"封面更新失敗: {str(e)}"
        )


def update_book_club(
    session: Session, 
    *,
    club_id: int, 
    book_club_update: BookClubUpdate, 
    current_user: User
) -> BookClubReadWithDetails:
    book_club = session.get(BookClub, club_id)
    if not book_club:
        raise HTTPException(status_code=404, detail="Book club not found")

    update_data = book_club_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book_club, key, value)

    session.add(book_club)
    session.commit()
    session.refresh(book_club)

    return get_book_club_by_id(session=session, club_id=club_id, current_user=current_user)

def create_book_club(
    session: Session,
    current_user: User,
    book_club_data: BookClubCreate,
    cover_image: Optional[UploadFile] = None
) -> BookClubReadWithDetails:
    # 1. 驗證所有 tag_ids 是否存在
    tags = session.exec(
        select(ClubTag).where(ClubTag.id.in_(book_club_data.tag_ids))
    ).all()
    
    if len(tags) != len(book_club_data.tag_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="一個或多個標籤 ID 無效"
        )
    
    # 2. 建立 BookClub 實例（先不設定封面）
    book_club = BookClub(
        name=book_club_data.name,
        description=book_club_data.description,
        visibility=book_club_data.visibility,
        cover_image_url=None,  # 稍後上傳
        owner_id=current_user.id
    )
    
    session.add(book_club)
    session.flush()  # 取得 book_club.id
    
    # 3. 處理封面圖片上傳（需要 club_id）
    if cover_image:
        try:
            cover_image_url = upload_club_cover_to_cloudinary(cover_image, book_club.id)
            book_club.cover_image_url = cover_image_url
        except Exception as e:
            # 如果上傳失敗，回滾並拋出錯誤
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"封面圖片上傳失敗: {str(e)}"
            )
    
    # 4. 關聯標籤至讀書會
    for tag in tags:
        tag_link = BookClubTagLink(
            book_club_id=book_club.id,
            tag_id=tag.id
        )
        session.add(tag_link)
    
    # 5. 自動建立 BookClubMember 記錄 (role=OWNER)
    member = BookClubMember(
        user_id=current_user.id,
        book_club_id=book_club.id,
        role=MemberRole.OWNER
    )
    session.add(member)
    
    session.commit()
    session.refresh(book_club)
    
    # 6. 構建回應資料
    from app.models.user import UserRead
    
    return BookClubReadWithDetails(
        id=book_club.id,
        name=book_club.name,
        description=book_club.description,
        visibility=book_club.visibility,
        cover_image_url=book_club.cover_image_url,
        owner_id=book_club.owner_id,
        created_at=book_club.created_at,
        updated_at=book_club.updated_at,
        owner=UserRead(
            id=current_user.id,
            email=current_user.email,
            display_name=current_user.display_name,
            avatar_url=current_user.avatar_url
        ),
        tags=[ClubTagRead(id=tag.id, name=tag.name, is_predefined=tag.is_predefined) for tag in tags],
        member_count=1,
        membership_status=MembershipStatus.OWNER  # 設定創建者的 membership_status
    )

def get_available_tags(session: Session) -> List[ClubTagRead]:
    tags = session.exec(select(ClubTag).order_by(ClubTag.name)).all()
    return [
        ClubTagRead(id=tag.id, name=tag.name, is_predefined=tag.is_predefined)
        for tag in tags
    ]

def list_book_clubs(
    session: Session,
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    tag_ids: Optional[List[int]] = None,
    user_id: Optional[int] = None,
    current_user: Optional[User] = None
) -> tuple[List[BookClubReadWithDetails], dict]:
    from sqlmodel import func, col
    
    query = select(BookClub).where(BookClub.visibility == "public")
    
    # 如果指定了 user_id，只返回該用戶加入的讀書會
    if user_id is not None:
        query = query.join(BookClubMember).where(BookClubMember.user_id == user_id)
    
    if keyword:
        search_pattern = f"%{keyword}%"
        query = query.where(
            (BookClub.name.like(search_pattern)) |
            (BookClub.description.like(search_pattern))
        )
    
    if tag_ids and len(tag_ids) > 0:
        query = query.join(BookClubTagLink).where(
            BookClubTagLink.tag_id.in_(tag_ids)
        ).distinct()
    
    count_query = select(func.count()).select_from(query.subquery())
    total_items = session.exec(count_query).one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(BookClub.created_at.desc())
    
    book_clubs = session.exec(query).all()
    
    result = []
    for club in book_clubs:
        owner = session.get(User, club.owner_id)
        
        tag_links = session.exec(
            select(BookClubTagLink).where(BookClubTagLink.book_club_id == club.id)
        ).all()
        tag_ids_for_club = [link.tag_id for link in tag_links]
        tags = session.exec(
            select(ClubTag).where(ClubTag.id.in_(tag_ids_for_club))
        ).all() if tag_ids_for_club else []
        
        member_count = session.exec(
            select(func.count(BookClubMember.user_id)).where(
                BookClubMember.book_club_id == club.id
            )
        ).one()
        
        # 計算當前使用者的 membership_status
        membership_status = None
        if current_user:
            member_record = session.exec(
                select(BookClubMember).where(
                    BookClubMember.book_club_id == club.id,
                    BookClubMember.user_id == current_user.id
                )
            ).first()
            
            if member_record:
                # 將 MemberRole 映射到 MembershipStatus
                membership_status = MembershipStatus(member_record.role.value)
            else:
                # 檢查是否有待處理的加入請求
                pending_request = session.exec(
                    select(ClubJoinRequest).where(
                        ClubJoinRequest.book_club_id == club.id,
                        ClubJoinRequest.user_id == current_user.id,
                        ClubJoinRequest.status == JoinRequestStatus.PENDING
                    )
                ).first()
                if pending_request:
                    membership_status = MembershipStatus.PENDING_REQUEST
        
        from app.models.user import UserRead
        
        result.append(BookClubReadWithDetails(
            id=club.id,
            name=club.name,
            description=club.description,
            visibility=club.visibility,
            cover_image_url=club.cover_image_url,
            owner_id=club.owner_id,
            created_at=club.created_at,
            updated_at=club.updated_at,
            owner=UserRead(
                id=owner.id,
                email=owner.email,
                display_name=owner.display_name,
                avatar_url=owner.avatar_url
            ) if owner else None,
            tags=[ClubTagRead(id=tag.id, name=tag.name, is_predefined=tag.is_predefined) for tag in tags],
            member_count=member_count,
            membership_status=membership_status
        ))
    
    total_pages = (total_items + page_size - 1) // page_size
    pagination = {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }
    
    return result, pagination

def get_book_club_by_id(
    session: Session,
    club_id: int,
    current_user: Optional[User] = None
) -> BookClubReadWithDetails:
    from sqlmodel import func
    
    book_club = session.get(BookClub, club_id)
    
    if not book_club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"讀書會 ID {club_id} 不存在"
        )
    
    owner = session.get(User, book_club.owner_id)
    
    tag_links = session.exec(
        select(BookClubTagLink).where(BookClubTagLink.book_club_id == club_id)
    ).all()
    tag_ids_for_club = [link.tag_id for link in tag_links]
    tags = session.exec(
        select(ClubTag).where(ClubTag.id.in_(tag_ids_for_club))
    ).all() if tag_ids_for_club else []
    
    member_count = session.exec(
        select(func.count(BookClubMember.user_id)).where(
            BookClubMember.book_club_id == club_id
        )
    ).one()
    
    membership_status: Optional[MembershipStatus] = MembershipStatus.NOT_MEMBER
    if current_user:
        member_record = session.exec(
            select(BookClubMember).where(
                BookClubMember.book_club_id == club_id,
                BookClubMember.user_id == current_user.id
            )
        ).first()
        if member_record:
            membership_status = MembershipStatus(member_record.role.value)
        else:
            # 檢查是否有待處理的加入請求（所有讀書會都需要審核）
            request_record = session.exec(
                select(ClubJoinRequest).where(
                    ClubJoinRequest.book_club_id == club_id,
                    ClubJoinRequest.user_id == current_user.id,
                    ClubJoinRequest.status == JoinRequestStatus.PENDING
                )
            ).first()
            if request_record:
                membership_status = MembershipStatus.PENDING_REQUEST

    from app.models.user import UserRead
    
    return BookClubReadWithDetails(
        id=book_club.id,
        name=book_club.name,
        description=book_club.description,
        visibility=book_club.visibility,
        cover_image_url=book_club.cover_image_url,
        owner_id=book_club.owner_id,
        created_at=book_club.created_at,
        updated_at=book_club.updated_at,
        owner=UserRead(
            id=owner.id,
            email=owner.email,
            display_name=owner.display_name,
            avatar_url=owner.avatar_url
        ) if owner else None,
        tags=[ClubTagRead(id=tag.id, name=tag.name, is_predefined=tag.is_predefined) for tag in tags],
        member_count=member_count,
        membership_status=membership_status
    )

def join_book_club(session: Session, club_id: int, user_id: int) -> ClubJoinRequest:
    """
    創建加入讀書會的請求（所有讀書會都需要審核）
    """
    print(f"---LOG: Entering join_book_club service for club_id: {club_id}, user_id: {user_id}")
    book_club = session.get(BookClub, club_id)
    if not book_club:
        print(f"---LOG: Club with id {club_id} not found")
        raise HTTPException(status_code=404, detail="讀書會不存在")

    print(f"---LOG: Checking if user is already a member")
    member_record = session.exec(
        select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == user_id)
    ).first()
    if member_record:
        print(f"---LOG: User is already a member, raising 409")
        raise HTTPException(status_code=409, detail="您已經是此讀書會的成員")

    # Check for existing pending request
    existing_request = session.exec(
        select(ClubJoinRequest).where(
            ClubJoinRequest.book_club_id == club_id,
            ClubJoinRequest.user_id == user_id,
            ClubJoinRequest.status == JoinRequestStatus.PENDING
        )
    ).first()
    if existing_request:
        print(f"---LOG: User already has pending request, raising 409")
        raise HTTPException(status_code=409, detail="您已送出過加入請求")

    print(f"---LOG: All checks passed. Creating join request.")
    new_request = ClubJoinRequest(user_id=user_id, book_club_id=club_id, status=JoinRequestStatus.PENDING)
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    print(f"---LOG: Join request successfully created.")
    return new_request

def leave_book_club(session: Session, club_id: int, user_id: int) -> None:
    member_record = session.exec(
        select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == user_id)
    ).first()

    if not member_record:
        raise HTTPException(status_code=404, detail="您不是此讀書會的成員")

    if member_record.role == MemberRole.OWNER:
        raise HTTPException(status_code=400, detail="擁有者無法退出，請先轉移擁有權或刪除讀書會")

    session.delete(member_record)
    session.commit()

def request_to_join_book_club(session: Session, club_id: int, user_id: int) -> ClubJoinRequest:
    """
    創建加入讀書會的請求（所有讀書會都需要審核）
    與 join_book_club 功能相同
    """
    return join_book_club(session, club_id, user_id)