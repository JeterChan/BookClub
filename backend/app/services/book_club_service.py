from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.book_club import BookClub, BookClubCreate, BookClubVisibility
from app.models.book_club_member import BookClubMember, MemberRole, MembershipStatus
from app.models.club_tag import ClubTag, BookClubTagLink
from app.models.user import User
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.schemas.book_club import BookClubReadWithDetails, BookClubUpdate
from app.models.club_tag import ClubTagRead

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
    book_club_data: BookClubCreate
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
    
    # 2. 建立 BookClub 實例
    book_club = BookClub(
        name=book_club_data.name,
        description=book_club_data.description,
        visibility=book_club_data.visibility,
        cover_image_url=book_club_data.cover_image_url,
        owner_id=current_user.id
    )
    
    session.add(book_club)
    session.flush()  # 取得 book_club.id
    
    # 3. 關聯標籤至讀書會
    for tag in tags:
        tag_link = BookClubTagLink(
            book_club_id=book_club.id,
            tag_id=tag.id
        )
        session.add(tag_link)
    
    # 4. 自動建立 BookClubMember 記錄 (role=OWNER)
    member = BookClubMember(
        user_id=current_user.id,
        book_club_id=book_club.id,
        role=MemberRole.OWNER
    )
    session.add(member)
    
    session.commit()
    session.refresh(book_club)
    
    # 5. 構建回應資料
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
            display_name=current_user.display_name
        ),
        tags=[ClubTagRead(id=tag.id, name=tag.name, is_predefined=tag.is_predefined) for tag in tags],
        member_count=1
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
    tag_ids: Optional[List[int]] = None
) -> tuple[List[BookClubReadWithDetails], dict]:
    from sqlmodel import func, col
    
    query = select(BookClub).where(BookClub.visibility == "public")
    
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
            member_count=member_count
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
        elif book_club.visibility == BookClubVisibility.PRIVATE:
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

def join_book_club(session: Session, club_id: int, user_id: int) -> None:
    print(f"---LOG: Entering join_book_club service for club_id: {club_id}, user_id: {user_id}")
    book_club = session.get(BookClub, club_id)
    if not book_club:
        print(f"---LOG: Club with id {club_id} not found")
        raise HTTPException(status_code=404, detail="讀書會不存在")

    print(f"---LOG: Checking club visibility. Visibility is {book_club.visibility}")
    if book_club.visibility != BookClubVisibility.PUBLIC:
        print(f"---LOG: Club is not public, raising 400")
        raise HTTPException(status_code=400, detail="此為私密讀書會，無法直接加入")

    print(f"---LOG: Checking if user is already a member")
    member_record = session.exec(
        select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == user_id)
    ).first()
    if member_record:
        print(f"---LOG: User is already a member, raising 409")
        raise HTTPException(status_code=409, detail="您已經是此讀書會的成員")

    print(f"---LOG: All checks passed. Adding user to club.")
    new_member = BookClubMember(user_id=user_id, book_club_id=club_id, role=MemberRole.MEMBER)
    session.add(new_member)
    session.commit()
    print(f"---LOG: User successfully added to club.")

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
    book_club = session.get(BookClub, club_id)
    if not book_club:
        raise HTTPException(status_code=404, detail="讀書會不存在")

    if book_club.visibility != BookClubVisibility.PRIVATE:
        raise HTTPException(status_code=400, detail="此為公開讀書會，可直接加入")

    member_record = session.exec(
        select(BookClubMember).where(
            BookClubMember.book_club_id == club_id, BookClubMember.user_id == user_id)
    ).first()
    if member_record:
        raise HTTPException(status_code=409, detail="您已經是此讀書會的成員")

    existing_request = session.exec(
        select(ClubJoinRequest).where(
            ClubJoinRequest.book_club_id == club_id,
            ClubJoinRequest.user_id == user_id,
            ClubJoinRequest.status == JoinRequestStatus.PENDING
        )
    ).first()
    if existing_request:
        raise HTTPException(status_code=409, detail="您已送出過加入請求")

    new_request = ClubJoinRequest(user_id=user_id, book_club_id=club_id, status=JoinRequestStatus.PENDING)
    session.add(new_request)
    session.commit()
    session.refresh(new_request)
    return new_request