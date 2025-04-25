// src/pages/HomePage.js
import React, { useState, useEffect, useMemo } from 'react';
import './HomePage.css';
import { getAllRestaurants } from '../services/restaurantService';
import { getPublicSettings } from '../services/settingsService';
import { getAllCategories } from '../services/categoryService';
import RestaurantCard from '../components/Restaurants/RestaurantCard';

const HomePage = () => {
  // Data states
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // Loading states
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Error states
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);

  // UI state
  const [addressInput, setAddressInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Combined loading state for initial page view
  const isPageLoading = isLoadingRestaurants || isLoadingSettings || isLoadingCategories;

  // Effect 1: Fetch Initial Data (Restaurants, Settings, Categories)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingRestaurants(true);
      setIsLoadingSettings(true);
      setIsLoadingCategories(true);
      setError(null);
      setCategoryError(null);
      setCategories([]);

      try {
        console.log("HomePage: Fetching initial data...");
        const results = await Promise.allSettled([
            getAllRestaurants(),
            getPublicSettings(),
            getAllCategories()
        ]);

        // Process Restaurants
        if (results[0].status === 'fulfilled') {
            const restaurantsData = results[0].value;
            setAllRestaurants(restaurantsData || []);
            setFilteredRestaurants(restaurantsData || []);
            console.log(`HomePage: Found ${restaurantsData?.length || 0} total restaurants.`);
        } else {
            console.error("HomePage Error fetching restaurants:", results[0].reason);
            setError(results[0].reason?.message || 'Failed to load restaurants.');
            setAllRestaurants([]);
            setFilteredRestaurants([]);
        }
        setIsLoadingRestaurants(false);

        // Process Settings
        if (results[1].status === 'fulfilled') {
            const settingsData = results[1].value;
            if (settingsData && settingsData.heroImageUrl) {
                setHeroImageUrl(settingsData.heroImageUrl);
            } else {
                setHeroImageUrl('');
            }
        } else {
            console.error("HomePage Error fetching settings:", results[1].reason);
            setHeroImageUrl('');
        }
        setIsLoadingSettings(false);

        // Process Categories
        if (results[2].status === 'fulfilled') {
            const categoriesData = results[2].value;
            setCategories((categoriesData || []).sort((a, b) => a.name.localeCompare(b.name)));
            console.log(`HomePage: Found ${categoriesData?.length || 0} categories.`);
        } else {
            console.error("HomePage Error fetching categories:", results[2].reason);
            setCategoryError(results[2].reason?.message || 'Failed to load categories.');
            setCategories([]);
        }
        setIsLoadingCategories(false);

      } catch (overallError) {
          console.error("HomePage Error during initial data fetch:", overallError);
          setError('Failed to load page data.');
          setIsLoadingRestaurants(false);
          setIsLoadingSettings(false);
          setIsLoadingCategories(false);
      }
    };
    fetchInitialData();
  }, []); // Run only on initial mount

  // Effect 2: Filter restaurants
  useEffect(() => {
    if (!isLoadingRestaurants) {
        console.log("HomePage: Filtering by category:", selectedCategory);
        if (selectedCategory === null) {
            setFilteredRestaurants(allRestaurants);
        } else {
            const filtered = allRestaurants.filter(restaurant =>
                restaurant.cuisine?.some(c =>
                    c.trim().toLowerCase() === selectedCategory.toLowerCase()
                )
            );
            setFilteredRestaurants(filtered);
        }
    }
  }, [selectedCategory, allRestaurants, isLoadingRestaurants]);


  // --- Event Handlers ---
  const handleAddressChange = (event) => {
    setAddressInput(event.target.value);
  };

  const handleAddressSearch = () => {
    console.log(`Simulating search for address: ${addressInput}`);
    alert(`Address search not implemented yet. Searching for: "${addressInput}"`);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryName) => {
    console.log(`Category clicked: ${categoryName}`);
    setSelectedCategory(prevCategory =>
        prevCategory === categoryName ? null : categoryName
    );
  };

  return (
    <>
      <section
        className="hero-section"
        style={
          heroImageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${heroImageUrl})`,
              }
            : {}
        }
      >
        <div className="hero-content">
          <h1>Food you love, delivered.</h1>
          <div className="address-search-bar">
            <input
              type="text"
              placeholder="Enter delivery address (Simulation)"
              value={addressInput}
              onChange={handleAddressChange}
            />
            <button onClick={handleAddressSearch}>Find Food</button>
          </div>
        </div>
      </section>

      <main className="main-content">
        <section className="categories-section">
          <h2>Top Categories</h2>
          {isLoadingCategories ? (
            <p>Loading categories...</p>
          ) : categoryError ? (
            <p className="error-message">{categoryError}</p>
          ) : categories.length === 0 ? (
            <p>No categories available.</p>
          ) : (
            <div className="categories-container">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`category-card ${
                    selectedCategory === category.name ? 'active' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.name)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleCategoryClick(category.name)
                  }
                >
                  <div className="category-image-placeholder">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      loading="lazy"
                    />
                  </div>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
              {selectedCategory && (
                <button
                  className="category-item all-btn"
                  onClick={() => setSelectedCategory(null)}
                >
                  Show All Restaurants
                </button>
              )}
            </div>
          )}
        </section>

        <section className="restaurants-section">
          <h2>{selectedCategory || 'Featured'} Restaurants</h2>
          {isLoadingRestaurants ? (
            <div className="loading-indicator">
              <p>Loading restaurants...</p>
            </div>
          ) : error ? (
            <div className="error-message restaurants-error">
              <p>{error}</p>
            </div>
          ) : (
            <div className="restaurant-list-grid">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                  />
                ))
              ) : (
                <p>
                  {selectedCategory
                    ? `No restaurants found matching category: ${selectedCategory}.`
                    : 'No restaurants available at the moment.'}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default HomePage;