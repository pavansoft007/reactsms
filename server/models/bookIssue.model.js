/**
 * Book Issue model for tracking book loans
 * 
 * @module models/bookIssue.model
 */

module.exports = (sequelize, DataTypes) => {
  const BookIssue = sequelize.define(
    "book_issues",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'book',
          key: 'id'
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
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      date_of_issue: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      date_of_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      fine_amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0 = pending, 1 = accepted, 2 = rejected, 3 = returned'
      },
      issued_by: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      return_by: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false,
      tableName: 'book_issues'
    }
  );

  return BookIssue;
};