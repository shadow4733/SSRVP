"""create_city_table

Revision ID: 85a99a9ba3cb
Revises: 78695f1228c7
Create Date: 2026-03-12 22:26:08.267503

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '85a99a9ba3cb'
down_revision: Union[str, Sequence[str], None] = '78695f1228c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE cities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            hint TEXT
        );
    """)


def downgrade() -> None:
    op.execute("DROP TABLE cities;")
