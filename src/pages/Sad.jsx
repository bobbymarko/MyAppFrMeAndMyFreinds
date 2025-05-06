import { useEffect, useState } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function Sad({ isBanned }) {
  const [deleted, setDeleted] = useState(false);
  useEffect(() => {
    if (isBanned) return; // Don't run sadCount logic for bans
    const sadCount = parseInt(localStorage.getItem('sadCount') || '0', 10) + 1;
    localStorage.setItem('sadCount', sadCount);
    if (sadCount >= 5) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const deleteUser = async () => {
          try {
            await docClient.send(new DeleteCommand({
              TableName: 'Users',
              Key: { id: userId }
            }));
          } catch (err) {
            // ignore error
          } finally {
            localStorage.clear();
            setDeleted(true);
          }
        };
        deleteUser();
      } else {
        setDeleted(true);
        localStorage.clear();
      }
    }
  }, [isBanned]);

  return (
    <div style={{ textAlign: 'center', marginTop: isBanned ? 0 : '100px', minHeight: '100vh', background: isBanned ? 'linear-gradient(135deg, #2c0101 0%, #7b0000 100%)' : 'none', color: isBanned ? '#fff' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isBanned ? 'center' : undefined }}>
      <h1 style={isBanned ? { fontSize: '3rem', color: '#ff2222', textShadow: '2px 2px 12px #000' } : {}}>
        {isBanned ? '⛔ BANNED ⛔' : '😢 Sad'}
      </h1>
      {isBanned ? (
        <div style={{ maxWidth: 400, margin: '2rem auto', background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '2rem', boxShadow: '0 0 30px #000', border: '2px solid #ff2222' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#ff2222', marginBottom: '1rem' }}>
            You have been banned by an admin.<br />
            <span style={{ color: '#fff', fontWeight: 'normal' }}>
              Your access to this app is <span style={{ textDecoration: 'underline', color: '#ff2222' }}>completely revoked</span>.<br />
              Only an admin can restore your access.<br /><br />
              <span style={{ fontSize: '2rem', color: '#fff' }}>🔒</span>
            </span>
          </p>
        </div>
      ) : deleted ? (
        <p>Your account has been deleted due to too many failed attempts.</p>
      ) : (
        <p>You've entered the wrong password too many times.<br/>({localStorage.getItem('sadCount') || 1}/5)</p>
      )}
    </div>
  );
}

export default Sad;
  