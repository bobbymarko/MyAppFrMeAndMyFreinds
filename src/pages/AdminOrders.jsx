import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

// Initialize DynamoDB client
const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function getUserId() {
  return localStorage.getItem('userId');
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState('spiralcone');
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('small');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch username on mount
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

  // Load orders from DynamoDB on mount
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== '') {
      const newOrder = `${username} ordered ${quantity} ${size} ${item}${quantity > 1 ? 's' : ''} #ADMIN`;
      setOrders((prevOrders) => [...prevOrders, newOrder]);
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
        
        // Save to DynamoDB first
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
        
        // Only update local state after successful save
        setOrders(latestOrders);
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

  // Save orders to DynamoDB only when new orders are added
  useEffect(() => {
    const saveOrders = async () => {
      // Skip if orders array is empty (initial load)
      if (orders.length === 0) return;
      
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
        
        // Only save if we have new orders
        if (orders.length > latestOrders.length) {
          const putCommand = new PutCommand({
            TableName: "Orders",
            Item: {
              id: key,
              orders: orders,
              updatedAt: new Date().toISOString()
            }
          });
          await docClient.send(putCommand);
          console.log('[AdminOrders] Orders saved successfully with key:', key, orders);
        }
      } catch (err) {
        console.error("[AdminOrders] Error saving orders:", err);
      }
    };
    saveOrders();
  }, [orders]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
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
  );
}

export default AdminOrders;
