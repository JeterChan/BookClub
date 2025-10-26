# backend/app/services/club_management_service.py
from typing import List
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.book_club import BookClub
from app.models.book_club_member import BookClubMember, MemberRole
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus
from app.models.user import User

class ClubManagementService:
    def __init__(self, session: Session):
        self.session = session

    def get_join_requests(self, *, club_id: int) -> List[ClubJoinRequest]:
        statement = select(ClubJoinRequest).where(
            ClubJoinRequest.book_club_id == club_id,
            ClubJoinRequest.status == JoinRequestStatus.PENDING
        ).options(selectinload(ClubJoinRequest.user))
        return self.session.exec(statement).all()

    def approve_join_request(self, *, request_id: int, club_id: int) -> None:
        join_request = self.session.get(ClubJoinRequest, request_id)
        if not join_request or join_request.book_club_id != club_id or join_request.status != JoinRequestStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found or not pending")

        # Check if user is already a member
        existing_member = self.session.exec(
            select(BookClubMember).where(
                BookClubMember.book_club_id == club_id,
                BookClubMember.user_id == join_request.user_id
            )
        ).first()
        if existing_member:
            join_request.status = JoinRequestStatus.REJECTED # Or just delete
            self.session.add(join_request)
            self.session.commit()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member of this club")

        # Update request status
        join_request.status = JoinRequestStatus.APPROVED

        # Add user to members
        new_member = BookClubMember(
            user_id=join_request.user_id,
            book_club_id=join_request.book_club_id,
            role=MemberRole.MEMBER
        )
        self.session.add(new_member)
        self.session.add(join_request)
        self.session.commit()

    def reject_join_request(self, *, request_id: int, club_id: int) -> None:
        join_request = self.session.get(ClubJoinRequest, request_id)
        if not join_request or join_request.book_club_id != club_id or join_request.status != JoinRequestStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found or not pending")

        join_request.status = JoinRequestStatus.REJECTED
        self.session.add(join_request)
        self.session.commit()

    def get_club_members(self, *, club_id: int) -> List[BookClubMember]:
        statement = select(BookClubMember).where(
            BookClubMember.book_club_id == club_id
        ).options(selectinload(BookClubMember.user))
        return self.session.exec(statement).all()

    def update_member_role(self, *, club_id: int, target_user_id: int, new_role: MemberRole, acting_user: User) -> BookClubMember:
        # Get the membership of the user whose role is to be changed
        target_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == target_user_id)
        ).first()
        if not target_membership:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user is not a member of this club")

        # Get the membership of the user performing the action
        acting_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == acting_user.id)
        ).first()
        if not acting_membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acting user is not a member of this club")

        # Permission checks
        # No one can change the owner's role except for ownership transfer
        if target_membership.role == MemberRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot change the role of the club owner")

        # Admins cannot change other admins' roles
        if acting_membership.role == MemberRole.ADMIN and target_membership.role == MemberRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot change other admins\' roles")

        # Only owners can promote to admin
        if new_role == MemberRole.ADMIN and acting_membership.role != MemberRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can promote members to admin")

        target_membership.role = new_role
        self.session.add(target_membership)
        self.session.commit()
        self.session.refresh(target_membership)
        return target_membership

    def remove_member(self, *, club_id: int, target_user_id: int, acting_user: User) -> None:
        # Get the membership of the user to be removed
        target_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == target_user_id)
        ).first()
        if not target_membership:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user is not a member of this club")

        # Get the membership of the user performing the action
        acting_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.book_club_id == club_id, BookClubMember.user_id == acting_user.id)
        ).first()
        if not acting_membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acting user is not a member of this club")

        # Permission checks
        # Owner cannot be removed
        if target_membership.role == MemberRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot remove the club owner")

        # Admins cannot remove other admins
        if acting_membership.role == MemberRole.ADMIN and target_membership.role == MemberRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins cannot remove other admins")

        self.session.delete(target_membership)
        self.session.commit()

    def transfer_ownership(self, *, club_id: int, new_owner_id: int, acting_user: User) -> None:
        if acting_user.id == new_owner_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New owner cannot be the same as the current owner")

        # Get the club
        book_club = self.session.get(BookClub, club_id)
        if not book_club:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book club not found")

        # Get current owner's membership
        current_owner_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.user_id == acting_user.id, BookClubMember.book_club_id == club_id)
        ).first()

        # Get new owner's membership
        new_owner_membership = self.session.exec(
            select(BookClubMember).where(BookClubMember.user_id == new_owner_id, BookClubMember.book_club_id == club_id)
        ).first()

        if not new_owner_membership:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="New owner is not a member of this club")

        # Start transaction
        try:
            # 1. Update BookClub owner_id
            book_club.owner_id = new_owner_id
            self.session.add(book_club)

            # 2. Downgrade old owner to Admin
            if current_owner_membership:
                current_owner_membership.role = MemberRole.ADMIN
                self.session.add(current_owner_membership)

            # 3. Promote new owner to Owner
            new_owner_membership.role = MemberRole.OWNER
            self.session.add(new_owner_membership)

            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred during ownership transfer: {e}")
