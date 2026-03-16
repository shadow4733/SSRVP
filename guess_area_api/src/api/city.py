from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import db
from ..service.city_service import CityService
from ..dto.city.request.city_request import SubmitGuessRequest
from ..dto.city.response.city_response import CityResponse, HintResponse, GuessResultResponse

router = APIRouter()

def get_db():
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()

@router.get("/random", response_model=CityResponse)
async def get_random_city(db_session: Session = Depends(get_db)):
    """Получить случайный город (без подсказки и координат)"""
    service = CityService(db_session)
    city = service.get_random_city()
    
    if not city:
        raise HTTPException(status_code=404, detail="No cities found")
    
    return CityResponse(
        id=city.id,
        name=city.name,
        latitude=float(city.latitude),
        longitude=float(city.longitude)
    )

@router.get("/{city_id}/hint", response_model=HintResponse)
async def get_city_hint(city_id: int, db_session: Session = Depends(get_db)):
    """Получить подсказку для города"""
    service = CityService(db_session)
    hint = service.get_city_hint(city_id)
    
    if hint is None:
        raise HTTPException(status_code=404, detail="City not found")
    
    return HintResponse(hint=hint)

@router.post("/guess", response_model=GuessResultResponse)
async def submit_guess(
    guess: SubmitGuessRequest,
    db_session: Session = Depends(get_db)
):
    """
    Отправить догадку пользователя и получить результат
    Подсчет очков и расстояния происходит на бекенде
    """
    service = CityService(db_session)
    result = service.calculate_guess_result(
        guess.city_id,
        guess.guessed_latitude,
        guess.guessed_longitude
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="City not found")
    
    return GuessResultResponse(**result)
