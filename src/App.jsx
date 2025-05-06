import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SiteNavigaition from './components/SiteNavigationn/SiteNavigaition';
import Home from './pages/Home';
import PriceCalculator from './pages/PriceCalculator';
import NonAdminOrders from './pages/NonAdminOrders';
import Sad from './pages/Sad';
import AdminOrders from './pages/AdminOrders';
import Thanks from './pages/Thanks';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { awsConfig } from './aws-config';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const command = new GetCommand({
          TableName: "Users",
          Key: { id: "current-user" }
        });
        const response = await docClient.send(command);
        if (response.Item) {
          setIsAuthenticated(true);
          // Check if user is admin (you can add this field to your Users table)
          setIsAdmin(response.Item.isAdmin || false);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <SiteNavigaition />
      <div className="App">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Thanks" element={<Thanks />} />
            <Route path="/orders" element={<NonAdminOrders />} />
            <Route path="/price-calculator" element={isAdmin ? <PriceCalculator /> : <Navigate to="/home" />} />
            <Route path="/sad" element={<Sad />} />
            <Route path="/AAOMO" element={isAdmin ? <AdminDashboard /> : <Navigate to="/home" />} />
            <Route path="/admin-orders" element={isAdmin ? <AdminOrders /> : <Navigate to="/home" />} />
            <Route path="/user-management" element={isAdmin ? <UserManagement /> : <Navigate to="/home" />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
