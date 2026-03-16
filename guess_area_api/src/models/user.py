from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func, expression
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    total_score = Column(Integer, server_default=expression.text('0'), default=0)
    games_played = Column(Integer, server_default=expression.text('0'), default=0)
    created_at = Column(DateTime, server_default=func.now(), default=func.now())
    game_sessions = relationship('GameSession', back_populates='user', cascade='all, delete-orphan')