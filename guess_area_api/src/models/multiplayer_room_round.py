from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from ..database import Base


class MultiplayerRoomRound(Base):
    __tablename__ = "multiplayer_room_rounds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("multiplayer_rooms.id", ondelete="CASCADE"), nullable=False)
    round_number = Column(Integer, nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("room_id", "round_number", name="uq_multiplayer_room_rounds_room_round"),
    )

    room = relationship("MultiplayerRoom", back_populates="rounds")
    city = relationship("City")
