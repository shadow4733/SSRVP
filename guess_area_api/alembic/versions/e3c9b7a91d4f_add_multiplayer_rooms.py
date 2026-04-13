"""add_multiplayer_rooms

Revision ID: e3c9b7a91d4f
Revises: bba5cfe4043b
Create Date: 2026-04-13 11:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3c9b7a91d4f'
down_revision: Union[str, Sequence[str], None] = 'bba5cfe4043b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "multiplayer_rooms",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("code", sa.String(length=12), nullable=False),
        sa.Column("host_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.Column("total_rounds", sa.Integer(), nullable=False),
        sa.Column("max_players", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_multiplayer_rooms_code", "multiplayer_rooms", ["code"], unique=True)

    op.create_table(
        "multiplayer_room_participants",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("multiplayer_rooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("room_id", "user_id", name="uq_multiplayer_room_participants_room_user"),
    )

    op.add_column("game_sessions", sa.Column("multiplayer_room_id", sa.Integer(), nullable=True))
    op.create_index("ix_game_sessions_multiplayer_room_id", "game_sessions", ["multiplayer_room_id"], unique=False)
    op.create_foreign_key(
        "fk_game_sessions_multiplayer_room_id",
        "game_sessions",
        "multiplayer_rooms",
        ["multiplayer_room_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint("fk_game_sessions_multiplayer_room_id", "game_sessions", type_="foreignkey")
    op.drop_index("ix_game_sessions_multiplayer_room_id", table_name="game_sessions")
    op.drop_column("game_sessions", "multiplayer_room_id")

    op.drop_table("multiplayer_room_participants")

    op.drop_index("ix_multiplayer_rooms_code", table_name="multiplayer_rooms")
    op.drop_table("multiplayer_rooms")
