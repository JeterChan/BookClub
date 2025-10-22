# backend/tests/unit/test_interest_tag_service.py
import pytest
from sqlmodel import Session, delete

from app.services.interest_tag_service import interest_tag_service
from app.models.interest_tag import InterestTag


def test_create_custom_tag(session: Session):
    """測試成功創建自定義標籤"""
    tag_name = "New Custom Tag"
    tag = interest_tag_service.create_custom_tag(session, tag_name)
    assert tag.name == tag_name
    assert tag.is_predefined is False
    db_tag = session.get(InterestTag, tag.id)
    assert db_tag is not None

def test_create_duplicate_tag_raises_error(session: Session):
    """測試創建重複標籤（不區分大小寫）時應引發錯誤"""
    tag_name = "Duplicate Tag"
    interest_tag_service.create_custom_tag(session, tag_name)
    with pytest.raises(ValueError, match=f"標籤 '{tag_name.lower()}' 已存在"):
        interest_tag_service.create_custom_tag(session, tag_name.lower())

def test_get_all_tags(session: Session):
    """測試獲取所有標籤"""
    # Clear and create some tags
    session.exec(delete(InterestTag))
    session.commit()
    interest_tag_service.create_custom_tag(session, "Tag A")
    interest_tag_service.create_custom_tag(session, "Tag B")
    
    tags = interest_tag_service.get_all_tags(session)
    assert len(tags) == 2

def test_get_all_tags_predefined_only(session: Session):
    """測試只獲取預設標籤"""
    session.exec(delete(InterestTag))
    session.commit()
    session.add(InterestTag(name="Predefined 1", is_predefined=True))
    session.add(InterestTag(name="Custom 1", is_predefined=False))
    session.commit()

    tags = interest_tag_service.get_all_tags(session, predefined_only=True)
    assert len(tags) == 1
    assert tags[0].name == "Predefined 1"

def test_get_all_tags_with_search(session: Session):
    """測試依名稱搜尋標籤"""
    session.exec(delete(InterestTag))
    session.commit()
    interest_tag_service.create_custom_tag(session, "Searchable Tag")
    interest_tag_service.create_custom_tag(session, "Another One")

    tags = interest_tag_service.get_all_tags(session, search="searchable")
    assert len(tags) == 1
    assert tags[0].name == "Searchable Tag"

def test_get_tag_by_id(session: Session):
    """測試依 ID 獲取標籤"""
    tag = interest_tag_service.create_custom_tag(session, "Tag For ID Test")
    found_tag = interest_tag_service.get_tag_by_id(session, tag.id)
    assert found_tag is not None
    assert found_tag.id == tag.id
