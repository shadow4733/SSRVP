from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression, func

from ..database import Base


class MultiplayerRoomParticipant(Base):
    __tablename__ = "multiplayer_room_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("multiplayer_rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, server_default=func.now(), nullable=False)
    is_ready = Column(Boolean, server_default=expression.false(), default=False, nullable=False)
    ready_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_multiplayer_room_participants_room_user"),
    )

    room = relationship("MultiplayerRoom", back_populates="participants")
    user = relationship("User", back_populates="room_memberships")
