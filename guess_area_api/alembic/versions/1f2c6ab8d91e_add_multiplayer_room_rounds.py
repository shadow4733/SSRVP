"""add_multiplayer_room_rounds

Revision ID: 1f2c6ab8d91e
Revises: e3c9b7a91d4f
Create Date: 2026-04-13 12:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f2c6ab8d91e'
down_revision: Union[str, Sequence[str], None] = 'e3c9b7a91d4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "multiplayer_room_rounds",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("multiplayer_rooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("round_number", sa.Integer(), nullable=False),
        sa.Column("city_id", sa.Integer(), sa.ForeignKey("cities.id"), nullable=False),
        sa.UniqueConstraint("room_id", "round_number", name="uq_multiplayer_room_rounds_room_round"),
    )
    op.create_index("ix_multiplayer_room_rounds_room_id", "multiplayer_room_rounds", ["room_id"], unique=False)


def downgrade():
    op.drop_index("ix_multiplayer_room_rounds_room_id", table_name="multiplayer_room_rounds")
    op.drop_table("multiplayer_room_rounds")
