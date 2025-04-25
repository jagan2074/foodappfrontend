// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state directly without complex initializers here
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Start loading true - effect will determine auth status
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // useEffect: Runs ONCE on initial mount to check localStorage
  useEffect(() => {
    console.log("AuthContext: Initial Mount useEffect running...");
    setIsAuthLoading(true); // Ensure loading is true at start of check
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      console.log("AuthContext: Found token in storage.");
      try {
        const decoded = jwtDecode(storedToken);
        console.log("AuthContext: Decoded token payload:", decoded);

        // Check expiry (essential step)
        if (decoded.exp * 1000 > Date.now()) {
          console.log("AuthContext: Token is valid. Setting auth state.");
          // Token is valid and not expired, set the state
          setToken(storedToken);
          setUser(decoded.user); // Assuming payload is { user: {...} }
          setIsAuthenticated(true);
        } else {
          // Token exists but is expired
          console.log("AuthContext: Token expired. Clearing state.");
          localStorage.removeItem('token'); // Clean up expired token
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Token exists but is invalid (cannot decode)
        console.error("AuthContext: Invalid token found on initial load.", error);
        localStorage.removeItem('token'); // Clean up invalid token
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      // No token found
      console.log("AuthContext: No token found in storage on initial load.");
      setToken(null); // Ensure state is cleared if no token
      setUser(null);
      setIsAuthenticated(false);
    }
    // Finished initial auth check
    setIsAuthLoading(false);
    console.log("AuthContext: Initial auth check complete.");

  }, []); // Empty dependency array ensures this runs only ONCE on mount

  // Login function: updates state and localStorage
  const login = (newToken, userData) => {
    try {
      console.log("AuthContext: login function called.");
      // 1. Store token first
      localStorage.setItem('token', newToken);
      // 2. Update state - this should trigger re-renders
      setToken(newToken);
      setUser(userData); // Use the data directly from backend response
      setIsAuthenticated(true);
      setIsAuthLoading(false); // Ensure loading is false after login
      console.log("AuthContext: State updated after login:", { token: newToken, user: userData, isAuthenticated: true });
    } catch (error) {
        console.error("AuthContext: Error during login state update:", error);
        logout(); // Attempt to logout/clear state if error occurs
    }
  };

  // Logout function: clears state and localStorage
  const logout = () => {
    console.log("AuthContext: Logging out user.");
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAuthLoading(false); // Ensure loading is false after logout
  };

  // Value provided by the context
  const value = {
    token,
    user,
    isAuthenticated,
    isAuthLoading,
    login,
    logout,
  };

  // Use AuthContext.Provider here
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};