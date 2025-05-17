import React from 'react';
import { Link } from 'react-router-dom';
import './Games.css';

const Games = () => {
  return (
    <div className="games-page">
      <h1>Games</h1>
      <div className="games-grid">
        <Link to="/target-game" className="game-card">
          <h2>Target Game</h2>
          <p>Test your aim and precision</p>
        </Link>
        <Link to="/godot-game" className="game-card">
          <h2>Godot Game</h2>
          <p>Explore the Godot engine</p>
        </Link>
        <Link to="/garden-game" className="game-card">
          <h2>Garden Game</h2>
          <p>Grow and harvest plants in 3D</p>
        </Link>
        <Link to="/cube-game" className="game-card">
          <h2>Cube Game</h2>
          <p>Interactive 3D cube experience</p>
        </Link>
      </div>
    </div>
  );
};

export default Games; 