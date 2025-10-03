import React, { useEffect, useState } from 'react';
import './Game.css'; // Reusing the game styles

const RobloxGame = () => {
  const [selectedGame, setSelectedGame] = useState('tycoon');
  const [customGameId, setCustomGameId] = useState('127742093697776');
  const [isLoading, setIsLoading] = useState(false);
  const [localGames, setLocalGames] = useState([]);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // Your local Roblox games
  const localGameFiles = [
    { id: 'tycoon', name: '🏭 tycoon.rbxl', filename: 'tycoon.rbxl' },
    { id: 'server', name: '🎮 server.rbxl', filename: 'server.rbxl' },
    { id: 'Place_AutoRecovery_0', name: '🔄 Place_AutoRecovery_0.rbxl', filename: 'Place_AutoRecovery_0.rbxl' },
    { id: 'VRFTUX', name: '🎮 VRFTUX.rbxl', filename: 'VRFTUX.rbxl' },
    { id: 'UserSafetyTest', name: '🛡️ UserSafetyTest.rbxl', filename: 'UserSafetyTest.rbxl' },
    { id: 'RhodiumUnitTest', name: '🧪 RhodiumUnitTest.rbxl', filename: 'RhodiumUnitTest.rbxl' },
    { id: 'MobileChatPlace', name: '📱 MobileChatPlace.rbxl', filename: 'MobileChatPlace.rbxl' },
    { id: 'Mobile', name: '📱 Mobile.rbxl', filename: 'Mobile.rbxl' },
    { id: 'Maquettes', name: '🎨 Maquettes.rbxl', filename: 'Maquettes.rbxl' }
  ];

  // Online games
  const onlineGames = [
    { id: 'pvz', name: '🌱 Plants vs Brainrots (Online)', placeId: '127742093697776', isLocal: false },
    { id: 'adoptme', name: '🌐 Adopt Me (Online)', placeId: '920587237', isLocal: false },
    { id: 'murder', name: '🌐 Murder Mystery 2 (Online)', placeId: '142823291', isLocal: false },
    { id: 'custom', name: '🌐 Custom Online Game', placeId: '', isLocal: false }
  ];

  // Combine all games
  const gameOptions = [
    ...localGameFiles.map(game => ({ ...game, isLocal: true, placeId: game.id })),
    ...onlineGames
  ];

  useEffect(() => {
    // Prevent scrolling while in the game
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getCurrentGameId = () => {
    if (selectedGame === 'custom' || selectedGame === 'pvz') {
      return customGameId || (selectedGame === 'pvz' ? '1234567890' : '1');
    }
    const game = gameOptions.find(g => g.id === selectedGame);
    return game ? game.placeId : '1';
  };

  const getCurrentGame = () => {
    if (selectedGame === 'custom' || selectedGame === 'pvz') {
      return { placeId: customGameId || (selectedGame === 'pvz' ? '1234567890' : '1'), isLocal: false };
    }
    const game = gameOptions.find(g => g.id === selectedGame);
    return game || { placeId: '1', isLocal: false };
  };

  const getGameEmbedUrl = (placeId, isLocal = false) => {
    if (isLocal) {
      // For local games, use the template that shows all games
      return `/games/template/index.html`;
    }
    // Use Roblox's embed URL to keep you on your website
    return `https://www.roblox.com/games/embed/${placeId}?autostart=true&autoplay=true`;
  };

  const getGamePageUrl = (placeId) => {
    return `https://www.roblox.com/games/${placeId}`;
  };

  const getRobloxDeepLink = (placeId) => {
    return `roblox://placeId=${placeId}`;
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
        <h2 style={{ margin: 0, color: '#fff' }}>🎮 All Your Roblox Games</h2>
        <p style={{ margin: 0, color: '#00ff00', fontSize: '12px' }}>
          ✅ All your .rbxl files + online games - play everything on your website!
        </p>
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
          
          {(selectedGame === 'custom' || selectedGame === 'pvz') && (
            <input
              type="text"
              placeholder={selectedGame === 'pvz' ? "Enter Plants vs Brainrots ID" : "Enter Place ID"}
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
            onClick={() => {
              setIsLoading(true);
              setShowEmbed(true);
              setEmbedError(false);
            }}
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

          <a
            href={getRobloxDeepLink(getCurrentGameId())}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#16a34a',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Play in Roblox
          </a>

          <a
            href={getGamePageUrl(getCurrentGameId())}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#374151',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Open on Roblox.com
          </a>
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
        ) : !showEmbed ? (
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
            padding: '40px'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#00a2ff', marginBottom: '20px' }}>🎮 Ready to Play!</h2>
              <p style={{ color: '#ccc', fontSize: '18px', marginBottom: '30px' }}>
                Select a game above and click "Load Game" to start playing, or use the buttons to launch directly in Roblox!
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setShowEmbed(true);
                    setEmbedError(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#00a2ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  🎮 Load Game Preview
                </button>
                <a
                  href={getRobloxDeepLink(getCurrentGameId())}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🚀 Play in Roblox
                </a>
              </div>
            </div>
          </div>
        ) : embedError ? (
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
            padding: '40px'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Embed Not Available</h2>
              <p style={{ color: '#ccc', fontSize: '18px', marginBottom: '30px' }}>
                This game can't be embedded, but you can still play it directly in Roblox!
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getRobloxDeepLink(getCurrentGameId())}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🚀 Play in Roblox
                </a>
                <a
                  href={getGamePageUrl(getCurrentGameId())}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#374151',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🌐 Open on Roblox.com
                </a>
                <button
                  onClick={() => {
                    setShowEmbed(false);
                    setEmbedError(false);
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Game Selection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={getGameEmbedUrl(getCurrentGameId(), getCurrentGame().isLocal)}
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
            onLoad={() => {
              setIsLoading(false);
              // Check if the iframe loaded an error page
              setTimeout(() => {
                try {
                  const iframe = document.querySelector('iframe');
                  if (iframe && iframe.contentDocument) {
                    const body = iframe.contentDocument.body;
                    if (body && (body.textContent.includes('Code:') || body.textContent.includes('ID:'))) {
                      setEmbedError(true);
                    }
                  }
                } catch (e) {
                  // Cross-origin error, assume it's working
                }
              }, 2000);
            }}
            onError={() => {
              setIsLoading(false);
              setEmbedError(true);
              console.error('Failed to load Roblox game');
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen; microphone; camera"
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
