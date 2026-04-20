## 1. Структура проекта (что где находится)

```text
SSRVP/
├── docker-compose.yml
├── Makefile
├── README.md
├── guess_area/                     # Frontend (React)
│   ├── src/
│   │   ├── main.jsx                # Роутинг приложения
│   │   ├── context/AuthContext.jsx # Глобальная авторизация на клиенте
│   │   ├── services/
│   │   │   ├── authService.js      # API авторизации
│   │   │   └── gameSessionService.js # API игровых и мультиплеерных сессий
│   │   ├── api/cityApi.js          # API города/подсказки/проверка догадки
│   │   ├── pages/
│   │   │   ├── WelcomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── GameSetupPage.jsx   # Настройки + мультиплеер + лидерборд
│   │   │   ├── GamePageWithSession.jsx # Основная игра по sessionId
│   │   │   ├── GamePage.jsx        # Упрощенная одиночная страница
│   │   │   └── GameResultsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useCity.js
│   │   │   ├── useGame.js
│   │   │   └── useHint.js
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── MapComponent.jsx
│   │   │   ├── GamePanel.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── utils/mapConfig.js
│   ├── nginx.conf
│   └── Dockerfile
└── guess_area_api/                 # Backend (FastAPI)
    ├── src/
    │   ├── main.py                 # Инициализация FastAPI и подключение роутеров
    │   ├── database.py             # Подключение к БД и get_db dependency
    │   ├── api/
    │   │   ├── auth.py             # /api/auth/*
    │   │   ├── city.py             # /api/city/*
    │   │   └── game_session.py     # /api/game/session/*
    │   ├── service/
    │   │   ├── auth_service.py
    │   │   ├── city_service.py
    │   │   ├── game_session_service.py
    │   │   └── multiplayer_service.py
    │   ├── models/                 # SQLAlchemy модели таблиц
    │   └── dto/                    # Pydantic DTO
    ├── alembic/versions/           # Миграции схемы и данных городов
    └── Dockerfile
```

---

## 2. Как реализована авторизация (JWT)

## Backend

Файлы:
- `guess_area_api/src/api/auth.py`
- `guess_area_api/src/service/auth_service.py`
- `guess_area_api/src/dto/auth/*`

Основная схема:
1. Регистрация (`/api/auth/register`) создает пользователя и сразу возвращает JWT.
2. Логин (`/api/auth/login`) проверяет username + password и возвращает JWT.
3. Защищенные эндпоинты используют `get_current_user()`:
    - токен читается через `HTTPBearer`;
    - декодируется JWT;
    - из `sub` берется `user_id`;
    - пользователь подтягивается из БД.

Технические детали:
- Хеширование: bcrypt (через `passlib`).
- В коде пароль обрезается до 72 байт перед хешированием/проверкой (ограничение bcrypt).
- Токен содержит `sub=<id пользователя>` и `exp`.
- Время жизни токена: `ACCESS_TOKEN_EXPIRE_HOURS` (по умолчанию 24 часа).

## Frontend

Файлы:
- `guess_area/src/context/AuthContext.jsx`
- `guess_area/src/services/authService.js`
- `guess_area/src/components/PrivateRoute.jsx`

Как работает:
1. После логина/регистрации токен сохраняется в `localStorage`.
2. `AuthProvider` при старте проверяет токен через `/api/auth/me`.
3. Если токен валиден — пользователь считается авторизованным.
4. Защищенные маршруты оборачиваются `PrivateRoute`.

---

## 3. Как реализован мультиплеер

## Модели БД

Файлы:
- `models/multiplayer_room.py`
- `models/multiplayer_room_participant.py`
- `models/multiplayer_room_round.py`
- `models/game_sessions.py` (поле `multiplayer_room_id`)

Сущности:
- **multiplayer_rooms**: код комнаты, режим (`duel`/`room`), число раундов, лимит игроков, `started_at`.
- **multiplayer_room_participants**: участники, флаг готовности `is_ready`, время `ready_at`.
- **multiplayer_room_rounds**: фиксированный набор городов на каждый раунд комнаты.

## Backend-логика

Файл: `guess_area_api/src/service/multiplayer_service.py`

Ключевые этапы:
1. **Создание комнаты**:
    - генерируется уникальный код;
    - сразу создаются раунды комнаты (`_seed_room_rounds`);
    - создатель становится участником;
    - создается его `game_session`, привязанная к комнате.
2. **Вход в комнату по коду**:
    - проверка существования/активности;
    - проверка лимита (для дуэли максимум 2);
    - добавление участника;
    - создание сессии игрока (если активной нет).
3. **Лобби и старт**:
    - каждый игрок нажимает “ready” (`/ready`);
    - матч стартует, когда готовы все и игроков минимум 2;
    - для дуэли строго 2 участника.
4. **Раунды**:
    - для мультиплеера город на раунд берется не случайно, а из `multiplayer_room_rounds`;
    - при сохранении раунда сервер валидирует, что игрок отправил **правильный city_id для этого round_number**.
