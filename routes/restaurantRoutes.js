const express = require('express');
const User = require('../models/User');
const RestaurantProfile = require('../models/RestaurantProfile');
const Dish = require('../models/Dish');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// ===== PROTECTED RESTAURANT PROFILE ROUTES =====

// Get restaurant profile
router.get('/profile', auth.isRestaurant, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Getting profile for restaurant user ID: ${userId}`);
    
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      console.log(`No profile found, creating default profile for user ID: ${userId}`);
      await RestaurantProfile.create(userId, 'Not provided', 'Not provided');
      profile = await RestaurantProfile.findByUserId(userId);
      
      if (!profile) {
        console.error(`Failed to create restaurant profile for user ID: ${userId}`);
        return res.status(500).json({ message: 'Error creating restaurant profile' });
      }
    }
    
    const enhancedProfile = {
      ...profile,
      restaurantId: userId,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    console.log(`Successfully retrieved profile for ${user.name}`);
    res.json(enhancedProfile);
  } catch (error) {
    console.error('Restaurant profile error:', error);
    next(error);
  }
});

// Update restaurant profile
router.put('/profile', auth.isRestaurant, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Updating profile for restaurant ID: ${userId}`);
    const { description, location, cuisine, openTime, closeTime, deliveryFee, minOrder } = req.body;
    
    const profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      console.log(`No profile found, creating new profile for restaurant ID: ${userId}`);
      await RestaurantProfile.create(userId, location || 'Not provided', cuisine || 'Not provided');
      
      if (description || openTime || closeTime || deliveryFee || minOrder) {
        await RestaurantProfile.update(
          userId, description, null, null, openTime, closeTime, deliveryFee, minOrder
        );
      }
    } else {
      console.log(`Updating existing profile for restaurant ID: ${userId}`);
      const success = await RestaurantProfile.update(
        userId, description, location, cuisine, openTime, closeTime, deliveryFee, minOrder
      );
      
      if (!success) {
        console.error(`Failed to update profile for restaurant ID: ${userId}`);
        return res.status(500).json({ message: 'Failed to update profile' });
      }
    }
    
    console.log(`Profile updated successfully for restaurant ID: ${userId}`);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    next(error);
  }
});

