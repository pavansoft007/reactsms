/**
 * Class model for managing school classes
 * 
 * @module models/class.model
 */

module.exports = (sequelize, Sequelize) => {
  const Class = sequelize.define("classes", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Class name cannot be empty" },
        len: {
          args: [1, 100],
          msg: "Class name must be between 1 and 100 characters"
        }
      }
    },
    numeric_name: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Numeric representation of class (e.g. 1, 2, 3, etc.)"
    },
    branch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    rank_order: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Used for sorting classes in a specific order"
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
  Class.associate = (models) => {
    // Class belongs to a Branch
    Class.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });

    // Class has many Sections
    Class.hasMany(models.section, {
      foreignKey: 'class_id',
      as: 'sections'
    });
  };

  return Class;
};