const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  city: {
    getRandom: async () => {
      const response = await fetch(`${API_URL}/api/city/random`);
      if (!response.ok) throw new Error('Failed to fetch city');
      return response.json();
    },
    
    getHint: async (cityId) => {
      const response = await fetch(`${API_URL}/api/city/${cityId}/hint`);
      if (!response.ok) throw new Error('Failed to fetch hint');
      return response.json();
    },

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
