/**
 * Book model for managing library books
 * 
 * @module models/book.model
 */

module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "book",
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
          notEmpty: { msg: "Book title cannot be empty" }
        }
      },
      cover: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      author: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      isbn_no: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'book_category',
          key: 'id'
        }
      },
      publisher: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      edition: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
      },
      total_stock: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      issued_copies: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '0'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true
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
      tableName: 'book'
    }
  );

  return Book;
};