# backend/app/services/interest_tag_service.py
from typing import List, Optional
from sqlmodel import Session, select, func

from app.models.interest_tag import InterestTag


class InterestTagService:
    def get_all_tags(
        self,
        session: Session,
        predefined_only: bool = False,
        search: Optional[str] = None
    ) -> List[InterestTag]:
        """獲取所有興趣標籤，可選擇只看預設或依名稱搜尋"""
        query = select(InterestTag)
        if predefined_only:
            query = query.where(InterestTag.is_predefined == True)
        if search:
            query = query.where(func.lower(InterestTag.name).contains(search.lower()))
        
        return session.exec(query).all()

    def create_custom_tag(self, session: Session, name: str) -> InterestTag:
        """創建一個新的自定義興趣標籤，並檢查名稱是否重複"""
        # Case-insensitive check for existing tag
        existing_tag = session.exec(
            select(InterestTag).where(func.lower(InterestTag.name) == name.lower())
        ).first()
        if existing_tag:
            raise ValueError(f"標籤 '{name}' 已存在")

        new_tag = InterestTag(name=name, is_predefined=False)
        session.add(new_tag)
        session.commit()
        session.refresh(new_tag)
        return new_tag

    def get_tag_by_id(self, session: Session, tag_id: int) -> Optional[InterestTag]:
        """依 ID 獲取單一興趣標籤"""
        return session.get(InterestTag, tag_id)


interest_tag_service = InterestTagService()
