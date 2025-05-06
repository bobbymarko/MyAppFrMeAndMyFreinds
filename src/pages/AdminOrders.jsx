import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

// Initialize DynamoDB client
const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function AdminOrders() {
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState('spiralcone');
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('small');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const correctPassword = 'thisIsStaffHi1234Isco0L';

  // Load orders from DynamoDB on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Attempting to fetch orders from DynamoDB...');
        const command = new GetCommand({
          TableName: "Orders",
          Key: { id: "shared-orders" }
        });
        const response = await docClient.send(command);
        console.log('DynamoDB response:', response);
        if (response.Item && response.Item.orders) {
          console.log('Orders loaded successfully:', response.Item.orders);
          setOrders(response.Item.orders);
        } else {
          console.log('No existing orders found');
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Save orders to DynamoDB whenever they change
  useEffect(() => {
    const saveOrders = async () => {
      try {
        const key = "shared-orders";
        console.log('[AdminOrders] Saving orders to DynamoDB with key:', key, orders);
        // Fetch latest orders
        const getCommand = new GetCommand({
          TableName: "Orders",
          Key: { id: key }
        });
        const latestResponse = await docClient.send(getCommand);
        let latestOrders = (latestResponse.Item && latestResponse.Item.orders) ? latestResponse.Item.orders : [];
        // Merge local changes (add only new orders)
        let mergedOrders = orders;
        if (orders.length > latestOrders.length) {
          // Add new orders to the latest list
          mergedOrders = [...latestOrders, ...orders.slice(latestOrders.length)];
        } else if (orders.length < latestOrders.length) {
          // If local is behind, use latest
          mergedOrders = latestOrders;
        }
        const putCommand = new PutCommand({
          TableName: "Orders",
          Item: {
            id: key,
            orders: mergedOrders,
            updatedAt: new Date().toISOString()
          }
        });
        await docClient.send(putCommand);
        console.log('[AdminOrders] Orders saved successfully with key:', key, mergedOrders);
        setOrders(mergedOrders); // Ensure local state is in sync
      } catch (err) {
        console.error("[AdminOrders] Error saving orders:", err);
      }
    };
    saveOrders();
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

  const handleDelete = async (index) => {
    try {
      // First fetch the latest orders from DynamoDB
      const key = "shared-orders";
      const getCommand = new GetCommand({
        TableName: "Orders",
        Key: { id: key }
      });
      const latestResponse = await docClient.send(getCommand);
      let latestOrders = (latestResponse.Item && latestResponse.Item.orders) ? latestResponse.Item.orders : [];
      
      // Remove the order at the specified index
      if (index < latestOrders.length) {
        latestOrders.splice(index, 1);
        
        // Update local state
        setOrders(latestOrders);
        
        // Save to DynamoDB
        const putCommand = new PutCommand({
          TableName: "Orders",
          Item: {
            id: key,
            orders: latestOrders,
            updatedAt: new Date().toISOString()
          }
        });
        await docClient.send(putCommand);
        console.log('[AdminOrders] Order deleted and saved successfully');
      } else {
        console.error('[AdminOrders] Index out of bounds for deletion');
      }
    } catch (err) {
      console.error("[AdminOrders] Error deleting order:", err);
      // Refresh orders from DynamoDB to ensure consistency
      const getCommand = new GetCommand({
        TableName: "Orders",
        Key: { id: "shared-orders" }
      });
      const response = await docClient.send(getCommand);
      if (response.Item && response.Item.orders) {
        setOrders(response.Item.orders);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <>
      {!unlocked ? (
        <form className="tip-calculator" onSubmit={handlePasswordSubmit}>
          <div className="section">
            <div className="form-group">
              <label htmlFor="admin-password">Enter Password</label>
              <input
                id="admin-password"
                name="admin-password"
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
            <label htmlFor="admin-item" style={{ display: 'none' }}>Item</label>
            <select id="admin-item" name="admin-item" value={item} onChange={(e) => setItem(e.target.value)} style={{ marginRight: '0.5rem' }}>
              <option value="spiralcone">spiralcone</option>
              <option value="bob's the best">bob's the best</option>
            </select>

            <label htmlFor="admin-quantity" style={{ display: 'none' }}>Quantity</label>
            <select id="admin-quantity" name="admin-quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginRight: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <label htmlFor="admin-size" style={{ display: 'none' }}>Size</label>
            <select id="admin-size" name="admin-size" value={size} onChange={(e) => setSize(e.target.value)} style={{ marginRight: '0.5rem' }}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>

            <label htmlFor="admin-name" style={{ display: 'none' }}>Name</label>
            <input
              id="admin-name"
              name="admin-name"
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
