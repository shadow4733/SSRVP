from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from fastapi import HTTPException, status

from ..models.game_sessions import GameSession
from ..models.game_round import GameRound
from ..models.user import User
from ..models.city import City


class GameSessionService:
    """Сервис для работы с игровыми сессиями"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, user_id: int, total_rounds: int) -> GameSession:
        """Создает новую игровую сессию"""
        session = GameSession(
            user_id=user_id,
            total_rounds=total_rounds,
            total_score=0
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_session(self, session_id: int) -> GameSession:
        """Получает сессию по ID"""
        session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found"
            )
        return session
    
    def get_user_sessions(self, user_id: int, limit: int = 10):
        """Получает последние сессии пользователя"""
        return self.db.query(GameSession)\
            .filter(GameSession.user_id == user_id)\
            .order_by(GameSession.started_at.desc())\
            .limit(limit)\
            .all()
    
    def save_round(
        self, 
        session_id: int,
        city_id: int,
        round_number: int,
        guessed_lat: float,
        guessed_lng: float,
        distance_meters: int,
        points_earned: int
    ) -> GameRound:
        """Сохраняет раунд игры"""
        session = self.get_session(session_id)
        
        current_rounds = self.db.query(func.count(GameRound.id))\
            .filter(GameRound.session_id == session_id)\
            .scalar()
        
        if current_rounds >= session.total_rounds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All rounds already played"
            )
        
        game_round = GameRound(
            session_id=session_id,
            city_id=city_id,
            guessed_lat=guessed_lat,
            guessed_lng=guessed_lng,
            distance_meters=distance_meters,
            points_earned=points_earned,
            round_number=round_number
        )
        
        session.total_score += points_earned
        
        self.db.add(game_round)
        self.db.commit()
        self.db.refresh(game_round)
        
        if current_rounds + 1 >= session.total_rounds:
            self.complete_session(session_id)
        
        return game_round
    
    def get_session_rounds(self, session_id: int):
        """Получает все раунды сессии"""
        return self.db.query(GameRound)\
            .filter(GameRound.session_id == session_id)\
            .order_by(GameRound.round_number)\
            .all()
    
    def complete_session(self, session_id: int) -> GameSession:
        """Завершает игровую сессию"""
        session = self.get_session(session_id)
        
        if session.completed_at:
            return session
        
        session.completed_at = datetime.utcnow()
        
        user = self.db.query(User).filter(User.id == session.user_id).first()
        if user:
            user.total_score += session.total_score
            user.games_played += 1
        
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_user_stats(self, user_id: int) -> dict:
        """Получает статистику пользователя"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        avg_score = 0
        if user.games_played > 0:
            avg_score = user.total_score // user.games_played
        
        # Лучшая игра
        best_game = self.db.query(GameSession)\
            .filter(GameSession.user_id == user_id)\
            .filter(GameSession.completed_at.isnot(None))\
            .order_by(GameSession.total_score.desc())\
            .first()
        
        best_score = best_game.total_score if best_game else 0
        
        return {
            "user_id": user.id,
            "username": user.username,
            "total_score": user.total_score,
            "games_played": user.games_played,
            "average_score": avg_score,
            "best_score": best_score,
            "member_since": user.created_at.isoformat() if user.created_at else None
        }
