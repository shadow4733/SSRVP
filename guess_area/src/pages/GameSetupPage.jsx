import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameSessionAPI } from '../services/gameSessionService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/GameSetup.css';

function GameSetupPage() {
  const [selectedRounds, setSelectedRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await gameSessionAPI.getMyStats(token);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const response = await gameSessionAPI.createSession(selectedRounds, token);
      navigate(`/game/${response.session_id}`);
    } catch (error) {
      alert('Ошибка при создании игры: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const roundOptions = [
    { value: 3, label: '3 раунда', emoji: '⚡', description: 'Быстрая игра' },
    { value: 5, label: '5 раундов', emoji: '🎯', description: 'Классика' },
    { value: 10, label: '10 раундов', emoji: '🏆', description: 'Марафон' },
    { value: 15, label: '15 раундов', emoji: '🔥', description: 'Эпик' },
  ];

  return (
    <div className="app">
      <Header score={stats?.total_score || 0} />
      
      <div className="game-setup-container">
        <div className="setup-box">
          <h1 className="setup-title">🌍 Готовы играть?</h1>
          
          {!loadingStats && stats && (
            <div className="stats-panel">
              <div className="stat-item">
                <span className="stat-label">Сыграно игр</span>
                <span className="stat-value">{stats.games_played}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Общий счет</span>
                <span className="stat-value">{stats.total_score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Средний счет</span>
                <span className="stat-value">{stats.average_score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Лучшая игра</span>
                <span className="stat-value highlight">{stats.best_score}</span>
              </div>
            </div>
          )}

          <div className="rounds-selection">
            <h2>Выберите количество раундов:</h2>
            <div className="rounds-grid">
              {roundOptions.map(option => (
                <div
                  key={option.value}
                  className={`round-option ${selectedRounds === option.value ? 'selected' : ''}`}
                  onClick={() => setSelectedRounds(option.value)}
                >
                  <div className="round-emoji">{option.emoji}</div>
                  <div className="round-label">{option.label}</div>
                  <div className="round-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="start-game-btn"
            onClick={handleStartGame}
            disabled={loading}
          >
            {loading ? '⏳ Создание игры...' : '🚀 Начать игру'}
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default GameSetupPage;
