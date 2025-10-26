# backend/app/schemas/club_management.py
from datetime import datetime
from sqlmodel import SQLModel

from app.models.club_join_request import JoinRequestStatus
from app.models.user import UserRead
from app.models.book_club_member import MemberRole

class ClubJoinRequestRead(SQLModel):
    id: int
    user_id: int
    book_club_id: int
    status: JoinRequestStatus
    created_at: datetime
    user: UserRead

class ClubMemberRead(SQLModel):
    role: MemberRole
    user: UserRead

class UpdateMemberRoleRequest(SQLModel):
    role: MemberRole

class TransferOwnershipRequest(SQLModel):
    new_owner_id: int
