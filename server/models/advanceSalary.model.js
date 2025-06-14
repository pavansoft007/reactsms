/**
 * Advance Salary model for managing staff advance salary requests
 * 
 * @module models/advanceSalary.model
 */

module.exports = (sequelize, DataTypes) => {
  const AdvanceSalary = sequelize.define(
    "advance_salary",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: { args: [0.01], msg: "Amount must be greater than 0" }
        }
      },
      deduct_month: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      year: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      request_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      paid_date: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '1=pending,2=paid,3=rejected'
      },
      create_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      issued_by: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      comments: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        references: {
          model: 'branches',
          key: 'id'
        }
      }
    },
    {
      timestamps: false,
      tableName: 'advance_salary'
    }
  );

  return AdvanceSalary;
};