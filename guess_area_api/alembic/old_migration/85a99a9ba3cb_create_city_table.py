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


def upgrade():
    op.create_table(
        "cities",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("latitude", sa.DECIMAL(9, 6), nullable=False),
        sa.Column("longitude", sa.DECIMAL(9, 6), nullable=False),
        sa.Column("hint", sa.Text),
    )


def downgrade():
    op.drop_table("cities")