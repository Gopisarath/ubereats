import React, { useState } from 'react';

const MenuItem = ({ item, addToCart, restaurantId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Fallback image URL if the original fails to load
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  
  // Handle adding to cart with animation feedback
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate a short delay for animation
    setTimeout(() => {
      addToCart(item, restaurantId);
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="menu-item-card">
      <div className="img-container">
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="img-loading-state">
            <div className="spinner"></div>
          </div>
        )}
        
        {/* Image with fallback */}
        <img
          src={imageError ? fallbackImageUrl : item.imageUrl}
          className={`w-100 h-100 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          alt={item.name}
          style={{ objectFit: 'cover' }}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        
        {/* Price tag */}
        <div className="price-tag">
          ${item.price.toFixed(2)}
        </div>
        
        {/* Popular tag if applicable */}
        {item.isPopular && (
          <div className="popular-tag">
            <i className="bi bi-star-fill me-1"></i> Popular
          </div>
        )}
      </div>
      
      <div className="card-body">
        <h5 className="item-title">{item.name}</h5>
        
        {/* Truncate description with "show more" option */}
        {item.description && (
          <>
            {item.description.length > 80 && !showDetails ? (
              <p className="item-description">
                {item.description.substring(0, 80)}...{' '}
                <button 
                  className="btn btn-link btn-sm text-success p-0" 
                  onClick={() => setShowDetails(true)}
                  style={{ textDecoration: 'none' }}
                >
                  more
                </button>
              </p>
            ) : (
              <p className="item-description">
                {item.description}
                {item.description.length > 80 && (
                  <button 
                    className="btn btn-link btn-sm text-success p-0 ms-1" 
                    onClick={() => setShowDetails(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    less
                  </button>
                )}
              </p>
            )}
          </>
        )}
        
        {/* Dietary tags if available */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="dietary-tags">
            {item.dietary.map((tag, index) => (
              <span key={index} className="dietary-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Add to cart button */}
        <button
          className="add-to-cart-btn mt-auto"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MenuItem;