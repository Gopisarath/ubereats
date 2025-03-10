// improved-debug.js - Enhanced debugging script with better error handling
const axios = require('axios');

// Configuration - Update these values to match your actual setup
const API_BASE_URL = 'http://localhost:3001/api';
const CREDENTIALS = {
  email: 'bawarchi@gmail.com',  // Use your restaurant account email
  password: '12345678'          // Correct password for Bawarchi account
};

// Helper function to make API calls with better error reporting
async function callApi(method, endpoint, data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`${method.toUpperCase()} ${url}`);
    
    const config = {
      method,
      url,
      data: method !== 'get' ? data : undefined,
      params: method === 'get' && data ? data : undefined,
      validateStatus: () => true, // Don't throw on any status code
    };
    
    const response = await axios(config);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } else {
      console.error('Error response:', response.status, JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is your server running on the correct port?');
    }
    return null;
  }
}

// Test server connection
async function testServerConnection() {
  console.log('\n=== TESTING SERVER CONNECTION ===\n');
  try {
    // Try to connect to the root endpoint
    console.log(`Testing connection to ${API_BASE_URL}...`);
    const response = await axios.get(API_BASE_URL.replace('/api', '/'), {
      validateStatus: () => true,
      timeout: 5000
    });
    console.log(`Server responded with status: ${response.status}`);
    return true;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Is your server running?');
    console.log(`2. Is it accessible at ${API_BASE_URL.replace('/api', '')}?`);
    console.log('3. Is the port correct?');
    return false;
  }
}

// Test user creation if login fails
async function createTestUser() {
  console.log('\n=== CREATING TEST USER ===\n');
  
  const userData = {
    name: 'Test Restaurant',
    email: CREDENTIALS.email,
    password: CREDENTIALS.password,
    role: 'restaurant',
    location: '123 Test Street',
    cuisine: 'Test Cuisine'
  };
  
  return await callApi('post', '/auth/signup', userData);
}

// Main debug function
async function runFullDebug() {
  console.log('=== UBEREATS API DEBUGGING SCRIPT (IMPROVED) ===\n');
  
  // First test if server is reachable
  const serverUp = await testServerConnection();
  if (!serverUp) {
    console.error('\nCan\'t proceed with tests until server is reachable.');
    return;
  }
  
  // Try to login
  console.log('\n=== TESTING AUTHENTICATION ===\n');
  console.log('1. Attempting login with:', CREDENTIALS.email);
  let loginResult = await callApi('post', '/auth/login', CREDENTIALS);
  
  // If login fails, try creating a test account and then login again
  if (!loginResult) {
    console.log('\nLogin failed. Attempting to create a test account...');
    const signupResult = await createTestUser();
    
    if (signupResult) {
      console.log('Test account created successfully. Trying login again...');
      loginResult = await callApi('post', '/auth/login', CREDENTIALS);
    }
  }
  
  if (!loginResult) {
    console.error('\nAuthentication failed. Debug can\'t proceed.');
    console.log('\nPossible solutions:');
    console.log('1. Check your database connection');
    console.log('2. Verify user credentials in the debug script');
    console.log('3. Check your auth routes for any issues');
    return;
  }
  
  // If login succeeded, test other endpoints
  console.log('\n=== TESTING CURRENT USER ===\n');
  const currentUser = await callApi('get', '/auth/current-user');
  
  console.log('\n=== TESTING RESTAURANT PROFILE ===\n');
  const profile = await callApi('get', '/restaurant/profile');
  
  console.log('\n=== TESTING RESTAURANT DISHES ===\n');
  const dishes = await callApi('get', '/restaurant/dishes');
  
  console.log('\n=== TESTING RESTAURANT ORDERS ===\n');
  const orders = await callApi('get', '/restaurant/orders');
  
  console.log('\n=== DEBUGGING SUMMARY ===\n');
  console.log('Authentication:', loginResult ? 'Success' : 'Failed');
  console.log('Current User:', currentUser ? 'Success' : 'Failed');
  console.log('Restaurant Profile:', profile ? 'Success' : 'Failed');
  console.log('Restaurant Dishes:', dishes ? 'Success' : 'Failed');
  console.log('Restaurant Orders:', orders ? 'Success' : 'Failed');
}

runFullDebug();