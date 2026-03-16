from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class GameSession(Base):
    __tablename__ = 'game_sessions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    total_score = Column(Integer, default=0)
    total_rounds = Column(Integer, nullable=False)
    user = relationship("User", back_populates="game_sessions")
    rounds = relationship("GameRound",back_populates="session",cascade="all, delete-orphan")