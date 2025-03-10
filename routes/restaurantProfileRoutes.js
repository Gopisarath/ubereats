// restaurantProfileRoutes.js - Create this file in your routes folder

const express = require('express');
const User = require('../models/User');
const RestaurantProfile = require('../models/RestaurantProfile');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get restaurant profile
router.get('/', auth.isRestaurant, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Getting profile for restaurant user ID: ${userId}`);
    
    // First, verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Found user: ${user.name}, fetching restaurant profile`);
    
    // Get or create the restaurant profile
    let profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      console.log(`No profile found, creating default profile for user ID: ${userId}`);
      // Create a default profile with minimal data
      try {
        await RestaurantProfile.create(userId, 'Not provided', 'Not provided');
        console.log(`Created default profile for user ID: ${userId}`);
      } catch (createError) {
        console.error(`Error creating profile: ${createError.message}`);
      }
      
      // Fetch the newly created profile
      profile = await RestaurantProfile.findByUserId(userId);
      
      if (!profile) {
        console.error(`Failed to create restaurant profile for user ID: ${userId}`);
        return res.status(500).json({ message: 'Error creating restaurant profile' });
      }
    }
    
    // Enhance the profile with user data
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
router.put('/', auth.isRestaurant, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Updating profile for restaurant ID: ${userId}`);
    const { description, location, cuisine, openTime, closeTime, deliveryFee, minOrder } = req.body;
    
    // Check if profile exists
    const profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      // Create profile if it doesn't exist
      console.log(`No profile found, creating new profile for restaurant ID: ${userId}`);
      await RestaurantProfile.create(userId, location || 'Not provided', cuisine || 'Not provided');
      
      // Update with additional details if provided
      if (description || openTime || closeTime || deliveryFee || minOrder) {
        await RestaurantProfile.update(
          userId, description, null, null, openTime, closeTime, deliveryFee, minOrder
        );
      }
    } else {
      // Update existing profile
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
router.post('/image', auth.isRestaurant, upload.single('image'), async (req, res, next) => {
  try {
    const userId = req.session.userId;
    console.log(`Uploading image for restaurant ID: ${userId}`);
    
    if (!req.file) {
      console.error('No image file provided');
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const image = `/uploads/${req.file.filename}`;
    console.log(`Image path: ${image}`);
    
    // Check if profile exists
    const profile = await RestaurantProfile.findByUserId(userId);
    
    if (!profile) {
      // Create profile if it doesn't exist
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

module.exports = router;