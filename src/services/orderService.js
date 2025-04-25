// src/services/orderService.js
import axios from 'axios';

const API_ORDER_URL = 'https://foodappbackend-sjfy.onrender.com/api/orders';
const getToken = () => localStorage.getItem('token');

/**
 * Creates a new order.
 * Requires authentication token.
 * @param {object} orderData - Object containing order details.
 * @returns {Promise<object>} - The created order object from the backend.
 */
const createOrder = async (orderData) => {
  const token = getToken();
  if (!token) {
    console.error("Order Service: No token found for createOrder");
    throw new Error('Authentication required to place an order.');
  }

  if (
    !orderData.restaurant ||
    !orderData.orderItems ||
    orderData.orderItems.length === 0 ||
    !orderData.deliveryAddress ||
    orderData.totalAmount === undefined // Check for undefined explicitly too
  ) {
    console.error("Order Service: Incomplete order data", orderData);
    throw new Error('Incomplete order information provided.');
  }

  console.log("FE Order Service: Creating order with data:", orderData);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.post(
      API_ORDER_URL,
      orderData,
      config
    );
    return response.data;
  } catch (error) {
    console.error("FE Order Service: Error creating order:", error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message || 'Failed to place order.');
  }
};

/**
 * Fetches the order history for the logged-in user.
 * Requires authentication token.
 * @returns {Promise<Array>} - Array of user's past orders.
 */
const getMyOrders = async () => {
    const token = getToken();
    if (!token) {
        console.error("Order Service: No token found for getMyOrders");
        throw new Error('Authentication required to view orders.');
    }
    const url = API_ORDER_URL; // GET request to /api/orders
    console.log(`FE Order Service: GET ${url}`);
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data || [];
    } catch (error) {
        console.error("FE Order Service: Error fetching orders:", error);
        throw new Error(error.response?.data?.msg || error.message || 'Failed to fetch order history.');
    }
};

// --- Add getOrderById later if needed ---

export {
    createOrder,
    getMyOrders,
};