import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Провайдер аутентификации приложения.
 * @param {{children: React.ReactNode}} props Дочерние элементы приложения.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Проверяет наличие валидного токена и восстанавливает сессию.
     * @returns {Promise<void>}
     */
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await authAPI.getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Выполняет вход пользователя.
   * @param {string} username Имя пользователя.
   * @param {string} password Пароль пользователя.
   * @returns {Promise<Object>} Объект пользователя.
   */
  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const userData = await authAPI.getCurrentUser(access_token);
    setUser(userData);
    
    return userData;
  };

  /**
   * Регистрирует нового пользователя и авторизует его.
   * @param {string} username Имя пользователя.
   * @param {string} email Email пользователя.
   * @param {string} password Пароль пользователя.
   * @returns {Promise<Object>} Объект пользователя.
   */
  const register = async (username, email, password) => {
    const response = await authAPI.register(username, email, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const userData = await authAPI.getCurrentUser(access_token);
    setUser(userData);
    
    return userData;
  };

  /**
   * Завершает текущую пользовательскую сессию.
   * @returns {void}
   */
  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Возвращает объект состояния и методов аутентификации.
 * @returns {{
 * user: Object|null,
 * token: string|null,
 * loading: boolean,
 * login: (username: string, password: string) => Promise<Object>,
 * register: (username: string, email: string, password: string) => Promise<Object>,
 * logout: () => void,
 * isAuthenticated: boolean
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
