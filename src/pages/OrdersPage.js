// src/pages/OrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // To check login status
import { getMyOrders } from '../services/orderService'; // To fetch orders
import { Link } from 'react-router-dom';
import './OrdersPage.css'; // Create this CSS file next

const OrdersPage = () => {
  const { user, isAuthLoading, isAuthenticated } = useAuth(); // Get auth status
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch user's orders
  const fetchOrders = useCallback(async () => {
    // Only fetch if authenticated and not loading auth state
    if (!isAuthenticated || isAuthLoading) {
        // If still loading auth, wait. If not authenticated, do nothing.
        if (!isAuthLoading) console.log("OrdersPage: User not authenticated, cannot fetch orders.");
        setOrders([]); // Ensure orders are empty if not authenticated
        return;
    }

    setIsLoading(true);
    setError(null);
    console.log("OrdersPage: Fetching user orders...");
    try {
      const data = await getMyOrders();
      setOrders(data || []);
      console.log(`OrdersPage: Found ${data?.length || 0} orders.`);
    } catch (err) {
      console.error("OrdersPage: Error fetching orders:", err);
      setError(err.message || 'Failed to load order history.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]); // Depend on auth status

  // Fetch orders on initial load or when auth status changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // --- Render Logic ---

  // Show loading state for authentication first
  if (isAuthLoading) {
    return <div className="loading-fullpage">Loading User Data...</div>;
  }

  // Prompt login if not authenticated
  if (!isAuthenticated) {
      return (
          <div className="orders-page-logged-out">
              <h2>My Orders</h2>
              <p>Please <Link to="/">log in</Link> to view your order history.</p>
              {/* Or trigger login modal */}
          </div>
      );
  }

  // Main content for logged-in users
  return (
    <div className="orders-page">
      <h1>My Order History</h1>

      {isLoading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <ul className="order-list">
          {orders.map(order => (
            <li key={order._id} className="order-list-item">
              <div className="order-header">
                 <span className="order-date">
                    Order Placed: {new Date(order.createdAt).toLocaleDateString()}
                 </span>
                 <span className={`order-status status-${order.orderStatus.toLowerCase().replace(/ /g, '-')}`}>
                    Status: {order.orderStatus}
                 </span>
                 <span className="order-id">
                    Order ID: #{order._id.substring(order._id.length - 6)} {/* Short ID */}
                 </span>
              </div>
              <div className="order-details">
                 <div className="order-restaurant-info">
                    {/* Display restaurant image and name */ }
                    {order.restaurant?.imageUrl && (
                        <img src={order.restaurant.imageUrl} alt={order.restaurant.name || 'Restaurant'}/>
                    )}
                    <span>{order.restaurant?.name || 'Restaurant N/A'}</span>
                 </div>
                 <ul className="order-item-summary">
                     {order.orderItems.map((item, index) => (
                         // Only show first few items maybe, or all
                         <li key={`${item.menuItem}-${index}`}>
                             {item.quantity} x {item.name}
                         </li>
                     ))}
                      {order.orderItems.length > 3 && <li>... and more</li>} {/* Indicate if more items */}
                 </ul>
                 <div className="order-total">
                     Total: {order.totalAmount.toFixed(2)}
                 </div>
                 {/* Optional: Link to view full order details */ }
                 {/* <Link to={`/orders/${order._id}`}>View Details</Link> */ }
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;