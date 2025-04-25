// src/components/Layout/Footer.js
import React from 'react';
import './Footer.css'; // We'll create this CSS file next

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Add more links or content as needed */}
        <p>© 2023 FoodApp</p>
        <nav className="footer-nav">
          <a href="/about">About</a>
          <a href="/help">Help</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;