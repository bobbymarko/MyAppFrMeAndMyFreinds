import React, { useEffect, useState } from 'react';
import './Game.css'; // Reusing the game styles

const RobloxGame = () => {
  const [selectedGame, setSelectedGame] = useState('default');
  const [customGameId, setCustomGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Predefined games you can choose from
  const gameOptions = [
    { id: 'default', name: 'Default Roblox Game', placeId: '1' },
    { id: 'adoptme', name: 'Adopt Me', placeId: '920587237' },
    { id: 'murder', name: 'Murder Mystery 2', placeId: '142823291' },
    { id: 'custom', name: 'Custom Game', placeId: '' }
  ];

  useEffect(() => {
    // Prevent scrolling while in the game
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getCurrentGameId = () => {
    if (selectedGame === 'custom') {
      return customGameId || '1';
    }
    const game = gameOptions.find(g => g.id === selectedGame);
    return game ? game.placeId : '1';
  };

  const getGameEmbedUrl = (placeId) => {
    return `https://www.roblox.com/games/embed/${placeId}?autostart=true&autoplay=true`;
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
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        margin: '5px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: 0, color: '#fff' }}>🎮 Roblox Games</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #555',
              borderRadius: '6px',
              backgroundColor: '#333',
              color: '#fff',
              minWidth: '150px'
            }}
          >
            {gameOptions.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          
          {selectedGame === 'custom' && (
            <input
              type="text"
              placeholder="Enter Place ID"
              value={customGameId}
              onChange={(e) => setCustomGameId(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #555',
                borderRadius: '6px',
                backgroundColor: '#333',
                color: '#fff',
                minWidth: '120px'
              }}
            />
          )}
          
          <button
            onClick={() => setIsLoading(true)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#00a2ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0088cc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#00a2ff'}
          >
            Load Game
          </button>
        </div>
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
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0
      }}>
        {isLoading ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #333',
                borderTop: '5px solid #00a2ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <h3>Loading Roblox Game...</h3>
              <p style={{ color: '#ccc' }}>Please wait while the game loads</p>
            </div>
          </div>
        ) : (
          <iframe
            src={getGameEmbedUrl(getCurrentGameId())}
            title="Roblox Game"
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
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              console.error('Failed to load Roblox game');
            }}
          />
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RobloxGame;
