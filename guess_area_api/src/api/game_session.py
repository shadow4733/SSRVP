from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from ..database import get_db
from ..service.game_session_service import GameSessionService
from ..service.auth_service import get_current_user
from ..models.user import User
from ..models.game_sessions import GameSession
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
    guessed_lat: float
    guessed_lng: float
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


@router.get("/{session_id}", response_model=SessionResponse)
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


@router.post("/{session_id}/round", response_model=RoundResponse)
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


@router.post("/{session_id}/complete", response_model=SessionResponse)
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
