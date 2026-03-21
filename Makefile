.PHONY: help build up down logs backend-shell frontend-shell db-shell logs-backend logs-frontend logs-db restart

GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help:
	@echo "$(GREEN)Доступные команды:$(NC)"
	@echo ""
	@echo "$(YELLOW)Управление контейнерами:$(NC)"
	@echo "  make build          - Собрать все контейнеры (docker compose build)"
	@echo "  make up             - Запустить все контейнеры в фоне"
	@echo "  make up-build       - Собрать и запустить контейнеры (docker compose up -d --build)"
	@echo "  make down           - Остановить и удалить контейнеры"
	@echo "  make restart        - Перезапустить все контейнеры"
	@echo "  make logs           - Просмотр логов всех контейнеров"
	@echo ""
	@echo "$(YELLOW)Доступ к контейнерам:$(NC)"
	@echo "  make backend-shell  - Войти в контейнер бекенда (bash)"
	@echo "  make frontend-shell - Войти в контейнер фронтенда (sh)"
	@echo "  make db-shell       - Войти в контейнер PostgreSQL (psql)"
	@echo ""
	@echo "$(YELLOW)Просмотр логов отдельных сервисов:$(NC)"
	@echo "  make logs-backend   - Логи бекенда"
	@echo "  make logs-frontend  - Логи фронтенда"
	@echo "  make logs-db        - Логи базы данных"
	@echo ""
	@echo "$(GREEN)После запуска:$(NC)"
	@echo "  Фронтенд: http://localhost:3000"
	@echo "  Бекенд API: http://localhost:8000"
	@echo "  Документация API: http://localhost:8000/docs"

build:
	@echo "$(GREEN)Сборка контейнеров...$(NC)"
	docker compose build

up:
	@echo "$(GREEN)Запуск контейнеров...$(NC)"
	docker compose up -d

up-build:
	@echo "$(GREEN)Сборка и запуск контейнеров...$(NC)"
	docker compose up -d --build

down:
	@echo "$(YELLOW)Остановка и удаление контейнеров...$(NC)"
	docker compose down

restart:
	@echo "$(YELLOW)Перезапуск контейнеров...$(NC)"
	docker compose restart

logs:
	@echo "$(GREEN)Логи всех контейнеров (Ctrl+C для выхода):$(NC)"
	docker compose logs -f

logs-backend:
	@echo "$(GREEN)Логи бекенда (Ctrl+C для выхода):$(NC)"
	docker compose logs -f backend

logs-frontend:
	@echo "$(GREEN)Логи фронтенда (Ctrl+C для выхода):$(NC)"
	docker compose logs -f frontend

logs-db:
	@echo "$(GREEN)Логи базы данных (Ctrl+C для выхода):$(NC)"
	docker compose logs -f postgres

backend-shell:
	@echo "$(GREEN)Вход в контейнер бекенда...$(NC)"
	docker compose exec backend bash || docker compose exec backend sh

frontend-shell:
	@echo "$(GREEN)Вход в контейнер фронтенда...$(NC)"
	docker compose exec frontend sh

db-shell:
	@echo "$(GREEN)Подключение к PostgreSQL...$(NC)"
	@echo "Используйте команды: \du (список пользователей), \l (список БД), \dt (таблицы)"
	@docker compose exec postgres psql -U ${DB_USER} -d ${DB_NAME}

ps:
	@echo "$(GREEN)Статус контейнеров:$(NC)"
	docker compose ps

prune:
	@echo "$(YELLOW)Очистка неиспользуемых ресурсов Docker...$(NC)"
	docker system prune -f

migrate:
	@echo "$(GREEN)Выполнение миграций Alembic...$(NC)"
	docker compose exec backend alembic upgrade head

migrate-create:
	@read -p "Введите название миграции: " name; \
	docker compose exec backend alembic revision --autogenerate -m "$$name"