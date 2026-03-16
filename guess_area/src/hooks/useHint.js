import { useState } from 'react';
import { api } from '../api';

export const useHint = () => {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
