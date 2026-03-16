from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import db
from ..models.city import City

router = APIRouter()

def get_db():
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()

@router.get("/random")
async def get_random_city(db_session: Session = Depends(get_db)):
    """Получить случайный город (без подсказки)"""
    city = db_session.query(City).order_by(func.random()).first()
    
    if city:
        return {
            "id": city.id,
            "name": city.name,
            "latitude": float(city.latitude),
            "longitude": float(city.longitude)
        }
    
    return {"message": "No cities found"}

@router.get("/{city_id}/hint")
async def get_city_hint(city_id: int, db_session: Session = Depends(get_db)):
    """Получить подсказку для города"""
    city = db_session.query(City).filter(City.id == city_id).first()
    
    if city:
        return {
            "hint": city.hint
        }
    
    return {"message": "City not found"}
