from pydantic import BaseModel
from typing import Optional

class CityResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    
    class Config:
        from_attributes = True

class HintResponse(BaseModel):
    hint: Optional[str]

class GuessResultResponse(BaseModel):
    distance_km: float
    earned_points: int
    city_latitude: float
    city_longitude: float
