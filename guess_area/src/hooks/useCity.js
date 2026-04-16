import { useCallback, useState } from 'react';
import { api } from '../api';

/**
 * Хук управления текущим городом раунда.
 * @returns {{
 * currentCity: Object|null,
 * loading: boolean,
 * error: string|null,
 * fetchRandomCity: () => Promise<void>,
 * resetCity: () => void,
 * setCity: (data: Object) => void
 * }}
 */
export const useCity = () => {
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Нормализует и сохраняет город в локальном состоянии.
   * @param {Object} data Данные города с бэкенда.
   * @returns {void}
   */
  const setCity = useCallback((data) => {
    if (!data?.id) {
      return;
    }
    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);
    setCurrentCity({
      id: data.id,
      name: data.name,
      latitude,
      longitude,
      coords: [latitude, longitude],
    });
  }, []);

  /**
   * Загружает случайный город с API.
   * @returns {Promise<void>}
   */
  const fetchRandomCity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.city.getRandom();
      setCity(data);
    } catch (err) {
      setError('Не удалось получить город с сервера');
      console.error('Ошибка при получении города:', err);
    } finally {
      setLoading(false);
    }
  }, [setCity]);

  /**
   * Сбрасывает текущий город и ошибку.
   * @returns {void}
   */
  const resetCity = useCallback(() => {
    setCurrentCity(null);
    setError(null);
  }, []);

  return {
    currentCity,
    loading,
    error,
    fetchRandomCity,
    resetCity,
    setCity,
  };
};
