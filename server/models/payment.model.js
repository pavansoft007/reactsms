/**
 * Payment model for tracking fee payments
 * 
 * @module models/payment.model
 */

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "payments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fees',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: { args: [0.01], msg: "Payment amount must be greater than 0" }
        }
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      receipt_no: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'completed'
      },
      collected_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'master_admins',
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
      tableName: 'payments'
    }
  );

  return Payment;
};