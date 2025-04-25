// src/services/adminService.js
import axios from 'axios';

const API_ADMIN_URL = 'https://foodappbackend-sjfy.onrender.com/api/admin';
const getToken = () => localStorage.getItem('token');

const getPendingRestaurants = async () => {
  const token = getToken();
  if (!token) {
    console.error("Admin Service: No token found for getPendingRestaurants");
    throw new Error('Admin action requires authentication.');
  }
  const url = `${API_ADMIN_URL}/pending-restaurants`;
  console.log(`FE Admin Service: GET ${url}`);
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data || [];
  } catch (error) {
    console.error("FE Admin Service: Error fetching pending restaurants:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
       throw new Error(error.response.data?.msg || 'Not authorized to view pending requests.');
    }
    throw new Error(error.response?.data?.msg || error.message || 'Failed to fetch pending requests.');
  }
};

const approveRestaurant = async (userId) => {
  if (!userId) {
    console.error("Admin Service: userId needed for approveRestaurant");
    throw new Error('User ID is required for approval.');
  }
  const token = getToken();
  if (!token) {
    console.error("Admin Service: No token found for approveRestaurant");
    throw new Error('Admin action requires authentication.');
  }
  const url = `${API_ADMIN_URL}/approve-restaurant/${userId}`;
  console.log(`FE Admin Service: POST ${url}`);
  try {
    const response = await axios.post(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`FE Admin Service: Error approving user ${userId}:`, error);
    if (error.response?.status === 401 || error.response?.status === 403) {
       throw new Error(error.response.data?.msg || 'Not authorized to approve.');
    }
    throw new Error(error.response?.data?.msg || error.message || 'Failed to approve application.');
  }
};

const rejectRestaurant = async (userId) => {
  if (!userId) {
    console.error("Admin Service: userId needed for rejectRestaurant");
    throw new Error('User ID is required for rejection.');
  }
  const token = getToken();
  if (!token) {
    console.error("Admin Service: No token found for rejectRestaurant");
    throw new Error('Admin action requires authentication.');
  }
  const url = `${API_ADMIN_URL}/reject-restaurant/${userId}`;
  console.log(`FE Admin Service: POST ${url}`);
  try {
    const response = await axios.post(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`FE Admin Service: Error rejecting user ${userId}:`, error);
    if (error.response?.status === 401 || error.response?.status === 403) {
       throw new Error(error.response.data?.msg || 'Not authorized to reject.');
    }
    throw new Error(error.response?.data?.msg || error.message || 'Failed to reject application.');
  }
};

// --- ADD THIS FUNCTION ---
const updateHeroImage = async (imageUrl) => {
    const token = getToken();
    if (!token) {
        throw new Error('Admin action requires authentication.');
    }
    const url = `${API_ADMIN_URL}/settings/hero-image`;
    console.log(`FE Admin Service: PUT ${url}`);
    try {
        const response = await axios.put(
            url,
            { heroImageUrl: imageUrl }, // Send data in request body
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error(`FE Admin Service: Error updating hero image:`, error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error(error.response.data?.msg || 'Not authorized.');
        }
        throw new Error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message || 'Failed to update hero image.');
    }
};
// --- END OF ADDED FUNCTION ---

export {
    getPendingRestaurants,
    approveRestaurant,
    rejectRestaurant,
    updateHeroImage // <-- Add new function to export
};



