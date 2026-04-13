from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

from ..database import get_db
from ..service.game_session_service import GameSessionService
from ..service.multiplayer_service import MultiplayerService
from ..service.auth_service import get_current_user
from ..models.user import User
from ..models.game_round import GameRound

router = APIRouter()


# DTOs
class CreateSessionRequest(BaseModel):
    total_rounds: int

class CreateSessionResponse(BaseModel):
    session_id: int
    user_id: int
    total_rounds: int
    started_at: str

class SaveRoundRequest(BaseModel):
    city_id: int
    round_number: int
    guessed_lat: Optional[float] = None
    guessed_lng: Optional[float] = None
    distance_meters: int
    points_earned: int

class RoundResponse(BaseModel):
    id: int
    round_number: int
    city_id: int
    points_earned: int
    distance_meters: int

    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    id: int
    user_id: int
    total_rounds: int
    total_score: int
    multiplayer_room_id: Optional[int]
    started_at: str
    completed_at: Optional[str]
    rounds: List[RoundResponse]

class UserStatsResponse(BaseModel):
    user_id: int
    username: str
    total_score: int
    games_played: int
    average_score: int
    best_score: int
    member_since: Optional[str]


class TopPlayerResponse(BaseModel):
    rank: int
    user_id: int
    username: str
    total_score: int
    games_played: int
    total_rounds_played: int
    average_score: int
    best_score: int


class CreateMultiplayerRoomRequest(BaseModel):
    mode: Literal["duel", "room"]
    total_rounds: int = Field(default=5)


class JoinMultiplayerRoomRequest(BaseModel):
    room_code: str = Field(min_length=3, max_length=12)


class MultiplayerPlayerResponse(BaseModel):
    user_id: int
    username: str
    total_score: int
    completed_rounds: int
    total_rounds: Optional[int]
    is_completed: bool
    is_ready: bool
    ready_at: Optional[str]


class MultiplayerRoomStateResponse(BaseModel):
    room_id: int
    room_code: str
    mode: Literal["duel", "room"]
    total_rounds: int
    max_players: Optional[int]
    required_players: int
    started_at: Optional[str]
    participants_count: int
    players: List[MultiplayerPlayerResponse]
    my_session_id: Optional[int]


class MultiplayerRoomCreateResponse(BaseModel):
    room_id: int
    room_code: str
    mode: Literal["duel", "room"]
    total_rounds: int
    max_players: Optional[int]
    participants_count: int
    session_id: int


class RoundCityResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float


class MultiplayerRoundGuessResponse(BaseModel):
    user_id: int
    username: str
    guessed_lat: Optional[float]
    guessed_lng: Optional[float]
    points_earned: int
    distance_meters: int


class MultiplayerReadyResponse(BaseModel):
    started: bool
    started_now: bool
    started_at: Optional[str]


