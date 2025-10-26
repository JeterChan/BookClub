from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session
from app.models.user import User, UserRead, UserUpdateDisplayName, UserLinkGoogle, UserProfileRead, UserProfileUpdate
from app.models.interest_tag import InterestTagRead, UserInterestTagCreate
from app.services.user_service import UserService
from app.db.session import get_session
from app.core.security import get_current_user

router = APIRouter()

def get_user_from_payload(session: Session, payload: dict) -> User:
    email = payload.get("sub")
    user = UserService.get_by_email(session, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/profile", response_model=UserProfileRead)
def get_user_profile(
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    return UserService.get_user_profile(session, user=current_user)


@router.put("/me/profile", response_model=UserProfileRead)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    return UserService.update_profile(
        session=session, 
        user=current_user, 
        display_name=profile_data.display_name, 
        bio=profile_data.bio
    )


@router.post("/me/avatar")
def upload_avatar(
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session),
    file: UploadFile = File(...)
):
    current_user = get_user_from_payload(session, current_user_payload)
    try:
        avatar_url = UserService.upload_avatar(session=session, user=current_user, file=file)
        return {"avatar_url": avatar_url, "message": "頭像上傳成功"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/me/interest-tags", response_model=List[InterestTagRead])
def add_my_interest_tag(
    tag_data: UserInterestTagCreate,
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    try:
        user = UserService.add_interest_tag(session, current_user, tag_data.tag_id)
        session.refresh(user)
        return user.interest_tags
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/me/interest-tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_interest_tag(
    tag_id: int,
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    try:
        UserService.remove_interest_tag(session, current_user, tag_id)
        return
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/me/display-name", response_model=UserRead, status_code=status.HTTP_200_OK)
def update_display_name(
    update_data: UserUpdateDisplayName,
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    current_user.display_name = update_data.display_name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.post("/me/link-google", status_code=status.HTTP_200_OK)
def link_google_account(
    link_data: UserLinkGoogle,
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    google_info = UserService.verify_google_token(link_data.id_token)
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token"
        )
    try:
        UserService.link_google_account(session, current_user, google_info['google_id'])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    return {"message": "Google account linked successfully"}

@router.delete("/me/unlink-google", status_code=status.HTTP_200_OK)
def unlink_google_account(
    current_user_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user = get_user_from_payload(session, current_user_payload)
    try:
        UserService.unlink_google_account(session, current_user)
    except ValueError as e:
        error_detail = str(e)
        if "no password set" in error_detail.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_detail
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_detail
            )
    return {"message": "Google account unlinked successfully"}