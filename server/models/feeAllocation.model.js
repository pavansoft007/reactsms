/**
 * Fee Allocation model for managing student fee assignments
 * 
 * @module models/feeAllocation.model
 */

module.exports = (sequelize, DataTypes) => {
  const FeeAllocation = sequelize.define(
    "fee_allocation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'student',
          key: 'id'
        }
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_groups',
          key: 'id'
        }
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branch',
          key: 'id'
        }
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'schoolyear',
          key: 'id'
        }
      },
      prev_due: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0.00,
        validate: {
          isDecimal: { msg: "Previous due must be a valid decimal number" },
          min: { args: [0], msg: "Previous due cannot be negative" }
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "fee_allocation",
      timestamps: false,
      indexes: [
        {
          fields: ['student_id']
        },
        {
          fields: ['group_id']
        },
        {
          fields: ['branch_id']
        },
        {
          fields: ['session_id']
        },
        {
          unique: true,
          fields: ['student_id', 'group_id', 'session_id']
        }
      ]
    }
  );

  FeeAllocation.associate = function(models) {
    // Association with Student
    FeeAllocation.belongsTo(models.student, {
      foreignKey: 'student_id',
      as: 'student'
    });

    // Association with Fee Group
    FeeAllocation.belongsTo(models.fee_groups, {
      foreignKey: 'group_id',
      as: 'feeGroup'
    });

    // Association with Branch
    FeeAllocation.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });

    // Association with School Year
    FeeAllocation.belongsTo(models.schoolyear, {
      foreignKey: 'session_id',
      as: 'session'
    });

    // Association with Payment History
    FeeAllocation.hasMany(models.fee_payment_history, {
      foreignKey: 'allocation_id',
      as: 'paymentHistory'
    });
  };

  return FeeAllocation;
};
