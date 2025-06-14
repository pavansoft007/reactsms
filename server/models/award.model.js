/**
 * Award model for managing staff and student awards
 * 
 * @module models/award.model
 */

module.exports = (sequelize, DataTypes) => {
  const Award = sequelize.define(
    "award",
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
          notEmpty: { msg: "Award name cannot be empty" }
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      gift_item: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      award_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
      },
      award_reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      given_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        }
      }
    },
    {
      timestamps: false,
      tableName: 'award'
    }
  );

  return Award;
};