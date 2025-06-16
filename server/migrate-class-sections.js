require('dotenv').config();
const db = require('./models');

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');

    // Check if class_sections table already exists
    const [tables] = await db.sequelize.query(`
      SHOW TABLES LIKE 'class_sections'
    `);
    
    if (tables.length === 0) {
      // Create the class_sections table
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS class_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          class_id INT NOT NULL,
          section_id INT NOT NULL,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
          FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
          UNIQUE KEY unique_class_section (class_id, section_id)
        )
      `);
      console.log('Created class_sections table');
    } else {
      console.log('class_sections table already exists');
    }

    // Check if class_id exists in the sections table
    const [columnResults] = await db.sequelize.query(`
      SHOW COLUMNS FROM sections LIKE 'class_id'
    `);

    if (columnResults.length > 0) {
      // Transfer existing relationships to the join table
      console.log('Transferring existing class-section relationships...');
      await db.sequelize.query(`
        INSERT IGNORE INTO class_sections (class_id, section_id)
        SELECT class_id, id FROM sections WHERE class_id IS NOT NULL
      `);

      // Remove class_id from sections table
      console.log('Removing class_id column from sections table...');
      try {
        // Try to drop foreign key constraint if it exists
        await db.sequelize.query(`
          ALTER TABLE sections DROP FOREIGN KEY sections_ibfk_2
        `);
      } catch (error) {
        console.log('Foreign key constraint may not exist, continuing...');
      }
      
      try {
        // Try to drop the column
        await db.sequelize.query(`
          ALTER TABLE sections DROP COLUMN class_id
        `);
        console.log('Successfully removed class_id column');
      } catch (error) {
        console.error('Error removing class_id column:', error.message);
      }
    } else {
      console.log('class_id column not found in sections table');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
