import { useState } from 'react';
import { api } from '../api';

export const useCity = () => {
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomCity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.city.getRandom();
      if (data.id) {
        setCurrentCity({
          id: data.id,
          name: data.name,
          coords: [data.latitude, data.longitude]
        });
      }
    } catch (err) {
      setError('Не удалось получить город с сервера');
      console.error('Ошибка при получении города:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCity = () => {
    setCurrentCity(null);
    setError(null);
  };

  return {
    currentCity,
    loading,
    error,
    fetchRandomCity,
    resetCity
  };
};
