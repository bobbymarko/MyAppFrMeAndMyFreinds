import React, { useEffect, useState } from 'react';
import './Game.css'; // Reusing the game styles

const RobloxGame = () => {
  const [gameUrl, setGameUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Prevent scrolling while in the game
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const launchRoblox = (placeId = '1') => {
    setIsLoading(true);
    try {
      // Try to launch Roblox using the roblox-player protocol
      window.location.href = `roblox-player:${placeId}`;
      
      // Fallback: try to open in browser
      setTimeout(() => {
        window.open(`https://www.roblox.com/games/${placeId}`, '_blank');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error launching Roblox:', error);
      setIsLoading(false);
    }
  };

  const handleCustomLaunch = () => {
    if (gameUrl.trim()) {
      // Extract place ID from URL if it's a full Roblox URL
      const placeIdMatch = gameUrl.match(/\/games\/(\d+)/);
      const placeId = placeIdMatch ? placeIdMatch[1] : gameUrl;
      launchRoblox(placeId);
    } else {
      launchRoblox();
    }
  };

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
        <h2>Roblox Game</h2>
        <p style={{ color: '#ccc', fontSize: '14px', margin: '5px 0' }}>
          {isLoading ? 'Launching Roblox...' : 'Choose a game to play'}
        </p>
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
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ marginBottom: '30px', maxWidth: '600px' }}>
            <h3>🎮 Roblox Game Launcher</h3>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>
              Launch your favorite Roblox games directly from here!
            </p>
          </div>

          <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Enter Roblox game URL or Place ID (optional)"
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #555',
                borderRadius: '6px',
                backgroundColor: '#333',
                color: '#fff',
                marginBottom: '15px'
              }}
            />
            <button
              onClick={handleCustomLaunch}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                backgroundColor: isLoading ? '#666' : '#00a2ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
              onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#0088cc')}
              onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#00a2ff')}
            >
              {isLoading ? 'Launching...' : 'Launch Game'}
            </button>
          </div>

          <div style={{ fontSize: '14px', color: '#ccc', maxWidth: '600px' }}>
            <p><strong>Quick Launch Options:</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', margin: '15px 0' }}>
              <button
                onClick={() => launchRoblox('1')}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Default Game
              </button>
              <button
                onClick={() => launchRoblox('920587237')}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Adopt Me
              </button>
              <button
                onClick={() => launchRoblox('142823291')}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Murder Mystery 2
              </button>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <p><strong>If Roblox doesn't launch automatically:</strong></p>
              <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                <li>Make sure Roblox is installed on your computer</li>
                <li>Try opening Roblox directly from your desktop or start menu</li>
                <li>Check if your browser allows protocol handlers</li>
                <li>Copy the game URL and paste it in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobloxGame;
