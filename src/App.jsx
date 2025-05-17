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
import Game from './pages/Game';
import Games from './pages/Games';
import GodotGame from './pages/GodotGame';
import GardenGame from './components/GardenGame/GardenGame';
import MyN from './components/GardenGame/myn';
import Vid from './components/Vid';
import TomatoGame from './components/TomatoGame/TomatoGame';
import './App.css';

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userId = localStorage.getItem('userId');
        
        if (isLoggedIn && userId) {
          try {
            const command = new GetCommand({
              TableName: "Users",
              Key: { id: userId }
            });
            const response = await docClient.send(command);
            if (response.Item) {
              setIsAuthenticated(true);
              setIsAdmin(response.Item.isAdmin || false);
              setIsBanned(response.Item.isBanned || false);
            } else {
              // Only clear auth if we confirm the user doesn't exist
              setIsAuthenticated(false);
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('userId');
            }
          } catch (err) {
            // If we can't reach DynamoDB, keep the user logged in
            console.error("Error checking user status:", err);
            setIsAuthenticated(true); // Keep them logged in
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []); // Remove the interval check since we don't need constant polling

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (isBanned) {
    return <Sad isBanned={true} />;
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
            <Route path="/admin-dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/home" />} />
            <Route path="/admin-orders" element={isAdmin ? <AdminOrders /> : <Navigate to="/home" />} />
            <Route path="/user-management" element={isAdmin ? <UserManagement /> : <Navigate to="/AAOMO" />} />
            <Route path="/games" element={isAdmin ? <Games /> : <Navigate to="/home" />} />
            <Route path="/target-game" element={isAdmin ? <Game /> : <Navigate to="/home" />} />
            <Route path="/godot-game" element={isAdmin ? <GodotGame /> : <Navigate to="/home" />} />
            <Route path="/garden-game" element={isAdmin ? <GardenGame /> : <Navigate to="/home" />} />
            <Route path="/cube-game" element={<MyN />} />
            <Route path="/videos" element={isAdmin ? <Vid /> : <Navigate to="/home" />} />
            <Route path="/tomato" element={<TomatoGame />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
