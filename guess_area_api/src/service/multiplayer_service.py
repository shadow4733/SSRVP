import secrets
import string
from datetime import datetime
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.city import City
from ..models.game_round import GameRound
from ..models.game_sessions import GameSession
from ..models.multiplayer_room import MultiplayerRoom
from ..models.multiplayer_room_participant import MultiplayerRoomParticipant
from ..models.multiplayer_room_round import MultiplayerRoomRound
from ..models.user import User

RoomMode = Literal["duel", "room"]
ALLOWED_ROUNDS = {3, 5, 10, 15}


class MultiplayerService:
    def __init__(self, db: Session):
        self.db = db

    def create_room(self, host_user_id: int, mode: RoomMode, total_rounds: int) -> tuple[MultiplayerRoom, GameSession]:
        if total_rounds not in ALLOWED_ROUNDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total rounds must be 3, 5, 10, or 15",
            )
        if mode not in {"duel", "room"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mode must be duel or room",
            )

        room = MultiplayerRoom(
            code=self._generate_room_code(),
            host_user_id=host_user_id,
            mode=mode,
            total_rounds=total_rounds,
            max_players=2 if mode == "duel" else None,
            is_active=True,
            started_at=None,
        )
        self.db.add(room)
        self.db.flush()
        self._seed_room_rounds(room.id, total_rounds)

        participant = MultiplayerRoomParticipant(room_id=room.id, user_id=host_user_id)
        session = GameSession(
            user_id=host_user_id,
            total_rounds=total_rounds,
            total_score=0,
            multiplayer_room_id=room.id,
        )

        self.db.add(participant)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(room)
        self.db.refresh(session)
        return room, session

    def join_room(self, user_id: int, room_code: str) -> tuple[MultiplayerRoom, GameSession]:
        room = self._get_room_by_code(room_code)
        self._ensure_room_rounds(room)
        if room.started_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room already started",
            )

        membership = self.db.query(MultiplayerRoomParticipant).filter(
            MultiplayerRoomParticipant.room_id == room.id,
            MultiplayerRoomParticipant.user_id == user_id,
        ).first()

        participants_count = self.get_participants_count(room.id)
        if not membership:
            if room.max_players is not None and participants_count >= room.max_players:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Room is full",
                )
            self.db.add(MultiplayerRoomParticipant(room_id=room.id, user_id=user_id))

        session = self.db.query(GameSession).filter(
            GameSession.multiplayer_room_id == room.id,
            GameSession.user_id == user_id,
            GameSession.completed_at.is_(None),
        ).order_by(GameSession.started_at.desc()).first()

        if not session:
            session = GameSession(
                user_id=user_id,
                total_rounds=room.total_rounds,
                total_score=0,
                multiplayer_room_id=room.id,
            )
            self.db.add(session)

        self.db.commit()
        self.db.refresh(room)
        self.db.refresh(session)
        return room, session

    def mark_ready_and_maybe_start(self, room_id: int, user_id: int) -> dict:
        room = self._get_room_by_id(room_id)
        participant = self.db.query(MultiplayerRoomParticipant).filter(
            MultiplayerRoomParticipant.room_id == room.id,
            MultiplayerRoomParticipant.user_id == user_id,
        ).first()
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

        if room.started_at is not None:
            return {
                "started": True,
                "started_now": False,
                "started_at": room.started_at.isoformat(),
            }

        if not participant.is_ready:
            participant.is_ready = True
            participant.ready_at = datetime.utcnow()

        started_now = False
        if self._can_start_room(room):
            room.started_at = datetime.utcnow()
            started_now = True

        self.db.commit()
        self.db.refresh(room)
        return {
            "started": room.started_at is not None,
            "started_now": started_now,
            "started_at": room.started_at.isoformat() if room.started_at else None,
        }

    def get_room_state_for_user(self, room_id: int, user_id: int) -> dict:
        room = self._get_room_by_id(room_id)
        self._ensure_room_rounds(room)
        self._assert_user_in_room(room.id, user_id)
        players = self._build_players_state(room.id)
        my_session = self.db.query(GameSession).filter(
            GameSession.multiplayer_room_id == room.id,
            GameSession.user_id == user_id,
            GameSession.completed_at.is_(None),
        ).order_by(GameSession.started_at.desc()).first()

        return {
            "room_id": room.id,
            "room_code": room.code,
            "mode": room.mode,
            "total_rounds": room.total_rounds,
            "max_players": room.max_players,
            "required_players": 2,
            "started_at": room.started_at.isoformat() if room.started_at else None,
            "participants_count": self.get_participants_count(room.id),
            "players": players,
            "my_session_id": my_session.id if my_session else None,
        }

    def get_round_city_for_session(self, session: GameSession, user_id: int, round_number: int) -> City:
        if not session.multiplayer_room_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is not multiplayer",
            )
        self._assert_user_in_room(session.multiplayer_room_id, user_id)
        room = self._get_room_by_id(session.multiplayer_room_id)
        self._ensure_room_rounds(room)
        if room.started_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is waiting for players to press start",
            )

        room_round = self.db.query(MultiplayerRoomRound).filter(
            MultiplayerRoomRound.room_id == session.multiplayer_room_id,
            MultiplayerRoomRound.round_number == round_number,
        ).first()
        if not room_round:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Round city not found",
            )
        city = self.db.query(City).filter(City.id == room_round.city_id).first()
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        return city

    def validate_round_city(self, room_id: int, user_id: int, round_number: int, city_id: int) -> None:
        self._assert_user_in_room(room_id, user_id)
        room = self._get_room_by_id(room_id)
        self._ensure_room_rounds(room)
        if room.started_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is waiting for players to press start",
            )
        room_round = self.db.query(MultiplayerRoomRound).filter(
            MultiplayerRoomRound.room_id == room_id,
            MultiplayerRoomRound.round_number == round_number,
        ).first()
        if not room_round:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Round city not found",
            )
        if room_round.city_id != city_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid city for this room round",
            )

    def get_round_guesses(self, room_id: int, user_id: int, round_number: int) -> list[dict]:
        self._assert_user_in_room(room_id, user_id)
        members = self.db.query(
            MultiplayerRoomParticipant.user_id,
            User.username,
        ).join(
            User,
            User.id == MultiplayerRoomParticipant.user_id,
        ).filter(
            MultiplayerRoomParticipant.room_id == room_id,
        ).all()

        result: list[dict] = []
        for member in members:
            latest_session = self.db.query(GameSession).filter(
                GameSession.multiplayer_room_id == room_id,
                GameSession.user_id == member.user_id,
            ).order_by(GameSession.started_at.desc()).first()

            round_guess = None
            if latest_session:
                round_guess = self.db.query(GameRound).filter(
                    GameRound.session_id == latest_session.id,
                    GameRound.round_number == round_number,
                ).first()

            result.append({
                "user_id": member.user_id,
                "username": member.username,
                "guessed_lat": float(round_guess.guessed_lat) if round_guess and round_guess.guessed_lat is not None else None,
                "guessed_lng": float(round_guess.guessed_lng) if round_guess and round_guess.guessed_lng is not None else None,
                "points_earned": int(round_guess.points_earned or 0) if round_guess else 0,
                "distance_meters": int(round_guess.distance_meters or 0) if round_guess else 0,
            })

        result.sort(key=lambda item: item["username"].lower())
        return result

    def _build_players_state(self, room_id: int) -> list[dict]:
        members = self.db.query(
            MultiplayerRoomParticipant.user_id,
            User.username,
            MultiplayerRoomParticipant.is_ready,
            MultiplayerRoomParticipant.ready_at,
        ).join(
            User,
            User.id == MultiplayerRoomParticipant.user_id,
        ).filter(
            MultiplayerRoomParticipant.room_id == room_id,
        ).all()

        players = []
        for member in members:
            latest_session = self.db.query(GameSession).filter(
                GameSession.multiplayer_room_id == room_id,
                GameSession.user_id == member.user_id,
            ).order_by(GameSession.started_at.desc()).first()

            completed_rounds = 0
            total_score = 0
            total_rounds = None
            is_completed = False

            if latest_session:
                completed_rounds = int(self.db.query(func.count(GameRound.id)).filter(
                    GameRound.session_id == latest_session.id,
                ).scalar() or 0)
                total_score = int(latest_session.total_score or 0)
                total_rounds = latest_session.total_rounds
                is_completed = latest_session.completed_at is not None

            players.append({
                "user_id": member.user_id,
                "username": member.username,
                "total_score": total_score,
                "completed_rounds": completed_rounds,
                "total_rounds": total_rounds,
                "is_completed": is_completed,
                "is_ready": bool(member.is_ready),
                "ready_at": member.ready_at.isoformat() if member.ready_at else None,
            })

        players.sort(
            key=lambda player: (
                -player["total_score"],
                -player["completed_rounds"],
                player["username"].lower(),
            )
        )
        return players

    def _seed_room_rounds(self, room_id: int, total_rounds: int) -> None:
        cities = self.db.query(City).order_by(func.random()).limit(total_rounds).all()
        if len(cities) < total_rounds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough cities to initialize room",
            )
        for index, city in enumerate(cities, start=1):
            self.db.add(MultiplayerRoomRound(
                room_id=room_id,
                round_number=index,
                city_id=city.id,
            ))

    def _ensure_room_rounds(self, room: MultiplayerRoom) -> None:
        existing_rounds = self.db.query(MultiplayerRoomRound).filter(
            MultiplayerRoomRound.room_id == room.id,
        ).all()
        if len(existing_rounds) >= room.total_rounds:
            return

        existing_numbers = {round_item.round_number for round_item in existing_rounds}
        existing_city_ids = {round_item.city_id for round_item in existing_rounds}
        missing_numbers = [number for number in range(1, room.total_rounds + 1) if number not in existing_numbers]
        if not missing_numbers:
            return

        cities_query = self.db.query(City).filter(~City.id.in_(existing_city_ids)) if existing_city_ids else self.db.query(City)
        cities = cities_query.order_by(func.random()).limit(len(missing_numbers)).all()
        if len(cities) < len(missing_numbers):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough cities to initialize room",
            )

        for round_number, city in zip(missing_numbers, cities):
            self.db.add(MultiplayerRoomRound(
                room_id=room.id,
                round_number=round_number,
                city_id=city.id,
            ))
        self.db.flush()

    def _can_start_room(self, room: MultiplayerRoom) -> bool:
        participants = self.db.query(MultiplayerRoomParticipant).filter(
            MultiplayerRoomParticipant.room_id == room.id,
        ).all()
        if len(participants) < 2:
            return False
        if room.mode == "duel" and len(participants) != 2:
            return False
        return all(participant.is_ready for participant in participants)

    def get_participants_count(self, room_id: int) -> int:
        return int(self.db.query(func.count(MultiplayerRoomParticipant.id)).filter(
            MultiplayerRoomParticipant.room_id == room_id,
        ).scalar() or 0)

    def _assert_user_in_room(self, room_id: int, user_id: int) -> None:
        membership = self.db.query(MultiplayerRoomParticipant.id).filter(
            MultiplayerRoomParticipant.room_id == room_id,
            MultiplayerRoomParticipant.user_id == user_id,
        ).first()
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    def _generate_room_code(self, length: int = 6) -> str:
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(20):
            code = "".join(secrets.choice(alphabet) for _ in range(length))
            exists = self.db.query(MultiplayerRoom.id).filter(MultiplayerRoom.code == code).first()
            if not exists:
                return code
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique room code",
        )

    def _get_room_by_id(self, room_id: int) -> MultiplayerRoom:
        room = self.db.query(MultiplayerRoom).filter(
            MultiplayerRoom.id == room_id,
            MultiplayerRoom.is_active.is_(True),
        ).first()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found",
            )
        return room

    def _get_room_by_code(self, room_code: str) -> MultiplayerRoom:
        normalized = room_code.strip().upper()
        room = self.db.query(MultiplayerRoom).filter(
            MultiplayerRoom.code == normalized,
            MultiplayerRoom.is_active.is_(True),
        ).first()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found",
            )
        return room
