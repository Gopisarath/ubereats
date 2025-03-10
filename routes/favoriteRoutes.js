const express = require('express');
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');
const router = express.Router();

// Get customer's favorite restaurants
router.get('/', auth.isCustomer, async (req, res, next) => {
  try {
    const customerId = req.session.userId;
    const favorites = await Favorite.findByCustomerId(customerId);
    
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

// Add restaurant to favorites
router.post('/:restaurantId', auth.isCustomer, async (req, res, next) => {
  try {
    const customerId = req.session.userId;
    const restaurantId = req.params.restaurantId;
    
    await Favorite.add(customerId, restaurantId);
    
    res.status(201).json({ message: 'Restaurant added to favorites' });
  } catch (error) {
    next(error);
  }
});

// Remove restaurant from favorites
router.delete('/:restaurantId', auth.isCustomer, async (req, res, next) => {
  try {
    const customerId = req.session.userId;
    const restaurantId = req.params.restaurantId;
    
    const success = await Favorite.remove(customerId, restaurantId);
    
    if (!success) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    res.json({ message: 'Restaurant removed from favorites' });
  } catch (error) {
    next(error);
  }
});

// Check if restaurant is favorite
router.get('/:restaurantId/check', auth.isCustomer, async (req, res, next) => {
  try {
    const customerId = req.session.userId;
    const restaurantId = req.params.restaurantId;
    
    const isFavorite = await Favorite.isFavorite(customerId, restaurantId);
    
    res.json({ isFavorite });
  } catch (error) {
    next(error);
  }
});

module.exports = router;