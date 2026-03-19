FROM python:3.11-slim

WORKDIR /app

# Установить зависимости системы
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Скопировать файл зависимостей
COPY requirements.txt .

# Установить Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Скопировать код приложения
COPY . .

# Запустить миграции и стартануть приложение
CMD ["sh", "-c", "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000"]
