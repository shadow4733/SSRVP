import React from 'react';
import { useCity } from '../hooks/useCity';
import { useHint } from '../hooks/useHint';
import { useGame } from '../hooks/useGame';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import GamePanel from '../components/GamePanel';
import '../App.css';

function GamePage() {
  const { currentCity, loading: cityLoading, fetchRandomCity } = useCity();
  const { hint, loading: hintLoading, fetchHint, resetHint } = useHint();
  const { score, guessedCoords, lastResult, submitting, handleMapClick, submitGuess, resetGuess } = useGame();

  const handleFetchCity = async () => {
    await fetchRandomCity();
    resetHint();
    resetGuess();
  };

  const handleFetchHint = async () => {
    if (currentCity) {
      await fetchHint(currentCity.id);
    }
  };

  const handleSubmit = async () => {
    if (currentCity && guessedCoords) {
      try {
        await submitGuess(currentCity.id);
      } catch (error) {
        alert('Ошибка при отправке ответа');
      }
    }
  };

  return (
    <div className="app">
      <Header score={score} onProfileClick={() => alert('Профиль')} />
      <div className="container">
        <Sidebar position="left">
          <h3>Левое меню</h3>
          <p>Здесь может быть что-то полезное</p>
        </Sidebar>

        <MapComponent
          currentCity={currentCity}
          guessedCoords={guessedCoords}
          onMapClick={handleMapClick}
          showLine={lastResult !== null}
          actualCityCoords={lastResult ? [lastResult.city_latitude, lastResult.city_longitude] : null}
        />

        <Sidebar position="right">
          <h3>Найди город</h3>
          <GamePanel
            currentCity={currentCity}
            hint={hint}
            lastResult={lastResult}
            guessedCoords={guessedCoords}
            loading={cityLoading}
            hintLoading={hintLoading}
            submitting={submitting}
            onFetchCity={handleFetchCity}
            onFetchHint={handleFetchHint}
            onSubmit={handleSubmit}
          />
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}

export default GamePage;
