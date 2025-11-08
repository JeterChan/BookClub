from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.models.book_club_member import BookClubMember
from app.models.event import Event
from app.db.session import get_session
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()


class NotificationRead(BaseModel):
    id: int
    type: NotificationType
    content: dict
    is_read: bool
    created_at: datetime
    recipient_id: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationRead])
def get_notifications(
    is_read: Optional[bool] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    獲取當前用戶的通知列表，只顯示用戶有權限查看的通知
    
    Args:
        is_read: 篩選已讀/未讀通知（可選）
        limit: 限制返回數量，預設 20
        current_user: 當前登入用戶
        session: 資料庫 session
    
    Returns:
        通知列表，按建立時間降序排序，已過濾無權限查看的通知
    """
    query = select(Notification).where(Notification.recipient_id == current_user.id)
    
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    
    query = query.order_by(Notification.id.desc()).limit(limit * 2)  # 多取一些以便過濾後還有足夠數量
    
    all_notifications = session.exec(query).all()
    
    # 過濾通知：檢查用戶是否有權限查看
    filtered_notifications = []
    for notification in all_notifications:
        has_permission = False
        
        if notification.type == NotificationType.NEW_MEMBER:
            # NEW_MEMBER: 檢查用戶是否是該讀書會的 owner 或 admin
            club_id = notification.content.get("club_id")
            if club_id:
                membership = session.exec(
                    select(BookClubMember).where(
                        BookClubMember.user_id == current_user.id,
                        BookClubMember.book_club_id == club_id
                    )
                ).first()
                
                if membership and membership.role in ["owner", "admin"]:
                    has_permission = True
        
        elif notification.type == NotificationType.EVENT_CREATED:
            # EVENT_CREATED: 檢查用戶是否是該讀書會成員
            club_id = notification.content.get("club_id")
            if club_id:
                membership = session.exec(
                    select(BookClubMember).where(
                        BookClubMember.user_id == current_user.id,
                        BookClubMember.book_club_id == club_id
                    )
                ).first()
                
                if membership:
                    has_permission = True
        
        else:
            # 其他類型的通知預設顯示
            has_permission = True
        
        if has_permission:
            filtered_notifications.append(notification)
            
        # 達到限制數量就停止
        if len(filtered_notifications) >= limit:
            break
    
    return filtered_notifications


@router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    將指定通知標記為已讀
    
    Args:
        notification_id: 通知 ID
        current_user: 當前登入用戶
        session: 資料庫 session
    
    Returns:
        204 No Content
    
    Raises:
        404: 通知不存在或不屬於當前用戶
    """
    notification = session.get(Notification, notification_id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    # 驗證通知屬於當前用戶
    if notification.recipient_id != current_user.id:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    notification.is_read = True
    session.add(notification)
    session.commit()
    
    return None
