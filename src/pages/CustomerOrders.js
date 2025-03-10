import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerOrders } from '../services/customer';

const CustomerOrders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch orders data
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const response = await getCustomerOrders();
        
        // Transform API response to match component structure
        const orders = response.data.map(order => ({
          id: order.id,
          date: new Date(order.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: new Date(order.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: order.status,
          restaurant: {
            id: order.restaurant_id,
            name: order.restaurant_name
          },
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total_price
        }));
        
        setOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status === 'On the Way' || order.status === 'Preparing';
    if (activeTab === 'past') return order.status === 'Delivered' || order.status === 'Cancelled';
    return true;
  });

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success';
      case 'On the Way':
        return 'bg-primary';
      case 'Preparing':
        return 'bg-warning';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#FFF', paddingTop: '70px', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="py-4" style={{ marginBottom: '8px' }}>Your Orders</h1>
        
        {/* Tabs styled exactly like in screenshot 2 */}
        <div className="mb-3">
          <div className="d-flex" style={{ borderBottom: '1px solid #333' }}>
            <button 
              className={`border-0 py-3 px-4 ${activeTab === 'all' ? 'active' : ''}`} 
              onClick={() => setActiveTab('all')}
              style={{ 
                backgroundColor: 'transparent',
                color: activeTab === 'all' ? '#fff' : '#757575',
                borderBottom: activeTab === 'all' ? '2px solid #06C167' : 'none',
                fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                margin: 0,
                outline: 'none',
                position: 'relative',
                bottom: activeTab === 'all' ? '-1px' : '0'
              }}
            >
              All Orders
            </button>
            <button 
              className={`border-0 py-3 px-4 ${activeTab === 'active' ? 'active' : ''}`} 
              onClick={() => setActiveTab('active')}
              style={{ 
                backgroundColor: 'transparent',
                color: activeTab === 'active' ? '#fff' : '#757575',
                borderBottom: activeTab === 'active' ? '2px solid #06C167' : 'none',
                fontWeight: activeTab === 'active' ? 'bold' : 'normal',
                margin: 0,
                outline: 'none',
                position: 'relative',
                bottom: activeTab === 'active' ? '-1px' : '0'
              }}
            >
              Active Orders
            </button>
            <button 
              className={`border-0 py-3 px-4 ${activeTab === 'past' ? 'active' : ''}`} 
              onClick={() => setActiveTab('past')}
              style={{ 
                backgroundColor: 'transparent',
                color: activeTab === 'past' ? '#fff' : '#757575',
                borderBottom: activeTab === 'past' ? '2px solid #06C167' : 'none',
                fontWeight: activeTab === 'past' ? 'bold' : 'normal',
                margin: 0,
                outline: 'none',
                position: 'relative',
                bottom: activeTab === 'past' ? '-1px' : '0'
              }}
            >
              Past Orders
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Empty state
          <div className="text-center py-5">
            <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
            <h4 className="text-white">No orders found</h4>
            <p className="text-muted">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet." 
                : activeTab === 'active' 
                  ? "You don't have any active orders at the moment."
                  : "You don't have any past orders."}
            </p>
            <Link to="/restaurants" className="btn btn-success mt-2">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          // Orders list
          <div>
            {filteredOrders.map((order) => (
              <div key={order.id} className="mb-4">
                {/* Order header with ID, date, and status */}
                <div style={{ 
                  backgroundColor: '#121212', 
                  padding: '15px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}>
                  <div className="text-white-50">
                    Order #{order.id} • {order.date} at {order.time}
                  </div>
                  <span className="badge" style={{ 
                    backgroundColor: getStatusBadgeClass(order.status),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                {/* Order items */}
                <div style={{ backgroundColor: '#121212' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ 
                      padding: '15px 20px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      borderBottom: idx < order.items.length - 1 ? '1px solid #333333' : 'none'
                    }}>
                      <span className="text-white">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-white">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Order total */}
                  <div style={{ 
                    padding: '15px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid #333333',
                    fontWeight: 'bold'
                  }}>
                    <span className="text-white">Total</span>
                    <span className="text-white">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div style={{ 
                  padding: '15px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  backgroundColor: '#121212',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                }}>
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="btn"
                    style={{ 
                      backgroundColor: '#06C167', 
                      color: 'white', 
                      padding: '8px 16px',
                      borderRadius: '30px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/restaurants/${order.restaurant.id}`} 
                    className="btn"
                    style={{ 
                      border: '1px solid #ffffff', 
                      color: 'white', 
                      padding: '8px 16px',
                      borderRadius: '30px',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Order Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;