import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/game-setup');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="auth-title" style={{ fontSize: '48px', marginBottom: '20px' }}>
          🌍 Угадай Город
        </h1>
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: '18px', 
          lineHeight: '1.6',
          marginBottom: '30px' 
        }}>
          Проверьте свои знания географии! Угадывайте местоположение городов на карте и зарабатывайте очки.
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          marginTop: '40px' 
        }}>
          <button 
            className="auth-button"
            onClick={() => navigate('/login')}
            style={{ fontSize: '20px' }}
          >
             Войти
          </button>
          
          <button 
            className="auth-button"
            onClick={() => navigate('/register')}
            style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              fontSize: '20px'
            }}
          >
             Регистрация
          </button>
        </div>

        <div style={{ marginTop: '30px', color: '#b8c5d6', fontSize: '14px' }}>
          <p> Зарабатывайте очки за точность</p>
          <p> Используйте подсказки</p>
          <p> Соревнуйтесь с друзьями</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
