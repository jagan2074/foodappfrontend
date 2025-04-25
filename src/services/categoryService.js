// src/services/categoryService.js
import axios from 'axios';

// Base URL for CATEGORY part of the API
const API_CATEGORY_URL = 'http://localhost:5000/api/categories';

/**
 * Fetches all categories from the backend.
 * Publicly accessible.
 * @returns {Promise<Array>} - Array of category objects (e.g., [{ _id, name, imageUrl }]).
 */
const getAllCategories = async () => {
    const url = `${API_CATEGORY_URL}/`; // GET request to /api/categories/
    console.log(`FE Category Service: GET ${url}`);
    try {
        const response = await axios.get(url);
        return response.data || []; // Return data or empty array
    } catch (error) {
        console.error("FE Category Service: Error fetching categories:", error);
        // Return empty array on error so page can still load
        // throw new Error(error.response?.data?.msg || error.message || 'Failed to fetch categories.');
        return [];
    }
};

export {
    getAllCategories
};