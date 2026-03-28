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
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Нажмите кнопку, чтобы начать игру
        </p>
        <button onClick={onFetchCity} disabled={loading}>
          {loading ? 'Загрузка...' : 'Получить город'}
        </button>
      </>
    );
  }

  return (
    <>
      <p style={{ 
        color: '#ffffff',
        fontSize: '18px',
        margin: '0 0 15px 0',
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.4)'
      }}>
        <strong>Город:</strong> <span style={{ color: '#ffd700', fontSize: '20px' }}>{currentCity.name}</span>
      </p>
      
      {!hint ? (
        <button onClick={onFetchHint} disabled={hintLoading} style={{ marginTop: '10px' }}>
          {hintLoading ? '⏳ Загрузка...' : ' Показать подсказку'}
        </button>
      ) : (
        <div style={{ 
          marginTop: '10px', 
          padding: '15px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          color: '#ffffff',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>💡</span>
            <strong style={{ fontSize: '18px' }}>Подсказка:</strong>
          </div>
          <p style={{ margin: '10px 0 0 0', fontWeight: '500' }}>{hint}</p>
        </div>
      )}
      
      <p style={{ 
        marginTop: '15px',
        color: '#b8c5d6',
        fontSize: '14px',
        fontStyle: 'italic',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        borderLeft: '3px solid #667eea'
      }}>
        <em>Нажмите на карту в предполагаемом месте города, затем нажмите "Подтвердить".</em>
      </p>
      
      <button onClick={onSubmit} disabled={!guessedCoords || submitting} style={{
        background: guessedCoords && !submitting 
          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
          : undefined
      }}>
        {submitting ? 'Проверка...' : 'Подтвердить'}
      </button>
      
      {lastResult && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          borderRadius: '8px',
          border: '2px solid #00d4ff',
          boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
          color: '#ffffff'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
            <strong> Расстояние:</strong> <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{lastResult.distance_km.toFixed(1)} км</span>
          </p>
          <p style={{ margin: '0', fontSize: '16px' }}>
            <strong> Получено очков:</strong> <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd700' }}>{lastResult.earned_points}</span>
          </p>
        </div>
      )}
      
      <button onClick={onFetchCity} style={{ marginTop: '15px' }} disabled={loading}>
        {loading ? 'Загрузка...' : 'Следующий город'}
      </button>
    </>
  );
};

export default GamePanel;
