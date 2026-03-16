from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class GameRound(Base):
    __tablename__ = "game_rounds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id", ondelete="CASCADE"))
    city_id = Column(Integer, ForeignKey("cities.id"))
    guessed_lat = Column(DECIMAL(9, 6), nullable=True)
    guessed_lng = Column(DECIMAL(9, 6), nullable=True)
    distance_meters = Column(Integer)
    points_earned = Column(Integer)
    round_number = Column(Integer, nullable=False)
    played_at = Column(DateTime, server_default=func.now())
    session = relationship("GameSession", back_populates="rounds")
    city = relationship("City", back_populates="rounds")