5. **Live-состояние**:
    - frontend опрашивает состояние комнаты раз в 2 секунды;
    - догадки игроков по раунду — раз в 3 секунды.

## Frontend-логика

Файлы:
- `pages/GameSetupPage.jsx`
- `pages/GamePageWithSession.jsx`
- `services/gameSessionService.js`
- `components/MapComponent.jsx`

Что доступно игроку:
- создать комнату: дуэль или общая;
- войти по коду;
- видеть лобби/готовность игроков;
- после раунда видеть клики соперников на карте (CircleMarker разных цветов).

---

## 4. Игровая логика и карта

Файлы:
- `hooks/useCity.js`, `hooks/useHint.js`, `hooks/useGame.js`
- `components/MapComponent.jsx`, `components/GamePanel.jsx`
- `pages/GamePageWithSession.jsx`
- `guess_area_api/src/service/city_service.py`

Процесс раунда:
1. Получение города:
    - одиночная игра: случайный город (`/api/city/random`);
    - мультиплеер: город раунда комнаты (`/api/game/session/{id}/round-city`).
2. Игрок ставит маркер на карту.
3. По нажатию “Подтвердить” frontend отправляет догадку на backend (`/api/city/guess`).
4. Backend считает расстояние и очки.
5. Результат раунда сохраняется в `game_rounds`.

Таймер:
- 30 секунд на раунд.
- Если время вышло и игрок не поставил точку: отправляется автопропуск (0 очков).
- Если точка была поставлена, но не отправлена — выполняется автоотправка.

Формула очков (backend):
- `max_score = 1000`
- `max_distance_km = 1000`
- если дистанция >= 1000 км, очки = 0
- иначе `round(1000 * (1 - distance_km / 1000))`

Карта:
- Leaflet + тайлы `light_nolabels` (без подписей).
- Ограничение карты по широте/долготе задано в `mapConfig.js`.
- После ответа показываются:
    - маркер игрока;
    - правильная точка;
    - линия между ними;
    - в мультиплеере — точки соперников.

---

## 5. API (актуальные эндпоинты)

Базовый префикс backend: `http://localhost:8000/api`

## Auth

| Метод | URL | Описание | Auth |
|---|---|---|---|
| POST | `/auth/register` | Регистрация | Нет |
| POST | `/auth/login` | Логин | Нет |
| GET | `/auth/me` | Текущий пользователь | Bearer |
| GET | `/auth/profile` | Профиль с базовой статистикой | Bearer |

## City

| Метод | URL | Описание | Auth |
|---|---|---|---|
| GET | `/city/random` | Случайный город | Нет |
| GET | `/city/{city_id}/hint` | Подсказка по городу | Нет |
| POST | `/city/guess` | Расчет расстояния и очков | Нет |

## Game sessions + Multiplayer

| Метод | URL | Описание | Auth |
|---|---|---|---|
| POST | `/game/session/create` | Создать сессию | Bearer |
| GET | `/game/session/{session_id}` | Получить сессию | Bearer |
| POST | `/game/session/{session_id}/round` | Сохранить раунд | Bearer |
| POST | `/game/session/{session_id}/complete` | Завершить сессию | Bearer |
| GET | `/game/session/stats/me` | Личная статистика | Bearer |
| GET | `/game/session/stats/leaderboard` | Лидерборд | Bearer |
| GET | `/game/session/{session_id}/round-city` | Город раунда (мультиплеер) | Bearer |
| POST | `/game/session/multiplayer/create` | Создать комнату | Bearer |
| POST | `/game/session/multiplayer/join` | Войти в комнату | Bearer |
| GET | `/game/session/multiplayer/{room_id}` | Состояние комнаты | Bearer |
| POST | `/game/session/multiplayer/{room_id}/ready` | Готовность игрока | Bearer |
| GET | `/game/session/multiplayer/{room_id}/round/{round_number}/guesses` | Догадки игроков за раунд | Bearer |

---

## 6. Схема данных (основные таблицы)

| Таблица | Назначение |
|---|---|
| `users` | Пользователи, логин, хеш пароля, агрегированная статистика |
| `cities` | Города, координаты, подсказки |
| `game_sessions` | Игровые сессии пользователя (одиночные и мультиплеерные) |
| `game_rounds` | Результаты каждого раунда сессии |
| `multiplayer_rooms` | Комнаты мультиплеера |
| `multiplayer_room_participants` | Участники комнат и готовность |
| `multiplayer_room_rounds` | Предзаданные города на раунды комнаты |

Миграции:
- базовые таблицы: `a89fe5a35d6b_create_tables.py`
- мультиплеер: `e3c9b7a91d4f_add_multiplayer_rooms.py`
- фиксированные раунды: `1f2c6ab8d91e_add_multiplayer_room_rounds.py`
- ready/start состояние: `8ac3fdd2d3be_add_room_ready_start_state.py`

