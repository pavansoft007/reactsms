/**
 * Branch model for managing school branches
 * 
 * @module models/branch.model
 */

module.exports = (sequelize, Sequelize) => {
  const Branch = sequelize.define("branches", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Branch name cannot be empty" },
        len: {
          args: [2, 100],
          msg: "Branch name must be between 2 and 100 characters"
        }
      }
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Branch code cannot be empty" },
        len: {
          args: [2, 20],
          msg: "Branch code must be between 2 and 20 characters"
        }
      }
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true
    },
    state: {
      type: Sequelize.STRING,
      allowNull: true
    },
    country: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Invalid email format" }
      }
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    master_admin_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'master_admins',
        key: 'id'
      },
      comment: 'Assigned Super Admin (Master Admin)'
    },
    school_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    mobileno: {
      type: Sequelize.STRING,
      allowNull: true
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: true
    },
    symbol: {
      type: Sequelize.STRING,
      allowNull: true
    },
    stu_generate: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    stu_username_prefix: {
      type: Sequelize.STRING,
      allowNull: true
    },
    stu_default_password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    grd_generate: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    grd_username_prefix: {
      type: Sequelize.STRING,
      allowNull: true
    },
    grd_default_password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    teacher_restricted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    due_days: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    due_with_fine: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    unique_roll: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    role_group_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    branch_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        unique: true,
        fields: ['code']
      }
    ]
  });

  return Branch;
};