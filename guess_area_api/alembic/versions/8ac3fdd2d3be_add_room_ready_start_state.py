"""add_room_ready_start_state

Revision ID: 8ac3fdd2d3be
Revises: 1f2c6ab8d91e
Create Date: 2026-04-13 12:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ac3fdd2d3be'
down_revision: Union[str, Sequence[str], None] = '1f2c6ab8d91e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("multiplayer_rooms", sa.Column("started_at", sa.DateTime(), nullable=True))
    op.add_column("multiplayer_room_participants", sa.Column("is_ready", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("multiplayer_room_participants", sa.Column("ready_at", sa.DateTime(), nullable=True))
    op.execute("UPDATE multiplayer_room_participants SET is_ready = false WHERE is_ready IS NULL")


def downgrade():
    op.drop_column("multiplayer_room_participants", "ready_at")
    op.drop_column("multiplayer_room_participants", "is_ready")
    op.drop_column("multiplayer_rooms", "started_at")
