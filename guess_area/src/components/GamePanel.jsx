import React from 'react';

const GamePanel = ({ 
  currentCity, 
  hint,
  lastResult,
  guessedCoords,
  loading,
  hintLoading,
  submitting,
  onFetchCity,
  onFetchHint,
  onSubmit
}) => {
  if (!currentCity) {
    return (
      <>
        <p>Нажмите кнопку, чтобы начать игру</p>
        <button onClick={onFetchCity} disabled={loading}>
          {loading ? 'Загрузка...' : 'Получить город'}
        </button>
      </>
    );
  }

  return (
    <>
      <p><strong>Город:</strong> {currentCity.name}</p>
      
      {!hint ? (
        <button onClick={onFetchHint} disabled={hintLoading} style={{ marginTop: '10px' }}>
          {hintLoading ? 'Загрузка...' : '💡 Показать подсказку'}
        </button>
      ) : (
        <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '5px' }}>
          <strong>Подсказка:</strong> {hint}
        </div>
      )}
      
      <p style={{ marginTop: '15px' }}>
        <em>Нажмите на карту в предполагаемом месте города, затем нажмите "Подтвердить".</em>
      </p>
      
      <button onClick={onSubmit} disabled={!guessedCoords || submitting}>
        {submitting ? 'Проверка...' : 'Подтвердить'}
      </button>
      
      {lastResult && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#e7f3ff', borderRadius: '5px' }}>
          <p><strong>Расстояние:</strong> {lastResult.distance_km.toFixed(1)} км</p>
          <p><strong>Получено очков:</strong> {lastResult.earned_points}</p>
        </div>
      )}
      
      <button onClick={onFetchCity} style={{ marginTop: '15px' }} disabled={loading}>
        {loading ? 'Загрузка...' : 'Следующий город'}
      </button>
    </>
  );
};

export default GamePanel;
