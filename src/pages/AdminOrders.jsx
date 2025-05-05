import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState('spiralcone');
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('small');
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const correctPassword = 'hisIsStaffHi1234Isco0L';

  // ✅ Load orders only once, on first mount
  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  // ✅ Save orders whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== '') {
      const newOrder = `${name.trim()} ordered ${quantity} ${size} ${item}${quantity > 1 ? 's' : ''} #ADMIN`;
      setOrders((prevOrders) => [...prevOrders, newOrder]);
      setName('');
    }
  };

  const handleDelete = (index) => {
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
  };

  return (
    <>
      {!unlocked ? (
        <form className="tip-calculator" onSubmit={handlePasswordSubmit}>
          <div className="section">
            <div className="form-group">
              <label>Enter Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
              />
              <button type="submit" style={{ color: 'black' }}>Submit</button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Admin Orders</h1>

          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <select value={item} onChange={(e) => setItem(e.target.value)} style={{ marginRight: '0.5rem' }}>
              <option value="spiralcone">spiralcone</option>
            </select>

            <select value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginRight: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select value={size} onChange={(e) => setSize(e.target.value)} style={{ marginRight: '0.5rem' }}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{ padding: '0.5rem', fontSize: '1rem', width: '30%' }}
            />

            <button
              type="submit"
              style={{
                marginLeft: '0.5rem',
                color: 'black',
                backgroundColor: '#f0f0f0',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </form>

          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} style={{
                margin: '0.5rem 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <div style={{
                  background: 'black',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  marginRight: '1rem',
                }}>
                  {order.includes('#ADMIN') ? (
                    <>
                      {order.replace('#ADMIN', '')}
                      <span style={{ color: 'red' }}> #ADMIN</span>
                    </>
                  ) : order}
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    backgroundColor: 'red',
                    color: 'black',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default AdminOrders;
