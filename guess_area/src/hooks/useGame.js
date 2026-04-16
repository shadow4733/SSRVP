import { useState } from 'react';
import { api } from '../api';

/**
 * Хук состояния игрового раунда и отправки догадки.
 * @returns {{
 * score: number,
 * guessedCoords: number[]|null,
 * lastResult: Object|null,
 * submitting: boolean,
 * handleMapClick: (coords: number[]) => void,
 * submitGuess: (cityId: number|string) => Promise<Object|null>,
 * resetGuess: () => void
 * }}
 */
export const useGame = () => {
  const [score, setScore] = useState(0);
  const [guessedCoords, setGuessedCoords] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Сохраняет выбранную на карте точку.
   * @param {number[]} coords Координаты [lat, lng].
   * @returns {void}
   */
  const handleMapClick = (coords) => {
    setGuessedCoords(coords);
    setLastResult(null);
  };

  /**
   * Отправляет догадку пользователя на сервер.
   * @param {number|string} cityId Идентификатор текущего города.
   * @returns {Promise<Object|null>} Результат раунда или null, если точка не выбрана.
   */
  const submitGuess = async (cityId) => {
    if (!guessedCoords) return null;

    setSubmitting(true);
    try {
      const result = await api.city.submitGuess(
        cityId,
        guessedCoords[0],
        guessedCoords[1]
      );
      
      setLastResult(result);
      setScore(prev => prev + result.earned_points);
      
      return result;
    } catch (error) {
      console.error('Ошибка при отправке догадки:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Очищает выбранную точку и результат прошлого раунда.
   * @returns {void}
   */
  const resetGuess = () => {
    setGuessedCoords(null);
    setLastResult(null);
  };

  return {
    score,
    guessedCoords,
    lastResult,
    submitting,
    handleMapClick,
    submitGuess,
    resetGuess
  };
};
