'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('sections');
      if (columns.class_id) {
        await queryInterface.removeColumn('sections', 'class_id');
        console.log('class_id column removed successfully.');
      } else {
        console.log('class_id column does not exist, skipping removal.');
      }
    } catch (error) {
      console.error('Error checking or removing class_id column:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Add class_id back to sections table
    const columns = await queryInterface.describeTable('sections');
    if (!columns.class_id) {
      await queryInterface.addColumn('sections', 'class_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id'
        }
      });
      
      // 2. Move relationships back from join table to sections table
      const relationships = await queryInterface.sequelize.query(
        'SELECT class_id, section_id FROM class_sections',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Update each section with its class_id
      for (const rel of relationships) {
        await queryInterface.sequelize.query(
          `UPDATE sections SET class_id = ${rel.class_id} WHERE id = ${rel.section_id}`
        );
      }
    }
  }
};
