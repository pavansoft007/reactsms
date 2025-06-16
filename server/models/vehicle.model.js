module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define(
    "vehicle",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING
      },
      capacity: {
        type: DataTypes.INTEGER
      },
      route_id: {
        type: DataTypes.INTEGER
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
      tableName: 'vehicle',
      timestamps: false
    }
  );

  Vehicle.associate = function(models) {
    // associations can be defined here
    Vehicle.belongsTo(models.route, {
      foreignKey: 'route_id'
    });
    Vehicle.hasMany(models.student, {
      foreignKey: 'vehicle_id'
    });
  };

  return Vehicle;
};
