const API_URL = 'http://localhost:8000/api';

export const gameSessionAPI = {
  /**
   * Создает новую одиночную игровую сессию.
   * @param {number} totalRounds Количество раундов.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные созданной сессии.
   */
  createSession: async (totalRounds, token) => {
    const response = await fetch(`${API_URL}/game/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ total_rounds: totalRounds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create session');
    }

    return response.json();
  },

  /**
   * Получает состояние игровой сессии.
   * @param {string|number} sessionId Идентификатор сессии.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные сессии.
   */
  getSession: async (sessionId, token) => {
    const response = await fetch(`${API_URL}/game/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  /**
   * Получает город для конкретного раунда в сессии.
   * @param {string|number} sessionId Идентификатор сессии.
   * @param {number} roundNumber Номер раунда.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные города раунда.
   */
  getSessionRoundCity: async (sessionId, roundNumber, token) => {
    const response = await fetch(`${API_URL}/game/session/${sessionId}/round-city?round_number=${roundNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get round city');
    }

    return response.json();
  },

  /**
   * Сохраняет результат раунда.
   * @param {string|number} sessionId Идентификатор сессии.
   * @param {Object} roundData Данные раунда.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Сохраненный результат.
   */
  saveRound: async (sessionId, roundData, token) => {
    const response = await fetch(`${API_URL}/game/session/${sessionId}/round`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roundData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save round');
    }

    return response.json();
  },

  /**
   * Завершает игровую сессию.
   * @param {string|number} sessionId Идентификатор сессии.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Итоговые данные сессии.
   */
  completeSession: async (sessionId, token) => {
    const response = await fetch(`${API_URL}/game/session/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to complete session');
    }

    return response.json();
  },

  /**
   * Получает личную статистику текущего пользователя.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Объект статистики.
   */
  getMyStats: async (token) => {
    const response = await fetch(`${API_URL}/game/session/stats/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    return response.json();
  },

  /**
   * Получает таблицу лидеров с фильтрами.
   * @param {string} token JWT токен.
   * @param {'week'|'month'|'all'} [period='all'] Период рейтинга.
   * @param {string} [rounds='all'] Фильтр количества раундов.
   * @returns {Promise<Object[]>} Список игроков в рейтинге.
   */
  getLeaderboard: async (token, period = 'all', rounds = 'all') => {
    const params = new URLSearchParams({ period });
    if (rounds !== 'all') {
      params.set('rounds', rounds);
    }
    const response = await fetch(`${API_URL}/game/session/stats/leaderboard?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get leaderboard');
    }

    return response.json();
  },

  /**
   * Создает мультиплеерную комнату.
   * @param {'duel'|'room'} mode Режим комнаты.
   * @param {number} totalRounds Количество раундов.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные комнаты.
   */
  createMultiplayerRoom: async (mode, totalRounds, token) => {
    const response = await fetch(`${API_URL}/game/session/multiplayer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode,
        total_rounds: totalRounds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create multiplayer room');
    }

    return response.json();
  },

  /**
   * Присоединяет пользователя к мультиплеерной комнате.
   * @param {string} roomCode Код комнаты.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные созданной или найденной сессии.
   */
  joinMultiplayerRoom: async (roomCode, token) => {
    const response = await fetch(`${API_URL}/game/session/multiplayer/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        room_code: roomCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to join multiplayer room');
    }

    return response.json();
  },

  /**
   * Получает текущее состояние мультиплеерной комнаты.
   * @param {string|number} roomId Идентификатор комнаты.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Состояние комнаты.
   */
  getMultiplayerRoom: async (roomId, token) => {
    const response = await fetch(`${API_URL}/game/session/multiplayer/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get multiplayer room state');
    }

    return response.json();
  },

  /**
   * Отмечает текущего игрока как готового к старту.
   * @param {string|number} roomId Идентификатор комнаты.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Обновленное состояние комнаты.
   */
  readyMultiplayerRoom: async (roomId, token) => {
    const response = await fetch(`${API_URL}/game/session/multiplayer/${roomId}/ready`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark player ready');
    }

    return response.json();
  },

  /**
   * Получает догадки игроков по конкретному раунду.
   * @param {string|number} roomId Идентификатор комнаты.
   * @param {number} roundNumber Номер раунда.
   * @param {string} token JWT токен.
   * @returns {Promise<Object[]>} Список догадок игроков.
   */
  getMultiplayerRoundGuesses: async (roomId, roundNumber, token) => {
    const response = await fetch(`${API_URL}/game/session/multiplayer/${roomId}/round/${roundNumber}/guesses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get multiplayer round guesses');
    }

    return response.json();
  },
};
