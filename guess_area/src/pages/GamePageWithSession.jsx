import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../hooks/useCity';
import { useHint } from '../hooks/useHint';
import { useGame } from '../hooks/useGame';
import { gameSessionAPI } from '../services/gameSessionService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import GamePanel from '../components/GamePanel';
import '../App.css';

const ROUND_TIME_LIMIT_SECONDS = 30;

/**
 * Основная страница игрового процесса с поддержкой мультиплеера.
 * @returns {JSX.Element}
 */
function GamePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [session, setSession] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_LIMIT_SECONDS);
  const [roundTimeoutResult, setRoundTimeoutResult] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [roundGuesses, setRoundGuesses] = useState([]);
  const [readySubmitting, setReadySubmitting] = useState(false);
  const [readyError, setReadyError] = useState('');
  const timeoutTriggeredRef = useRef(false);

  const { currentCity, loading: cityLoading, fetchRandomCity, setCity } = useCity();
  const { hint, loading: hintLoading, fetchHint, resetHint } = useHint();
  const { guessedCoords, lastResult, submitting, handleMapClick, submitGuess, resetGuess } = useGame();
  const roundResult = lastResult || roundTimeoutResult;
  const isMultiplayer = Boolean(session?.multiplayer_room_id);
  const roomStarted = Boolean(roomState?.started_at);
  const isWaitingForStart = isMultiplayer && !roomStarted;
  const myPlayerState = roomState?.players?.find((player) => player.user_id === user?.id) || null;
  const isRoundActive = Boolean(session && currentCity && roundResult === null && !submitting && !isWaitingForStart);

  /**
   * Загружает город для указанного раунда.
   * @param {Object|null} targetSession Текущая сессия.
   * @param {number} roundNumber Номер раунда.
   * @returns {Promise<void>}
   */
  const loadCityForRound = useCallback(async (targetSession, roundNumber) => {
    if (targetSession?.multiplayer_room_id) {
      const city = await gameSessionAPI.getSessionRoundCity(sessionId, roundNumber, token);
      setCity(city);
      return;
    }
    await fetchRandomCity();
  }, [sessionId, token, setCity, fetchRandomCity]);

  /**
   * Загружает сессию и готовит состояние страницы.
   * @returns {Promise<void>}
   */
  const loadSession = useCallback(async () => {
    try {
      const data = await gameSessionAPI.getSession(sessionId, token);
      setSession(data);
      setCurrentRound(data.rounds.length + 1);
      setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
      setRoundTimeoutResult(null);
      timeoutTriggeredRef.current = false;

      if (data.completed_at || data.rounds.length >= data.total_rounds) {
        navigate(`/game-results/${sessionId}`);
        return;
      }

      if (!data.multiplayer_room_id) {
        await loadCityForRound(data, data.rounds.length + 1);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Ошибка загрузки сессии');
      navigate('/game-setup');
    } finally {
      setSessionLoading(false);
    }
  }, [sessionId, token, navigate, loadCityForRound]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /**
   * Обрабатывает клик по карте только пока раунд не завершен.
   * @param {number[]} coords Координаты [lat, lng].
   * @returns {void}
   */
  const handleMapClickConditional = (coords) => {
    if (roundResult === null) {
      handleMapClick(coords);
    }
  };

  /**
   * Загружает следующий город и переключает раунд.
   * @returns {Promise<void>}
   */
  const handleFetchCity = async () => {
    if (isWaitingForStart) {
      return;
    }
    if (session && currentRound === session.total_rounds) {
      navigate(`/game-results/${sessionId}`);
      return;
    }

    const nextRound = currentRound + 1;
    await loadCityForRound(session, nextRound);
    resetHint();
    resetGuess();
    setRoundTimeoutResult(null);
    setRoundGuesses([]);
    setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
    timeoutTriggeredRef.current = false;
    setCurrentRound(nextRound);
  };

  /**
   * Загружает подсказку для текущего города.
   * @returns {Promise<void>}
   */
  const handleFetchHint = async () => {
    if (currentCity) {
      await fetchHint(currentCity.id);
    }
  };

  /**
   * Отправляет ответ игрока и сохраняет результат раунда.
   * @returns {Promise<void>}
   */
  const handleSubmit = useCallback(async () => {
    if (isWaitingForStart) return;
    if (!currentCity || !guessedCoords || roundResult !== null) return;

    try {
      const result = await submitGuess(currentCity.id);
      setRoundTimeoutResult(null);

      await gameSessionAPI.saveRound(
        sessionId,
        {
          city_id: currentCity.id,
          round_number: currentRound,
          guessed_lat: guessedCoords[0],
          guessed_lng: guessedCoords[1],
          distance_meters: Math.round(result.distance_km * 1000),
          points_earned: result.earned_points,
        },
        token
      );

      const updatedSession = await gameSessionAPI.getSession(sessionId, token);
      setSession(updatedSession);
    } catch (error) {
      console.error('Error submitting guess:', error);
      alert('Ошибка при отправке ответа');
    }
  }, [isWaitingForStart, currentCity, guessedCoords, roundResult, submitGuess, sessionId, currentRound, token]);

  /**
   * Завершает раунд по таймеру и фиксирует автопропуск.
   * @returns {Promise<void>}
   */
  const handleRoundTimeout = useCallback(async () => {
    if (
      !session ||
      !currentCity ||
      timeoutTriggeredRef.current ||
      roundResult !== null ||
      submitting
    ) {
      return;
    }

    timeoutTriggeredRef.current = true;

    try {
      if (guessedCoords) {
        await handleSubmit();
        return;
      }

      await gameSessionAPI.saveRound(
        sessionId,
        {
          city_id: currentCity.id,
          round_number: currentRound,
          guessed_lat: null,
          guessed_lng: null,
          distance_meters: 0,
          points_earned: 0,
        },
        token
      );

      const updatedSession = await gameSessionAPI.getSession(sessionId, token);
      setSession(updatedSession);
      setRoundTimeoutResult({
        distance_km: 0,
        earned_points: 0,
        city_latitude: currentCity.latitude,
        city_longitude: currentCity.longitude,
        timed_out: true,
      });
    } catch (error) {
      console.error('Error handling timeout:', error);
      alert('Ошибка при завершении раунда по таймеру');
    }
  }, [
    session,
    currentCity,
    roundResult,
    submitting,
    guessedCoords,
    handleSubmit,
    sessionId,
    currentRound,
    token,
  ]);

  useEffect(() => {
    if (!isRoundActive || timeLeft <= 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRoundActive, timeLeft]);

  useEffect(() => {
    if (isRoundActive && timeLeft === 0 && !timeoutTriggeredRef.current) {
      handleRoundTimeout();
    }
  }, [isRoundActive, timeLeft, handleRoundTimeout]);

  useEffect(() => {
    if (!session?.multiplayer_room_id) {
      setRoomState(null);
      return undefined;
    }

    let cancelled = false;
    /**
     * Обновляет состояние мультиплеерной комнаты.
     * @returns {Promise<void>}
     */
    const fetchRoomState = async () => {
      try {
        const data = await gameSessionAPI.getMultiplayerRoom(session.multiplayer_room_id, token);
        if (!cancelled) {
          setRoomState(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load multiplayer room:', error);
        }
      }
    };

    fetchRoomState();
    const intervalId = setInterval(fetchRoomState, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [session?.multiplayer_room_id, token]);

  useEffect(() => {
    if (!session || !roomStarted || currentCity) {
      return;
    }
    loadCityForRound(session, currentRound);
  }, [session, roomStarted, currentCity, currentRound, loadCityForRound]);

  useEffect(() => {
    if (!session?.multiplayer_room_id || !roundResult) {
      setRoundGuesses([]);
      return undefined;
    }

    let cancelled = false;
    /**
     * Загружает клики игроков за текущий раунд.
     * @returns {Promise<void>}
     */
    const fetchRoundGuesses = async () => {
      try {
        const guesses = await gameSessionAPI.getMultiplayerRoundGuesses(
          session.multiplayer_room_id,
          currentRound,
          token
        );
        if (!cancelled) {
          setRoundGuesses(guesses);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load round guesses:', error);
        }
      }
    };

    fetchRoundGuesses();
    const intervalId = setInterval(fetchRoundGuesses, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [session?.multiplayer_room_id, roundResult, currentRound, token]);

  const opponentGuesses = roundGuesses.filter(
    (guess) => guess.user_id !== user?.id && guess.guessed_lat !== null && guess.guessed_lng !== null
  );

  /**
   * Помечает текущего игрока готовым к старту матча.
   * @returns {Promise<void>}
   */
  const handleReadyUp = async () => {
    if (!session?.multiplayer_room_id || readySubmitting) {
      return;
    }
    setReadySubmitting(true);
    setReadyError('');
    try {
      await gameSessionAPI.readyMultiplayerRoom(session.multiplayer_room_id, token);
      const freshState = await gameSessionAPI.getMultiplayerRoom(session.multiplayer_room_id, token);
      setRoomState(freshState);
    } catch (error) {
      setReadyError(error.message || 'Не удалось подтвердить готовность');
    } finally {
      setReadySubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="app">
        <Header score={0} />
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: '24px',
              width: '100%',
            }}
          >
            ⏳ Загрузка игры...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header score={session?.total_score || 0} />
      <div className="container">
        <Sidebar position="left">
          <h3>📊 Прогресс</h3>
          {session && (
            <div style={{ color: '#ffffff' }}>
              <p style={{ fontSize: '18px', margin: '15px 0' }}>
                <strong>Раунд:</strong>{' '}
                <span
                  style={{
                    fontSize: '24px',
                    color: '#ffd700',
                  }}
                >
                  {currentRound}/{session.total_rounds}
                </span>
              </p>
              <p style={{ fontSize: '16px', margin: '10px 0' }}>
                <strong>Счет игры:</strong>{' '}
                <span style={{ color: '#38ef7d', fontSize: '20px' }}>
                  {session.total_score}
                </span>
              </p>
              <p style={{ fontSize: '16px', margin: '10px 0' }}>
                <strong>Время раунда:</strong>{' '}
                <span
                  style={{
                    color: timeLeft <= 10 ? '#ff6b6b' : '#ffd700',
                    fontSize: '22px',
                  }}
                >
                  {timeLeft}с
                </span>
              </p>

              <div
                style={{
                  marginTop: '20px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  height: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                }}
              >
                <div
                  style={{
                    width: `${(session.rounds.length / session.total_rounds) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#b8c5d6',
                  marginTop: '10px',
                  textAlign: 'center',
                }}
              >
                Завершено: {session.rounds.length} из {session.total_rounds}
              </p>

              {roomState && (
                <div
                  style={{
                    marginTop: '18px',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    paddingTop: '14px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', color: '#ffd700', fontWeight: 700 }}>
                    👥 Комната {roomState.room_code}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#dbe6ff' }}>
                    {roomState.mode === 'duel' ? 'Режим: Дуэль 1v1' : 'Режим: Безлимитная комната'}
                  </p>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#dbe6ff' }}>
                    Игроков онлайн: {roomState.participants_count}
                  </p>
                  {!roomStarted && (
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#ffd700' }}>
                      Матч стартует, когда все нажмут «Старт».
                    </p>
                  )}
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {roomState.players.slice(0, 6).map((player) => (
                      <div
                        key={player.user_id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: '#ffffff',
                        }}
                      >
                        <span>
                          {player.username}
                          {player.is_ready && !roomStarted ? ' ✅' : ''}
                        </span>
                        <span style={{ color: '#38ef7d' }}>{player.total_score}</span>
                      </div>
                    ))}
                  </div>
                  {roundResult && (
                    <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#ffd700' }}>
                      Клики соперников за раунд показаны на карте.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Sidebar>

        <MapComponent
          currentCity={currentCity}
          guessedCoords={guessedCoords}
          onMapClick={handleMapClickConditional}
          showLine={roundResult !== null}
          actualCityCoords={roundResult ? [roundResult.city_latitude, roundResult.city_longitude] : null}
          opponentGuesses={opponentGuesses}
        />

        <Sidebar position="right">
          {isWaitingForStart ? (
            <>
              <h3>⏳ Лобби</h3>
              <p style={{ color: '#dbe6ff', fontSize: '14px', lineHeight: '1.5' }}>
                Ожидаем готовность игроков. Нажмите кнопку ниже, чтобы подтвердить старт.
              </p>
              <button
                onClick={handleReadyUp}
                disabled={readySubmitting || myPlayerState?.is_ready}
                style={{
                  background: myPlayerState?.is_ready
                    ? 'linear-gradient(135deg, #2c7a50 0%, #38ef7d 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {myPlayerState?.is_ready ? '✅ Вы готовы' : readySubmitting ? '⏳ Подтверждение...' : '🚀 Старт'}
              </button>
              {readyError && (
                <p style={{ marginTop: '10px', color: '#ff9b9b', fontSize: '13px' }}>
                  {readyError}
                </p>
              )}
            </>
          ) : (
            <>
              <h3>🎯 Найди город</h3>
              <GamePanel
                currentCity={currentCity}
                hint={hint}
                lastResult={roundResult}
                guessedCoords={guessedCoords}
                loading={cityLoading}
                hintLoading={hintLoading}
                submitting={submitting}
                timeLeft={timeLeft}
                onFetchCity={handleFetchCity}
                onFetchHint={handleFetchHint}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}

export default GamePage;
