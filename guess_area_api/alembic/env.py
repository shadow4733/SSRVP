# alembic/env.py
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Добавляем путь к проекту (чтоб видел src)
sys.path.append(str(Path(__file__).parent.parent))
load_dotenv()

from src.database import Base
from src.models.user import User
from src.models.city import City
from src.models.game_sessions import GameSession

from alembic import context
from sqlalchemy import engine_from_config, pool

# Это важно! Берем metadata из Base
target_metadata = Base.metadata


def _build_database_url_from_env() -> str | None:
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")

    if all([db_user, db_password, db_host, db_port, db_name]):
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return None


def _apply_runtime_database_url() -> None:
    env_database_url = _build_database_url_from_env()
    if env_database_url:
        context.config.set_main_option("sqlalchemy.url", env_database_url)


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    _apply_runtime_database_url()
    url = context.config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    _apply_runtime_database_url()
    connectable = engine_from_config(
        context.config.get_section(context.config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
