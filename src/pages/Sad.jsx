import { useEffect, useState } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from '../aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function Sad() {
  const [deleted, setDeleted] = useState(false);
  useEffect(() => {
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
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>😢 Sad</h1>
      {deleted ? (
        <p>Your account has been deleted due to too many failed attempts.</p>
      ) : (
        <p>You've entered the wrong password too many times.<br/>({localStorage.getItem('sadCount') || 1}/5)</p>
      )}
    </div>
  );
}

export default Sad;
  