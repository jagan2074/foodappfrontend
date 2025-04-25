// src/services/settingsService.js
import axios from 'axios';

// Base URL for PUBLIC settings part of the API
const API_SETTINGS_URL = 'http://localhost:5000/api/settings';

/**
 * Fetches publicly accessible settings (like hero image URL).
 * No authentication required.
 * @returns {Promise<object>} - Object containing public settings (e.g., { heroImageUrl: '...' }).
 */
const getPublicSettings = async () => {
    const url = `${API_SETTINGS_URL}/public`;
    console.log(`FE Settings Service: GET ${url}`);
    try {
        const response = await axios.get(url);
        // Return the data object, or an empty object if no settings found/error
        return response.data || {};
    } catch (error) {
        console.error("FE Settings Service: Error fetching public settings:", error);
        // Return empty object on error to allow graceful fallback in component
        return {};
    }
};

export {
    getPublicSettings
};