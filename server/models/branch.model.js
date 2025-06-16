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
    logo_file: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Logo file name'
    },
    text_logo: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Text logo file name'
    },
    print_file: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Print header file name'
    },
    report_card: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Report card template file name'
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
    ],
    hooks: {
      beforeValidate: (branch) => {
        // Ensure name and code are strings
        if (branch.name !== undefined) {
          if (Array.isArray(branch.name)) {
            branch.name = branch.name[0] || '';
          } else if (typeof branch.name === 'object' && branch.name !== null) {
            branch.name = '';
          } else {
            branch.name = String(branch.name).trim();
          }
        }
        
        if (branch.code !== undefined) {
          if (Array.isArray(branch.code)) {
            branch.code = branch.code[0] || '';
          } else if (typeof branch.code === 'object' && branch.code !== null) {
            branch.code = '';
          } else {
            branch.code = String(branch.code).trim();
          }
        }
      }
    }
  });

  return Branch;
};