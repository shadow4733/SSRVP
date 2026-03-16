"""create_game_sessions_table

Revision ID: cfed8e667b7d
Revises: 85a99a9ba3cb
Create Date: 2026-03-12 22:26:17.762133

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cfed8e667b7d'
down_revision: Union[str, Sequence[str], None] = '85a99a9ba3cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "game_sessions",
        sa.Column("id", sa.Integer, primary_key=True),

        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),

        sa.Column("started_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime),

        sa.Column("total_score", sa.Integer, server_default="0"),
        sa.Column("total_rounds", sa.Integer, nullable=False),
    )


def downgrade():
    op.drop_table("game_sessions")