import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true; // For cookies

// Request interceptor for debugging
axios.interceptors.request.use(config => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  if (config.data) {
    console.log('Request payload:', config.data);
  }
  return config;
});

// Response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`API Error: ${error.response?.status || 'Unknown'} ${error.response?.config?.url || 'Unknown URL'}`);
    console.error('Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Restaurant API service
const RestaurantAPI = {
  // Restaurant Profile Management
  
  /**
   * Get the current restaurant's profile
   * @returns {Promise<Object>} Restaurant profile data
   */
  getProfile: async () => {
    try {
      const response = await axios.get('/restaurant/profile');
      console.log('Fetched restaurant profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant profile:', error);
      throw error;
    }
  },

  /**
   * Update the restaurant's profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put('/restaurant/profile', profileData);
      console.log('Updated restaurant profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant profile:', error);
      throw error;
    }
  },

  /**
   * Upload restaurant profile image
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Response data with image URL
   */
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post('/restaurant/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Uploaded restaurant image:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading restaurant image:', error);
      throw error;
    }
  },

  // Dish Management

  /**
   * Get all dishes for the current restaurant
   * @returns {Promise<Array>} List of dishes
   */
  getDishes: async () => {
    try {
      const response = await axios.get('/restaurant/dishes');
      console.log('Fetched dishes:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }
  },

  /**
   * Add a new dish
   * @param {Object} dishData - Dish data including image
   * @returns {Promise<Object>} Created dish data
   */
  addDish: async (dishData) => {
    try {
      // Convert to FormData if not already
      let formData;
      if (dishData instanceof FormData) {
        formData = dishData;
      } else {
        formData = new FormData();
        Object.keys(dishData).forEach(key => {
          if (key === 'image' && dishData[key] instanceof File) {
            formData.append(key, dishData[key]);
          } else {
            formData.append(key, dishData[key]);
          }
        });
      }

      const response = await axios.post('/restaurant/dishes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Added new dish:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding dish:', error);
      throw error;
    }
  },

  /**
   * Update an existing dish
   * @param {string} id - Dish ID
   * @param {Object} dishData - Updated dish data
   * @returns {Promise<Object>} Updated dish data
   */
  updateDish: async (id, dishData) => {
    try {
      // Convert to FormData if not already
      let formData;
      if (dishData instanceof FormData) {
        formData = dishData;
      } else {
        formData = new FormData();
        Object.keys(dishData).forEach(key => {
          if (key === 'image' && dishData[key] instanceof File) {
            formData.append(key, dishData[key]);
          } else {
            formData.append(key, dishData[key]);
          }
        });
      }

      const response = await axios.put(`/restaurant/dishes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(`Updated dish ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating dish ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a dish
   * @param {string} id - Dish ID
   * @returns {Promise<Object>} Response data
   */
  deleteDish: async (id) => {
    try {
      const response = await axios.delete(`/restaurant/dishes/${id}`);
      console.log(`Deleted dish ${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting dish ${id}:`, error);
      throw error;
    }
  },

  // Order Management

  /**
   * Get orders for the restaurant
   * @param {string} [status] - Filter by order status
   * @returns {Promise<Array>} List of orders
   */
  getOrders: async (status) => {
    try {
      const url = status ? `/restaurant/orders?status=${status}` : '/restaurant/orders';
      const response = await axios.get(url);
      console.log('Fetched orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Response data
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`/restaurant/orders/${orderId}/status`, { status });
      console.log(`Updated order ${orderId} status to ${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },

  // Public Restaurant Information

  /**
   * Get all restaurants
   * @returns {Promise<Array>} List of restaurants
   */
  getAllRestaurants: async () => {
    try {
      const response = await axios.get('/restaurant');
      console.log('Fetched all restaurants:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all restaurants:', error);
      return [];
    }
  },

  /**
   * Get restaurant by ID
   * @param {string} id - Restaurant ID
   * @returns {Promise<Object>} Restaurant data
   */
  getRestaurantById: async (id) => {
    try {
      const response = await axios.get(`/restaurant/${id}`);
      console.log(`Fetched restaurant ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get restaurant menu
   * @param {string} id - Restaurant ID
   * @returns {Promise<Array>} List of dishes in the menu
   */
  getRestaurantMenu: async (id) => {
    try {
      const response = await axios.get(`/restaurant/${id}/menu`);
      console.log(`Fetched menu for restaurant ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching menu for restaurant ${id}:`, error);
      return [];
    }
  }
};

export default RestaurantAPI;