// Upload restaurant image
router.post('/profile/image', auth.isRestaurant, upload.single('image'), async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Uploading image for restaurant ID: ${userId}`);
    
    if (!req.file) {
      console.error('No image file provided');
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const image = `/uploads/${req.file.filename}`;
    console.log(`Image path: ${image}`);
    
    const profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      console.log(`No profile found, creating new profile with image for restaurant ID: ${userId}`);
      await RestaurantProfile.create(userId, 'Not provided', 'Not provided');
    }
    
    const success = await RestaurantProfile.updateImage(userId, image);
    
    if (!success) {
      console.error(`Failed to update restaurant image for ID: ${userId}`);
      return res.status(500).json({ message: 'Failed to update restaurant image' });
    }
    
    console.log(`Restaurant image updated successfully for ID: ${userId}`);
    res.json({ 
      message: 'Restaurant image updated successfully',
      image
    });
  } catch (error) {
    console.error('Error uploading restaurant image:', error);
    next(error);
  }
});

// ===== PROTECTED RESTAURANT DISH ROUTES =====

// Get restaurant's dishes
router.get('/dishes', auth.isRestaurant, async (req, res, next) => {
  try {
    const restaurantId = req.session.userId;
    console.log(`Fetching dishes for restaurant ID: ${restaurantId}`);
    
    const dishes = await Dish.findByRestaurantId(restaurantId);
    console.log(`Found ${dishes.length} dishes for restaurant ID: ${restaurantId}`);
    
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching restaurant dishes:', error);
    next(error);
  }
});

// Add a new dish
router.post('/dishes', auth.isRestaurant, upload.single('image'), async (req, res, next) => {
  try {
    const restaurantId = req.session.userId;
    console.log(`Adding dish for restaurant ID: ${restaurantId}`);
    const { name, description, price, category } = req.body;
    
    if (!name || !description || !price || !category) {
      console.error('Missing required dish fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const dishId = await Dish.create(restaurantId, name, description, price, category, image);
    console.log(`Created new dish with ID: ${dishId}`);
    
    res.status(201).json({ 
      message: 'Dish added successfully',
      dishId
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    next(error);
  }
});

// Update dish
router.put('/dishes/:id', auth.isRestaurant, upload.single('image'), async (req, res, next) => {
  try {
    const dishId = req.params.id;
    const restaurantId = req.session.userId;
    console.log(`Updating dish ID: ${dishId} for restaurant ID: ${restaurantId}`);
    const { name, description, price, category, isAvailable } = req.body;
    
    if (!name || !description || !price || !category) {
      console.error('Missing required dish update fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const currentDish = await Dish.findById(dishId);
    
    if (!currentDish) {
      console.error(`Dish not found with ID: ${dishId}`);
      return res.status(404).json({ message: 'Dish not found' });
    }
    
    if (currentDish.restaurant_id !== restaurantId) {
      console.error(`Unauthorized dish access: Restaurant ${restaurantId} trying to update dish ${dishId} belonging to restaurant ${currentDish.restaurant_id}`);
      return res.status(403).json({ message: 'Unauthorized access to this dish' });
    }
    
    const image = req.file ? `/uploads/${req.file.filename}` : currentDish.image;
    
    const success = await Dish.update(
      dishId, name, description, price, category, image, isAvailable !== undefined ? isAvailable : true
    );
    
    if (!success) {
      console.error(`Failed to update dish ID: ${dishId}`);
      return res.status(500).json({ message: 'Failed to update dish' });
    }
    
    console.log(`Successfully updated dish ID: ${dishId}`);
    res.json({ message: 'Dish updated successfully' });
  } catch (error) {
    console.error('Error updating dish:', error);
    next(error);
  }
});

// Delete dish
router.delete('/dishes/:id', auth.isRestaurant, async (req, res, next) => {
  try {
    const dishId = req.params.id;
    const restaurantId = req.session.userId;
    console.log(`Deleting dish ID: ${dishId} for restaurant ID: ${restaurantId}`);
    
    const currentDish = await Dish.findById(dishId);
    
    if (!currentDish) {
      console.error(`Dish not found with ID: ${dishId}`);
      return res.status(404).json({ message: 'Dish not found' });
    }
    
    if (currentDish.restaurant_id !== restaurantId) {
      console.error(`Unauthorized dish deletion: Restaurant ${restaurantId} trying to delete dish ${dishId} belonging to restaurant ${currentDish.restaurant_id}`);
      return res.status(403).json({ message: 'Unauthorized access to this dish' });
    }
    
    const success = await Dish.delete(dishId);
    
    if (!success) {
      console.error(`Failed to delete dish ID: ${dishId}`);
      return res.status(500).json({ message: 'Failed to delete dish' });
    }
    
    console.log(`Successfully deleted dish ID: ${dishId}`);
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    console.error('Error deleting dish:', error);
    next(error);
  }
});

// ===== PROTECTED RESTAURANT ORDER ROUTES =====

// Get restaurant orders
router.get('/orders', auth.isRestaurant, async (req, res, next) => {
  try {
    const restaurantId = req.session.userId;
    const status = req.query.status;
    console.log(`Fetching orders for restaurant ID: ${restaurantId}${status ? ` with status: ${status}` : ''}`);
    
    let orders = await Order.findByRestaurantId(restaurantId);
    
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
    console.log(`Found ${orders.length} orders for restaurant ID: ${restaurantId}`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    next(error);
  }
});

// Update order status
router.put('/orders/:id/status', auth.isRestaurant, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const restaurantId = req.session.userId;
    const { status } = req.body;
    console.log(`Updating order ID: ${orderId} status to "${status}" for restaurant ID: ${restaurantId}`);
    
    if (!status) {
      console.error('No status provided for order update');
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.restaurant_id !== restaurantId) {
      console.error(`Unauthorized order access: Restaurant ${restaurantId} trying to update order ${orderId} belonging to restaurant ${order.restaurant_id}`);
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    const validStatuses = [
      'New', 'Order Received', 'Preparing', 'On the Way', 
      'Pick-up Ready', 'Delivered', 'Picked Up', 'Cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      console.error(`Invalid order status: ${status}`);
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const success = await Order.updateStatus(orderId, status);
    
    if (!success) {
      console.error(`Failed to update status for order ID: ${orderId}`);
      return res.status(500).json({ message: 'Failed to update order status' });
    }
    
    console.log(`Successfully updated status for order ID: ${orderId}`);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    next(error);
  }
});

// ===== PUBLIC RESTAURANT ROUTES =====

// Get all restaurants
router.get('/', async (req, res, next) => {
  try {
    const restaurants = await RestaurantProfile.getAll();
    console.log(`Returning ${restaurants.length} restaurants`);
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching all restaurants:', error);
    next(error);
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    console.log(`Looking up restaurant with ID: ${restaurantId}`);
    
    const user = await User.findById(restaurantId);
    if (!user || user.role !== 'restaurant') {
      console.log(`No restaurant user found with ID: ${restaurantId}`);
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    const restaurant = await RestaurantProfile.findByUserId(restaurantId);
    
    if (!restaurant) {
      console.log(`No restaurant profile found for user ID: ${restaurantId}`);
      return res.status(404).json({ message: 'Restaurant profile not found' });
    }
    
    console.log(`Found restaurant: ${user.name}`);
    res.json({
      ...restaurant,
      restaurantId: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    next(error);
  }
});

// Get restaurant menu
router.get('/:id/menu', async (req, res, next) => {
  try {
    const restaurantId = req.params.id;
    console.log(`Looking up menu for restaurant ID: ${restaurantId}`);
    
    const user = await User.findById(restaurantId);
    if (!user || user.role !== 'restaurant') {
      console.log(`No restaurant user found with ID: ${restaurantId}`);
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    const dishes = await Dish.findByRestaurantId(restaurantId);
    console.log(`Found ${dishes.length} dishes for restaurant ID: ${restaurantId}`);
    
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    next(error);
  }
});

module.exports = router;