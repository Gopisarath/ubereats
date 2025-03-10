// verify-db.js - Check database connection and tables
require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  console.log('=== DATABASE VERIFICATION TOOL ===\n');
  console.log('Checking database configuration...\n');

  // Display database configuration (without password)
  console.log('Database Host:', process.env.DB_HOST || 'Not set (default: localhost)');
  console.log('Database Name:', process.env.DB_NAME || 'Not set');
  console.log('Database User:', process.env.DB_USER || 'Not set');
  console.log('Database Password:', process.env.DB_PASSWORD ? '******** (set)' : 'Not set');
  
  // Attempt to connect to the database
  let connection;
  try {
    console.log('\nAttempting to connect to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connected to MySQL server successfully!');
  } catch (error) {
    console.error('❌ Failed to connect to MySQL server:');
    console.error(error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your .env file for correct credentials');
    console.log('3. Run "npm run setup-db" to create the database');
    return;
  }

  // Check if tables exist
  try {
    console.log('\nChecking database tables...');
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?`, 
      [process.env.DB_NAME]
    );
    
    const tableNames = tables.map(t => t.TABLE_NAME || t.table_name);
    console.log(`Found ${tableNames.length} tables in the database:`);
    
    const expectedTables = [
      'users', 'customer_profiles', 'restaurant_profiles', 
      'dishes', 'orders', 'order_items', 'favorites'
    ];
    
    // Check each expected table
    for (const tableName of expectedTables) {
      const exists = tableNames.some(t => t.toLowerCase() === tableName.toLowerCase());
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    }
    
    // Check if all expected tables exist
    const missingTables = expectedTables.filter(
      t => !tableNames.some(name => name.toLowerCase() === t.toLowerCase())
    );
    
    if (missingTables.length > 0) {
      console.error('\n❌ Some tables are missing:');
      console.error(missingTables.join(', '));
      console.log('\nRun the database setup script:');
      console.log('npm run setup-db');
    } else {
      console.log('\n✅ All required tables exist!');
    }
    
    // Check user table
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count;
    console.log(`\nFound ${userCount} users in the database`);
    
    // If no users, suggest running the setup again
    if (userCount === 0) {
      console.log('\n⚠️ No users found in the database.');
      console.log('You may need to register a user.');
    } else {
      // List sample of restaurant users
      const [restaurants] = await connection.query(`
        SELECT id, name, email, role, created_at 
        FROM users 
        WHERE role = 'restaurant' 
        LIMIT 5
      `);
      
      if (restaurants.length > 0) {
        console.log('\nSample restaurant accounts:');
        restaurants.forEach(r => {
          console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking database tables:', error.message);
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

verifyDatabase();