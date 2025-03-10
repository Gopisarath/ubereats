import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getRestaurantById, getRestaurantMenu } from '../services/restaurant';
import { addFavoriteRestaurant, removeFavoriteRestaurant, checkIsFavorite } from '../services/customer';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { cart, addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch restaurant details and menu
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantResponse = await getRestaurantById(id);
        const restaurantData = restaurantResponse.data;
        
        // Check if restaurant is in favorites
        let isFav = false;
        try {
          const favoriteResponse = await checkIsFavorite(id);
          isFav = favoriteResponse.data.isFavorite;
        } catch (error) {
          console.error('Error checking favorite status:', error);
          // Continue even if favorite check fails
        }
        
        // Fetch restaurant menu
        const menuResponse = await getRestaurantMenu(id);
        const menuData = menuResponse.data;
        
        // Transform the restaurant data to match component structure
        const restaurant = {
          id: parseInt(id),
          name: restaurantData.name,
          cuisine: restaurantData.cuisine || 'Various',
          rating: restaurantData.rating || 4.5, // Default if not provided
          reviewCount: restaurantData.review_count || 100, // Default if not provided
          deliveryTime: restaurantData.delivery_time || '15-25 min', // Default if not provided
          deliveryFee: restaurantData.delivery_fee || 2.99,
          minOrder: restaurantData.min_order || 10,
          address: restaurantData.location || '123 Main St, San Jose, CA 95112',
          phone: restaurantData.phone || '(123) 456-7890',
          hours: restaurantData.hours || 'Mon-Sun: 11:00 AM - 10:00 PM',
          description: restaurantData.description || 'Delicious food served with care.',
          imageUrl: restaurantData.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=800&q=80',
          isFavorite: isFav,
        };
        
        // Transform the menu data
        const menu = menuData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          category: item.category || 'Other',
          imageUrl: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=500&q=80',
          isPopular: item.is_popular || false, // Default if not provided
          dietary: item.dietary || [] // Default if not provided
        }));
        
        // Extract menu categories
        const categories = ['all', ...new Set(menu.map(item => item.category))];
        
        setRestaurant(restaurant);
        setMenu(menu);
        setMenuCategories(categories);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);
  
  // Handle adding item to cart
  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      restaurantName: restaurant.name,
      customizations: item.dietary || []
    }, restaurant.id);
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      setIsFavorite(!isFavorite);
      
      if (isFavorite) {
        await removeFavoriteRestaurant(restaurant.id);
      } else {
        await addFavoriteRestaurant(restaurant.id);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setIsFavorite(!isFavorite); // Revert on error
    }
  };
  
  // Filter menu items based on active category
  const displayedMenu = activeCategory === 'all'
    ? menu
    : menu.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        {/* Loading content */}
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle fs-1 text-danger mb-3"></i>
          <h2>Restaurant Not Found</h2>
          <p className="text-muted mb-4">The restaurant you're looking for doesn't exist or has been removed.</p>
          <Link to="/restaurants" className="btn btn-success">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Restaurant Hero Banner */}
      <div 
        className="restaurant-banner position-relative fade-in"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${restaurant.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '350px',
          marginTop: '56px' // Adjust based on navbar height
        }}
      >
        <div className="container h-100 d-flex align-items-end">
          <div className="text-white pb-4">
            <h1 className="fw-bold mb-2">{restaurant.name}</h1>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
              <span className="bg-dark bg-opacity-50 px-3 py-1 rounded-pill">{restaurant.cuisine}</span>
              <span className="d-flex align-items-center bg-dark bg-opacity-50 px-3 py-1 rounded-pill">
                <i className="bi bi-star-fill text-warning me-1"></i>
                {restaurant.rating} ({restaurant.reviewCount} reviews)
              </span>
              <span className="bg-dark bg-opacity-50 px-3 py-1 rounded-pill">
                <i className="bi bi-clock me-1"></i>
                {restaurant.deliveryTime}
              </span>
            </div>
            <p className="mb-0 bg-dark bg-opacity-50 d-inline-block px-3 py-1 rounded-pill">
              ${restaurant.deliveryFee.toFixed(2)} delivery fee • ${restaurant.minOrder} minimum
            </p>
          </div>
        </div>
      </div>
      
      <div className="container py-4">
        <div className="row">
          {/* Sidebar - Restaurant Info */}
          <div className="col-lg-3 mb-4 mb-lg-0 fade-in">
            <div className="glass-card mb-4 sticky-top" style={{ top: '80px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Restaurant Info</h5>
                  <button 
                    className={`favorite-button btn btn-sm btn-outline-success rounded-circle ${isFavorite ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Address</h6>
                  <p className="mb-0">{restaurant.address}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Hours</h6>
                  <p className="mb-0">{restaurant.hours}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Phone</h6>
                  <p className="mb-0">{restaurant.phone}</p>
                </div>
                
                <div>
                  <h6 className="fw-bold">Description</h6>
                  <p className="mb-0">{restaurant.description}</p>
                </div>
              </div>
            </div>
            
            {/* Cart Preview if items in cart */}
            {cart.items.length > 0 && cart.restaurantId === parseInt(id) && (
              <div className="glass-card sticky-top mt-3" style={{ top: '440px' }}>
                <div className="card-body">
                  <h5 className="card-title">Your Order</h5>
                  <ul className="list-group list-group-flush mb-3">
                    {cart.items.slice(0, 3).map(item => (
                      <li key={item.id} className="list-group-item bg-transparent px-0 d-flex justify-content-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    {cart.items.length > 3 && (
                      <li className="list-group-item bg-transparent px-0 text-center text-muted">
                        +{cart.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                  <Link to="/cart" className="btn btn-success w-100">
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content - Menu */}
          <div className="col-lg-9">
            {/* Menu Categories */}
            <div className="mb-4 overflow-auto bg-dark p-3 rounded sticky-top shadow-sm fade-in" style={{ zIndex: 990, top: '56px' }}>
              <div className="d-flex">
                {menuCategories.map(category => (
                  <button
                    key={category}
                    className={`btn ${activeCategory === category ? 'btn-success' : 'btn-outline-light'} me-2 flex-shrink-0`}
                    onClick={() => setActiveCategory(category)}
                  >
                    <span className="fw-bold">{category === 'all' ? 'All Items' : category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category Header (if not showing all) */}
            {activeCategory !== 'all' && (
              <h2 className="text-white fw-bold mb-4 border-bottom border-success pb-2">
                {activeCategory}
              </h2>
            )}
            
            {/* Menu Items */}
            <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 g-4 fade-in">
              {displayedMenu.map(item => (
                <div key={item.id} className="col">
                  <div className="card bg-dark border-secondary h-100 hover-effect">
                    <div className="row g-0 h-100">
                      <div className="col-md-8">
                        <div className="card-body d-flex flex-column h-100">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title text-white">{item.name}</h5>
                            <span className="badge bg-success px-2 py-1 fs-6">${item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="mb-2">
                            {item.isPopular && (
                              <span className="badge bg-warning text-dark me-1">
                                <i className="bi bi-star-fill me-1"></i>
                                Popular
                              </span>
                            )}
                            {item.dietary && item.dietary.map(diet => (
                              <span key={diet} className="badge bg-secondary me-1">{diet}</span>
                            ))}
                          </div>
                          
                          <p className="card-text text-muted mb-3">{item.description}</p>
                          
                          <button 
                            className="btn btn-success mt-auto"
                            onClick={() => handleAddToCart(item)}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-md-4 p-0 d-flex align-items-stretch">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="img-fluid rounded-end h-100 w-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;