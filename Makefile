.PHONY: help backend frontend install-backend install-frontend db-up db-down

help:
	@echo "  Доступные команды:"
	@echo ""
	@echo "  make backend          - Запустить бекенд (FastAPI)"
	@echo "  make frontend         - Запустить фронтенд (React)"
	@echo "  make install-backend  - Установить зависимости бекенда"
	@echo "  make install-frontend - Установить зависимости фронтенда"
	@echo "  make db-up            - Запустить PostgreSQL (docker)"
	@echo "  make db-down          - Остановить PostgreSQL"
	@echo ""
	@echo "  Для просмотра API документации:"
	@echo "  После запуска бекенда откройте: http://localhost:8000/docs"

backend:
	@echo "Запуск бекенда..."
	cd guess_area_api && source .venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@echo "Запуск фронтенда..."
	cd guess_area && npm run dev

install-backend:
	@echo "Установка зависимостей бекенда..."
	cd guess_area_api && python3 -m venv .venv && source .venv/bin/activate && pip install fastapi uvicorn sqlalchemy python-dotenv psycopg2-binary alembic

install-frontend:
	@echo "Установка зависимостей фронтенда..."
	cd guess_area && npm install

db-up:
	@echo "Запуск PostgreSQL..."
	cd guess_area_api && docker-compose up -d

db-down:
	@echo "Остановка PostgreSQL..."
	cd guess_area_api && docker-compose down
