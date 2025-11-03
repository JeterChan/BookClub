"""add password reset tokens table

Revision ID: b2a6d580feb2
Revises: 9a61d7bbe93c
Create Date: 2025-11-02 08:32:23.192633

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2a6d580feb2'
down_revision: Union[str, Sequence[str], None] = '9a61d7bbe93c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 創建 password_reset_tokens 表
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    
    # 創建索引
    op.create_index('idx_password_reset_token', 'password_reset_tokens', ['token'])
    op.create_index('idx_password_reset_user_id', 'password_reset_tokens', ['user_id'])
    op.create_index('idx_password_reset_expires', 'password_reset_tokens', ['expires_at'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_password_reset_expires', table_name='password_reset_tokens')
    op.drop_index('idx_password_reset_user_id', table_name='password_reset_tokens')
    op.drop_index('idx_password_reset_token', table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
