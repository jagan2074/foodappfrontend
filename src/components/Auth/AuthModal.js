// src/components/Auth/AuthModal.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import OtpVerification from './OtpVerification';
import './Auth.css';
import { IoClose } from 'react-icons/io5';

// Accept initialMode prop (defaults to 'login')
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  // State for current view ('login', 'signup', 'otp')
  const [view, setView] = useState(initialMode === 'restaurantSignup' ? 'signup' : initialMode);
  // State for email/identifier needed by OTP view
  const [authIdentifier, setAuthIdentifier] = useState('');
  // State for temporary signup data needed by OTP view for restaurant activation
  const [pendingSignupData, setPendingSignupData] = useState(null);

  // Effect to reset state when modal visibility or initial mode changes
  useEffect(() => {
    if (isOpen) {
      console.log("AuthModal opening/re-rendering with initialMode:", initialMode);
      // Set view based on initialMode when modal becomes visible or prop changes
      setView(initialMode === 'restaurantSignup' ? 'signup' : initialMode);
      setAuthIdentifier(''); // Clear identifier
      setPendingSignupData(null); // Clear pending signup data
    }
    // Dependency array includes isOpen and initialMode
  }, [isOpen, initialMode]);

  // Function called by Login/Signup components when OTP is sent successfully
  const showOtpView = (identifier, signupDetails = null) => {
    console.log("AuthModal: showOtpView called for identifier:", identifier);
    setAuthIdentifier(identifier); // Store the email
    setPendingSignupData(signupDetails); // Store associated signup data (null if login)
    // --- Set the state to switch the view ---
    setView('otp');
    // --- ADDED DEBUG LOG ---
    console.log("AuthModal: setView('otp') was called. Current view state should become 'otp'.");
    // --- END ADDED DEBUG LOG ---
  };

  // Functions to switch back to Login or Signup view
  const showLoginView = () => {
    console.log("AuthModal: Switching to Login view.");
    setView('login');
    setPendingSignupData(null); // Clear pending data
  };
  const showSignupView = () => {
    console.log("AuthModal: Switching to Signup view.");
    setView('signup');
    setPendingSignupData(null); // Clear pending data
  };


  // If modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  // Render the modal overlay and content
  return (
    <div className="auth-modal-overlay" onClick={onClose}> {/* Close on overlay click */}
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing on content click */}
        {/* Close button */}
        <button className="auth-modal-close-btn" onClick={onClose}>
          <IoClose size={24} />
        </button>

        {/* Conditional Rendering based on the 'view' state */}
        {view === 'login' && (
          <Login
            // Prop to allow Login component to switch view to Signup
            switchToSignup={showSignupView}
            // Prop function for Login component to call when OTP is sent
            onOtpSent={showOtpView}
          />
        )}
        {view === 'signup' && (
           <Signup
           isRestaurantMode={initialMode === 'restaurantSignup'}
           switchToLogin={showLoginView}
           onOtpSent={showOtpView} // Still needed for CUSTOMER signup
           onCloseModal={onClose} // <<<--- Pass onClose prop
         />
        )}
        {view === 'otp' && (
          <OtpVerification
            // Pass the stored email/identifier to OTP component
            identifier={authIdentifier}
            // Pass any stored signup data needed for restaurant verification
            signupData={pendingSignupData}
            // Prop to allow OTP component to switch back to Login
            switchToLogin={showLoginView}
            // Prop to allow OTP component to close the modal on success
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;