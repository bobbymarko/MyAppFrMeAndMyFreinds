import React from 'react';

function Vid() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)', borderRadius: 16, boxShadow: '0 4px 32px #0002', padding: 24
      }}>
        <iframe
          width="768"
          height="432"
          src="https://www.youtube.com/embed/7F0JWhHRa8s"
          title="Longest English Word Pronounced"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ borderRadius: 12 }}
        />
      </div>
    </div>
  );
}

export default Vid; 