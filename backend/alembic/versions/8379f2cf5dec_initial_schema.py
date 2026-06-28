"""initial schema

Revision ID: 8379f2cf5dec
Revises:
Create Date: 2026-06-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "8379f2cf5dec"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "businesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("logo", sa.String(length=512), nullable=True),
        sa.Column("industry_type", sa.String(length=100), nullable=False),
        sa.Column("gst_number", sa.String(length=50), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.String(length=512), nullable=True),
        sa.Column("currency", sa.String(length=10), server_default="INR", nullable=False),
        sa.Column("timezone", sa.String(length=64), server_default="Asia/Kolkata", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_businesses_user_id", "businesses", ["user_id"])

    op.create_table(
        "business_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("businesses.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("ai_enabled", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("ai_chat_enabled", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("ai_insights_enabled", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("modules_enabled", sa.JSON(), nullable=True),
    )
    op.create_index("ix_business_settings_business_id", "business_settings", ["business_id"], unique=True)


def downgrade() -> None:
    op.drop_table("business_settings")
    op.drop_table("businesses")
    op.drop_table("users")
