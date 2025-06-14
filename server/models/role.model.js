
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      prefix: {
        type: DataTypes.STRING(50)
      },
      is_system: {
        type: DataTypes.STRING(10),
        allowNull: false
      }
    },
    {
      timestamps: false,
      tableName: 'role'
    }
  );

  return Role;
};