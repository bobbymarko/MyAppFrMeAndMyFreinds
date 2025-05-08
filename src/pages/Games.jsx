import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();

  const buttonStyle = {
    padding: '1.5rem 2rem',
    fontSize: '1.3rem',
    margin: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '300px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="games-container">
      <h1>Admin Games</h1>
      <div className="games-grid">
        <button
          onClick={() => navigate('/target-game')}
          style={{
            ...buttonStyle,
            backgroundColor: '#28a745',
            boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)'
          }}
        >
          Target Game
        </button>
        <button
          onClick={() => navigate('/godot-game')}
          style={{
            ...buttonStyle,
            backgroundColor: '#ff6b6b',
            boxShadow: '0 4px 6px rgba(255, 107, 107, 0.2)'
          }}
        >
          Godot Game
        </button>
      </div>
    </div>
  );
};

export default Games; 