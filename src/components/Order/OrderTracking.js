import React, { useState, useEffect } from 'react';

const OrderTracking = ({ order }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [progress, setProgress] = useState(0);
  const [driverPosition, setDriverPosition] = useState({ lat: 0, lng: 0 });
  
  // Map status to progress percentage
  useEffect(() => {
    switch (currentStatus) {
      case 'Confirmed':
        setProgress(20);
        break;
      case 'Preparing':
        setProgress(40);
        break;
      case 'Ready for Pickup':
        setProgress(60);
        break;
      case 'On the Way':
        setProgress(80);
        break;
      case 'Delivered':
        setProgress(100);
        break;
      default:
        setProgress(0);
    }
  }, [currentStatus]);

  // Demo-only: This would be replaced with real-time updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStatus(order.status);
    }, 1000);
    
    // Simulate driver moving (for demo purposes)
    if (currentStatus === 'On the Way') {
      const movementInterval = setInterval(() => {
        setDriverPosition(prevPos => ({
          lat: prevPos.lat + (Math.random() * 0.001 - 0.0005),
          lng: prevPos.lng + (Math.random() * 0.001 - 0.0005),
        }));
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(movementInterval);
      };
    }
    
    return () => clearTimeout(timer);
  }, [order.status, currentStatus]);

  // Order status steps
  const steps = [
    { id: 'confirmed', label: 'Confirmed', icon: 'bi-check-circle', status: 'Confirmed' },
    { id: 'preparing', label: 'Preparing', icon: 'bi-fire', status: 'Preparing' },
    { id: 'ready', label: 'Ready', icon: 'bi-bag-check', status: 'Ready for Pickup' },
    { id: 'delivery', label: 'On the Way', icon: 'bi-truck', status: 'On the Way' },
    { id: 'delivered', label: 'Delivered', icon: 'bi-house-door', status: 'Delivered' }
  ];

  const getStepStatus = (step) => {
    const statusIndex = steps.findIndex(s => s.status === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === step.id);
    
    if (stepIndex < statusIndex) return 'completed';
    if (stepIndex === statusIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="order-tracking-container">
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-4">Track Your Order</h5>
          
          {/* Order ID and Estimated Time */}
          <div className="d-flex justify-content-between mb-4">
            <div>
              <small className="text-muted">Order #</small>
              <p className="mb-0 fw-bold">{order.id}</p>
            </div>
            <div className="text-end">
              <small className="text-muted">Estimated Arrival</small>
              <p className="mb-0 fw-bold">{order.estimatedDeliveryTime}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress mb-4" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${progress}%` }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          
          {/* Status Steps */}
          <div className="status-steps">
            <div className="row text-center">
              {steps.map((step) => {
                const status = getStepStatus(step);
                return (
                  <div className="col" key={step.id}>
                    <div className={`status-icon-container mb-2 ${status}`}>
                      <i className={`bi ${step.icon} status-icon`}></i>
                    </div>
                    <p className={`mb-0 small ${status === 'current' ? 'fw-bold' : ''}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Map View (if on the way) */}
          {currentStatus === 'On the Way' && order.deliveryPerson && (
            <div className="mt-4">
              <div className="order-map">
                {/* Map would be implemented here with real mapping library */}
                <div className="map-placeholder bg-light d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                  <div className="text-center">
                    <i className="bi bi-map fs-2 text-muted"></i>
                    <p className="text-muted mb-0">Live delivery tracking</p>
                  </div>
                </div>
              </div>
              
              <div className="delivery-details">
                <img
                  src={order.deliveryPerson.avatar || `https://ui-avatars.com/api/?name=${order.deliveryPerson.name}&background=06C167&color=fff`}
                  alt={order.deliveryPerson.name}
                  className="driver-avatar"
                />
                <div className="driver-info">
                  <div className="driver-name">{order.deliveryPerson.name}</div>
                  <div className="driver-vehicle">{order.deliveryPerson.vehicleInfo}</div>
                </div>
                <button className="btn btn-outline-success contact-button" aria-label="Call delivery person">
                  <i className="bi bi-telephone"></i>
                </button>
                <button className="btn btn-outline-success contact-button" aria-label="Message delivery person">
                  <i className="bi bi-chat"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Restaurant Info */}
          {['Confirmed', 'Preparing', 'Ready for Pickup'].includes(currentStatus) && (
            <div className="restaurant-info-delivery mt-4">
              <img
                src={order.restaurant.imageUrl || `https://ui-avatars.com/api/?name=${order.restaurant.name}&background=06C167&color=fff`}
                alt={order.restaurant.name}
                className="restaurant-logo"
              />
              <div className="flex-grow-1">
                <div className="restaurant-name">{order.restaurant.name}</div>
                <div className="order-items">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ${order.total.toFixed(2)}
                </div>
              </div>
              <button className="btn btn-outline-success contact-button" aria-label="Call restaurant">
                <i className="bi bi-telephone"></i>
              </button>
            </div>
          )}
          
          {/* Current Status Message */}
          <div className="current-status-message mt-4 text-center">
            {currentStatus === 'Confirmed' && (
              <p className="mb-0">Your order has been received! The restaurant will start preparing it soon.</p>
            )}
            {currentStatus === 'Preparing' && (
              <p className="mb-0">The restaurant is now preparing your delicious meal.</p>
            )}
            {currentStatus === 'Ready for Pickup' && (
              <p className="mb-0">Your order is ready! A delivery partner will pick it up soon.</p>
            )}
            {currentStatus === 'On the Way' && (
              <p className="mb-0">Your food is on the way! It will arrive at your doorstep soon.</p>
            )}
            {currentStatus === 'Delivered' && (
              <p className="mb-0">Your food has been delivered. Enjoy your meal!</p>
            )}
          </div>
          
          {/* Help Button */}
          <div className="text-center mt-4">
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-question-circle me-2"></i>
              Help with my order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;