@router.post("/create", response_model=CreateSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_game_session(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создает новую игровую сессию
    
    - **total_rounds**: количество раундов (3, 5, 10, 15)
    """
    if request.total_rounds not in [3, 5, 10, 15]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total rounds must be 3, 5, 10, or 15"
        )
    
    service = GameSessionService(db)
    session = service.create_session(current_user.id, request.total_rounds)
    
    return CreateSessionResponse(
        session_id=session.id,
        user_id=session.user_id,
        total_rounds=session.total_rounds,
        started_at=session.started_at.isoformat()
    )


@router.get("/{session_id:int}", response_model=SessionResponse)
async def get_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получает информацию о игровой сессии"""
    service = GameSessionService(db)
    session = service.get_session(session_id)
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    rounds = service.get_session_rounds(session_id)
    
    return SessionResponse(
        id=session.id,
        user_id=session.user_id,
        total_rounds=session.total_rounds,
        total_score=session.total_score,
        multiplayer_room_id=session.multiplayer_room_id,
        started_at=session.started_at.isoformat(),
        completed_at=session.completed_at.isoformat() if session.completed_at else None,
        rounds=[RoundResponse(
            id=r.id,
            round_number=r.round_number,
            city_id=r.city_id,
            points_earned=r.points_earned,
            distance_meters=r.distance_meters
        ) for r in rounds]
    )


@router.post("/{session_id:int}/round", response_model=RoundResponse)
async def save_game_round(
    session_id: int,
    request: SaveRoundRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Сохраняет раунд игры"""
    service = GameSessionService(db)
    session = service.get_session(session_id)
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    if session.multiplayer_room_id:
        multiplayer_service = MultiplayerService(db)
        multiplayer_service.validate_round_city(
            room_id=session.multiplayer_room_id,
            user_id=current_user.id,
            round_number=request.round_number,
            city_id=request.city_id,
        )
    
    game_round = service.save_round(
        session_id=session_id,
        city_id=request.city_id,
        round_number=request.round_number,
        guessed_lat=request.guessed_lat,
        guessed_lng=request.guessed_lng,
        distance_meters=request.distance_meters,
        points_earned=request.points_earned
    )
    
    return RoundResponse(
        id=game_round.id,
        round_number=game_round.round_number,
        city_id=game_round.city_id,
        points_earned=game_round.points_earned,
        distance_meters=game_round.distance_meters
    )


@router.post("/{session_id:int}/complete", response_model=SessionResponse)
async def complete_game_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Завершает игровую сессию и обновляет статистику пользователя"""
    service = GameSessionService(db)
    session = service.get_session(session_id)
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    completed_session = service.complete_session(session_id)
    rounds = service.get_session_rounds(session_id)
    
    return SessionResponse(
        id=completed_session.id,
        user_id=completed_session.user_id,
        total_rounds=completed_session.total_rounds,
        total_score=completed_session.total_score,
        multiplayer_room_id=completed_session.multiplayer_room_id,
        started_at=completed_session.started_at.isoformat(),
        completed_at=completed_session.completed_at.isoformat() if completed_session.completed_at else None,
        rounds=[RoundResponse(
            id=r.id,
            round_number=r.round_number,
            city_id=r.city_id,
            points_earned=r.points_earned,
            distance_meters=r.distance_meters
        ) for r in rounds]
    )


@router.get("/stats/me", response_model=UserStatsResponse)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получает статистику текущего пользователя"""
    service = GameSessionService(db)
    stats = service.get_user_stats(current_user.id)
    return UserStatsResponse(**stats)


@router.get("/stats/leaderboard", response_model=List[TopPlayerResponse])
async def get_leaderboard(
    period: Literal["week", "month", "all"] = "all",
    rounds: Optional[int] = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получает топ игроков за период: неделя, месяц или всё время"""
    if rounds is not None and rounds not in [3, 5, 10, 15]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rounds must be 3, 5, 10, or 15"
        )

    service = GameSessionService(db)
    top_players = service.get_top_players(period=period, rounds=rounds, limit=limit)
    return [TopPlayerResponse(**player) for player in top_players]


@router.get("/{session_id:int}/round-city", response_model=RoundCityResponse)
async def get_session_round_city(
    session_id: int,
    round_number: int = Query(ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = GameSessionService(db)
    session = service.get_session(session_id)
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    if not session.multiplayer_room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Round city endpoint is available only for multiplayer sessions"
        )
    multiplayer_service = MultiplayerService(db)
    city = multiplayer_service.get_round_city_for_session(session, current_user.id, round_number)
    return RoundCityResponse(
        id=city.id,
        name=city.name,
        latitude=float(city.latitude),
        longitude=float(city.longitude),
    )


@router.post("/multiplayer/create", response_model=MultiplayerRoomCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_multiplayer_room(
    request: CreateMultiplayerRoomRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создает мультиплеерную комнату: дуэль (2 игрока) или общую (без лимита)."""
    service = MultiplayerService(db)
    room, session = service.create_room(
        host_user_id=current_user.id,
        mode=request.mode,
        total_rounds=request.total_rounds,
    )
    return MultiplayerRoomCreateResponse(
        room_id=room.id,
        room_code=room.code,
        mode=room.mode,
        total_rounds=room.total_rounds,
        max_players=room.max_players,
        participants_count=service.get_participants_count(room.id),
        session_id=session.id,
    )


@router.post("/multiplayer/join", response_model=MultiplayerRoomCreateResponse)
async def join_multiplayer_room(
    request: JoinMultiplayerRoomRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Входит в мультиплеерную комнату по коду."""
    service = MultiplayerService(db)
    room, session = service.join_room(current_user.id, request.room_code)
    return MultiplayerRoomCreateResponse(
        room_id=room.id,
        room_code=room.code,
        mode=room.mode,
        total_rounds=room.total_rounds,
        max_players=room.max_players,
        participants_count=service.get_participants_count(room.id),
        session_id=session.id,
    )


@router.get("/multiplayer/{room_id:int}", response_model=MultiplayerRoomStateResponse)
async def get_multiplayer_room_state(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Возвращает состояние комнаты и live-таблицу игроков."""
    service = MultiplayerService(db)
    state = service.get_room_state_for_user(room_id, current_user.id)
    return MultiplayerRoomStateResponse(**state)


@router.post("/multiplayer/{room_id:int}/ready", response_model=MultiplayerReadyResponse)
async def ready_multiplayer_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отмечает игрока как готового и запускает матч, когда готовы все."""
    service = MultiplayerService(db)
    result = service.mark_ready_and_maybe_start(room_id, current_user.id)
    return MultiplayerReadyResponse(**result)


@router.get("/multiplayer/{room_id:int}/round/{round_number:int}/guesses", response_model=List[MultiplayerRoundGuessResponse])
async def get_multiplayer_round_guesses(
    room_id: int,
    round_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Показывает клики игроков по выбранному раунду комнаты."""
    if round_number < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="round_number must be >= 1"
        )
    service = MultiplayerService(db)
    guesses = service.get_round_guesses(room_id, current_user.id, round_number)
    return [MultiplayerRoundGuessResponse(**guess) for guess in guesses]
