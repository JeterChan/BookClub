from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session
from app.models.user import User, UserRead, UserUpdateDisplayName, UserProfileRead, UserProfileUpdate
from app.models.interest_tag import InterestTagRead, UserInterestTagCreate
from app.services.user_service import UserService
from app.db.session import get_session
from app.core.security import get_current_user

router = APIRouter()



@router.get("/me/profile", response_model=UserProfileRead)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_service = UserService(session)
    return user_service.get_user_profile(user=current_user)


@router.put("/me/profile", response_model=UserProfileRead)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_service = UserService(session)
    return user_service.update_profile(
        user=current_user, 
        display_name=profile_data.display_name, 
        bio=profile_data.bio
    )


@router.post("/me/avatar")
def upload_avatar(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    file: UploadFile = File(...)
):
    user_service = UserService(session)
    try:
        avatar_url = user_service.upload_avatar(user=current_user, file=file)
        return {"avatar_url": avatar_url, "message": "頭像上傳成功"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/me/interest-tags", response_model=List[InterestTagRead])
def add_my_interest_tag(
    tag_data: UserInterestTagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_service = UserService(session)
    try:
        user = user_service.add_interest_tag(current_user, tag_data.tag_id)
        session.refresh(user)
        return user.interest_tags
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/me/interest-tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_interest_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_service = UserService(session)
    try:
        user_service.remove_interest_tag(current_user, tag_id)
        return
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/me/display-name", response_model=UserRead, status_code=status.HTTP_200_OK)
def update_display_name(
    update_data: UserUpdateDisplayName,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    current_user.display_name = update_data.display_name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_service = UserService(session)
    user_service.deactivate_account(user=current_user)
    return