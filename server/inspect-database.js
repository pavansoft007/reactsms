require('dotenv').config();
const db = require('./models');

async function inspectAndFixDatabase() {
  try {
    console.log('Starting database inspection...');

    // Check sections table structure
    const [sectionColumns] = await db.sequelize.query(`DESCRIBE sections`);
    console.log('Sections table columns:');
    console.log(sectionColumns);

    // Check foreign keys on sections table
    const [foreignKeys] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'sections'
      AND REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('Foreign keys on sections table:');
    console.log(foreignKeys);

    // List all constraints on sections table
    const [constraints] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'sections'
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('All constraints on sections table:');
    console.log(constraints);

    // Check if class_id column exists
    const hasClassIdColumn = sectionColumns.some(col => col.Field === 'class_id');
    
    if (hasClassIdColumn) {
      console.log('class_id column exists - attempting to drop it');
      
      // Drop all foreign keys first
      for (const fk of foreignKeys) {
        if (fk.COLUMN_NAME === 'class_id') {
          console.log(`Dropping foreign key: ${fk.CONSTRAINT_NAME}`);
          await db.sequelize.query(`
            ALTER TABLE sections DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
          `);
        }
      }
      
      console.log('Dropping class_id column');
      await db.sequelize.query(`ALTER TABLE sections DROP COLUMN class_id`);
    } else {
      console.log('class_id column does not exist in sections table');
    }

    // Check if removing class_id worked
    const [updatedColumns] = await db.sequelize.query(`DESCRIBE sections`);
    console.log('Updated sections table columns:');
    console.log(updatedColumns);

    console.log('Inspection and fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during inspection:', error);
    process.exit(1);
  }
}

inspectAndFixDatabase();
