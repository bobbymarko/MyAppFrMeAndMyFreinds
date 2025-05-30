import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Game.css';

const Game = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [highScore, setHighScore] = useState(() => {
    return localStorage.getItem('gameHighScore') || 0;
  });
  const gameAreaRef = useRef(null);
  const timerRef = useRef(null);
  const frameRef = useRef(null);

  // Memoize the moveTarget function
  const moveTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const targetSize = 50;
    const maxX = Math.floor(gameArea.width - targetSize);
    const maxY = Math.floor(gameArea.height - targetSize);
    
    // Direct DOM manipulation for instant movement
    const targetElement = gameAreaRef.current.querySelector('.target');
    if (targetElement) {
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      targetElement.style.left = `${x}px`;
      targetElement.style.top = `${y}px`;
    }
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const startTime = Date.now();
      const initialTime = timeLeft;

      const updateTimer = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const newTime = initialTime - elapsedSeconds;
        
        if (newTime > 0) {
          setTimeLeft(newTime);
          timerRef.current = requestAnimationFrame(updateTimer);
        } else {
          setTimeLeft(0);
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('gameHighScore', score);
          }
        }
      };

      timerRef.current = requestAnimationFrame(updateTimer);

      return () => {
        if (timerRef.current) {
          cancelAnimationFrame(timerRef.current);
        }
      };
    }
  }, [isPlaying, score, highScore]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    moveTarget();
  };

  const handleClick = useCallback((e) => {
    if (!isPlaying || timeLeft === 0) return;
    
    const targetElement = e.target.closest('.target');
    if (targetElement) {
      // Synchronous score update
      setScore(s => s + 1);
      // Immediate target movement
      moveTarget();
    }
  }, [isPlaying, timeLeft, moveTarget]);

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
        <h2>Click the Target!</h2>
        <div className="game-stats">
          <p>Score: {score}</p>
          <p>Time: {timeLeft}s</p>
          <p>High Score: {highScore}</p>
        </div>
        {!isPlaying && (
          <p className="game-instructions">
            You have 30 seconds to get the highest score possible. 
            Click the red targets as fast as you can!
            If You press the button it will give you 1 second until continuing to count down
          </p>
        )}
      </div>
      
      <div 
        ref={gameAreaRef}
        className="game-area"
        style={{
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
        }}
      >
        {isPlaying && timeLeft > 0 && (
          <div 
            className="target"
            onClick={handleClick}
          />
        )}
        {timeLeft === 0 && (
          <div className="game-over">
            <h2>Time's Up!</h2>
            <p>Final Score: {score}</p>
            {score > highScore && (
              <p className="new-high-score">New High Score! 🎉</p>
            )}
          </div>
        )}
      </div>

      {!isPlaying && (
        <button 
          className="start-button"
          onClick={startGame}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2
          }}
        >
          {timeLeft === 30 ? 'Start Game' : 'Play Again'}
        </button>
      )}
    </div>
  );
};

export default Game; 