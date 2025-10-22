# backend/tests/unit/test_user_profile_service.py
import pytest
from sqlmodel import Session

from app.services.user_service import UserService
from app.services.interest_tag_service import interest_tag_service
from app.models.user import User


@pytest.fixture
def test_user(session: Session) -> User:
    """Provide a test user for profile tests."""
    user = User(email="profile-test@example.com", display_name="Test User")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def test_update_profile(session: Session, test_user: User):
    """測試更新個人檔案（名稱和簡介）"""
    new_name = "Updated Name"
    new_bio = "This is my new bio."
    updated_user = UserService.update_profile(session, test_user, new_name, new_bio)
    assert updated_user.display_name == new_name
    assert updated_user.bio == new_bio

def test_add_interest_tag(session: Session, test_user: User):
    """測試為用戶新增興趣標籤"""
    tag = interest_tag_service.create_custom_tag(session, "Testing Tag")
    user = UserService.add_interest_tag(session, test_user, tag.id)
    assert tag in user.interest_tags

def test_add_duplicate_interest_tag_raises_error(session: Session, test_user: User):
    """測試新增重複標籤時引發錯誤"""
    tag = interest_tag_service.create_custom_tag(session, "Duplicate Testing Tag")
    UserService.add_interest_tag(session, test_user, tag.id)
    with pytest.raises(ValueError, match="已新增過此標籤"):
        UserService.add_interest_tag(session, test_user, tag.id)

def test_add_interest_tag_limit_raises_error(session: Session, test_user: User):
    """測試用戶標籤達到 20 個上限時引發錯誤"""
    for i in range(20):
        tag = interest_tag_service.create_custom_tag(session, f"Tag #{i}")
        UserService.add_interest_tag(session, test_user, tag.id)
    
    # The 21st tag should fail
    last_tag = interest_tag_service.create_custom_tag(session, "The Last Tag")
    with pytest.raises(ValueError, match="興趣標籤數量已達上限"):
        UserService.add_interest_tag(session, test_user, last_tag.id)

def test_remove_interest_tag(session: Session, test_user: User):
    """測試移除用戶的興趣標籤"""
    tag = interest_tag_service.create_custom_tag(session, "Tag to Remove")
    UserService.add_interest_tag(session, test_user, tag.id)
    assert tag in test_user.interest_tags

    user = UserService.remove_interest_tag(session, test_user, tag.id)
    assert tag not in user.interest_tags

def test_get_user_profile(session: Session, test_user: User):
    """測試獲取用戶檔案時能正確載入關聯的標籤"""
    tag = interest_tag_service.create_custom_tag(session, "Profile Tag")
    UserService.add_interest_tag(session, test_user, tag.id)

    # Get a fresh instance of the user and get profile
    user_instance = session.get(User, test_user.id)
    profile = UserService.get_user_profile(session, user_instance)
    assert len(profile.interest_tags) == 1
    assert profile.interest_tags[0].name == "Profile Tag"
