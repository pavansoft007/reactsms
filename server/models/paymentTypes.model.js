/**
 * Payment Types model for managing payment methods
 * 
 * @module models/paymentTypes.model
 */

module.exports = (sequelize, DataTypes) => {
  const PaymentTypes = sequelize.define(
    "payment_types",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Payment type name is required" },
          len: { args: [1, 50], msg: "Payment type name must be between 1 and 50 characters" }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
      }
    },    {
      tableName: "payment_types",
      timestamps: false,
      indexes: [
        {
          fields: ['name']
        }
      ]
    }
  );

  PaymentTypes.associate = function(models) {
    // Association with Fee Payment History
    PaymentTypes.hasMany(models.fee_payment_history, {
      foreignKey: 'pay_via',
      as: 'paymentHistory'
    });
  };

  return PaymentTypes;
};
