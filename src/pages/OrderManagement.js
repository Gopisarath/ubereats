import React, { useState, useEffect } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../services/restaurant';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    // Fetch orders data
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const response = await getRestaurantOrders();
        const ordersData = response.data;
        
        // Transform API response to match component structure
        const orders = ordersData.map(order => ({
          id: order.id,
          customerName: order.customer_name,
          customerPhone: order.phone || '123-456-7890', // Default if not provided
          customerAddress: order.delivery_address,
          items: order.items || [],
          subtotal: calculateSubtotal(order.items),
          deliveryFee: 2.99, // Default if not provided
          tax: order.total_price * 0.0875, // Assuming 8.75% tax rate
          total: order.total_price,
          status: order.status,
          paymentMethod: 'Credit Card', // Default if not provided
          date: new Date(order.created_at).toLocaleString(),
          notes: order.notes || '',
        }));
        
        setOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        // Set empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Helper function to calculate subtotal from items
  const calculateSubtotal = (items) => {
    return items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  // Status options for filtering
  const statusOptions = ['all', 'New', 'Preparing', 'On the Way', 'Ready for Pickup', 'Delivered', 'Picked Up', 'Cancelled'];

  // Status options for updating
  const updateStatusOptions = ['New', 'Order Received', 'Preparing', 'On the Way', 'Ready for Pickup', 'Delivered', 'Picked Up', 'Cancelled'];

  // Filter orders based on active filter
  const filterOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status === activeFilter);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'bg-dark';
      case 'Order Received':
      case 'Preparing':
        return 'bg-info';
      case 'On the Way':
        return 'bg-primary';
      case 'Ready for Pickup':
        return 'bg-warning';
      case 'Delivered':
      case 'Picked Up':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateLoading(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // Call API to update status
      await updateOrderStatus(orderId, newStatus);
      
      // Update order status in the list
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);

      // Update selected order if it's open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setUpdateError('Failed to update order status. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setUpdateError(null);
      }, 3000);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const filteredOrders = filterOrders();

  return (
    <div className="container py-5">
      <h1 className="mb-4">Order Management</h1>
      
      {updateSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Order status updated successfully!
          <button type="button" className="btn-close" onClick={() => setUpdateSuccess(false)}></button>
        </div>
      )}
      
      {updateError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {updateError}
          <button type="button" className="btn-close" onClick={() => setUpdateError(null)}></button>
        </div>
      )}
      
      {/* Filter Tabs */}
      <ul className="nav nav-tabs mb-4">
        {statusOptions.map(status => (
          <li className="nav-item" key={status}>
            <button
              className={`nav-link ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              {status === 'all' ? 'All Orders' : status}
              {status !== 'all' && (
                <span className="badge bg-secondary ms-2">
                  {orders.filter(order => order.status === status).length}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      
      {/* Orders Table */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 text-secondary mb-3"></i>
          <h4>No orders found</h4>
          <p className="text-muted">
            {activeFilter === 'all'
              ? "You haven't received any orders yet."
              : `No ${activeFilter} orders found.`}
          </p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.date}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)} status-badge`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewOrder(order)}
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            title="Update status"
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                          <ul className="dropdown-menu">
                            {updateStatusOptions.map(status => (
                              <li key={status}>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUpdateStatus(order.id, status)}
                                  disabled={order.status === status || statusUpdateLoading}
                                >
                                  {status}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order #{selectedOrder.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Order Details</h6>
                    <p className="mb-1">
                      <strong>Date:</strong> {selectedOrder.date}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                    </p>
                    {selectedOrder.notes && (
                      <p className="mb-1">
                        <strong>Notes:</strong> {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {selectedOrder.customerName}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {selectedOrder.customerPhone}
                    </p>
                    <p className="mb-1">
                      <strong>Address:</strong> {selectedOrder.customerAddress}
                    </p>
                  </div>
                </div>
                
                <h6>Order Items</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">${item.price.toFixed(2)}</td>
                          <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="3" className="text-end">Subtotal</td>
                        <td className="text-end">${selectedOrder.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end">Delivery Fee</td>
                        <td className="text-end">${selectedOrder.deliveryFee.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end">Tax</td>
                        <td className="text-end">${selectedOrder.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Total</strong></td>
                        <td className="text-end"><strong>${selectedOrder.total.toFixed(2)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <h6>Update Order Status</h6>
                <div className="btn-group w-100">
                  {updateStatusOptions.map(status => (
                    <button
                      key={status}
                      className={`btn ${selectedOrder.status === status ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status || statusUpdateLoading}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;