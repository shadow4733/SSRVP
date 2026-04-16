import { useState } from 'react';
import { api } from '../api';

/**
 * Хук для получения и хранения подсказки текущего раунда.
 * @returns {{
 * hint: string|null,
 * loading: boolean,
 * error: string|null,
 * fetchHint: (cityId: number|string) => Promise<void>,
 * resetHint: () => void
 * }}
 */
export const useHint = () => {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Загружает подсказку для выбранного города.
   * @param {number|string} cityId Идентификатор города.
   * @returns {Promise<void>}
   */
  const fetchHint = async (cityId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.city.getHint(cityId);
      if (data.hint) {
        setHint(data.hint);
      }
    } catch (err) {
      setError('Не удалось получить подсказку');
      console.error('Ошибка при получении подсказки:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Сбрасывает подсказку и ошибку загрузки.
   * @returns {void}
   */
  const resetHint = () => {
    setHint(null);
    setError(null);
  };

  return {
    hint,
    loading,
    error,
    fetchHint,
    resetHint
  };
};
