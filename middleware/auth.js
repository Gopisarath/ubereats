// auth.js - Updated authentication middleware with better debugging
// Replace the entire content of middleware/auth.js with this

const User = require('../models/User');

const authMiddleware = {
  // Ensure user is authenticated
  isAuth: (req, res, next) => {
    console.log('[Auth Check] Session ID:', req.session.id);
    console.log('[Auth Check] User ID:', req.session.userId);
    console.log('[Auth Check] User Role:', req.session.userRole);
    
    if (!req.session || !req.session.userId) {
      console.log('Authentication failed: No userId in session');
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    console.log(`User authenticated: ${req.session.userId} (${req.session.userRole})`);
    next();
  },

  // Ensure user is a customer
  isCustomer: (req, res, next) => {
    console.log('[Customer Auth Check] Session ID:', req.session.id);
    console.log('[Customer Auth Check] User ID:', req.session.userId);
    console.log('[Customer Auth Check] User Role:', req.session.userRole);
    
    if (!req.session || !req.session.userId) {
      console.log('Customer authentication failed: No userId in session');
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    if (req.session.userRole !== 'customer') {
      console.log(`Customer access denied for user role: ${req.session.userRole}`);
      return res.status(403).json({ message: 'Access denied. Customer access only.' });
    }
    
    console.log(`Customer authenticated: ${req.session.userId}`);
    next();
  },

  // Ensure user is a restaurant
  isRestaurant: async (req, res, next) => {
    console.log('[Restaurant Auth Check] Session ID:', req.session.id);
    console.log('[Restaurant Auth Check] User ID:', req.session.userId);
    console.log('[Restaurant Auth Check] User Role:', req.session.userRole);
    
    if (!req.session || !req.session.userId) {
      console.log('Restaurant authentication failed: No userId in session');
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    if (req.session.userRole !== 'restaurant') {
      console.log(`Restaurant access denied for user role: ${req.session.userRole}`);
      return res.status(403).json({ message: 'Access denied. Restaurant access only.' });
    }
    
    // Double-check the user exists in the database (extra validation)
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.log(`Restaurant authentication failed: User ${req.session.userId} not found in database`);
        req.session.destroy();
        return res.status(401).json({ message: 'User not found. Please log in again.' });
      }
      
      if (user.role !== 'restaurant') {
        console.log(`Restaurant access denied: User ${req.session.userId} has role ${user.role}`);
        return res.status(403).json({ message: 'Access denied. Restaurant access only.' });
      }
    } catch (error) {
      console.error('Error verifying restaurant user:', error);
      return res.status(500).json({ message: 'Authentication error. Please try again.' });
    }
    
    console.log(`Restaurant authenticated: ${req.session.userId}`);
    next();
  }
};

module.exports = authMiddleware;