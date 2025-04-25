// src/components/Restaurants/RestaurantCard.js
import React from 'react';
import './RestaurantCard.css';
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom';
// import { IoStar } from 'react-icons/io5';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate(); // 2. Initialize navigate hook

  const {
    _id, name = 'Restaurant Name', cuisine = [], imageUrl = '...',
    rating = 0, numberOfReviews = 0, deliveryTimeMinutes = '--',
    deliveryFee = null, priceRange = ''
  } = restaurant || {};

  const cuisineStr = cuisine.join(', ');
  const deliveryFeeStr = (deliveryFee === null || deliveryFee === undefined)
                         ? '' : deliveryFee === 0 ? 'Free Delivery' : `$${deliveryFee.toFixed(2)}`;
  const renderRatingStars = (ratingValue) => `★ ${ratingValue.toFixed(1)}`;

  // 3. Handle card click
  const handleCardClick = () => {
    if (_id) {
      navigate(`/restaurants/${_id}`); // Navigate to the detail page URL
    } else {
      console.error("Cannot navigate, restaurant ID is missing.");
    }
  };

  return (
    // 4. Add onClick handler to the main element
    <article className="restaurant-card" data-id={_id} tabIndex={0} onClick={handleCardClick}>
      <div className="restaurant-card-image">
        <img src={imageUrl} alt={`Image of ${name}`} loading="lazy" />
      </div>
      <div className="restaurant-card-content">
        <h3 className="restaurant-card-name">{name}</h3>
        {cuisineStr && <p className="restaurant-card-cuisine">{cuisineStr}</p>}
        <div className="restaurant-card-info-row">
          {rating > 0 && numberOfReviews > 0 && ( <span className="info-item rating"> {renderRatingStars(rating)} ({numberOfReviews}) </span> )}
          {deliveryTimeMinutes !== '--' && ( <span className="info-item delivery-time"> {deliveryTimeMinutes} min </span> )}
          {priceRange && ( <span className="info-item price-range"> {priceRange} </span> )}
        </div>
         {deliveryFeeStr && ( <div className="restaurant-card-delivery-fee"> {deliveryFeeStr} </div> )}
      </div>
    </article>
  );
};

export default RestaurantCard;