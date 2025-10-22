from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session
from app.models.user import User, UserRead, UserUpdateDisplayName, UserLinkGoogle, UserProfileRead, UserProfileUpdate
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
    """獲取當前用戶的完整個人檔案"""
    return UserService.get_user_profile(session, user=current_user)


@router.put("/me/profile", response_model=UserProfileRead)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新當前用戶的個人檔案（顯示名稱、個人簡介）"""
    return UserService.update_profile(
        session=session, 
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
    """上傳新的個人頭像"""
    try:
        avatar_url = UserService.upload_avatar(session=session, user=current_user, file=file)
        return {"avatar_url": avatar_url, "message": "頭像上傳成功"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/me/interest-tags", response_model=List[InterestTagRead])
def add_my_interest_tag(
    tag_data: UserInterestTagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """為當前用戶新增一個興趣標籤"""
    try:
        user = UserService.add_interest_tag(session, current_user, tag_data.tag_id)
        # We need to refresh the user to get the updated tags list
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
    """移除當前用戶的一個興趣標籤"""
    try:
        UserService.remove_interest_tag(session, current_user, tag_id)
        return
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/me/display-name", response_model=UserRead, status_code=status.HTTP_200_OK)
def update_display_name(
    update_data: UserUpdateDisplayName,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    更新當前用戶的顯示名稱
    
    需要認證：Bearer Token
    
    - **display_name**: 新的顯示名稱（最多 50 字符）
    """
    # 更新顯示名稱
    current_user.display_name = update_data.display_name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user

@router.post("/me/link-google", status_code=status.HTTP_200_OK)
def link_google_account(
    link_data: UserLinkGoogle,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    綁定 Google 帳號到當前用戶
    
    需要認證：Bearer Token
    
    - **id_token**: Google 提供的 ID Token
    """
    # 驗證 Google ID Token
    google_info = UserService.verify_google_token(link_data.id_token)
    
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token"
        )
    
    # 綁定 Google 帳號
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
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    解綁當前用戶的 Google 帳號
    
    需要認證：Bearer Token
    
    注意：解綁前必須先設定密碼，否則會無法登入
    """
    # 解綁 Google 帳號
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
