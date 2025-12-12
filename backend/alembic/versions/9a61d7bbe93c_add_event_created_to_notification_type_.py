"""add_event_created_to_notification_type_enum

Revision ID: 9a61d7bbe93c
Revises: f53859748ef5
Create Date: 2025-11-02 03:27:22.553198

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '9a61d7bbe93c'
down_revision: Union[str, Sequence[str], None] = 'f53859748ef5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add 'EVENT_CREATED' to the notificationtype enum (uppercase to match existing values)
    op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'EVENT_CREATED'")


def downgrade() -> None:
    """Downgrade schema."""
    # PostgreSQL does not support removing enum values directly
    # This would require recreating the enum type, which is complex
    # For now, we'll leave the enum value in place
    pass
