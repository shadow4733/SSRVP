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


def upgrade() -> None:
    op.execute("""
        CREATE TABLE game_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            city_id INTEGER REFERENCES cities(id),
            guessed_lat DECIMAL(9, 6),
            guessed_lng DECIMAL(9, 6),
            distance_meters INTEGER,
            points_earned INTEGER,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)


def downgrade() -> None:
    op.execute("DROP TABLE game_sessions;")