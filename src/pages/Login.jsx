import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function Login() {
  const [name, setName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const command = new GetCommand({
          TableName: "Users",
          Key: { id: "current-user" }
        });
        const response = await docClient.send(command);
        if (response.Item && response.Item.username) {
          // User already logged in, redirect to home
          navigate('/home');
        }
      } catch (err) {
        console.error("Error checking user:", err);
      } finally {
        setLoading(false);
      }
    };
    checkExistingUser();
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async (isConfirmed) => {
    if (isConfirmed) {
      try {
        // Save username to DynamoDB
        const putCommand = new PutCommand({
          TableName: "Users",
          Item: {
            id: "current-user",
            username: name.trim(),
            createdAt: new Date().toISOString()
          }
        });
        await docClient.send(putCommand);
        navigate('/home');
      } catch (err) {
        console.error("Error saving username:", err);
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