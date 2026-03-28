import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameSessionAPI } from '../services/gameSessionService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/GameResults.css';

function GameResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await gameSessionAPI.getSession(sessionId, token);
      setSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Ошибка загрузки результатов');
      navigate('/game-setup');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    navigate('/game-setup');
  };

  if (loading) {
    return (
      <div className="app">
        <Header score={0} />
        <div className="results-container">
          <div className="loading">⏳ Загрузка результатов...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <Header score={0} />
        <div className="results-container">
          <div className="error">Сессия не найдена</div>
        </div>
        <Footer />
      </div>
    );
  }

  const averagePoints = session.rounds.length > 0 
    ? Math.round(session.total_score / session.rounds.length)
    : 0;

  return (
    <div className="app">
      <Header score={session.total_score} />
      
      <div className="results-container">
        <div className="results-box">
          {/* Заголовок */}
          <div className="results-header">
            <h1 className="results-title">🎉 Игра завершена!</h1>
            <div className="final-score">
              <span className="score-label">Финальный счет</span>
              <span className="score-value">{session.total_score}</span>
              <span className="score-subtitle">за {session.total_rounds} раундов</span>
            </div>
          </div>

          <div className="session-stats">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-number">{session.total_rounds}</div>
              <div className="stat-label">Раундов сыграно</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{averagePoints}</div>
              <div className="stat-label">Средний балл</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-number">
                {Math.max(...session.rounds.map(r => r.points_earned))}
              </div>
              <div className="stat-label">Лучший раунд</div>
            </div>
          </div>

          <div className="rounds-list">
            <h2 className="rounds-title">📊 Детальные результаты</h2>
            {session.rounds.map((round, index) => {
              const distanceKm = (round.distance_meters / 1000).toFixed(1);
              const isGoodResult = round.points_earned > 5000;
              
              return (
                <div key={round.id} className={`round-item ${isGoodResult ? 'good' : ''}`}>
                  <div className="round-number">
                    <span className="round-badge">Раунд {round.round_number}</span>
                  </div>
                  <div className="round-details">
                    <div className="round-stat">
                      <span className="detail-label">📍 Расстояние:</span>
                      <span className="detail-value">{distanceKm} км</span>
                    </div>
                    <div className="round-stat">
                      <span className="detail-label">⭐ Очки:</span>
                      <span className="detail-value points">{round.points_earned}</span>
                    </div>
                  </div>
                  {isGoodResult && (
                    <div className="round-badge-excellent">🔥 Отлично!</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="play-again-btn" onClick={handlePlayAgain}>
              🔄 Играть еще
            </button>
            <button 
              className="view-stats-btn" 
              onClick={() => navigate('/game-setup')}
            >
              📈 Статистика
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default GameResultsPage;
