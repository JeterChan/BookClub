"""add_email_verification_fields

Revision ID: 8dc583baeb87
Revises: feb7a31e9ed1
Create Date: 2025-10-23 05:31:33.577851

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8dc583baeb87'
down_revision: Union[str, Sequence[str], None] = 'feb7a31e9ed1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add email verification fields
    op.add_column('user', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('email_verification_token', sa.String(length=255), nullable=True))
    op.add_column('user', sa.Column('email_verification_token_expires_at', sa.DateTime(), nullable=True))
    
    # Create index on verification token
    op.create_index(op.f('ix_user_email_verification_token'), 'user', ['email_verification_token'], unique=False)
    
    # Set existing Google OAuth users as verified (google_id IS NOT NULL)
    op.execute('UPDATE "user" SET email_verified = true WHERE google_id IS NOT NULL')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_email_verification_token'), table_name='user')
    op.drop_column('user', 'email_verification_token_expires_at')
    op.drop_column('user', 'email_verification_token')
    op.drop_column('user', 'email_verified')
