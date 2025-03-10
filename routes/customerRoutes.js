const express = require('express');
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite'); // Import Favorite model instead of redefining it
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get customer profile
router.get('/profile', auth.isCustomer, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const profile = await CustomerProfile.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Update customer profile
router.put('/profile', auth.isCustomer, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { phone, address, country, state, city } = req.body;
    
    const success = await CustomerProfile.update(userId, phone, address, country, state, city);
    
    if (!success) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Upload profile picture
router.post('/profile/picture', auth.isCustomer, upload.single('image'), async (req, res, next) => {
  try {
    const userId = req.session.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const profilePicture = `/uploads/${req.file.filename}`;
    const success = await CustomerProfile.updateProfilePicture(userId, profilePicture);
    
    if (!success) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture
    });
  } catch (error) {
    next(error);
  }
});

// Get customer orders
router.get('/orders', auth.isCustomer, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const orders = await Order.findByCustomerId(userId);
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Place a new order
router.post('/orders', auth.isCustomer, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { restaurantId, deliveryAddress, items, totalPrice } = req.body;
    
    if (!restaurantId || !items || !items.length || !totalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const orderId = await Order.create(userId, restaurantId, totalPrice, deliveryAddress, items);
    
    res.status(201).json({ 
      message: 'Order placed successfully',
      orderId
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;