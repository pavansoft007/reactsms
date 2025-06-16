/**
 * Fee Groups Details model for managing fee group detail structures
 * 
 * @module models/feeGroupDetails.model
 */

module.exports = (sequelize, DataTypes) => {
  const FeeGroupDetails = sequelize.define(
    "fee_groups_details",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fee_groups_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_groups',
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
          isDecimal: { msg: "Amount must be a valid decimal number" },
          min: { args: [0], msg: "Amount cannot be negative" }
        }
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: { msg: "Due date must be a valid date" }
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "fee_groups_details",
      timestamps: false,
      indexes: [
        {
          fields: ['fee_groups_id']
        },
        {
          fields: ['fee_type_id']
        },
        {
          unique: true,
          fields: ['fee_groups_id', 'fee_type_id']
        }
      ]
    }
  );

  FeeGroupDetails.associate = function(models) {
    // Association with Fee Group
    FeeGroupDetails.belongsTo(models.fee_groups, {
      foreignKey: 'fee_groups_id',
      as: 'feeGroup'
    });

    // Association with Fee Type
    FeeGroupDetails.belongsTo(models.fee_types, {
      foreignKey: 'fee_type_id',
      as: 'feeType'
    });
  };

  return FeeGroupDetails;
};
