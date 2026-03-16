import { useState } from 'react';
import { api } from '../api';

export const useGame = () => {
  const [score, setScore] = useState(0);
  const [guessedCoords, setGuessedCoords] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleMapClick = (coords) => {
    setGuessedCoords(coords);
    setLastResult(null);
  };

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
