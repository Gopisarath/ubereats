const express = require('express');
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const RestaurantProfile = require('../models/RestaurantProfile');
const router = express.Router();

// Register user
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role, location, cuisine, phone, ownerName } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Validate restaurant-specific fields
    if (role === 'restaurant') {
      if (!location || !cuisine) {
        return res.status(400).json({ message: 'Location and cuisine are required for restaurants' });
      }
    }
    
    // Create user
    const userId = await User.create(name, email, password, role);
    
    // Create profile based on role
    if (role === 'customer') {
      await CustomerProfile.create(userId);
      // If phone is provided, update the profile
      if (phone) {
        await CustomerProfile.update(userId, phone, null, null, null, null);
      }
    } else if (role === 'restaurant') {
      // Create restaurant profile with location and cuisine
      await RestaurantProfile.create(userId, location, cuisine);
      
      // If we have additional restaurant details, update the profile
      if (phone || ownerName) {
        const description = `Owned by ${ownerName || 'Owner'}`;
        await RestaurantProfile.update(userId, description, null, null, null, null, null, null);
      }
    }
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if roles match if role is specified
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid account type. Please use the ${role} login option.` });
    }
    
    // Verify password
    const isValid = await User.validatePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/current-user', (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }
  
  res.json({
    authenticated: true,
    userId: req.session.userId,
    userRole: req.session.userRole
  });
});

module.exports = router;