/**
 * Comprehensive database structure fix for finance module
 */

const db = require('./models');

async function fixDatabaseStructure() {
  try {
    console.log('Checking database structure...');
    
    // Fix payment_types table
    const [paymentTypesStructure] = await db.sequelize.query("DESCRIBE payment_types");
    console.log('Payment types structure:', paymentTypesStructure.map(col => col.Field));
    
    const hasIsActive = paymentTypesStructure.some(col => col.Field === 'is_active');
    const hasDescription = paymentTypesStructure.some(col => col.Field === 'description');
    const hasCreatedAt = paymentTypesStructure.some(col => col.Field === 'created_at');
    const hasUpdatedAt = paymentTypesStructure.some(col => col.Field === 'updated_at');
    
    if (!hasIsActive) {
      console.log('Adding is_active column to payment_types...');
      await db.sequelize.query(`
        ALTER TABLE payment_types 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
    }
    
    if (!hasDescription) {
      console.log('Adding description column to payment_types...');
      await db.sequelize.query(`
        ALTER TABLE payment_types 
        ADD COLUMN description TEXT
      `);
    }
    
    if (!hasCreatedAt) {
      console.log('Adding created_at column to payment_types...');
      await db.sequelize.query(`
        ALTER TABLE payment_types 
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
    }
    
    if (!hasUpdatedAt) {
      console.log('Adding updated_at column to payment_types...');
      await db.sequelize.query(`
        ALTER TABLE payment_types 
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
    
    console.log('Database structure fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database structure:', error);
    process.exit(1);
  }
}

fixDatabaseStructure();
