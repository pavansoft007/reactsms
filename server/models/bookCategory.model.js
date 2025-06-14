/**
 * Book Category model for categorizing library books
 * 
 * @module models/bookCategory.model
 */

module.exports = (sequelize, DataTypes) => {
  const BookCategory = sequelize.define(
    "book_category",
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
          notEmpty: { msg: "Category name cannot be empty" }
        }
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
      tableName: 'book_category'
    }
  );

  return BookCategory;
};