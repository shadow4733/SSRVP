import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameSessionAPI } from '../services/gameSessionService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/GameSetup.css';

/**
 * Страница настройки игры, статистики и мультиплеерных комнат.
 * @returns {JSX.Element}
 */
function GameSetupPage() {
  const [selectedRounds, setSelectedRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [multiplayerLoading, setMultiplayerLoading] = useState(false);
  const [multiplayerError, setMultiplayerError] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');
  const [leaderboardRounds, setLeaderboardRounds] = useState('all');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Загружает персональную статистику игрока.
     * @returns {Promise<void>}
     */
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

    loadStats();
  }, [token]);

  useEffect(() => {
    /**
     * Загружает таблицу лидеров по выбранным фильтрам.
     * @returns {Promise<void>}
     */
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      setLeaderboardError('');

      try {
        const data = await gameSessionAPI.getLeaderboard(token, leaderboardPeriod, leaderboardRounds);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setLeaderboardError('Не удалось загрузить топ игроков');
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, [token, leaderboardPeriod, leaderboardRounds]);

  /**
   * Создает одиночную игру и открывает сессию.
   * @returns {Promise<void>}
   */
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

  /**
   * Создает мультиплеерную комнату в выбранном режиме.
   * @param {'duel'|'room'} mode Режим создаваемой комнаты.
   * @returns {Promise<void>}
   */
  const handleCreateMultiplayerRoom = async (mode) => {
    setMultiplayerLoading(true);
    setMultiplayerError('');
    setCopyStatus('');
    try {
      const response = await gameSessionAPI.createMultiplayerRoom(mode, selectedRounds, token);
      setRoomInfo(response);
      setRoomCodeInput(response.room_code);
    } catch (error) {
      setMultiplayerError(`Ошибка создания комнаты: ${error.message}`);
    } finally {
      setMultiplayerLoading(false);
    }
  };

  /**
   * Подключает игрока к комнате по коду.
   * @returns {Promise<void>}
   */
  const handleJoinMultiplayerRoom = async () => {
    if (!roomCodeInput.trim()) {
      setMultiplayerError('Введите код комнаты');
      return;
    }

    setMultiplayerLoading(true);
    setMultiplayerError('');
    try {
      const response = await gameSessionAPI.joinMultiplayerRoom(roomCodeInput.trim().toUpperCase(), token);
      navigate(`/game/${response.session_id}`);
    } catch (error) {
      setMultiplayerError(`Ошибка входа в комнату: ${error.message}`);
    } finally {
      setMultiplayerLoading(false);
    }
  };

  /**
   * Копирует код комнаты в буфер обмена.
   * @returns {Promise<void>}
   */
  const handleCopyRoomCode = async () => {
    if (!roomInfo?.room_code || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(roomInfo.room_code);
      setCopyStatus('Код скопирован');
    } catch {
      setCopyStatus('Не удалось скопировать код');
    }
  };

  const roundOptions = [
    { value: 3, label: '3 раунда', emoji: '⚡', description: 'Быстрая игра' },
    { value: 5, label: '5 раундов', emoji: '🎯', description: 'Классика' },
    { value: 10, label: '10 раундов', emoji: '🏆', description: 'Марафон' },
    { value: 15, label: '15 раундов', emoji: '🔥', description: 'Эпик' },
  ];

  const periodOptions = [
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'all', label: 'Все время' },
  ];

  const leaderboardRoundsOptions = [
    { value: 'all', label: 'Все форматы' },
    { value: '3', label: '3 раунда' },
    { value: '5', label: '5 раундов' },
    { value: '10', label: '10 раундов' },
    { value: '15', label: '15 раундов' },
  ];

  /**
   * Возвращает бейдж ранга в таблице лидеров.
   * @param {number} rank Позиция игрока в рейтинге.
   * @returns {string}
   */
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

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

          <div className="leaderboard-panel">
            <div className="leaderboard-header">
              <h2>🏅 Топ игроков</h2>
              <div className="leaderboard-controls">
                <div className="leaderboard-filters">
                  {periodOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`period-filter-btn ${leaderboardPeriod === option.value ? 'active' : ''}`}
                      onClick={() => setLeaderboardPeriod(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <label className="rounds-filter">
                  <span>Раунды:</span>
                  <select
                    value={leaderboardRounds}
                    onChange={(event) => setLeaderboardRounds(event.target.value)}
                  >
                    {leaderboardRoundsOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {loadingLeaderboard && <p className="leaderboard-state">Загрузка рейтинга...</p>}
            {!loadingLeaderboard && leaderboardError && <p className="leaderboard-state error">{leaderboardError}</p>}
            {!loadingLeaderboard && !leaderboardError && leaderboard.length === 0 && (
              <p className="leaderboard-state">Пока нет завершенных игр</p>
            )}
            {!loadingLeaderboard && !leaderboardError && leaderboard.length > 0 && (
              <div className="leaderboard-list">
                {leaderboard.map(player => (
                  <div key={player.user_id} className="leaderboard-item">
                    <div className="leaderboard-rank">{getRankBadge(player.rank)}</div>
                    <div className="leaderboard-user">
                      <div className="leaderboard-username">{player.username}</div>
                      <div className="leaderboard-meta">
                        Игр в формате: {player.games_played}
                      </div>
                    </div>
                    <div className="leaderboard-score">{player.best_score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="multiplayer-panel">
            <h2>👥 Мультиплеер</h2>
            <p className="multiplayer-description">
              Создайте дуэль 1v1 или безлимитную комнату, куда может зайти любое количество игроков.
            </p>
            <div className="multiplayer-actions">
              <button
                type="button"
                className="multiplayer-btn duel-btn"
                onClick={() => handleCreateMultiplayerRoom('duel')}
                disabled={multiplayerLoading || loading}
              >
                ⚔️ Дуэль
              </button>
              <button
                type="button"
                className="multiplayer-btn room-btn"
                onClick={() => handleCreateMultiplayerRoom('room')}
                disabled={multiplayerLoading || loading}
              >
                🏠 Создать комнату
              </button>
            </div>

            <div className="join-room-row">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
                placeholder="Код комнаты"
                maxLength={12}
              />
              <button
                type="button"
                onClick={handleJoinMultiplayerRoom}
                disabled={multiplayerLoading || loading}
              >
                Войти
              </button>
            </div>

            {multiplayerError && <p className="multiplayer-state error">{multiplayerError}</p>}

            {roomInfo && (
              <div className="room-card">
                <p><strong>Код комнаты:</strong> {roomInfo.room_code}</p>
                <p>
                  <strong>Режим:</strong>{' '}
                  {roomInfo.mode === 'duel' ? 'Дуэль (2 игрока)' : 'Общая комната (без лимита)'}
                </p>
                <p><strong>Раундов:</strong> {roomInfo.total_rounds}</p>
                <p><strong>Участников:</strong> {roomInfo.participants_count}</p>
                <div className="room-card-actions">
                  <button type="button" onClick={handleCopyRoomCode}>Скопировать код</button>
                  <button type="button" onClick={() => navigate(`/game/${roomInfo.session_id}`)}>В лобби</button>
                </div>
                {copyStatus && <p className="multiplayer-state">{copyStatus}</p>}
              </div>
            )}
          </div>

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
            disabled={loading || multiplayerLoading}
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
