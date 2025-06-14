/**
 * Attachment model for managing file attachments
 * 
 * @module models/attachment.model
 */

module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    "attachments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Title cannot be empty" }
        }
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'attachments_type',
          key: 'id'
        }
      },
      uploader_id: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      class_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'unfiltered'
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      enc_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      subject_id: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: 'unfiltered'
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
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
      tableName: 'attachments'
    }
  );

  return Attachment;
};