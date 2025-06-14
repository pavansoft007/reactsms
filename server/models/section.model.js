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
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
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
    teacher_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'master_admins',
        key: 'id'
      },
      comment: "Class teacher/homeroom teacher ID"
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
        fields: ['class_id']
      },
      {
        fields: ['branch_id']
      },
      {
        fields: ['teacher_id']
      },
      {
        fields: ['name', 'class_id', 'branch_id'],
        unique: true
      }
    ]
  });

  // Add associations
  Section.associate = (models) => {
    // Section belongs to a Class
    Section.belongsTo(models.class, {
      foreignKey: 'class_id',
      as: 'class'
    });

    // Section belongs to a Branch
    Section.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });

    // Section belongs to a Teacher (User)
    Section.belongsTo(models.user, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });
  };

  return Section;
};