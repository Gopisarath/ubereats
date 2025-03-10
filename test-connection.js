// test-connection.js - Simple script to test if the API server is running
const axios = require('axios');

// API endpoint to test
const API_URL = 'http://localhost:3001';

async function testApiConnection() {
  console.log(`Testing connection to ${API_URL}...`);
  
  try {
    // Try to connect to the root endpoint
    const response = await axios.get(API_URL, {
      timeout: 5000
    });
    
    console.log('✅ API server is running!');
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Server might not be running.');
      console.log('\nMake sure to start your server with:');
      console.log('npm start');
      console.log('or');
      console.log('node server.js');
    } else {
      console.error('Error details:', error.message);
    }
    
    return false;
  }
}

// Test API endpoints
async function testEndpoints() {
  // Only proceed if the server is running
  const serverRunning = await testApiConnection();
  if (!serverRunning) return;
  
  console.log('\nTesting API endpoints...');
  
  const endpoints = [
    '/api/auth/current-user',
    '/api-docs',
    '/api/debug/session'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${API_URL}${endpoint}...`);
      const response = await axios.get(`${API_URL}${endpoint}`, {
        validateStatus: () => true,
        timeout: 5000
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error(`Failed to access ${endpoint}:`, error.message);
    }
  }
}

// Run the tests
testEndpoints();