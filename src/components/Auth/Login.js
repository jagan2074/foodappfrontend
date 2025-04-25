// src/components/Auth/Login.js
import React, { useState } from 'react';
import { sendOtp } from '../../services/authService';
import './Auth.css'; // Assuming Auth.css exists for styling

// Destructure props including onOtpSent
const Login = ({ switchToSignup, onOtpSent }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic frontend validation
    if (!email) {
      setError('Please enter your email.');
      setIsLoading(false);
      return;
    }
    // Optional: Add more robust email format validation here if needed

    console.log("Login Component: Attempting send OTP for:", email);

    try {
      // Call the backend service function
      const response = await sendOtp({ email }); // Pass only email for login

      // Log backend success message (optional)
      console.log("Login Component: Backend Response -", response.msg);

      // --- Verification and Calling onOtpSent ---
      // Check if onOtpSent prop is actually a function before calling it
      if (typeof onOtpSent === 'function') {
        console.log("Login Component: Calling onOtpSent prop...");
        onOtpSent(email); // Call the function passed from AuthModal to switch view
      } else {
        // This case should ideally not happen if AuthModal is coded correctly
        console.error("Login Component Error: onOtpSent prop is not a function!");
        setError("Internal application error. Please contact support."); // User-friendly error
      }
      // --- End Verification ---

    } catch (err) {
      // Catch errors thrown by the authService (includes backend errors)
      console.error("Login Component: sendOtp Error -", err);
      setError(err.message || 'Failed to send OTP. Please check your email or try again.');
    } finally {
      // Ensure loading state is always reset
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <p>Enter your email to receive an OTP</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading} // Disable input during API call
          />
        </div>
        {/* Display error messages */}
        {error && <p className="error-message">{error}</p>}
        {/* Submit button with loading state text */ }
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
      {/* Link to switch to Signup view */ }
      <p className="switch-view">
        Don't have an account?{' '}
        <button
          onClick={switchToSignup}
          className="link-button"
          disabled={isLoading} // Disable while loading
          type="button" // Prevent accidental form submission
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;