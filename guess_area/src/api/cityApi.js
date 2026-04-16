const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  city: {
    /**
     * Запрашивает случайный город для текущего раунда.
     * @returns {Promise<Object>} Данные города.
     */
    getRandom: async () => {
      const response = await fetch(`${API_URL}/api/city/random`);
      if (!response.ok) throw new Error('Failed to fetch city');
      return response.json();
    },
    
    /**
     * Запрашивает подсказку по городу.
     * @param {number|string} cityId Идентификатор города.
     * @returns {Promise<Object>} Объект с подсказкой.
     */
    getHint: async (cityId) => {
      const response = await fetch(`${API_URL}/api/city/${cityId}/hint`);
      if (!response.ok) throw new Error('Failed to fetch hint');
      return response.json();
    },

    /**
     * Отправляет координаты догадки игрока.
     * @param {number|string} cityId Идентификатор города.
     * @param {number} guessedLatitude Предполагаемая широта.
     * @param {number} guessedLongitude Предполагаемая долгота.
     * @returns {Promise<Object>} Результат проверки догадки.
     */
    submitGuess: async (cityId, guessedLatitude, guessedLongitude) => {
      const response = await fetch(`${API_URL}/api/city/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city_id: cityId,
          guessed_latitude: guessedLatitude,
          guessed_longitude: guessedLongitude
        })
      });
      if (!response.ok) throw new Error('Failed to submit guess');
      return response.json();
    }
  }
};
