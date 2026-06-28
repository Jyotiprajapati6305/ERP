"""add user verification fields

Revision ID: bee79d7dd894
Revises: 8379f2cf5dec
Create Date: 2026-06-28
"""

from alembic import op
import sqlalchemy as sa

revision = "bee79d7dd894"
down_revision = "8379f2cf5dec"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("mobile_number", sa.String(length=20), nullable=True))
    op.add_column(
        "users", sa.Column("is_verified", sa.Boolean(), server_default=sa.false(), nullable=False)
    )
    op.add_column("users", sa.Column("verification_token", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("verification_token_expires", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_users_mobile_number", "users", ["mobile_number"], unique=True)
    op.create_index("ix_users_verification_token", "users", ["verification_token"])

    # Existing users created before this migration are grandfathered in as verified.
    op.execute("UPDATE users SET is_verified = true")


def downgrade() -> None:
    op.drop_index("ix_users_verification_token", table_name="users")
    op.drop_index("ix_users_mobile_number", table_name="users")
    op.drop_column("users", "verification_token_expires")
    op.drop_column("users", "verification_token")
    op.drop_column("users", "is_verified")
    op.drop_column("users", "mobile_number")
