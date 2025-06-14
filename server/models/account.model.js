/**
 * Account model for managing financial accounts
 * 
 * @module models/account.model
 */

module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define(
    "accounts",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Account name cannot be empty" }
        }
      },
      number: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Account number cannot be empty" }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      balance: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00
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
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      tableName: 'accounts'
    }
  );

  return Account;
};