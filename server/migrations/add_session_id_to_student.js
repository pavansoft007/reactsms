module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('student', 'session_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1 // Set to a valid default or handle as needed
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('student', 'session_id');
  }
};
