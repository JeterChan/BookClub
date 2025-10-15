from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.models.user import UserRead, UserUpdateDisplayName, UserLinkGoogle
from app.services.user_service import UserService
from app.db.session import get_session
from app.core.security import get_current_user

router = APIRouter()

@router.patch("/me/display-name", response_model=UserRead, status_code=status.HTTP_200_OK)
def update_display_name(
    update_data: UserUpdateDisplayName,
    token_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    更新當前用戶的顯示名稱
    
    需要認證：Bearer Token
    
    - **display_name**: 新的顯示名稱（最多 50 字符）
    """
    # 從 token 取得用戶 email
    email = token_payload.get("sub")
    
    # 查詢用戶
    user = UserService.get_by_email(session, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 更新顯示名稱
    user.display_name = update_data.display_name
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user

@router.post("/me/link-google", status_code=status.HTTP_200_OK)
def link_google_account(
    link_data: UserLinkGoogle,
    token_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    綁定 Google 帳號到當前用戶
    
    需要認證：Bearer Token
    
    - **id_token**: Google 提供的 ID Token
    """
    # 從 token 取得用戶 email
    email = token_payload.get("sub")
    
    # 查詢用戶
    user = UserService.get_by_email(session, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 驗證 Google ID Token
    google_info = UserService.verify_google_token(link_data.id_token)
    
    if not google_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google ID token"
        )
    
    # 綁定 Google 帳號
    try:
        UserService.link_google_account(session, user, google_info['google_id'])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    
    return {"message": "Google account linked successfully"}

@router.delete("/me/unlink-google", status_code=status.HTTP_200_OK)
def unlink_google_account(
    token_payload: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    解綁當前用戶的 Google 帳號
    
    需要認證：Bearer Token
    
    注意：解綁前必須先設定密碼，否則會無法登入
    """
    # 從 token 取得用戶 email
    email = token_payload.get("sub")
    
    # 查詢用戶
    user = UserService.get_by_email(session, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 解綁 Google 帳號
    try:
        UserService.unlink_google_account(session, user)
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
