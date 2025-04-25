// src/components/Restaurants/RestaurantCard.js

import React from 'react';
import './RestaurantCard.css';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  console.log("RestaurantCard received prop:", restaurant);

  const navigate = useNavigate();

  const {
    _id,
    name = '',
    location = '',
    cuisine = '',
    imageUrl = '',
    rating = '',
    deliveryTime = '',
    priceRange = '',
  } = restaurant || {};

  console.log(`RestaurantCard: Image URL for ${name}:`, imageUrl);

  const isValidImageUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http');
  console.log(`RestaurantCard: Image URL "${imageUrl}" is valid?`, isValidImageUrl);

  const handleCardClick = () => {
    navigate(`/restaurant/${_id}`);
  };

  return (
    <article className="restaurant-card" onClick={handleCardClick}>
      <div className="restaurant-card-image">
        {isValidImageUrl ? (
          <img
            src={imageUrl}
            alt={`Image of ${name}`}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder-fallback">
            No Image
          </div>
        )}
      </div>

      <div className="restaurant-card-content">
        <h2 className="restaurant-name">{name}</h2>
        <p className="restaurant-location">{location}</p>
        <p className="restaurant-cuisine">{cuisine}</p>
        <div className="restaurant-card-meta">
          <span className="restaurant-rating">⭐ {rating}</span>
          <span className="restaurant-delivery-time">⏱ {deliveryTime}</span>
          <span className="restaurant-price">{priceRange}</span>
        </div>
      </div>
    </article>
  );
};

export default RestaurantCard;
