/**
 * Fee Type model for categorizing fees
 * 
 * @module models/feeType.model
 */

module.exports = (sequelize, DataTypes) => {
  const FeeType = sequelize.define(
    "fee_types",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Fee type name cannot be empty" }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: { args: [0], msg: "Amount cannot be negative" }
        }
      },
      frequency: {
        type: DataTypes.ENUM('one-time', 'monthly', 'quarterly', 'semi-annual', 'annual'),
        defaultValue: 'one-time'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      applicable_to: {
        type: DataTypes.ENUM('all', 'class', 'student'),
        defaultValue: 'all'
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id'
        }
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: false,
      tableName: 'fee_types'
    }
  );

  return FeeType;
};