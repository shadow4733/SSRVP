const API_URL = 'http://localhost:8000/api';

export const gameSessionAPI = {
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
