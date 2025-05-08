import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function getOrCreateUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

function Login() {
  const [name, setName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = getOrCreateUserId();

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const command = new GetCommand({
          TableName: "Users",
          Key: { id: userId }
        });
        const response = await docClient.send(command);
        if (response.Item && response.Item.username) {
          if (response.Item.isBanned) {
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/sad');
            return;
          }
          localStorage.setItem('isLoggedIn', 'true');
          if (window.location.pathname !== '/') {
            navigate('/');
          }
        }
      } catch (err) {
        console.error("Error checking user:", err);
      } finally {
        setLoading(false);
      }
    };
    checkExistingUser();
  }, [navigate, userId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async (isConfirmed) => {
    if (isConfirmed) {
      try {
        let rawName = name.trim();
        let isAdmin = false;
        if (rawName.endsWith('/IAmAdmin/')) {
          isAdmin = true;
          rawName = rawName.replace(/\/IAmAdmin\/$/, '');
        }

        // First check if user already exists to preserve their banned status
        const getCommand = new GetCommand({
          TableName: "Users",
          Key: { id: userId }
        });
        const existingUser = await docClient.send(getCommand);
        const isBanned = existingUser.Item?.isBanned || false;

        // Save username to DynamoDB
        const putCommand = new PutCommand({
          TableName: "Users",
          Item: {
            id: userId,
            username: rawName,
            createdAt: new Date().toISOString(),
            isAdmin: isAdmin,
            isLoggedIn: true,
            isBanned: isBanned,
            bannedAt: existingUser.Item?.bannedAt
          }
        });
        await docClient.send(putCommand);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.reload();
        navigate('/');
      } catch (err) {
        console.error("Error saving username:", err);
        setError("Failed to save user data. Please try again.");
      }
    } else {
      setName('');
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
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
      {!showConfirm ? (
        <form onSubmit={handleSubmit} style={{ width: '300px' }}>
          <h1>Welcome!</h1>
          <p>Please enter your name to continue</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              width: '100%',
              marginBottom: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Submit
          </button>
        </form>
      ) : (
        <div style={{ width: '300px' }}>
          <h2>Is this your name?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{name}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleConfirm(true)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              This Is My Name
            </button>
            <button
              onClick={() => handleConfirm(false)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              This Is Not My Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login; 