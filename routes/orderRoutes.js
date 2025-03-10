const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get order by ID
router.get('/:id', auth.isAuth, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.userId;
    const userRole = req.session.userRole;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Ensure order belongs to user or restaurant
    if (userRole === 'customer' && order.customer_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    } else if (userRole === 'restaurant' && order.restaurant_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Update order status (accessible by restaurant)
router.put('/:id/status', auth.isRestaurant, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const restaurantId = req.session.userId;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Get current order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Ensure order belongs to restaurant
    if (order.restaurant_id !== restaurantId) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    const validStatuses = [
      'New', 'Order Received', 'Preparing', 'On the Way', 
      'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const success = await Order.updateStatus(orderId, status);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to update order status' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;