// src/components/Auth/Signup.js
import React, { useState, useEffect } from 'react';
import { sendOtp } from '../../services/authService';
import './Auth.css';

const Signup = ({ switchToLogin, onOtpSent, isRestaurantMode = false, onCloseModal }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isRestaurantSignup, setIsRestaurantSignup] = useState(isRestaurantMode);
  const [restaurantName, setRestaurantName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  // --- Add State for imageUrl ---
  const [restaurantImageUrl, setRestaurantImageUrl] = useState('');
  // --- End Add State ---

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

   useEffect(() => {
      setIsRestaurantSignup(isRestaurantMode);
      if (!isRestaurantMode) {
          // Clear restaurant fields if switching back to customer mode
          setRestaurantName('');
          setAddressStreet('');
          setAddressCity('');
          setAddressState('');
          setAddressZip('');
          setRestaurantImageUrl(''); // Clear image URL too
      }
   }, [isRestaurantMode]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // --- Validation ---
    if (!email || !username) {
        setError('Please enter email and username.');
        setIsLoading(false);
        return;
    }
    // If restaurant signup, validate restaurant fields (now including optional imageUrl check if needed)
    if (isRestaurantSignup && (!restaurantName || !addressStreet || !addressCity || !addressState || !addressZip /* || !restaurantImageUrl - if required */)) {
        setError('Please fill in all required restaurant details (Name, Full Address). Image URL is optional.');
        setIsLoading(false);
        return;
    }
    // Optional: Add URL validation for restaurantImageUrl if provided

    // --- Prepare Data for API ---
    const apiData = {
      email: email.trim(),
      username: username.trim(),
    };
    let pendingDataForOtpStep = null;

    if (isRestaurantSignup) {
      apiData.restaurantName = restaurantName.trim();
      apiData.address = {
        street: addressStreet.trim(),
        city: addressCity.trim(),
        state: addressState.trim().toUpperCase(),
        zipCode: addressZip.trim(),
      };
      // --- Add imageUrl to apiData ---
      if (restaurantImageUrl.trim()) { // Only include if not empty
          apiData.imageUrl = restaurantImageUrl.trim();
      }
      // --- End Add imageUrl ---
      pendingDataForOtpStep = { ...apiData }; // Pass all details needed for creation later
    }

    console.log("Attempting signup / send OTP with data:", apiData);

    try {
      const response = await sendOtp(apiData);
      console.log("Signup Component: Backend Response -", response.msg);

      if (isRestaurantSignup) {
        setSuccessMessage(response.msg || 'Restaurant registration submitted. Please wait for admin approval.');
        // Clear form after successful submission for approval
        setEmail('');
        setUsername('');
        setRestaurantName('');
        setAddressStreet('');
        setAddressCity('');
        setAddressState('');
        setAddressZip('');
        setRestaurantImageUrl('');
        // Optionally close modal after delay
        // setTimeout(() => { if (onCloseModal) onCloseModal(); }, 3000);
      } else {
        // Customer signup
        if (typeof onOtpSent === 'function') {
            onOtpSent(email); // Only need email for customer OTP verify step
        } else {
             console.error("Signup Error: onOtpSent prop is not a function!");
             setError("Internal application error.");
        }
      }

    } catch (err) {
      console.error("Signup/Send OTP Error:", err);
      setError(err.message || 'Failed to sign up. Please try again.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>{isRestaurantSignup ? 'Restaurant Signup' : 'Create Account'}</h2>
      <p>{isRestaurantSignup ? 'Enter your restaurant details' : 'Sign up for FoodApp'}</p>

      {/* --- REMOVED CHECKBOX TOGGLE --- */}

      {successMessage && !error && (
          <p className="success-message" style={{ color: 'green', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
              {successMessage}
          </p>
      )}

      {/* Conditionally render form or success message for restaurant signup */}
      {!(isRestaurantSignup && successMessage) && (
        <form onSubmit={handleSubmit}>
          {/* User Fields */ }
          <div className="form-group">
            <label htmlFor="signup-username">Username*</label>
            <input
              type="text"
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRestaurantSignup ? "Restaurant Contact Name" : "Your Name"}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-email">Email Address*</label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* --- Conditional Restaurant Fields based on isRestaurantMode prop --- */}
          {isRestaurantSignup && (
            <>
              <hr className="form-divider" />
              <h3 className="form-section-title">Restaurant Details</h3>
              {/* Restaurant Name */}
              <div className="form-group">
                <label htmlFor="signup-restaurant-name">Restaurant Name*</label>
                <input
                  type="text"
                  id="signup-restaurant-name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g., The Tasty Spoon"
                  required={isRestaurantSignup}
                  disabled={isLoading}
                />
              </div>
              {/* Street */}
              <div className="form-group">
                <label htmlFor="signup-address-street">Street Address*</label>
                <input
                  type="text"
                  id="signup-address-street"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="e.g., 123 Main St"
                  required={isRestaurantSignup}
                  disabled={isLoading}
                />
              </div>
              {/* City */}
               <div className="form-group">
                <label htmlFor="signup-address-city">City*</label>
                <input
                  type="text"
                  id="signup-address-city"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="e.g., Anytown"
                  required={isRestaurantSignup}
                  disabled={isLoading}
                />
              </div>
              {/* State */}
               <div className="form-group">
                <label htmlFor="signup-address-state">State/Province*</label>
                <input
                  type="text"
                  id="signup-address-state"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  placeholder="e.g., CA"
                  required={isRestaurantSignup}
                  disabled={isLoading}
                />
              </div>
              {/* Zip */}
               <div className="form-group">
                <label htmlFor="signup-address-zip">Zip/Postal Code*</label>
                <input
                  type="text"
                  id="signup-address-zip"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                  placeholder="e.g., 90210"
                  required={isRestaurantSignup}
                  disabled={isLoading}
                />
              </div>
              {/* --- Add Image URL Field --- */}
              <div className="form-group">
                <label htmlFor="signup-restaurant-image">Image URL (Optional)</label>
                <input
                  type="url" // Use type="url" for better validation/input modes
                  id="signup-restaurant-image"
                  value={restaurantImageUrl}
                  onChange={(e) => setRestaurantImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
                <small>Enter the web address (URL) of the main image for your restaurant.</small>
              </div>
              {/* --- End Image URL Field --- */}
            </>
          )}
          {/* --- End Conditional Fields --- */}

          {/* Error Display */}
          {error && <p className="error-message">{error}</p>}

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isRestaurantSignup ? 'Submit for Approval' : 'Sign Up & Send OTP')}
          </button>
        </form>
      )}

      {/* Switch to Login (Show unless restaurant signup was successful and message is shown) */}
      {!(isRestaurantSignup && successMessage) && (
        <p className="switch-view">
          Already have an account?{' '}
          <button onClick={switchToLogin} className="link-button" disabled={isLoading}>
            Log In
          </button>
        </p>
      )}
    </div>
  );
};

export default Signup;