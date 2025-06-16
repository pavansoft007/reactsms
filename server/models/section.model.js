/**
 * Section model for managing class sections
 * 
 * @module models/section.model
 */

module.exports = (sequelize, Sequelize) => {
  const Section = sequelize.define("sections", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Section name cannot be empty" },
        len: {
          args: [1, 50],
          msg: "Section name must be between 1 and 50 characters"
        }
      }
    },
    branch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Capacity must be an integer" },
        min: {
          args: [1],
          msg: "Capacity must be at least 1"
        },
        max: {
          args: [200],
          msg: "Capacity cannot exceed 200"
        }
      }
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        fields: ['branch_id']
      },
      {
        fields: ['name', 'branch_id'],
        unique: true
      }
    ]
  });

  // Add associations
  Section.associate = (models) => {
    // Section belongs to a Branch
    Section.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
  };

  return Section;
};