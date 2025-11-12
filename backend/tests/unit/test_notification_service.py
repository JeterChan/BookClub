import pytest
from sqlmodel import Session
from app.services import notification_service
from app.models.notification import Notification, NotificationType
from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.models.user import User


def test_notify_new_join_request_creates_notifications_for_admins(session: Session):
    """測試新加入請求會為管理員和擁有者創建通知"""
    # 創建測試用戶
    owner = User(email="owner@test.com", hashed_password="hash", display_name="Owner")
    admin = User(email="admin@test.com", hashed_password="hash", display_name="Admin")
    member = User(email="member@test.com", hashed_password="hash", display_name="Member")
    applicant = User(email="applicant@test.com", hashed_password="hash", display_name="Applicant")
    
    session.add_all([owner, admin, member, applicant])
    session.commit()
    
    # 創建讀書會
    club = BookClub(name="Test Club", description="Test", visibility="public", owner_id=owner.id)
    session.add(club)
    session.commit()
    
    # 創建成員
    owner_member = BookClubMember(user_id=owner.id, book_club_id=club.id, role=MemberRole.OWNER)
    admin_member = BookClubMember(user_id=admin.id, book_club_id=club.id, role=MemberRole.ADMIN)
    regular_member = BookClubMember(user_id=member.id, book_club_id=club.id, role=MemberRole.MEMBER)
    
    session.add_all([owner_member, admin_member, regular_member])
    session.commit()
    
    # 創建加入請求
    request = ClubJoinRequest(user_id=applicant.id, book_club_id=club.id, status=JoinRequestStatus.PENDING)
    session.add(request)
    session.commit()
    
    # 執行通知函數
    notification_service.notify_new_join_request(session, club.id, request)
    
    # 驗證通知
    from sqlmodel import select
    notifications = session.exec(select(Notification)).all()
    
    # 應該只為 owner 和 admin 創建通知，不為 regular member 創建
    assert len(notifications) == 2
    
    recipient_ids = {n.recipient_id for n in notifications}
    assert owner.id in recipient_ids
    assert admin.id in recipient_ids
    assert member.id not in recipient_ids
    
    # 驗證通知內容
    for notif in notifications:
        assert notif.type == NotificationType.NEW_MEMBER
        assert notif.content['user_id'] == applicant.id
        assert notif.content['user_display_name'] == "Applicant"
        assert notif.content['club_id'] == club.id
        assert notif.content['club_name'] == "Test Club"
        assert notif.content['request_id'] == request.id
        assert notif.is_read == False
