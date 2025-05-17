import React, { useEffect } from 'react';
import './Game.css'; // Reusing the game styles

const GodotGame = () => {
  useEffect(() => {
    // Prevent scrolling while in the game
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="game-container" style={{ 
      minHeight: '100vh',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      position: 'absolute',
      top: 0,
      left: '120px',
      right: 0,
      bottom: 0,
      width: 'calc(100vw - 120px)',
      height: '100vh'
    }}>
      <div className="game-header" style={{ 
        padding: '5px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        margin: '5px',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }}>
        <h2>Godot Game</h2>
      </div>
      <div className="game-area" style={{ 
        padding: 0, 
        overflow: 'hidden',
        flex: 1,
        width: '100%',
        height: '100%',
        margin: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <iframe
          src="/games/godot-game/MyGameForMyApp/MyGame.html"
          title="Godot Game"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000',
            transform: 'scale(1)',
            transformOrigin: 'center center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </div>
    </div>
  );
};

export default GodotGame; 