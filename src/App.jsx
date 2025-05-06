import { Routes, Route, Navigate } from 'react-router-dom';
import SiteNavigaition from './components/SiteNavigationn/SiteNavigaition';
import Home from './pages/Home';
import PriceCalculator from './pages/PriceCalculator';
import NonAdminOrders from './pages/NonAdminOrders';
import Sad from './pages/Sad';
import AdminOrders from './pages/AdminOrders';
import Thanks from './pages/Thanks';

function App() {
  return (
    <>
      <SiteNavigaition />
      <div className="App">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Thanks" element={<Thanks />} />
            <Route path="/orders" element={<NonAdminOrders />} />
            <Route path="/price-calculator" element={<PriceCalculator />} />
            <Route path="/sad" element={<Sad />} />
            <Route path="/AAOMO" element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
