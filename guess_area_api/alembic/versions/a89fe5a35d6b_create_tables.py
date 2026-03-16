"""create_tables

Revision ID: a89fe5a35d6b
Revises: 
Create Date: 2026-03-16 17:04:36.000651

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a89fe5a35d6b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "cities",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("latitude", sa.DECIMAL(9, 6), nullable=False),
        sa.Column("longitude", sa.DECIMAL(9, 6), nullable=False),
        sa.Column("hint", sa.Text),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("email", sa.String(100), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("total_score", sa.Integer, server_default="0"),
        sa.Column("games_played", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

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
    op.drop_table("game_sessions")
    op.drop_table("users")
    op.drop_table("cities")