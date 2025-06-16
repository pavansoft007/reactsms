'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('branches', 'logo_file', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Logo file name'
    });

    await queryInterface.addColumn('branches', 'text_logo', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Text logo file name'
    });

    await queryInterface.addColumn('branches', 'print_file', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Print header file name'
    });

    await queryInterface.addColumn('branches', 'report_card', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Report card template file name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('branches', 'logo_file');
    await queryInterface.removeColumn('branches', 'text_logo');
    await queryInterface.removeColumn('branches', 'print_file');
    await queryInterface.removeColumn('branches', 'report_card');
  }
};
