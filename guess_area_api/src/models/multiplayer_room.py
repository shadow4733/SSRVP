from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from ..database import Base


class MultiplayerRoom(Base):
    __tablename__ = "multiplayer_rooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(12), unique=True, nullable=False, index=True)
    host_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mode = Column(String(20), nullable=False)
    total_rounds = Column(Integer, nullable=False)
    max_players = Column(Integer, nullable=True)
    is_active = Column(Boolean, server_default=expression.true(), default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    started_at = Column(DateTime, nullable=True)

    host_user = relationship("User", back_populates="hosted_rooms")
    participants = relationship("MultiplayerRoomParticipant", back_populates="room", cascade="all, delete-orphan")
    sessions = relationship("GameSession", back_populates="multiplayer_room")
    rounds = relationship("MultiplayerRoomRound", back_populates="room", cascade="all, delete-orphan")
