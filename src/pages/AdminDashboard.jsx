import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const correctPassword = 'thisIsStaffHi1234Isco0L';
  const navigate = useNavigate();

  const buttonStyle = {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    margin: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '300px',
    transition: 'background-color 0.2s'
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setUnlocked(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        navigate('/sad');
      }
    }
  };

  if (!unlocked) {
    return (
      <form onSubmit={handlePasswordSubmit} style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Admin Dashboard Login</h2>
        <input
          type="password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
          placeholder="Enter admin password"
          style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem' }}
        />
        <br />
        <button type="submit" style={{ ...buttonStyle, width: 'auto', margin: 0 }}>Submit</button>
      </form>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => navigate('/price-calculator')}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Price Calculator
        </button>
        <button
          onClick={() => navigate('/admin-orders')}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Manage Orders
        </button>
        <button
          onClick={() => navigate('/user-management')}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          User Management
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard; 