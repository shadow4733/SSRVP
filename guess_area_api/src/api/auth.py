from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dto.auth.request.auth_request import RegisterRequest, LoginRequest
from ..dto.auth.response.auth_response import TokenResponse, UserInfoResponse
from ..service.auth_service import (
    register_user,
    authenticate_user,
    get_current_user,
    create_token_response
)
from ..models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя
    
    - **username**: уникальное имя пользователя (3-50 символов)
    - **email**: уникальный email адрес
    - **password**: пароль (минимум 6 символов)
    
    Возвращает JWT токен для автоматического входа после регистрации
    """
    user = register_user(request, db)
    return create_token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Вход в систему
    
    - **username**: имя пользователя
    - **password**: пароль
    
    Возвращает JWT токен для авторизации
    """
    user = authenticate_user(request, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return create_token_response(user)


@router.get("/me", response_model=UserInfoResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Получить информацию о текущем пользователе
    
    Требует авторизации (Bearer token в заголовке Authorization)
    """
    return UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email
    )


@router.get("/profile", response_model=dict)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Получить профиль пользователя с статистикой
    
    Требует авторизации (Bearer token в заголовке Authorization)
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "total_score": current_user.total_score,
        "games_played": current_user.games_played,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
