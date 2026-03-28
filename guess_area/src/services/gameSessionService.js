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
};
