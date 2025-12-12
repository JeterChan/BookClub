"""add_predefined_club_tags

Revision ID: cb5434e13b4e
Revises: 96905e63a696
Create Date: 2025-10-24 16:25:06.114560

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'cb5434e13b4e'
down_revision: Union[str, Sequence[str], None] = '96905e63a696'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 插入預設的讀書會標籤
    op.execute("""
        INSERT INTO clubtag (name, is_predefined, created_at) VALUES
        ('文學', true, NOW()),
        ('商業', true, NOW()),
        ('科技', true, NOW()),
        ('歷史', true, NOW()),
        ('哲學', true, NOW()),
        ('心理學', true, NOW()),
        ('自我成長', true, NOW()),
        ('小說', true, NOW()),
        ('傳記', true, NOW()),
        ('科幻', true, NOW()),
        ('奇幻', true, NOW()),
        ('推理', true, NOW()),
        ('藝術', true, NOW()),
        ('旅遊', true, NOW()),
        ('烹飪', true, NOW())
        ON CONFLICT (name) DO NOTHING;
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # 移除預設標籤
    op.execute("""
        DELETE FROM clubtag WHERE is_predefined = true;
    """)
