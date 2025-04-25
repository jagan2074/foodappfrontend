// src/pages/RestaurantDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById, getMenuItemsByRestaurant } from '../services/restaurantService';
import { useCart } from '../context/CartContext';
import '../pages/RestaurantDetailPage.css'; // Ensure CSS is imported

const RestaurantDetailPage = () => {
  const { restaurantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState(null);

  const { addItemToCart } = useCart();

  // Effect 1: Fetch Restaurant Details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!restaurantId) return;
      setIsLoadingDetails(true);
      setDetailsError(null);
      setMenuItems([]);
      setIsLoadingMenu(true);
      try {
        console.log(`DetailPage: Fetching details for ${restaurantId}`);
        const data = await getRestaurantById(restaurantId);
        setRestaurant(data);
        console.log(`DetailPage: Details received`, data?.name);
      } catch (err) {
        console.error(`DetailPage: Error fetching details ${restaurantId}:`, err);
        setDetailsError(err.message || 'Failed to load restaurant details.');
        setRestaurant(null);
        setIsLoadingMenu(false);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [restaurantId]);

  // Effect 2: Fetch Menu Items
  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurantId || isLoadingDetails || detailsError) {
        setIsLoadingMenu(false);
        return;
      }
      setMenuError(null);
      try {
        console.log(`DetailPage: Fetching menu for ${restaurantId}`);
        const data = await getMenuItemsByRestaurant(restaurantId);
        setMenuItems(data || []);
        console.log(`DetailPage: Found ${data?.length || 0} menu items.`);
      } catch (err) {
        console.error(`DetailPage: Error fetching menu ${restaurantId}:`, err);
        setMenuError(err.message || 'Failed to load menu.');
        setMenuItems([]);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    if (!isLoadingDetails && !detailsError) {
        fetchMenu();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, isLoadingDetails, detailsError]);


  // --- Render Loading/Error States ---
  if (isLoadingDetails) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading restaurant details...
      </div>
    );
  }
  if (detailsError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        Error: {detailsError}
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Restaurant not found.
      </div>
    );
  }

  // --- Helper Function to Render Menu Section ---
  const renderMenu = () => {
      if (isLoadingMenu) {
        return (
          <p style={{ textAlign: 'center', padding: '1rem' }}>
            Loading menu...
          </p>
        );
      }
      if (menuError) {
        return (
          <p style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>
            Error loading menu: {menuError}
          </p>
        );
      }
      if (!menuItems || menuItems.length === 0) {
        return (
          <p style={{ textAlign: 'center', padding: '1rem' }}>
            This restaurant hasn't added any menu items yet.
          </p>
        );
      }

      const groupedItems = menuItems.reduce((acc, item) => {
          if (item.isActive) {
             (acc[item.category] = acc[item.category] || []).push(item);
          }
          return acc;
      }, {});

      if (Object.keys(groupedItems).length === 0) {
           return (
             <p style={{ textAlign: 'center', padding: '1rem' }}>
               No active menu items available.
             </p>
           );
      }

      return Object.entries(groupedItems)
        .sort(([catA], [catB]) => catA.localeCompare(catB))
        .map(([category, items]) => (
          <section key={category} className="menu-category-section">
              <h3 className="menu-category-title">{category}</h3>
              <div className="menu-item-grid">
                {items
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(item => (
                    <article key={item._id} className="menu-item-card">
                      {item.imageUrl && (
                        <div className="menu-item-image-container">
                          <img src={item.imageUrl} alt={item.name} loading="lazy" />
                        </div>
                      )}
                      <div className="menu-item-content">
                        <strong className="menu-item-name">{item.name}</strong>
                        {item.description && (
                          <p className="menu-item-description">{item.description}</p>
                        )}
                      </div>
                      <div className="menu-item-footer">
                        <span className="menu-item-price">
                          {item.price.toFixed(2)}
                        </span>
                        <button
                          className="menu-item-add-button"
                          onClick={() => addItemToCart(item)}
                          type="button"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                ))}
              </div>
          </section>
      ));
  };

  // --- Main Component Render ---
  return (
    <div className="restaurant-detail-page">
      <div className="detail-header">
        <h1>{restaurant.name}</h1>
        <p style={{ color: '#555', fontSize: '1em', margin: '0.2rem 0 0.5rem 0' }}>
          {restaurant.cuisine?.join(' • ')} {restaurant.priceRange && `• {restaurant.priceRange}`}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9em', color: '#444'}}>
            {restaurant.rating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                 <span style={{ color: '#f5c518', marginRight: '3px' }}>★</span>
                 {restaurant.rating?.toFixed(1)}
                 <span style={{ color: '#777', marginLeft: '4px' }}>({restaurant.numberOfReviews} reviews)</span>
              </span>
            )}
            {restaurant.deliveryTimeMinutes && (
              <span>{restaurant.deliveryTimeMinutes} min</span>
            )}
            {restaurant.deliveryFee !== null && (
              <span>{restaurant.deliveryFee === 0 ? 'Free Delivery' : `${restaurant.deliveryFee.toFixed(2)} delivery`}</span>
            )}
        </div>
      </div>

      <section className="menu-section">
        <h2>Menu</h2>
        {renderMenu()}
      </section>

    </div>
  );
};

export default RestaurantDetailPage;