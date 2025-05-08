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
  const [selectedUserId, setSelectedUserId] = useState(null);

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

  const handleBanUser = async () => {
    if (!selectedUserId) return;
    try {
      const user = users.find(u => u.id === selectedUserId);
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
        await fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error banning user:", err);
      setError("Failed to ban user");
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUserId) return;
    try {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        const putCommand = new PutCommand({
          TableName: "Users",
          Item: {
            ...user,
            isBanned: false,
            bannedAt: undefined
          }
        });
        await docClient.send(putCommand);
        await fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error unbanning user:", err);
      setError("Failed to unban user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const deleteCommand = new DeleteCommand({
          TableName: "Users",
          Key: { id: selectedUserId }
        });
        await docClient.send(deleteCommand);
        setSelectedUserId(null);
        await fetchUsers(); // Refresh the list
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
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            style={{
              background: 'white',
              color: 'black',
              border: selectedUserId === user.id ? '3px solid #007bff' : '2px solid #eee',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'border 0.2s',
              position: 'relative',
              width: 'fit-content',
              maxWidth: '100%',
              wordBreak: 'break-word',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'black', marginBottom: '0.5rem' }}>{user.username}</div>
            <div style={{ fontSize: '0.95rem', color: 'black', marginBottom: '0.5rem' }}>
              Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
            {user.isBanned && (
              <div style={{ color: 'red', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Banned on: {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : 'Unknown'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {selectedUserId && users.find(u => u.id === selectedUserId)?.isBanned ? (
          <button
            onClick={handleUnbanUser}
            style={{
              padding: '0.7rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Unban
          </button>
        ) : (
          <button
            onClick={handleBanUser}
            disabled={!selectedUserId}
            style={{
              padding: '0.7rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedUserId ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1rem',
              opacity: selectedUserId ? 1 : 0.5
            }}
          >
            Ban
          </button>
        )}
        <button
          onClick={handleDeleteUser}
          disabled={!selectedUserId}
          style={{
            padding: '0.7rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedUserId ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '1rem',
            opacity: selectedUserId ? 1 : 0.5
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default UserManagement; 