from sqlmodel import Session, select
from app.models.notification import Notification, NotificationType
from app.models.event import Event
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_join_request import ClubJoinRequest
from app.models.book_club import BookClub
from app.models.user import User


def notify_new_join_request(session: Session, club_id: int, request: ClubJoinRequest) -> None:
    """
    發送加入請求通知給讀書會的擁有者和管理員
    
    Args:
        session: 資料庫 session
        club_id: 讀書會 ID
        request: 加入請求物件
    """
    # 查詢讀書會資訊
    book_club = session.get(BookClub, club_id)
    if not book_club:
        return
    
    # 查詢申請人資訊
    applicant = session.get(User, request.user_id)
    if not applicant:
        return
    
    # 查詢讀書會的 owner 和 admin
    admins_and_owners = session.exec(
        select(BookClubMember)
        .where(
            BookClubMember.book_club_id == club_id,
            BookClubMember.role.in_([MemberRole.OWNER, MemberRole.ADMIN])
        )
    ).all()
    
    # 為每個 owner 和 admin 建立通知
    for member in admins_and_owners:
        notification = Notification(
            recipient_id=member.user_id,
            type=NotificationType.NEW_MEMBER,
            content={
                "user_id": applicant.id,
                "user_display_name": applicant.display_name,
                "club_id": book_club.id,
                "club_name": book_club.name,
                "request_id": request.id
            }
        )
        session.add(notification)
    
    session.commit()


def notify_event_created(session: Session, event: Event) -> None:
    """
    發送活動建立通知給讀書會所有成員
    
    Args:
        session: 資料庫 session
        event: 建立的活動
    """
    # 查詢讀書會所有成員
    members = session.exec(
        select(BookClubMember)
        .where(BookClubMember.book_club_id == event.club_id)
    ).all()
    
    # 為每個成員建立通知（排除活動發起人自己）
    for member in members:
        if member.user_id == event.organizer_id:
            continue
            
        notification = Notification(
            recipient_id=member.user_id,
            type=NotificationType.EVENT_CREATED,
            content={
                "event_id": event.id,
                "event_title": event.title,
                "event_datetime": event.event_datetime.isoformat(),
                "organizer_id": event.organizer_id,
                "club_id": event.club_id
            }
        )
        session.add(notification)
    
    session.commit()
