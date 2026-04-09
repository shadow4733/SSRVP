import React, { useState, useEffect } from 'react';
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

function GamePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [session, setSession] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionLoading, setSessionLoading] = useState(true);

  const { currentCity, loading: cityLoading, fetchRandomCity } = useCity();
  const { hint, loading: hintLoading, fetchHint, resetHint } = useHint();
  const { guessedCoords, lastResult, submitting, handleMapClick, submitGuess, resetGuess } = useGame();

  // Загрузить сессию
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await gameSessionAPI.getSession(sessionId, token);
      setSession(data);
      setCurrentRound(data.rounds.length + 1);

      if (data.completed_at || data.rounds.length >= data.total_rounds) {
        navigate(`/game-results/${sessionId}`);
        return;
      }

      if (!currentCity) {
        await fetchRandomCity();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Ошибка загрузки сессии');
      navigate('/game-setup');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleFetchCity = async () => {
    if (session && currentRound === session.total_rounds) {
      navigate(`/game-results/${sessionId}`);
      return;
    }

    await fetchRandomCity();
    resetHint();
    resetGuess();

    setCurrentRound(prev => prev + 1);
  };

  const handleFetchHint = async () => {
    if (currentCity) {
      await fetchHint(currentCity.id);
    }
  };

  const handleSubmit = async () => {
    if (!currentCity || !guessedCoords) return;

    try {
      const result = await submitGuess(currentCity.id);

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
            </div>
          )}
        </Sidebar>

        <MapComponent
          currentCity={currentCity}
          guessedCoords={guessedCoords}
          onMapClick={handleMapClick}
          showLine={lastResult !== null}
          actualCityCoords={lastResult ? [lastResult.city_latitude, lastResult.city_longitude] : null}
        />

        <Sidebar position="right">
          <h3>🎯 Найди город</h3>
          <GamePanel
            currentCity={currentCity}
            hint={hint}
            lastResult={lastResult}
            guessedCoords={guessedCoords}
            loading={cityLoading}
            hintLoading={hintLoading}
            submitting={submitting}
            onFetchCity={handleFetchCity}
            onFetchHint={handleFetchHint}
            onSubmit={handleSubmit}
          />
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}

export default GamePage;