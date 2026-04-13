import { useCallback, useState } from 'react';
import { api } from '../api';

export const useCity = () => {
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
