/**
 * Fee Groups model for managing fee group structures
 * 
 * @module models/feeGroup.model
 */

module.exports = (sequelize, DataTypes) => {
  const FeeGroup = sequelize.define(
    "fee_groups",
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
          notEmpty: { msg: "Fee group name is required" },
          len: { args: [1, 100], msg: "Fee group name must be between 1 and 100 characters" }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'schoolyear',
          key: 'id'
        }
      },
      system: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System groups cannot be deleted'
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'branch',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "fee_groups",
      timestamps: false,
      indexes: [
        {
          fields: ['branch_id']
        },
        {
          fields: ['session_id']
        },
        {
          unique: true,
          fields: ['name', 'branch_id', 'session_id']
        }
      ]
    }
  );

  FeeGroup.associate = function(models) {
    // Association with Branch
    FeeGroup.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });

    // Association with School Year
    FeeGroup.belongsTo(models.schoolyear, {
      foreignKey: 'session_id',
      as: 'session'
    });

    // Association with Fee Group Details
    FeeGroup.hasMany(models.fee_groups_details, {
      foreignKey: 'fee_groups_id',
      as: 'feeGroupDetails'
    });

    // Association with Fee Allocation
    FeeGroup.hasMany(models.fee_allocation, {
      foreignKey: 'group_id',
      as: 'allocations'
    });
  };

  return FeeGroup;
};
