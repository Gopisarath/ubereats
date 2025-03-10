import API from './config';

// Customer authentication
export const customerLogin = (credentials) => {
  return API.post('/auth/customer/login', credentials);
};

export const customerSignup = (userData) => {
  return API.post('/auth/customer/signup', userData);
};

// Restaurant authentication
export const restaurantLogin = (credentials) => {
  return API.post('/auth/restaurant/login', credentials);
};

export const restaurantSignup = (userData) => {
  return API.post('/auth/restaurant/signup', userData);
};

// Common authentication
export const logout = () => {
  return API.post('/auth/logout');
};

export const getCurrentUser = () => {
  return API.get('/auth/current-user');
};