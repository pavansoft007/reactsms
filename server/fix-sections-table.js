require('dotenv').config();
const db = require('./models');

async function fixSectionTable() {
  try {
    console.log('Starting section table fix...');

    // Get constraints information
    const [foreignKeys] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'sections'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND TABLE_SCHEMA = DATABASE()
    `);

    console.log('Foreign key constraints:', foreignKeys);

    // Drop all foreign key constraints on sections table
    for (const fkObj of foreignKeys) {
      const constraintName = fkObj.CONSTRAINT_NAME;
      console.log(`Dropping foreign key constraint: ${constraintName}`);
      
      await db.sequelize.query(`
        ALTER TABLE sections DROP FOREIGN KEY ${constraintName}
      `);
    }

    // Recreate necessary foreign key constraints
    console.log('Recreating necessary foreign key constraints');
    
    // Check if branch_id exists
    const [branchIdColumn] = await db.sequelize.query(`
      SHOW COLUMNS FROM sections LIKE 'branch_id'
    `);
    
    if (branchIdColumn.length > 0) {
      console.log('Adding branch_id foreign key');
      await db.sequelize.query(`
        ALTER TABLE sections ADD CONSTRAINT fk_sections_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id)
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    }

    console.log('Section table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixSectionTable();
