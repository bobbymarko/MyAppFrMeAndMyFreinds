function Thanks() {
    return (
      <>
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
        }} />
        <div style={{ 
          padding: '2rem', 
          minHeight: '100vh', 
          color: '#222',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginTop: '-5vh',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', textShadow: '2px 2px 8px #ff4e50' }}>
            🎉 Thank You! 🎉
          </h1>
          <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: '#fff', textShadow: '1px 1px 6px #f9d423' }}>
            We couldn't have done it without you!
          </p>
          <p style={{ fontSize: '1.1rem', background: 'rgba(255,255,255,0.8)', display: 'inline-block', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            Eilish, Jack, Avi, Bob, Sophia, and all other amazing employees and volunteers 💖
          </p>
          <div style={{ marginTop: '2rem', fontSize: '2rem', textAlign: 'center' }}>
            🥳👏🌟
          </div>
        </div>
      </>
    );
  }

  export default Thanks