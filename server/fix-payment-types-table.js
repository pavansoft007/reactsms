/**
 * Fix payment_types table structure
 */

const db = require('./models');

async function fixPaymentTypesTable() {
  try {
    console.log('Checking payment_types table structure...');
    
    // First, let's check if the table exists and get its structure
    const [results] = await db.sequelize.query("DESCRIBE payment_types");
    console.log('Current table structure:', results);
    
    // Check if is_active column exists
    const hasIsActive = results.some(col => col.Field === 'is_active');
    
    if (!hasIsActive) {
      console.log('Adding is_active column...');
      await db.sequelize.query(`
        ALTER TABLE payment_types 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
      console.log('is_active column added successfully');
    } else {
      console.log('is_active column already exists');
    }
    
    console.log('Payment types table structure fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing payment_types table:', error);
    process.exit(1);
  }
}

fixPaymentTypesTable();
