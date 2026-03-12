from sqlalchemy import Column, Integer, String, Float, Text, DECIMAL
from sqlalchemy.orm import relationship
from database import Base

class City(Base):
    __tablename__ = 'cities'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    latitude = Column(DECIMAL(9, 6), nullable=False)
    longitude = Column(DECIMAL(9, 6), nullable=False)
    hint = Column(Text, nullable=True)

    game_sessions = relationship('GameSession', back_populates='city')