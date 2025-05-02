// src/components/Restaurants/RestaurantCard.js
import React from 'react';
import './RestaurantCard.css';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  // <<<--- 1. Log the received prop ---<<<
  console.log("RestaurantCard received prop:", restaurant);

  const navigate = useNavigate();

  // Destructure props safely
  const {
    _id,
    name = 'Restaurant Name',
    cuisine = [],
    imageUrl = '', // Default to empty string instead of placeholder URL
    rating = 0,
    numberOfReviews = 0,
    deliveryTimeMinutes = '--',
    deliveryFee = null,
    priceRange = ''
  } = restaurant || {};

  // <<<--- 2. Log the destructured imageUrl ---<<<
  console.log(`RestaurantCard: Image URL for ${name}:`, imageUrl);

  const cuisineStr = cuisine.join(', ');
  const deliveryFeeStr = (deliveryFee === null || deliveryFee === undefined)
    ? '' : deliveryFee === 0 ? 'Free Delivery' : `$${deliveryFee.toFixed(2)}`;
  const renderRatingStars = (ratingValue) => `★ ${ratingValue.toFixed(1)}`;

  // src/components/Restaurants/RestaurantCard.js
const handleCardClick = () => {
  if (_id) {
    // --- CHANGE HERE: Use plural 'restaurants' ---
    navigate(`/restaurants/${_id}`);
    // --- END CHANGE ---
  } else {
    console.error("Cannot navigate, restaurant ID missing.");
  }
};

  // Basic check if URL looks potentially valid (starts with http)
  const isValidImageUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http');

  return (
    <article className="restaurant-card" data-id={_id} tabIndex={0} onClick={handleCardClick}>
      <div className="restaurant-card-image">
        {/* 3. Conditionally render image only if URL seems valid */}
        {isValidImageUrl ? (
          <img src={imageUrl} alt={`Image of ${name}`} loading="lazy" />
        ) : (
          // Optional: Display a placeholder div if image URL is invalid/missing
          <div className="image-placeholder-fallback">No Image</div>
        )}
      </div>
      <div className="restaurant-card-content">
        <h3 className="restaurant-card-name">{name}</h3>
        {cuisineStr && <p className="restaurant-card-cuisine">{cuisineStr}</p>}
        <div className="restaurant-card-info-row">
          {rating > 0 && numberOfReviews > 0 && (
            <span className="info-item rating">
              {renderRatingStars(rating)} ({numberOfReviews})
            </span>
          )}
          {deliveryTimeMinutes !== '--' && (
            <span className="info-item delivery-time">
              {deliveryTimeMinutes} min
            </span>
          )}
          {priceRange && (
            <span className="info-item price-range">
              {priceRange}
            </span>
          )}
        </div>
        {deliveryFeeStr && (
          <div className="restaurant-card-delivery-fee">
            {deliveryFeeStr}
          </div>
        )}
      </div>
    </article>
  );
};

export default RestaurantCard;
