import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRestaurantProfile } from '../services/restaurant';
import { getRestaurantOrders } from '../services/order';

const RestaurantDashboard = () => {
  const { currentUser } = useAuth();
  const [restaurantData, setRestaurantData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant profile
        const profileResponse = await getRestaurantProfile();
        setRestaurantData(profileResponse.data);
        
        // Fetch orders
        const ordersResponse = await getRestaurantOrders();
        const orders = ordersResponse.data;
        
        // Get recent orders (last 5)
        const sortedOrders = [...orders].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentOrders(sortedOrders.slice(0, 5));
        
        // Calculate stats
        const pendingOrders = orders.filter(order => 
          ['New', 'Preparing', 'On the Way', 'Ready for Pickup'].includes(order.status)
        ).length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
        
        setStats({
          totalOrders: orders.length,
          pendingOrders,
          revenue: totalRevenue
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container py-5 mt-5">
      <h1 className="mb-4">Welcome, {currentUser?.name || restaurantData?.name || 'Restaurant Owner'}</h1>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body">
                  <h5 className="card-title text-white">Total Orders</h5>
                  <h2 className="display-4 fw-bold text-white">{stats.totalOrders}</h2>
                  <p className="card-text text-muted">All-time orders</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body">
                  <h5 className="card-title text-white">Pending Orders</h5>
                  <h2 className="display-4 fw-bold text-white">{stats.pendingOrders}</h2>
                  <p className="card-text text-muted">Orders to be fulfilled</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body">
                  <h5 className="card-title text-white">Revenue</h5>
                  <h2 className="display-4 fw-bold text-white">${stats.revenue.toFixed(2)}</h2>
                  <p className="card-text text-muted">Total earnings</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Orders Section */}
          <div className="card bg-dark text-white mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/restaurant/orders" className="btn btn-outline-success btn-sm">View All Orders</Link>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customer_name}</td>
                          <td>{new Date(order.created_at).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'Delivered' ? 'bg-success' : 
                              order.status === 'On the Way' ? 'bg-primary' : 
                              order.status === 'Preparing' ? 'bg-warning' : 
                              order.status === 'Cancelled' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>${order.total_price.toFixed(2)}</td>
                          <td>
                            <Link to={`/restaurant/orders/${order.id}`} className="btn btn-outline-success btn-sm">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-list-check fs-1 mb-3"></i>
                  <h5 className="card-title">Manage Menu</h5>
                  <p className="card-text">Add, edit or remove dishes from your menu</p>
                  <Link to="/restaurant/menu" className="btn btn-success">Manage Menu</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-bag-check fs-1 mb-3"></i>
                  <h5 className="card-title">Manage Orders</h5>
                  <p className="card-text">View and update order statuses</p>
                  <Link to="/restaurant/orders" className="btn btn-success">Manage Orders</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-gear fs-1 mb-3"></i>
                  <h5 className="card-title">Profile Settings</h5>
                  <p className="card-text">Update your restaurant information</p>
                  <Link to="/restaurant/profile" className="btn btn-success">Edit Profile</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;