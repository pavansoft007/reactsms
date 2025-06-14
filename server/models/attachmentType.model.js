/**
 * Attachment Type model for categorizing attachments
 * 
 * @module models/attachmentType.model
 */

module.exports = (sequelize, DataTypes) => {
  const AttachmentType = sequelize.define(
    "attachments_type",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name cannot be empty" }
        }
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: false,
      tableName: 'attachments_type'
    }
  );

  return AttachmentType;
};