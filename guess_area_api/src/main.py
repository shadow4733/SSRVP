from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import city, auth, game_session

app = FastAPI(title="Guess Area API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(game_session.router, prefix="/api/game/session", tags=["game-session"])
app.include_router(city.router, prefix="/api/city", tags=["city"])

@app.get("/")
async def root():
    return {"message": "Guess Area API"}
