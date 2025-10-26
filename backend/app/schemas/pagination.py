# backend/app/schemas/pagination.py
from pydantic import BaseModel


class PaginationMeta(BaseModel):
    """分頁資訊（統一使用 snake_case）"""
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool
