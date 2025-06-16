/**
 * Student Category model for managing student categories
 * 
 * @module models/studentCategory.model
 */

module.exports = (sequelize, Sequelize) => {
  const StudentCategory = sequelize.define("student_category", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Category name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Category name must be between 2 and 255 characters"
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
    }
  }, {
    tableName: 'student_category',
    timestamps: false,
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
  StudentCategory.associate = (models) => {
    // StudentCategory belongs to a Branch
    StudentCategory.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });

    // Branch has many StudentCategories
    models.branch.hasMany(StudentCategory, {
      foreignKey: 'branch_id',
      as: 'studentCategories'
    });
  };

  return StudentCategory;
};
