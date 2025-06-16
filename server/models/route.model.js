module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define(
    "route",
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
      },
      fare: {
        type: DataTypes.DECIMAL(10, 2)
      },
      is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'route',
      timestamps: false
    }
  );

  Route.associate = function(models) {
    // associations can be defined here
    Route.hasMany(models.student, {
      foreignKey: 'route_id'
    });
  };

  return Route;
};
