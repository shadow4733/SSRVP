from sqlalchemy import Column, Integer, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class GameSession(Base):
    __tablename__ = 'game_sessions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    city_id = Column(Integer, ForeignKey('cities.id'), nullable=False)
    guessed_lat = Column(DECIMAL(9, 6), nullable=True)
    guessed_lng = Column(DECIMAL(9, 6), nullable=True)
    distance_meters = Column(Integer, nullable=True)
    points_earned = Column(Integer, nullable=True)
    played_at = Column(DateTime, server_default=func.now(), default=func.now())

    user = relationship('User', back_populates='game_sessions')
    city = relationship('City', back_populates='game_sessions')