"""create_game_rounds_table

Revision ID: 943334972baf
Revises: 0cdcb15597a3
Create Date: 2026-03-16 16:53:52.755536

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '943334972baf'
down_revision: Union[str, Sequence[str], None] = '0cdcb15597a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "game_rounds",
        sa.Column("id", sa.Integer, primary_key=True),

        sa.Column(
            "session_id",
            sa.Integer,
            sa.ForeignKey("game_sessions.id", ondelete="CASCADE"),
        ),

        sa.Column(
            "city_id",
            sa.Integer,
            sa.ForeignKey("cities.id"),
        ),

        sa.Column("guessed_lat", sa.DECIMAL(9, 6)),
        sa.Column("guessed_lng", sa.DECIMAL(9, 6)),

        sa.Column("distance_meters", sa.Integer),
        sa.Column("points_earned", sa.Integer),

        sa.Column("round_number", sa.Integer, nullable=False),

        sa.Column("played_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("game_rounds")