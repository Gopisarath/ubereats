// browser-debug.js - Add this as a script in your browser console to debug API calls

// Function to test API endpoints from the browser
async function testBrowserApi() {
    console.log('=== BROWSER API TESTING TOOL ===');
    
    // 1. Test current user endpoint
    console.log('\nTesting current user...');
    try {
      const currentUserResponse = await fetch('http://localhost:3001/api/auth/current-user', {
        method: 'GET',
        credentials: 'include'
      });
      const currentUser = await currentUserResponse.json();
      console.log('Current user:', currentUser);
      
      if (!currentUser.authenticated) {
        console.error('❌ Not authenticated! Session is not being maintained');
      } else {
        console.log('✅ Authenticated as', currentUser);
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    }
    
    // 2. Test restaurant profile
    console.log('\nTesting restaurant profile...');
    try {
      const profileResponse = await fetch('http://localhost:3001/api/restaurant/profile', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Profile response status:', profileResponse.status);
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('Restaurant profile:', profile);
        console.log('✅ Profile retrieved successfully');
      } else {
        const errorText = await profileResponse.text();
        console.error('❌ Failed to get profile:', errorText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    
    // 3. Test restaurant dishes
    console.log('\nTesting restaurant dishes...');
    try {
      const dishesResponse = await fetch('http://localhost:3001/api/restaurant/dishes', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Dishes response status:', dishesResponse.status);
      
      if (dishesResponse.ok) {
        const dishes = await dishesResponse.json();
        console.log('Restaurant dishes:', dishes);
        console.log(`✅ Retrieved ${dishes.length} dishes`);
      } else {
        const errorText = await dishesResponse.text();
        console.error('❌ Failed to get dishes:', errorText);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
    
    // Log any cookies for the domain
    console.log('\nCurrent cookies:');
    console.log(document.cookie);
    
    console.log('\n=== API TESTING COMPLETE ===');
  }
  
  // Run the tests
  testBrowserApi();