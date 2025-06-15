
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      prefix: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      show_view: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      show_add: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      show_edit: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      show_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      timestamps: true,
      tableName: 'permission',
      createdAt: 'created_at',
      updatedAt: false
    }
  );

  return Permission;
};