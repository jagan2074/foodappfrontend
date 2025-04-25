// src/pages/RestaurantDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMenuItemsByRestaurant,
  addMenuItem,
  updateMenuItem, // Make sure this is imported
  deleteMenuItem  // Make sure this is imported
} from '../services/menuItemService';
import './HomePage.css'; // Assuming styles are here

const RestaurantDashboard = () => {
  const { user, isAuthLoading } = useAuth();
  const restaurantId = user?.managedRestaurant;

  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState(null); // Error specifically for fetching/displaying menu

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemIsActive, setItemIsActive] = useState(true);
  const [itemImageUrl, setItemImageUrl] = useState('');

  // Action States
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for Add/Update
  const [submitError, setSubmitError] = useState(null);   // Error state for Add/Update form
  // Consider separate loading/error states per item for delete if needed

  // Fetch Menu Items Logic (using useCallback)
  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setMenuItems([]); // Clear if no ID
      return;
    }
    setIsLoadingMenu(true);
    setMenuError(null); // Clear previous menu errors before fetching
    try {
      console.log(`Dashboard: Fetching menu for restaurant ${restaurantId}`);
      const data = await getMenuItemsByRestaurant(restaurantId);
      setMenuItems(data || []);
      console.log("Dashboard: Menu items loaded:", data ? data.length : 0);
    } catch (err) {
      console.error("Dashboard Error fetching menu:", err);
      setMenuError(err.message || 'Failed to load menu items.');
      setMenuItems([]);
    } finally {
      setIsLoadingMenu(false);
    }
  }, [restaurantId]); // Re-run only if restaurantId changes

  // Initial data fetch
  useEffect(() => {
    if (!isAuthLoading && user?.role === 'restaurant' && restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId, isAuthLoading, user, fetchMenuItems]); // Correct dependencies

  // Clear form state
  const clearForm = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setItemName('');
    setItemPrice('');
    setItemCategory('');
    setItemDescription('');
    setItemIsActive(true);
    setItemImageUrl('');
    setSubmitError(null); // Also clear submit error on cancel/clear
  };

  // Handle Add or Update Submission
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous submit errors

    // --- Validation ---
    if (!itemName.trim() || !itemPrice.trim() || !itemCategory.trim()) {
      setSubmitError('Name, Price, and Category are required.');
      return;
    }
    const priceValue = parseFloat(itemPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      setSubmitError('Please enter a valid non-negative price.');
      return;
    }
    // Optional URL validation
    if (itemImageUrl.trim() && !itemImageUrl.startsWith('http')) {
        setSubmitError('Please enter a valid URL (starting with http/https) for the image.');
        return;
    }

    setIsSubmitting(true);
    const itemData = {
      name: itemName.trim(),
      price: priceValue,
      category: itemCategory.trim(),
      description: itemDescription.trim(),
      isActive: itemIsActive, // Include active status for both add/edit
      // Send imageUrl only if it's not empty, otherwise let backend handle default/removal
      imageUrl: itemImageUrl.trim() ? itemImageUrl.trim() : undefined,
    };

    // <<< ADD LOG >>>
    console.log("Dashboard Component: handleItemSubmit called.", {
        isEditing,
        currentItemId,
        itemData
    });

    try {
      if (isEditing && currentItemId) {
        // --- Update Logic ---
        console.log(`Dashboard Component: Calling updateMenuItem service with:`, {
            restaurantId,
            currentItemId,
            itemData
        });
        await updateMenuItem(restaurantId, currentItemId, itemData);
        console.log("Dashboard Component: updateMenuItem service call finished.");
        // alert('Item updated!'); // Use less intrusive feedback later
      } else {
        // --- Add Logic ---
        console.log(`Dashboard Component: Calling addMenuItem service with:`, {
            restaurantId,
            itemData
        });
        await addMenuItem(restaurantId, itemData);
        console.log("Dashboard Component: addMenuItem service call finished.");
        // alert('Item added!'); // Use less intrusive feedback later
      }
      fetchMenuItems(); // Refresh the list on success
      clearForm(); // Reset the form on success
    } catch (err) {
      console.error(`Dashboard Error ${isEditing ? 'updating' : 'adding'} item:`, err);
      setSubmitError(err.message || `Failed to ${isEditing ? 'update' : 'add'} menu item.`);
    } finally {
      setIsSubmitting(false); // Stop loading indicator
    }
  };

  // Populate form for editing
  const handleEditClick = (item) => {
    console.log("Editing item:", item);
    setIsEditing(true);
    setCurrentItemId(item._id);
    setItemName(item.name);
    setItemPrice(item.price.toString()); // Input type number expects string
    setItemCategory(item.category);
    setItemDescription(item.description || '');
    setItemIsActive(item.isActive);
    setItemImageUrl(item.imageUrl || '');
    setSubmitError(null); // Clear any previous form errors
    // Scroll to form
    const formElement = document.getElementById('item-form-section');
    if (formElement) {
        window.scrollTo({ top: formElement.offsetTop - 80, behavior: 'smooth' });
    }
  };

  // Handle item deletion
  const handleDeleteClick = async (itemId) => {
    if (!window.confirm(`Are you sure you want to permanently delete this menu item?`)) {
      return;
    }
    // Consider adding item-specific loading/disabled state here
    try {
      console.log(`Dashboard: Deleting menu item ${itemId}`);
      await deleteMenuItem(restaurantId, itemId);
      // alert('Item deleted!'); // Use less intrusive feedback later
      fetchMenuItems(); // Refresh the list
    } catch (err) {
      console.error(`Dashboard Error deleting item ${itemId}:`, err);
      // Display delete error more prominently?
      setMenuError(err.message || 'Failed to delete menu item.');
    }
  };

  // Helper function to render the list of menu items
  const renderMenuContent = () => {
    if (isLoadingMenu) return <p>Loading menu...</p>;
    // Display menu fetch error clearly
    if (menuError) return <p className="error-message">Error loading menu: {menuError}</p>;
    if (!menuItems || menuItems.length === 0) return <p>No menu items have been added yet.</p>;

    // Group items by category
    const groupedItems = menuItems.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {});

    // Render category groups
    return Object.entries(groupedItems)
      .sort(([catA], [catB]) => catA.localeCompare(catB)) // Sort categories
      .map(([category, items]) => (
        <div key={category} className="menu-category-group">
          <h4>{category}</h4>
          <ul className="menu-item-list">
            {items
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort items within category
              .map(item => (
                <li
                  key={item._id}
                  // Apply class if item is inactive
                  className={`menu-item ${!item.isActive ? 'inactive' : ''}`}
                >
                  {/* Display Item Image if available */}
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="menu-item-list-image"/>
                  )}
                  <div className="item-info">
                    <span className="item-name">
                      {item.name} {!item.isActive && '(Hidden)'}
                    </span>
                    {item.description && (
                      <span className="item-description">{item.description}</span>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="item-actions">
                     <span className="item-price">${item.price.toFixed(2)}</span>
                     <button
                       className="btn-edit"
                       onClick={() => handleEditClick(item)}
                       disabled={isSubmitting} // Disable if form is busy
                     >
                       Edit
                     </button>
                     <button
                       className="btn-delete"
                       onClick={() => handleDeleteClick(item._id)}
                       disabled={isSubmitting} // Disable if form is busy
                     >
                       Delete
                     </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ));
  };

  // --- Render Logic for Page ---

  // Show loading state while verifying auth
  if (isAuthLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading User Data...
      </div>
    );
  }

  // Show access denied if not a restaurant owner
  if (!user || user.role !== 'restaurant') {
      return (
        <div className="admin-page-error"> {/* Reuse admin error style? */ }
          Access Denied. Not a restaurant owner.
        </div>
      );
  }

  // Show error if user is owner but no restaurant is linked
   if (!restaurantId) {
       return (
         <div className="admin-page-error">
           Error: No managed restaurant linked. Contact support.
         </div>
       );
   }

  // --- Main Component Render ---
  return (
    <div className="restaurant-dashboard">
      <h1>Restaurant Dashboard</h1>
      <p>Welcome, {user.username}!</p>
      {/* Optional: Display restaurant name after fetching details */ }
      {/* <p>Managing: Restaurant Name Here</p> */ }

      <hr className="section-divider" />

      {/* --- Menu Management Section --- */ }
      <section className="dashboard-section">
        <h2>Menu Management</h2>
        {/* Render the list/loading/error states */ }
        <div className='menu-list-container'>
            {renderMenuContent()}
        </div>

        <hr className="section-divider" />

        {/* Add/Edit Item Form Section */ }
        <div id="item-form-section" className="add-item-form-container">
            <h3>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
            <form onSubmit={handleItemSubmit} className="add-item-form">
                {/* Display form submission errors */ }
                {submitError && <p className="error-message">{submitError}</p>}

                {/* Row 1: Name & Price */ }
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor='item-name'>Name*</label>
                        <input
                          type='text'
                          id='item-name'
                          value={itemName}
                          onChange={e => setItemName(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor='item-price'>Price*</label>
                        <input
                          type='number'
                          id='item-price'
                          value={itemPrice}
                          onChange={e => setItemPrice(e.target.value)}
                          step="0.01"
                          min="0"
                          required
                          disabled={isSubmitting}
                          placeholder="e.g., 12.99"
                         />
                    </div>
                </div>

                {/* Row 2: Category */ }
                <div className="form-group">
                    <label htmlFor='item-category'>Category*</label>
                    <input
                      type='text'
                      id='item-category'
                      value={itemCategory}
                      onChange={e => setItemCategory(e.target.value)}
                      required
                      disabled={isSubmitting}
                      placeholder='e.g., Appetizer, Main Course, Drinks'
                     />
                </div>

                {/* Row 3: Description */ }
                <div className="form-group">
                    <label htmlFor='item-description'>Description (Optional)</label>
                    <textarea
                      id='item-description'
                      value={itemDescription}
                      onChange={e => setItemDescription(e.target.value)}
                      disabled={isSubmitting}
                      rows={3}
                      placeholder="Describe the item..."
                    />
                </div>

                 {/* Row 4: Image URL */ }
                <div className="form-group">
                  <label htmlFor='item-image'>Image URL (Optional)</label>
                  <input
                    type='url' // Use type=url for basic validation
                    id='item-image'
                    value={itemImageUrl}
                    onChange={e => setItemImageUrl(e.target.value)}
                    disabled={isSubmitting}
                    placeholder='https://example.com/image.jpg'
                  />
                </div>

                 {/* Row 5: Active Status Toggle (Only show when Editing) */ }
                {isEditing && (
                     <div className="form-group toggle-active">
                         <label htmlFor="item-active">
                             <input
                                 type="checkbox"
                                 id="item-active"
                                 checked={itemIsActive}
                                 onChange={(e) => setItemIsActive(e.target.checked)}
                                 disabled={isSubmitting}
                             />
                             Item is Active (Visible to Customers)
                         </label>
                     </div>
                )}

                {/* Row 6: Form Actions */ }
                <div className="form-actions">
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className="submit-btn add-item-btn"
                    >
                        {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : '+ Add Item')}
                    </button>
                    {/* Show Cancel button only when editing */ }
                    {isEditing && (
                        <button
                          type="button" // Important: type="button" to prevent form submission
                          onClick={clearForm} // Reset form on cancel
                          className="cancel-btn"
                          disabled={isSubmitting}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>
        </div>
      </section>
      {/* --- End Menu Management --- */ }

      {/* Placeholder Sections */ }
      <hr className="section-divider" />
      <section className="dashboard-section">
        <h2>Restaurant Details</h2>
        <p>[Edit Restaurant Details Form - Coming Soon]</p>
      </section>
      <hr className="section-divider" />
      <section className="dashboard-section">
        <h2>Orders</h2>
        <p>[View Incoming Orders - Coming Soon]</p>
      </section>
    </div>
  );
};

export default RestaurantDashboard;