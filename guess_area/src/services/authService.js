const API_URL = 'http://localhost:8000/api';

export const authAPI = {
  /**
   * Регистрирует нового пользователя.
   * @param {string} username Имя пользователя.
   * @param {string} email Email пользователя.
   * @param {string} password Пароль пользователя.
   * @returns {Promise<Object>} Токен и данные аутентификации.
   */
  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Выполняет вход пользователя.
   * @param {string} username Имя пользователя.
   * @param {string} password Пароль пользователя.
   * @returns {Promise<Object>} Токен доступа.
   */
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  /**
   * Получает данные текущего пользователя по токену.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные пользователя.
   */
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  /**
   * Загружает профиль пользователя.
   * @param {string} token JWT токен.
   * @returns {Promise<Object>} Данные профиля.
   */
  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  },

  /**
   * Выходит из аккаунта и очищает локальное хранилище.
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
