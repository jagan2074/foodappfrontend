// src/components/Auth/OtpVerification.js
import React, { useState } from 'react';
import { verifyOtp } from '../../services/authService'; // Ensure verifyOtp service is ready
import { useAuth } from '../../context/AuthContext';

// Accept signupData prop from AuthModal
const OtpVerification = ({ identifier, signupData, switchToLogin, onClose }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otp || otp.length !== 6) { // Strict 6-digit check
      setError('Please enter the 6-digit OTP.');
      setIsLoading(false);
      return;
    }

    // Prepare data for the verification API call
    // Always include email and OTP
    const verificationData = {
      email: identifier,
      otp,
    };

    // If signupData exists (meaning this is a restaurant signup verification),
    // add the necessary details for the backend to create the restaurant.
    if (signupData) {
      console.log("FE: Passing signupData to verifyOtp:", signupData);
      verificationData.username = signupData.username;
      verificationData.restaurantName = signupData.restaurantName;
      verificationData.address = signupData.address;
      // Add any other restaurant fields from signupData if needed by backend
    }

    console.log("FE: Verifying OTP with data:", verificationData);

    try {
      // Call the backend verifyOtp endpoint with all necessary data
      const response = await verifyOtp(verificationData);

      console.log("FE: Verification Success! Response:", response);
      // Use the login function from AuthContext to update global state
      login(response.token, response.user);

      onClose(); // Close the modal on successful login/activation
    } catch (err) {
      console.error("FE: OTP Verification Error:", err);
      setError(err.message || 'Invalid OTP or verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Input handler to allow only numbers and limit length
  const handleOtpChange = (e) => {
      const value = e.target.value;
      if (/^[0-9]*$/.test(value) && value.length <= 6) {
          setOtp(value);
      }
  };

  return (
    <div className="auth-form">
      <h2>Verify OTP</h2>
      <p>Enter the 6-digit code sent to {identifier}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp-code">OTP Code</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id="otp-code"
            value={otp}
            onChange={handleOtpChange}
            maxLength="6"
            placeholder="Enter OTP"
            required
            disabled={isLoading}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify & Proceed'}
        </button>
      </form>
       <p className="switch-view">
        Entered wrong email?{' '}
        <button onClick={switchToLogin} className="link-button" disabled={isLoading}>
          Go Back
        </button>
      </p>
    </div>
  );
};

export default OtpVerification;