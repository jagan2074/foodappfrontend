// src/services/authService.js
import axios from 'axios';

// Define the *backend* API URL
const API_BASE_URL ='https://foodappbackend-sjfy.onrender.com/api/auth'; // Points to your server on port 5000

const sendOtp = async (data) => {
  try {
    console.log("FE: Sending OTP request to backend with data:", data);
    // axios makes the HTTP POST request from the browser (localhost:3000)
    // to the backend server URL (localhost:5000)
    const response = await axios.post(`${API_BASE_URL}/send-otp-email`, data); // <-- This is the request
    console.log("FE: OTP Send Response from backend:", response.data);
    return response.data;

  } catch (error) {
    console.error("FE: Error sending OTP:", error);
    if (error.response) {
      console.error("FE: Error Response Data:", error.response.data);
      throw new Error(error.response.data.errors?.[0]?.msg || error.response.data.msg || 'Failed to send OTP');
    } else if (error.request) {
      console.error("FE: Error Request Data:", error.request);
      throw new Error('No response received from server. Please check network or server status.');
    } else {
      console.error('FE: Error Message:', error.message);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
};

const verifyOtp = async (data) => {
    try {
        console.log("FE: Sending Verify OTP request to backend with data:", data);
        // Make POST request to the /verify-otp-email endpoint
        const response = await axios.post(`${API_BASE_URL}/verify-otp-email`, data); // <-- Verify endpoint

        console.log("FE: Verify OTP Response from backend:", response.data);
        // Return the full response data (contains token and user)
        return response.data;
    } catch (error) {
        console.error("FE: Error verifying OTP:", error);
        // Handle errors similarly to sendOtp
        if (error.response) {
            console.error("FE: Error Response Data:", error.response.data);
            // Throw specific error message from backend
            throw new Error(error.response.data.errors?.[0]?.msg || 'Invalid OTP or verification failed.');
        } else if (error.request) {
            console.error("FE: Error Request Data:", error.request);
            throw new Error('No response received from server during OTP verification.');
        } else {
            console.error('FE: Error Message:', error.message);
            throw new Error(error.message || 'An unexpected error occurred during OTP verification.');
        }
    }
};
export {
    sendOtp,
    verifyOtp
};