import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CustomerDashboard = () => {
  const { currentUser } = useAuth();
  const userName = currentUser?.name || 'John Doe';
  
  // State for hover effects
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredOrder, setHoveredOrder] = useState(null);
  
  // Stats data
  const stats = [
    { id: 'recent', icon: 'bi-receipt', value: 2, label: 'Recent Orders' },
    { id: 'favorites', icon: 'bi-heart', value: 2, label: 'Favorites' },
    { id: 'nearby', icon: 'bi-geo-alt', value: 3, label: 'Nearby Restaurants' }
  ];

  // Quick actions data
  const quickActions = [
    { 
      id: 'browse', 
      icon: 'bi-shop', 
      title: 'Browse Restaurants', 
      description: 'Discover new places to eat', 
      linkTo: '/restaurants', 
      buttonText: 'Explore' 
    },
    { 
      id: 'reorder', 
      icon: 'bi-arrow-repeat', 
      title: 'Reorder', 
      description: 'Quickly reorder your favorites', 
      linkTo: '/orders', 
      buttonText: 'My Orders' 
    },
    { 
      id: 'favorites', 
      icon: 'bi-heart', 
      title: 'Favorites', 
      description: 'View your saved restaurants', 
      linkTo: '/favorites', 
      buttonText: 'My Favorites' 
    },
    { 
      id: 'profile', 
      icon: 'bi-person', 
      title: 'My Profile', 
      description: 'Manage your account', 
      linkTo: '/profile', 
      buttonText: 'View Profile' 
    }
  ];

  // Recent orders data
  const recentOrders = [
    {
      id: '001',
      restaurant: 'Burger Palace',
      date: 'Wed, Mar 6',
      orderNumber: 'ORD#-001',
      status: 'Delivered'
    },
    {
      id: '002',
      restaurant: 'Pizza Heaven',
      date: 'Sun, Mar 2',
      orderNumber: 'ORD#-002',
      status: 'Delivered'
    }
  ];

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container py-5 mt-5">
        <div className="mb-4">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
            Hello, {userName}!
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#9CA3AF', marginBottom: '2rem' }}>
            What would you like to eat today?
          </p>
        </div>

        {/* Updated Search bar - expanded to take more width */}
        <div className="mb-5" style={{ maxWidth: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Search for restaurants..." 
              style={{ 
                width: '100%', 
                backgroundColor: '#121212', 
                border: '1px solid #333',
                borderRadius: '50px',
                padding: '15px 20px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <button 
              style={{ 
                position: 'absolute', 
                right: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                color: '#06C167',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row g-4 mb-5">
          {stats.map((stat) => (
            <div key={stat.id} className="col-md-4">
              <Link 
                to={stat.id === 'recent' ? '/orders' : stat.id === 'favorites' ? '/favorites' : '/restaurants'} 
                style={{ textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    backgroundColor: '#121212', 
                    border: hoveredCard === stat.id ? '1px solid #06C167' : '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    boxShadow: hoveredCard === stat.id ? '0 0 0 1px #06C167' : 'none'
                  }}
                  onMouseEnter={() => setHoveredCard(stat.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div 
                    style={{ 
                      marginRight: '15px',
                      color: '#06C167'
                    }}
                  >
                    <i className={`bi ${stat.icon}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                      {stat.value}
                    </div>
                    <div style={{ color: '#9CA3AF' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-5">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
            Quick Actions
          </h2>
          <div className="row g-4">
            {quickActions.map((action) => (
              <div key={action.id} className="col-md-6 col-lg-3">
                <div 
                  style={{ 
                    backgroundColor: '#121212', 
                    border: hoveredAction === action.id ? '1px solid #06C167' : '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    boxShadow: hoveredAction === action.id ? '0 0 0 1px #06C167' : 'none'
                  }}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <i className={`bi ${action.icon}`} style={{ 
                      fontSize: '2rem', 
                      color: '#06C167'
                    }}></i>
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {action.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#9CA3AF', 
                    textAlign: 'center', 
                    marginBottom: '1.5rem'
                  }}>
                    {action.description}
                  </p>
                  <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                    <Link 
                      to={action.linkTo} 
                      style={{ 
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#06C167',
                        color: 'white',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {action.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mb-5">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0', color: 'white' }}>
              Recent Orders
            </h2>
            <Link 
              to="/orders" 
              style={{ 
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '50px',
                padding: '0.375rem 1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#06C167';
                e.currentTarget.style.boxShadow = '0 0 0 1px #06C167';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All
            </Link>
          </div>
          
          {/* Recent Orders Cards */}
          <div className="row g-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="col-md-6">
                <div 
                  style={{ 
                    backgroundColor: '#121212', 
                    border: hoveredOrder === order.id ? '1px solid #06C167' : '1px solid #333',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    boxShadow: hoveredOrder === order.id ? '0 0 0 1px #06C167' : 'none'
                  }}
                  onMouseEnter={() => setHoveredOrder(order.id)}
                  onMouseLeave={() => setHoveredOrder(null)}
                >
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'white' }}>
                          {order.restaurant}
                        </h3>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: '0' }}>
                          {order.date} • {order.orderNumber}
                        </p>
                      </div>
                      <span style={{
                        backgroundColor: '#06C167',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      gap: '0.75rem',
                      marginTop: '1.25rem'
                    }}>
                      <Link
                        to={`/orders/${order.id}`}
                        style={{
                          flex: '1',
                          textAlign: 'center',
                          backgroundColor: '#06C167',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </Link>
                      <button
                        style={{
                          flex: '1',
                          backgroundColor: 'transparent',
                          border: '1px solid #333',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;