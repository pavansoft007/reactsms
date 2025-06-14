/**
 * Fee model for managing student fees
 * 
 * @module models/fee.model
 */

module.exports = (sequelize, DataTypes) => {
  const Fee = sequelize.define(
    "fees",
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
      fee_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_types',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: { args: [0], msg: "Amount cannot be negative" }
        }
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
        defaultValue: 'pending'
      },
      paid_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          isDecimal: true,
          min: { args: [0], msg: "Paid amount cannot be negative" }
        }
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      term: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        }
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'master_admins',
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
      tableName: 'fees'
    }
  );

  return Fee;
};