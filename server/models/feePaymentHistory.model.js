/**
 * Fee Payment History model for tracking payment transactions
 * 
 * @module models/feePaymentHistory.model
 */

module.exports = (sequelize, DataTypes) => {
  const FeePaymentHistory = sequelize.define(
    "fee_payment_history",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      allocation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_allocation',
          key: 'id'
        }
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_types',
          key: 'id'
        }
      },
      collect_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        comment: 'User who collected the payment'
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: "Amount must be a valid decimal number" },
          min: { args: [0], msg: "Amount cannot be negative" }
        }
      },
      discount: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0.00,
        validate: {
          isDecimal: { msg: "Discount must be a valid decimal number" },
          min: { args: [0], msg: "Discount cannot be negative" }
        }
      },
      fine: {
        type: DataTypes.DECIMAL(18, 2),
        defaultValue: 0.00,
        validate: {
          isDecimal: { msg: "Fine must be a valid decimal number" },
          min: { args: [0], msg: "Fine cannot be negative" }
        }
      },
      pay_via: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'payment_types',
          key: 'id'
        }
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: { msg: "Payment date must be a valid date" }
        }
      }
    },
    {
      tableName: "fee_payment_history",
      timestamps: false,
      indexes: [
        {
          fields: ['allocation_id']
        },
        {
          fields: ['type_id']
        },
        {
          fields: ['collect_by']
        },
        {
          fields: ['date']
        },
        {
          fields: ['pay_via']
        }
      ]
    }
  );

  FeePaymentHistory.associate = function(models) {
    // Association with Fee Allocation
    FeePaymentHistory.belongsTo(models.fee_allocation, {
      foreignKey: 'allocation_id',
      as: 'allocation'
    });

    // Association with Fee Type
    FeePaymentHistory.belongsTo(models.fee_types, {
      foreignKey: 'type_id',
      as: 'feeType'
    });

    // Association with User (collector)
    FeePaymentHistory.belongsTo(models.user, {
      foreignKey: 'collect_by',
      as: 'collector'
    });

    // Association with Payment Type
    FeePaymentHistory.belongsTo(models.payment_types, {
      foreignKey: 'pay_via',
      as: 'paymentType'
    });
  };

  return FeePaymentHistory;
};
