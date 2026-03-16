import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';

const API_URL = 'http://localhost:8000';

function App() {
  const [score, setScore] = useState(0);
  const [currentCity, setCurrentCity] = useState(null);
  const [guessedCoords, setGuessedCoords] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);

  const fetchRandomCity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/city/random`);
      const data = await response.json();
      
      if (data.id) {
        setCurrentCity({
          id: data.id,
          name: data.name,
          coords: [data.latitude, data.longitude]
        });
        setGuessedCoords(null);
        setLastResult(null);
        setHint(null);
      }
    } catch (error) {
      console.error('Ошибка при получении города:', error);
      alert('Не удалось получить город с сервера');
    } finally {
      setLoading(false);
    }
  };

  const fetchHint = async () => {
    if (!currentCity) return;
    
    setHintLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/city/${currentCity.id}/hint`);
      const data = await response.json();
      
      if (data.hint) {
        setHint(data.hint);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказки:', error);
      alert('Не удалось получить подсказку');
    } finally {
      setHintLoading(false);
    }
  };

  const handleMapClick = (coords) => {
    setGuessedCoords(coords);
    setLastResult(null);
  };

  const handleSubmit = () => {
    if (!currentCity || !guessedCoords) return;

    const cityLatLng = L.latLng(currentCity.coords[0], currentCity.coords[1]);
    const guessedLatLng = L.latLng(guessedCoords[0], guessedCoords[1]);
    const distance = cityLatLng.distanceTo(guessedLatLng);

    const maxScore = 100;
    const maxDistance = 500000;
    const earned = Math.round(maxScore * Math.max(0, 1 - Math.min(distance, maxDistance) / maxDistance));

    setLastResult({ distance, earned });
    setScore(prev => prev + earned);
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
        />

        <Sidebar position="right">
          <h3>Найди город</h3>
          {!currentCity ? (
            <>
              <p>Нажмите кнопку, чтобы начать игру</p>
              <button onClick={fetchRandomCity} disabled={loading}>
                {loading ? 'Загрузка...' : 'Получить город'}
              </button>
            </>
          ) : (
            <>
              <p><strong>Город:</strong> {currentCity.name}</p>
              
              {!hint ? (
                <button onClick={fetchHint} disabled={hintLoading} style={{ marginTop: '10px' }}>
                  {hintLoading ? 'Загрузка...' : '💡 Показать подсказку'}
                </button>
              ) : (
                <div style={{ marginTop: '10px', padding: '10px', background: '#25220a', borderRadius: '5px' }}>
                  <strong>Подсказка:</strong> {hint}
                </div>
              )}
              
              <p style={{ marginTop: '15px' }}>
                <em>Нажмите на карту в предполагаемом месте города, затем нажмите "Подтвердить".</em>
              </p>
              <button onClick={handleSubmit} disabled={!guessedCoords}>
                Подтвердить
              </button>
              {lastResult && (
                <div style={{ marginTop: '15px' }}>
                  <p>Расстояние: {(lastResult.distance / 1000).toFixed(1)} км</p>
                  <p>Получено очков: {lastResult.earned}</p>
                </div>
              )}
              <button onClick={fetchRandomCity} style={{ marginTop: '15px' }} disabled={loading}>
                {loading ? 'Загрузка...' : 'Следующий город'}
              </button>
            </>
          )}
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}

export default App;