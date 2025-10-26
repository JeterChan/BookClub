# backend/app/api/endpoints/club_members.py
from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.session import get_session
from app.core.permissions import club_owner_or_admin_required, club_member_required, club_owner_required
from app.models.user import User
from app.services.club_management_service import ClubManagementService
from app.schemas.club_management import ClubJoinRequestRead, ClubMemberRead, UpdateMemberRoleRequest, TransferOwnershipRequest

router = APIRouter()

def get_club_management_service(session: Session = Depends(get_session)) -> ClubManagementService:
    return ClubManagementService(session)

@router.get("/{club_id}/join-requests", response_model=List[ClubJoinRequestRead])
def get_pending_join_requests(
    club_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    user = Depends(club_owner_or_admin_required)
):
    """Get all pending join requests for a club."""
    return service.get_join_requests(club_id=club_id)


@router.post("/{club_id}/join-requests/{request_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
def approve_join_request(
    club_id: int,
    request_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    user = Depends(club_owner_or_admin_required)
):
    """Approve a pending join request."""
    service.approve_join_request(request_id=request_id, club_id=club_id)
    return


@router.post("/{club_id}/join-requests/{request_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
def reject_join_request(
    club_id: int,
    request_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    user = Depends(club_owner_or_admin_required)
):
    """Reject a pending join request."""
    service.reject_join_request(request_id=request_id, club_id=club_id)
    return


@router.get("/{club_id}/members", response_model=List[ClubMemberRead])
def get_club_members(
    club_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    user = Depends(club_member_required)
):
    """Get a list of all members in a club."""
    return service.get_club_members(club_id=club_id)


@router.put("/{club_id}/members/{user_id}/role", response_model=ClubMemberRead)
def update_member_role(
    club_id: int,
    user_id: int,
    role_update: UpdateMemberRoleRequest,
    service: ClubManagementService = Depends(get_club_management_service),
    acting_user: User = Depends(club_owner_or_admin_required)
):
    """Update a member's role in a club."""
    return service.update_member_role(
        club_id=club_id, 
        target_user_id=user_id, 
        new_role=role_update.role, 
        acting_user=acting_user
    )


@router.delete("/{club_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    club_id: int,
    user_id: int,
    service: ClubManagementService = Depends(get_club_management_service),
    acting_user: User = Depends(club_owner_or_admin_required)
):
    """Remove a member from a club."""
    service.remove_member(club_id=club_id, target_user_id=user_id, acting_user=acting_user)
    return


@router.post("/{club_id}/transfer-ownership", status_code=status.HTTP_204_NO_CONTENT)
def transfer_ownership(
    club_id: int,
    request: TransferOwnershipRequest,
    service: ClubManagementService = Depends(get_club_management_service),
    acting_user: User = Depends(club_owner_required)
):
    """Transfer club ownership to another member."""
    service.transfer_ownership(
        club_id=club_id, 
        new_owner_id=request.new_owner_id, 
        acting_user=acting_user
    )
    return
