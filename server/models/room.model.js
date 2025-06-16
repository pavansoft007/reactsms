module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "room",
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
      room_number: {
        type: DataTypes.STRING
      },
      capacity: {
        type: DataTypes.INTEGER
      },
      hostel_id: {
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
      tableName: 'room',
      timestamps: false
    }
  );

  Room.associate = function(models) {
    // associations can be defined here
    Room.belongsTo(models.hostel, {
      foreignKey: 'hostel_id'
    });
    Room.hasMany(models.student, {
      foreignKey: 'room_id'
    });
  };

  return Room;
};
