import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/common/RestaurantCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { getAllRestaurants } from '../services/restaurant';
import { getFavoriteRestaurants } from '../services/customer';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [cuisineFilters, setCuisineFilters] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const searchRef = useRef(null);

  // Auto-focus search input when component loads
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Fetch restaurants data
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        
        // Fetch all restaurants
        const response = await getAllRestaurants();
        
        // Fetch favorite restaurants to determine which ones are favorites
        let favorites = [];
        try {
          const favoritesResponse = await getFavoriteRestaurants();
          favorites = favoritesResponse.data.map(fav => fav.restaurant_id);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          // Continue even if favorites fail to load
        }
        
        // Transform the API response to match our component's expected format
        const restaurantList = response.data.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine || 'Various',
          rating: restaurant.rating || 4.5, // Default rating if not provided by API
          reviewCount: restaurant.review_count || 100, // Default review count if not provided
          deliveryTime: restaurant.delivery_time || '15-30 min', // Default delivery time if not provided
          deliveryFee: restaurant.delivery_fee || 2.99,
          minOrder: restaurant.min_order || 10,
          isOpen: restaurant.is_open !== false, // Default to open if not provided
          imageUrl: restaurant.image || 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&w=500&q=80',
          isFavorite: favorites.includes(restaurant.id),
          priceRange: restaurant.price_range || '$$', // Default price range if not provided
          promos: restaurant.promotions || []
        }));
        
        // Extract unique cuisines for filtering
        const cuisines = [...new Set(restaurantList.map(restaurant => restaurant.cuisine))];
        
        setRestaurants(restaurantList);
        setFilteredRestaurants(restaurantList);
        setCuisineFilters(cuisines);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter and sort restaurants whenever filters change
  useEffect(() => {
    let results = [...restaurants];
    
    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      results = results.filter(restaurant => restaurant.cuisine === selectedCuisine);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        restaurant => 
          restaurant.name.toLowerCase().includes(query) || 
          restaurant.cuisine.toLowerCase().includes(query)
      );
    }
    
    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery_time':
        // Sort by the minimum time in the range (e.g., "15-25 min" becomes 15)
        results.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0]);
          const bTime = parseInt(b.deliveryTime.split('-')[0]);
          return aTime - bTime;
        });
        break;
      case 'delivery_fee':
        results.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      case 'min_order':
        results.sort((a, b) => a.minOrder - b.minOrder);
        break;
      default: // 'recommended'
        // No additional sorting needed
        break;
    }
    
    setFilteredRestaurants(results);
  }, [restaurants, selectedCuisine, searchQuery, sortBy]);

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setRestaurants(prevRestaurants => 
      prevRestaurants.map(restaurant => 
        restaurant.id === id 
          ? { ...restaurant, isFavorite: !restaurant.isFavorite } 
          : restaurant
      )
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCuisine('all');
    setSearchQuery('');
    setSortBy('recommended');
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container py-5 mt-5">
      <h1 className="fw-bold mb-4 fade-in">Restaurants</h1>
      
      {/* Search and Filter Section */}
      <div className="card shadow-sm mb-4 fade-in">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="search-bar">
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0"
                  placeholder="Search restaurants or cuisines..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  ref={searchRef}
                  aria-label="Search restaurants"
                />
                <button className="btn">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
            
            <div className="col-md-3">
              <select 
                className="form-select form-select-lg" 
                value={selectedCuisine} 
                onChange={(e) => setSelectedCuisine(e.target.value)}
                aria-label="Filter by cuisine"
              >
                <option value="all">All Cuisines</option>
                {cuisineFilters.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <select 
                className="form-select form-select-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort restaurants"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="delivery_time">Fastest Delivery</option>
                <option value="delivery_fee">Lowest Delivery Fee</option>
                <option value="min_order">Lowest Minimum Order</option>
              </select>
            </div>
            
            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <div className="btn-group" role="group" aria-label="View mode">
                <button 
                  type="button" 
                  className={`btn btn-outline-secondary ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                  aria-label="Grid view"
                >
                  <i className="bi bi-grid"></i>
                </button>
                <button 
                  type="button" 
                  className={`btn btn-outline-secondary ${view === 'list' ? 'active' : ''}`}
                  onClick={() => setView('list')}
                  aria-label="List view"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Active filters */}
          {(selectedCuisine !== 'all' || searchQuery || sortBy !== 'recommended') && (
            <div className="mt-3 d-flex align-items-center">
              <span className="me-2">Active filters:</span>
              {selectedCuisine !== 'all' && (
                <span className="badge bg-success me-2">
                  {selectedCuisine}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => setSelectedCuisine('all')}
                    aria-label="Clear cuisine filter"
                    style={{ fontSize: '0.5rem' }}
                  ></button>
                </span>
              )}
              {searchQuery && (
                <span className="badge bg-success me-2">
                  "{searchQuery}"
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    style={{ fontSize: '0.5rem' }}
                  ></button>
                </span>
              )}
              {sortBy !== 'recommended' && (
                <span className="badge bg-success me-2">
                  Sorted by: {sortBy.replace('_', ' ')}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => setSortBy('recommended')}
                    aria-label="Clear sort"
                    style={{ fontSize: '0.5rem' }}
                  ></button>
                </span>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary ms-auto"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Results Section */}
      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="col-md-6 col-lg-4 col-xl-3 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <SkeletonLoader type="restaurant-card" />
            </div>
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-5 fade-in">
          <i className="bi bi-search fs-1 text-muted mb-3"></i>
          <h3>No restaurants found</h3>
          <p className="text-muted mb-4">
            Try adjusting your filters or search query
          </p>
          <button className="btn btn-success" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4 fade-in">Found {filteredRestaurants.length} restaurants</p>
          
          <div className={view === 'grid' ? 'row g-4' : 'row'}>
            {filteredRestaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id} 
                className={view === 'grid' ? 'col-md-6 col-lg-4 col-xl-3 fade-in' : 'col-12 mb-4 fade-in'} 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RestaurantCard 
                  restaurant={restaurant}
                  toggleFavorite={toggleFavorite}
                  listView={view === 'list'}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantList;