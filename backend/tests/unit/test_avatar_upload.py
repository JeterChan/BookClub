# backend/tests/unit/test_avatar_upload.py
import pytest
import os
import io
import base64
import time
from unittest.mock import MagicMock
from sqlmodel import Session
from fastapi import UploadFile

from app.services.user_service import UserService
from app.models.user import User

# A valid 1x1 transparent PNG
VALID_PNG_BYTES = base64.b64decode(b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')


@pytest.fixture
def test_user_for_upload(session: Session) -> User:
    """Provide a test user for upload tests."""
    user = User(email="upload-test@example.com", display_name="Upload User")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def create_mock_upload_file(filename: str, content: bytes, content_type: str) -> UploadFile:
    """Helper to create a mock UploadFile."""
    mock_file = io.BytesIO(content)
    headers = {"content-type": content_type}
    return UploadFile(filename=filename, file=mock_file, headers=headers)


def test_upload_avatar_success(session: Session, test_user_for_upload: User, tmp_path):
    """測試成功上傳頭像 (PNG)"""
    # Create a dummy image file
    file = create_mock_upload_file("avatar.png", VALID_PNG_BYTES, "image/png")

    # Mock the os.makedirs and shutil.copyfileobj to avoid actual file IO in unit test
    user_service = UserService(session)
    user_service.upload_avatar(test_user_for_upload, file)

    assert test_user_for_upload.avatar_url is not None
    assert test_user_for_upload.avatar_url.startswith("/uploads/avatars/")
    assert test_user_for_upload.avatar_url.endswith(".png")

    # Clean up the created file if it exists
    avatar_path = test_user_for_upload.avatar_url.lstrip("/")
    if os.path.exists(avatar_path):
        os.remove(avatar_path)

def test_upload_avatar_too_large_raises_error(session: Session, test_user_for_upload: User):
    """測試上傳過大檔案時引發錯誤"""
    large_content = b"a" * (3 * 1024 * 1024) # 3MB
    file = create_mock_upload_file("large.jpg", large_content, "image/jpeg")
    user_service = UserService(session)
    with pytest.raises(ValueError, match="檔案大小不可超過 2MB"):
        user_service.upload_avatar(test_user_for_upload, file)

def test_upload_avatar_invalid_type_raises_error(session: Session, test_user_for_upload: User):
    """測試上傳無效檔案類型時引發錯誤"""
    file = create_mock_upload_file("document.pdf", b"pdf content", "application/pdf")
    user_service = UserService(session)
    with pytest.raises(ValueError, match="不支援的檔案類型"):
        user_service.upload_avatar(test_user_for_upload, file)

def test_upload_avatar_corrupted_image_raises_error(session: Session, test_user_for_upload: User):
    """測試上傳損毀圖片時引發錯誤"""
    file = create_mock_upload_file("corrupted.png", b"not a real png", "image/png")
    user_service = UserService(session)
    with pytest.raises(ValueError, match="無效的圖片檔案"):
        user_service.upload_avatar(test_user_for_upload, file)

def test_upload_new_avatar_deletes_old_one(session: Session, test_user_for_upload: User):
    """測試上傳新頭像時會刪除舊的頭像檔案"""
    # 1. Upload first avatar
    first_file = create_mock_upload_file("first.png", VALID_PNG_BYTES, "image/png")
    user_service = UserService(session)
    user_service.upload_avatar(test_user_for_upload, first_file)
    old_avatar_path = test_user_for_upload.avatar_url.lstrip("/")
    assert os.path.exists(old_avatar_path)

    # Wait 1 second to ensure a different timestamp
    time.sleep(1)

    # 2. Upload second avatar
    second_file = create_mock_upload_file("second.png", VALID_PNG_BYTES, "image/png")
    user_service.upload_avatar(test_user_for_upload, second_file)
    new_avatar_path = test_user_for_upload.avatar_url.lstrip("/")

    # 3. Assert old file is deleted and new one exists
    assert not os.path.exists(old_avatar_path)
    assert os.path.exists(new_avatar_path)

    # Clean up
    if os.path.exists(new_avatar_path):
        os.remove(new_avatar_path)
