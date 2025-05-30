import { useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function getUserId() {
  return localStorage.getItem('userId');
}

function NonAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState('spiralcone');
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('small');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      const userId = getUserId();
      if (!userId) return;
      try {
        const command = new GetCommand({
          TableName: "Users",
          Key: { id: userId }
        });
        const response = await docClient.send(command);
        if (response.Item && response.Item.username) {
          setUsername(response.Item.username);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const command = new GetCommand({
          TableName: "Orders",
          Key: { id: "shared-orders" }
        });
        const response = await docClient.send(command);
        if (response.Item && response.Item.orders) {
          setOrders(response.Item.orders);
        }
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const saveOrders = async () => {
      try {
        const key = "shared-orders";
        const getCommand = new GetCommand({
          TableName: "Orders",
          Key: { id: key }
        });
        const latestResponse = await docClient.send(getCommand);
        let latestOrders = (latestResponse.Item && latestResponse.Item.orders) ? latestResponse.Item.orders : [];
        let mergedOrders = orders;
        if (orders.length > latestOrders.length) {
          mergedOrders = [...latestOrders, ...orders.slice(latestOrders.length)];
        } else if (orders.length < latestOrders.length) {
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
        setOrders(mergedOrders);
      } catch (err) {
        setError("Failed to save orders");
      }
    };
    saveOrders();
  }, [orders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== '') {
      const formattedOrder = `${username} ordered ${quantity} ${size} ${item}${quantity > 1 ? 's' : ''}`;
      setOrders([...orders, formattedOrder]);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  }
  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Orders</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <label htmlFor="nonadmin-item" style={{ display: 'none' }}>Item</label>
        <select id="nonadmin-item" name="nonadmin-item" value={item} onChange={(e) => setItem(e.target.value)} style={{ marginRight: '0.5rem' }}>
          <option value="spiralcone">spiralcone</option>
          <option value="bob's the best">bob's the best</option>
        </select>

        <label htmlFor="nonadmin-quantity" style={{ display: 'none' }}>Quantity</label>
        <select id="nonadmin-quantity" name="nonadmin-quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginRight: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <label htmlFor="nonadmin-size" style={{ display: 'none' }}>Size</label>
        <select id="nonadmin-size" name="nonadmin-size" value={size} onChange={(e) => setSize(e.target.value)} style={{ marginRight: '0.5rem' }}>
          <option value="small">small</option>
          <option value="medium">medium</option>
          <option value="large">large</option>
        </select>
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
