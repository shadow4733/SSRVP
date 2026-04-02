import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ score, onProfileClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-content">
        <h2>🌍 PinTheMap</h2>
        <div className="header-right">
          <span className="score-display">Счёт: {score}</span>
          {user && (
            <>
              <div style={{ 
                color: '#ffffff', 
                marginLeft: '25px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                👤 {user.username}
              </div>
              <button 
                className="profile-btn"
                onClick={handleLogout}
                style={{
                  marginLeft: '15px',
                  background: 'rgba(244, 67, 54, 0.8)',
                  padding: '8px 16px'
                }}
              >
                 Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;