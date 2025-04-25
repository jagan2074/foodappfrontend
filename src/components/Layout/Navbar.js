// src/components/Layout/Navbar.js
import React, { useState } from 'react';
import './Navbar.css';
import Sidebar from './Sidebar';
import { FiMenu } from "react-icons/fi";
import { IoCartOutline, IoSearchOutline } from "react-icons/io5";
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onAuthClick, onAddRestaurantClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  // Handler for cart button click
  const handleCartClick = () => {
    // <<<--- ADD THIS CONSOLE LOG ---<<<
    console.log("Navbar: handleCartClick triggered!");
    // <<<----------------------------<<<
    navigate('/cart');
  };

  return (
    <>
      <nav className="navbar">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <FiMenu size={24} />
        </button>
        <div className="navbar-logo">
          <a href="/">FoodApp</a>
        </div>
        <div className="navbar-center hide-mobile">
          <div className="address-display">
            <span className="address-icon">[ICON]</span>
            <span className="address-text">Enter Delivery Address</span>
          </div>
        </div>
        <div className="navbar-main-links hide-mobile">
          <a href="/investor-relations">Investor Relations</a>
          <button className="nav-link-button" onClick={onAddRestaurantClick}>Add restaurant</button>
        </div>

        <div className="navbar-actions">
          <button className="icon-button hide-mobile">
            <IoSearchOutline size={24} />
          </button>
           {isAuthenticated ? (
             <>
               <span className="username-display hide-mobile">
                 Hi, {user?.username || 'User'}
               </span>
               <button
                 className="nav-button logout-btn hide-mobile"
                 onClick={handleLogoutClick}
               >
                 Log Out
               </button>
             </>
           ) : (
             <>
               <button
                 className="nav-button signin-btn hide-mobile"
                 onClick={onAuthClick}
               >
                 Log in
               </button>
               <button
                 className="nav-button signup-btn hide-mobile"
                 onClick={onAuthClick}
               >
                 Sign up
               </button>
             </>
           )}

          {/* Cart Icon button with onClick handler */}
          <button
            className="icon-button cart-button"
            onClick={handleCartClick} // Attach the handler
            title="View Cart"
          >
            <IoCartOutline size={26} />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </button>
        </div>
      </nav>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onAuthClick={onAuthClick}
        onAddRestaurantClick={onAddRestaurantClick}
      />
    </>
  );
};

export default Navbar;