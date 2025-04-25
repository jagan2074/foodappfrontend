// src/App.js
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import AuthModal from './components/Auth/AuthModal';
import { useAuth } from './context/AuthContext';
import OrdersPage from './pages/OrdersPage';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  const openAuthModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };
  const openRestaurantSignup = () => {
    setAuthMode('restaurantSignup');
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading Application...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar
          onAuthClick={openAuthModal}
          onAddRestaurantClick={openRestaurantSignup}
          // Pass user prop down if Navbar needs to show Admin links differently
          // loggedInUser={user}
        />

        <main>
          <Routes>
            {/* --- MODIFIED HOME ROUTE --- */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.isAdmin === true ? (
                    // If logged in AND is admin, redirect to admin dashboard
                    <Navigate to="/admin/dashboard" replace />
                  ) : user?.role === 'restaurant' ? (
                    // If logged in AND is restaurant owner, redirect to restaurant dashboard
                    <Navigate to="/restaurant-dashboard" replace />
                  ) : (
                    // If logged in AND is customer, show home page
                    <HomePage />
                  )
                ) : (
                  // If not logged in, show home page
                  <HomePage />
                )
              }
            />
            {/* --- END MODIFIED HOME ROUTE --- */}


            {/* Restaurant Owner Dashboard */ }
            <Route
              path="/restaurant-dashboard"
              element={
                (isAuthenticated && user?.role === 'restaurant')
                  ? <RestaurantDashboard />
                  : <Navigate to="/" replace /> // Redirect others
              }
            />

            {/* Admin Dashboard Page */ }
            <Route
              path="/admin/dashboard"
              element={
                (isAuthenticated && user?.isAdmin === true)
                  ? <AdminPage />
                  : <Navigate to="/" replace /> // Redirect others
              }
            />

            {/* Restaurant Detail Page (Public) */ }
            <Route
              path="/restaurants/:restaurantId"
              element={<RestaurantDetailPage />}
            />

            {/* Cart Page (Public) */ }
            <Route
              path="/cart"
              element={<CartPage />}
            />

            <Route
              path="/my-orders"
              element={
                isAuthenticated
                  ? <OrdersPage />
                  : <Navigate to="/" replace /> // Redirect if not logged in
              }
            />

            {/* Add other routes: Customer Orders, Settings etc. */}

            {/* Optional: Catch-all route for 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}

          </Routes>
        </main>
        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      </div>
    </Router>
  );
}

export default App;