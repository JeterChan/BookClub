from sqlmodel import Session, select
from app.models.notification import Notification, NotificationType
from app.models.event import Event
from app.models.book_club_member import BookClubMember


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
