'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if teacher_id exists in sections table
    const columns = await queryInterface.describeTable('sections');
    if (columns.teacher_id) {
      // Remove teacher_id column
      await queryInterface.removeColumn('sections', 'teacher_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add teacher_id column back to sections table
    const columns = await queryInterface.describeTable('sections');
    if (!columns.teacher_id) {
      await queryInterface.addColumn('sections', 'teacher_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: "Class teacher/homeroom teacher ID (optional)"
      });
    }
  }
};
