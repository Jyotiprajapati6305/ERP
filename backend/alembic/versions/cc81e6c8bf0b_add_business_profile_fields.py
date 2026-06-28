"""add business profile fields

Revision ID: cc81e6c8bf0b
Revises: bee79d7dd894
Create Date: 2026-06-28
"""

from alembic import op
import sqlalchemy as sa

revision = "cc81e6c8bf0b"
down_revision = "bee79d7dd894"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("businesses", sa.Column("number_of_employees", sa.Integer(), nullable=True))
    op.add_column("businesses", sa.Column("country", sa.String(length=100), nullable=True))
    op.add_column("businesses", sa.Column("state", sa.String(length=100), nullable=True))
    op.add_column("businesses", sa.Column("city", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("businesses", "city")
    op.drop_column("businesses", "state")
    op.drop_column("businesses", "country")
    op.drop_column("businesses", "number_of_employees")
