const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'multismsdb',
    port: process.env.DB_PORT || 3306,
    connectTimeout: 5000,
    acquireTimeout: 5000,
    timeout: 5000
  };

  console.log('Testing database connection with config:', {
    ...config,
    password: config.password ? '***' : '(empty)'
  });

  try {
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to MySQL database!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    // Check if database exists
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:', dbs.map(db => db.Database));
    
    // Check if our database exists
    const dbExists = dbs.some(db => db.Database === config.database);
    if (dbExists) {
      console.log(`✅ Database '${config.database}' exists`);
      
      // Switch to our database and show tables
      await connection.execute(`USE ${config.database}`);
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Tables in database:', tables);
    } else {
      console.log(`❌ Database '${config.database}' does not exist`);
      console.log('Creating database...');
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
      console.log(`✅ Created database '${config.database}'`);
    }
    
    await connection.end();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    if (error.code === 'ETIMEDOUT') {
      console.log('- Check if MySQL server is running');
      console.log('- Verify the host and port are correct');
      console.log('- Check firewall settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('- Verify username and password');
      console.log('- Check user permissions in MySQL');
    } else if (error.code === 'ENOTFOUND') {
      console.log('- Check if the host address is correct');
      console.log('- Verify DNS resolution');
    }
  }
}

// Load environment variables
require('dotenv').config();

testConnection();
