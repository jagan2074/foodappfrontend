// src/components/Layout/Sidebar.js
import React from 'react';
import './Sidebar.css';
import { IoClose } from "react-icons/io5";
import { useAuth } from '../../context/AuthContext';

// 1. Accept onAddRestaurantClick prop
const Sidebar = ({ isOpen, onClose, onAuthClick, onAddRestaurantClick }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleSignIn = () => { onAuthClick(); onClose(); };
  const handleSignUp = () => { onAuthClick(); onClose(); };
  const handleLogout = () => { logout(); onClose(); };

  // 2. Handler for Add Restaurant click
  const handleAddRestaurant = () => {
      console.log("Sidebar: Triggering Restaurant Signup...");
      onAddRestaurantClick(); // Call the function passed from App.js
      onClose(); // Close the sidebar
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={onClose}><IoClose size={24} /></button>
        <nav className="sidebar-nav">
          {isAuthenticated ? (
               <>
                   <a href="/profile" onClick={onClose}>Hi, {user?.username || 'Account'}</a>
                   <a href="/orders" onClick={onClose}>My Orders</a>
                   {/* Make Add restaurant a button if logged in too? Or link? Adjust as needed */}
                   <button onClick={handleAddRestaurant}>Add restaurant</button>
                   <button onClick={handleLogout}>Log Out</button>
               </>
          ) : (
              <>
                  <a href="/investor-relations" onClick={onClose}>Investor Relations</a>
                  {/* 3. Make Add restaurant a button and attach handler */}
                  <button onClick={handleAddRestaurant}>Add restaurant</button>
                  <button onClick={handleSignIn}>Log in</button>
                  <button onClick={handleSignUp}>Sign up</button>
              </>
          )}
           <a href="/help" onClick={onClose}>Help</a>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;