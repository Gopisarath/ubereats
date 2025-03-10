import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, customerLogin, restaurantLogin, logout } from '../services/auth';

// Create a context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' or 'restaurant'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for current session on initial load
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        
        if (response.data.authenticated) {
          // If user is authenticated, fetch additional user info as needed
          setCurrentUser({
            id: response.data.userId,
            role: response.data.userRole
          });
          setUserType(response.data.userRole);
        } else {
          // Clear user state if not authenticated
          setCurrentUser(null);
          setUserType(null);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setError("Authentication error. Please try again.");
        // Clear user state on error
        setCurrentUser(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Customer login function
  const handleCustomerLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerLogin(credentials);
      const userData = response.data.user;
      
      setCurrentUser(userData);
      setUserType('customer');
      
      return userData;
    } catch (err) {
      console.error("Customer login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restaurant login function
  const handleRestaurantLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantLogin(credentials);
      const userData = response.data.user;
      
      setCurrentUser(userData);
      setUserType('restaurant');
      
      return userData;
    } catch (err) {
      console.error("Restaurant login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generic login success handler (for both customer and restaurant)
  const handleLoginSuccess = (userData, type) => {
    setCurrentUser(userData);
    setUserType(type);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      
      // Clear user data regardless of API success
      setCurrentUser(null);
      setUserType(null);
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear user data on error
      setCurrentUser(null);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  // Value object to be provided by the context
  const value = {
    currentUser,
    userType,
    isAuthenticated: !!currentUser,
    isCustomer: userType === 'customer',
    isRestaurant: userType === 'restaurant',
    loading,
    error,
    handleCustomerLogin,
    handleRestaurantLogin,
    handleLoginSuccess,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;