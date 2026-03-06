import React from 'react';

const Header = ({ score, onProfileClick }) => {
  return (
    <div className="header">
      <div className="header-content">
        <h2>PinTheMap</h2>
        <div className="header-right">
          <span className="score-display">Счёт: {score}</span>
          <button className="profile-btn" onClick={onProfileClick}>
            Профиль
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;