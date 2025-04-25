// src/services/restaurantService.js
import axios from 'axios';

// Base URL for restaurant API
const API_RESTAURANT_URL = 'http://localhost:5000/api/restaurants';

/**
 * Fetches a list of all active restaurants from the backend.
 * @returns {Promise<Array>} - A promise that resolves to an array of restaurant objects.
 */
const getAllRestaurants = async () => {
  console.log(">>> restaurantService: getAllRestaurants STARTING <<<"); // <<< ADD LOG
  try {
    const response = await axios.get(API_RESTAURANT_URL);
    console.log(">>> restaurantService: getAllRestaurants SUCCESS, returning data <<<"); // <<< ADD LOG
    return response.data || [];
  } catch (error) {
    console.error("FE: Error fetching all restaurants:", error);
    if (error.response) {
      throw new Error(error.response.data?.errors?.[0]?.msg || error.response.data?.msg || 'Failed to fetch restaurants');
    } else if (error.request) {
      throw new Error('No response received from server while fetching restaurants.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while fetching restaurants.');
    }
  }
};
/**
 * Fetches details for a single restaurant by its ID.
 * @param {string} restaurantId - The ID of the restaurant to fetch.
 * @returns {Promise<object>} - A promise that resolves to the restaurant detail object.
 */
const getRestaurantById = async (restaurantId) => {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required.');
  }
  const url = `${API_RESTAURANT_URL}/${restaurantId}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`FE: Error fetching restaurant by ID ${restaurantId}:`, error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(error.response.data?.msg || 'Restaurant not found.');
      }
      throw new Error(error.response.data?.errors?.[0]?.msg || error.response.data?.msg || 'Failed to fetch restaurant details');
    } else if (error.request) {
      throw new Error('No response received from server while fetching restaurant details.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while fetching restaurant details.');
    }
  }
};

// --- ADD THIS FUNCTION ---
/**
 * Fetches menu items for a specific restaurant.
 * @param {string} restaurantId - The ID of the restaurant.
 * @returns {Promise<Array>} - Array of menu items.
 */
const getMenuItemsByRestaurant = async (restaurantId) => {
    if (!restaurantId) {
        console.error("FE Service Error: restaurantId needed for getMenuItemsByRestaurant");
        throw new Error('Restaurant ID is required.');
    }
    // Construct the specific URL for the menu items of this restaurant
    const url = `${API_RESTAURANT_URL}/${restaurantId}/menu`;
    console.log(`FE Service: GET ${url}`);
    try {
        const response = await axios.get(url);
        return response.data || []; // Return data or empty array
    } catch (error) {
        console.error(`FE Service: Error fetching menu items for ${restaurantId}:`, error);
        // Re-throw a cleaner error message
        throw new Error(error.response?.data?.msg || error.message || 'Failed to fetch menu items');
    }
};
// --- END OF ADDED FUNCTION ---


// Export all functions
export {
  getAllRestaurants,
  getRestaurantById,
  getMenuItemsByRestaurant // <-- Add the new function to the export
};