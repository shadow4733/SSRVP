from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from ..models.city import City
from geopy.distance import geodesic

class CityService:
    def __init__(self, db: Session):
        self.db = db

    def get_random_city(self) -> Optional[City]:
        """Получить случайный город из базы данных"""
        return self.db.query(City).order_by(func.random()).first()

    def get_city_by_id(self, city_id: int) -> Optional[City]:
        """Получить город по ID"""
        return self.db.query(City).filter(City.id == city_id).first()

    def get_city_hint(self, city_id: int) -> Optional[str]:
        """Получить подсказку для города"""
        city = self.get_city_by_id(city_id)
        return city.hint if city else None

    def calculate_guess_result(
        self, 
        city_id: int, 
        guessed_lat: float, 
        guessed_lon: float
    ) -> Optional[dict]:
        """
        Рассчитать результат догадки пользователя
        Возвращает расстояние и заработанные очки
        """
        city = self.get_city_by_id(city_id)
        if not city:
            return None

        # Координаты города и догадки пользователя
        city_coords = (float(city.latitude), float(city.longitude))
        guessed_coords = (guessed_lat, guessed_lon)

        # Расстояние в километрах
        distance_km = geodesic(city_coords, guessed_coords).kilometers

        # Подсчет очков: максимум 100 очков за точность
        # Чем меньше расстояние, тем больше очков
        max_score = 100
        max_distance_km = 500  # 500 км - максимальное расстояние для получения очков
        
        if distance_km >= max_distance_km:
            earned_points = 0
        else:
            earned_points = round(max_score * (1 - distance_km / max_distance_km))

        return {
            "distance_km": round(distance_km, 2),
            "earned_points": earned_points,
            "city_latitude": float(city.latitude),
            "city_longitude": float(city.longitude)
        }
