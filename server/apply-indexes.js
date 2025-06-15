const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyIndexes() {
  try {    // Database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'multismsdb'
    });

    console.log('Connected to database');

    // Read the SQL file
    const sqlFile = fs.readFileSync(path.join(__dirname, 'migrations', 'performance_indexes.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlFile.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await connection.execute(statement.trim());
        console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Index already exists:', statement.trim().substring(0, 50) + '...');
        } else {
          console.error('❌ Error executing:', statement.trim().substring(0, 50) + '...');
          console.error('Error:', error.message);
        }
      }
    }

    await connection.end();
    console.log('✅ All indexes applied successfully!');
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

applyIndexes();
