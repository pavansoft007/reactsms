const mysql = require('mysql2/promise');
require('dotenv').config();

async function simpleTest() {
  console.log('🔍 Testing different connection methods...\n');
  
  const configs = [
    {
      name: 'Standard localhost',
      config: {
        host: 'localhost',
        user: 'root',
        password: '',
        port: 3306,
        connectTimeout: 5000
      }
    },
    {
      name: 'IP 127.0.0.1',
      config: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        port: 3306,
        connectTimeout: 5000
      }
    },
    {
      name: 'With socketPath (if available)',
      config: {
        user: 'root',
        password: '',
        socketPath: '/tmp/mysql.sock',
        connectTimeout: 5000
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`📡 Testing: ${name}`);
    try {
      const connection = await mysql.createConnection(config);
      console.log(`✅ ${name}: SUCCESS!`);
      
      // Test a simple query
      const [result] = await connection.execute('SELECT VERSION() as version');
      console.log(`   MySQL Version: ${result[0].version}`);
      
      await connection.end();
      
      // If this works, let's check the database
      await testDatabase(config);
      break; // Stop at first successful connection
      
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
    }
  }
}

async function testDatabase(workingConfig) {
  console.log('\n🗄️  Testing database operations...');
  
  try {
    const connection = await mysql.createConnection(workingConfig);
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'multismsdb');
    
    if (!dbExists) {
      console.log('📝 Creating database multismsdb...');
      await connection.execute('CREATE DATABASE multismsdb');
      console.log('✅ Database created successfully!');
    } else {
      console.log('✅ Database multismsdb exists');
    }
    
    // Switch to the database
    await connection.execute('USE multismsdb');
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in database`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
  }
}

simpleTest();
