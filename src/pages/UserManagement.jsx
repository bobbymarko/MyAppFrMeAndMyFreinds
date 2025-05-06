import { useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const command = new ScanCommand({
        TableName: "Users"
      });
      const response = await docClient.send(command);
      setUsers(response.Items || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        const putCommand = new PutCommand({
          TableName: "Users",
          Item: {
            ...user,
            isBanned: true,
            bannedAt: new Date().toISOString()
          }
        });
        await docClient.send(putCommand);
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error banning user:", err);
      setError("Failed to ban user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const deleteCommand = new DeleteCommand({
          TableName: "Users",
          Key: { id: userId }
        });
        await docClient.send(deleteCommand);
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>User Management</h1>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
      )}
      <div style={{ 
        display: 'grid', 
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {users.map(user => (
          <div key={user.id} style={{
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: user.isBanned ? '#ffebee' : 'white'
          }}>
            <h3>{user.username}</h3>
            <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
            {user.isBanned && (
              <p style={{ color: 'red' }}>Banned on: {new Date(user.bannedAt).toLocaleDateString()}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {!user.isBanned && (
                <button
                  onClick={() => handleBanUser(user.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ban User
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(user.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement; 