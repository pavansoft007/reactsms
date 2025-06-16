/**
 * Sections Allocation model for managing class-section assignments
 * 
 * @module models/sections_allocation.model
 */

module.exports = (sequelize, Sequelize) => {
  const SectionsAllocation = sequelize.define("sections_allocation", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    section_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'id'
      }
    }
  }, {
    tableName: 'sections_allocations', // Explicitly specify the table name
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['class_id', 'section_id']
      }
    ]
  });

  return SectionsAllocation;
};
