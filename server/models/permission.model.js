
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      }
    },
    {
      timestamps: false,
      tableName: 'permission'
    }
  );

  return Permission;
};