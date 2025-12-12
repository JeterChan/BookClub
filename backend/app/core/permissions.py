from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.book_club_member import MemberRole
from app.models.user import User
from app.services.member_service import MemberService

def get_member_service(session: Session = Depends(get_session)) -> MemberService:
    return MemberService(session)

class ClubPermissionChecker:
    def __init__(self, *, required_roles: list[MemberRole]):
        self.required_roles = required_roles

    def __call__(self, club_id: int, current_user: User = Depends(get_current_user), member_service: MemberService = Depends(get_member_service)) -> User:
        membership = member_service.get_membership(user_id=current_user.id, club_id=club_id)

        if not membership or membership.role not in self.required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
        
        return current_user

# Specific permission dependencies
club_owner_or_admin_required = ClubPermissionChecker(required_roles=[MemberRole.OWNER, MemberRole.ADMIN])
club_owner_required = ClubPermissionChecker(required_roles=[MemberRole.OWNER])
club_member_required = ClubPermissionChecker(required_roles=[MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER])
