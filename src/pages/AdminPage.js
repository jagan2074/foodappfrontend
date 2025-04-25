// src/pages/AdminPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  updateHeroImage // Import updateHeroImage service
} from '../services/adminService';
import './AdminPage.css';

const AdminPage = () => {
  const { user, isAuthLoading } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({});

  const [heroImageUrlInput, setHeroImageUrlInput] = useState('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [imageUpdateMsg, setImageUpdateMsg] = useState('');

  const fetchPending = useCallback(async () => {
    if (!user?.isAdmin) {
      if (!isAuthLoading) {
          setError("Access Denied: Admin role required.");
      }
      setPendingUsers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setActionStatus({});
    try {
      console.log("AdminPage: Fetching pending restaurants...");
      const data = await getPendingRestaurants();
      setPendingUsers(data || []);
      console.log(`AdminPage: Found ${data?.length || 0} pending users.`);
    } catch (err) {
      console.error("AdminPage: Error fetching pending users:", err);
      setError(err.message || 'Failed to load pending applications.');
      setPendingUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchPending();
      // Optional: Fetch current hero image URL here
    }
  }, [isAuthLoading, fetchPending]);

  const handleApprove = async (userIdToApprove) => {
    if (actionStatus[userIdToApprove]) return;
    setActionStatus(prev => ({ ...prev, [userIdToApprove]: 'Approving...' }));
    try {
      const response = await approveRestaurant(userIdToApprove);
      fetchPending();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [userIdToApprove]: `Error: ${err.message}` }));
    }
  };

  const handleReject = async (userIdToReject) => {
    if (actionStatus[userIdToReject]) return;
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }
    setActionStatus(prev => ({ ...prev, [userIdToReject]: 'Rejecting...' }));
    try {
      const response = await rejectRestaurant(userIdToReject);
      fetchPending();
    } catch (err) {
      setActionStatus(prev => ({ ...prev, [userIdToReject]: `Error: ${err.message}` }));
    }
  };

  const handleHeroImageUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingImage(true);
    setImageUpdateMsg('');
    setError(null);
    try {
      const response = await updateHeroImage(heroImageUrlInput.trim());
      setHeroImageUrlInput(response.heroImageUrl || '');
      setImageUpdateMsg('Hero image URL updated successfully!');
    } catch (err) {
      setImageUpdateMsg(`Error: ${err.message || 'Failed.'}`);
    } finally {
      setIsUpdatingImage(false);
      setTimeout(() => setImageUpdateMsg(''), 5000);
    }
  };

  if (isAuthLoading) {
     return <div className="loading-fullpage">Loading User Data...</div>;
  }
  if (!user?.isAdmin) {
     return <div className="admin-page-error">Access Denied.</div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <section className="dashboard-section hero-image-section">
        <h2>Homepage Hero Image</h2>
        <form onSubmit={handleHeroImageUpdate} className="hero-image-form">
           {imageUpdateMsg && (
              <p
                className={`action-status ${imageUpdateMsg.startsWith('Error') ? 'error' : 'success'}`}
              >
                {imageUpdateMsg}
              </p>
           )}
          <div className="form-group">
            <label htmlFor="hero-image-url">
              Hero Background Image URL:
            </label>
            <input
              type="url"
              id="hero-image-url"
              value={heroImageUrlInput}
              onChange={(e) => setHeroImageUrlInput(e.target.value)}
              placeholder="Enter image URL (leave blank for default)"
              disabled={isUpdatingImage}
            />
            <small>
              Enter the full web address (URL). Saves on submit.
            </small>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn-save-settings"
              disabled={isUpdatingImage}
            >
              {isUpdatingImage ? 'Saving...' : 'Save Hero Image'}
            </button>
          </div>
        </form>
      </section>

      <hr className="section-divider" />

      <section className="pending-restaurants-section">
        <h2>Pending Restaurant Approvals</h2>
         {isLoading ? (
           <p>Loading applications...</p>
         ) : error ? (
           <p className="error-message">{error}</p>
         ) : pendingUsers.length === 0 ? (
           <p>No pending applications.</p>
         ) : (
           <ul className="pending-list">
             {pendingUsers.map(pendingUser => (
               <li key={pendingUser._id} className="pending-item">
                 <div className="pending-info">
                   <strong>User:</strong>
                   {' '}{pendingUser.username} ({pendingUser.email})
                   <br />
                   <strong>Requested Restaurant:</strong>
                   {' '}{pendingUser.pendingRestaurantDetails?.restaurantName || 'N/A'}
                   <br />
                   <strong>Address:</strong>
                   {pendingUser.pendingRestaurantDetails?.address ? (
                     ` ${pendingUser.pendingRestaurantDetails.address.street}, ${pendingUser.pendingRestaurantDetails.address.city}, ${pendingUser.pendingRestaurantDetails.address.state} ${pendingUser.pendingRestaurantDetails.address.zipCode}`
                   ) : ' N/A'}
                   <br />
                   <strong>Submitted:</strong>
                   {' '}{new Date(pendingUser.createdAt).toLocaleDateString()}
                 </div>
                 <div className="pending-actions">
                   {actionStatus[pendingUser._id] ? (
                     <span
                       className={`action-status ${actionStatus[pendingUser._id].startsWith('Error') ? 'error' : ''}`}
                     >
                       {actionStatus[pendingUser._id]}
                     </span>
                   ) : (
                     <>
                       <button
                         className="btn-approve"
                         onClick={() => handleApprove(pendingUser._id)}
                       >
                         Approve
                       </button>
                       <button
                         className="btn-reject"
                         onClick={() => handleReject(pendingUser._id)}
                       >
                         Reject
                       </button>
                     </>
                   )}
                 </div>
               </li>
             ))}
           </ul>
         )}
      </section>

    </div>
  );
};

export default AdminPage;