import { useState, useEffect } from 'react';

function NonAdminOrders() {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [item, setItem] = useState('spiralcone');
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('small');
  const [name, setName] = useState('');

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== '') {
      const formattedOrder = `${name.trim()} ordered ${quantity} ${size} ${item}${quantity > 1 ? 's' : ''}`;
      setOrders([...orders, formattedOrder]);
      setName('');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Orders</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <select value={item} onChange={(e) => setItem(e.target.value)} style={{ marginRight: '0.5rem' }}>
          <option value="spiralcone">spiralcone</option>
        </select>

        <select value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginRight: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
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
          <div key={index} style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'black', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              {order.includes('#ADMIN') ? (
                <>
                  {order.replace('#ADMIN', '')}
                  <span style={{ color: 'red' }}> #ADMIN</span>
                </>
              ) : (
                order
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NonAdminOrders;
