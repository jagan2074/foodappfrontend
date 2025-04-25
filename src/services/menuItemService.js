// src/services/menuItemService.js
import axios from 'axios';

const API_RESTAURANT_URL = 'http://localhost:5000/api/restaurants';
const getToken = () => localStorage.getItem('token');

const getMenuItemsByRestaurant = async (restaurantId) => {
    // Keep existing function
    if (!restaurantId) {
        console.error("FE Service Error: restaurantId needed for getMenuItemsByRestaurant");
        throw new Error('Restaurant ID is required.');
    }
    const url = `${API_RESTAURANT_URL}/${restaurantId}/menu`;
    console.log(`FE Service: GET ${url}`);
    try {
        const response = await axios.get(url);
        return response.data || [];
    } catch (error) {
        console.error(`FE Service: Error fetching menu items for ${restaurantId}:`, error);
        throw new Error(error.response?.data?.msg || error.message || 'Failed to fetch menu items');
    }
};

// --- Add Menu Item (MODIFIED WITH LOGS) ---
const addMenuItem = async (restaurantId, itemData) => {
    if (!restaurantId) {
        throw new Error('Restaurant ID is required');
    }
    const token = getToken();
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }

    const url = `${API_RESTAURANT_URL}/${restaurantId}/menu`;
    // Prepare config with headers
    const config = {
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
      }
    };

    // <<< ADD LOGS >>>
    console.log(`FE Service: POST ${url}`);
    console.log(`FE Service: Sending Item Data:`, itemData);
    console.log(`FE Service: Using Request Config:`, config);
    // <<< END LOGS >>>

    try {
        const response = await axios.post(
            url,
            itemData,
            config // Pass the config object with headers
        );
        return response.data;
    } catch (error) {
        console.error("FE Service: Error adding menu item:", error);
        throw new Error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message || 'Failed to add menu item');
    }
};

// --- Update and Delete Functions ---
const updateMenuItem = async (restaurantId, itemId, itemData) => {
    // Keep existing (placeholder or actual)
    if (!restaurantId || !itemId) throw new Error('Restaurant ID and Item ID are required');
    const token = getToken();
    if (!token) throw new Error('Authentication required.');
    const url = `${API_RESTAURANT_URL}/${restaurantId}/menu/${itemId}`;
    console.log(`FE Service: PUT ${url}`, itemData);
    try {
         console.warn("updateMenuItem service function not fully implemented.");
         await new Promise(resolve => setTimeout(resolve, 500));
         return { ...itemData, _id: itemId, message: "Simulated Update OK" };
    } catch (error) {
        console.error(`FE Service: Error updating menu item ${itemId}:`, error);
        throw new Error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message || 'Failed to update menu item');
    }
};
const deleteMenuItem = async (restaurantId, itemId) => {
    // Keep existing (placeholder or actual)
     if (!restaurantId || !itemId) throw new Error('Restaurant ID and Item ID are required');
    const token = getToken();
    if (!token) throw new Error('Authentication required.');
    const url = `${API_RESTAURANT_URL}/${restaurantId}/menu/${itemId}`;
    console.log(`FE Service: DELETE ${url}`);
    try {
         console.warn("deleteMenuItem service function not fully implemented.");
         await new Promise(resolve => setTimeout(resolve, 500));
         return { msg: "Menu item removed successfully (Simulated)" };
    } catch (error) {
        console.error(`FE Service: Error deleting menu item ${itemId}:`, error);
        throw new Error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message || 'Failed to delete menu item');
    }
};


export {
    getMenuItemsByRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
};