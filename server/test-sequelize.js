const { Sequelize } = require('sequelize');
require('dotenv').config();

// More robust database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'multismsdb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      connectTimeout: 20000, // 20 seconds
      acquireTimeout: 20000,
      timeout: 20000,
      // Try to establish connection without SSL first
      ssl: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
      handleDisconnects: true
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 5
    }
  }
);

async function testSequelizeConnection() {
  console.log('🔗 Testing Sequelize connection...');
  
  try {
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Test query successful:', results);
    
    // Try to sync (create tables if they don't exist)
    console.log('🔄 Attempting to sync database...');
    await sequelize.sync({ force: false });
    console.log('✅ Database sync successful!');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    // Provide specific error handling
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n💡 Connection Error Troubleshooting:');
      console.log('1. Check if MySQL server is running');
      console.log('2. Verify credentials in .env file');
      console.log('3. Check if the database exists');
      console.log('4. Verify firewall settings');
      console.log('5. Check MySQL configuration (my.cnf/my.ini)');
      
      // Try creating database if it doesn't exist
      console.log('\n🔧 Attempting to create database if it doesn\'t exist...');
      await createDatabaseIfNotExists();
    }
  } finally {
    await sequelize.close();
  }
}

async function createDatabaseIfNotExists() {
  const tempSequelize = new Sequelize('', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 20000,
      acquireTimeout: 20000,
      timeout: 20000,
    }
  });
  
  try {
    await tempSequelize.authenticate();
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'multismsdb';
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);
    
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
  } finally {
    await tempSequelize.close();
  }
}

testSequelizeConnection();
