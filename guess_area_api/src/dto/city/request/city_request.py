from pydantic import BaseModel, Field

class SubmitGuessRequest(BaseModel):
    city_id: int = Field(..., description="ID города")
    guessed_latitude: float = Field(..., description="Широта пользовательской догадки")
    guessed_longitude: float = Field(..., description="Долгота пользовательской догадки")
