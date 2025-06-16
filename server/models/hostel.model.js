module.exports = (sequelize, DataTypes) => {
  const Hostel = sequelize.define(
    "hostel",
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
      address: {
        type: DataTypes.TEXT
      },
      warden_name: {
        type: DataTypes.STRING
      },
      contact_number: {
        type: DataTypes.STRING
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
      tableName: 'hostel',
      timestamps: false
    }
  );

  Hostel.associate = function(models) {
    // associations can be defined here
    Hostel.hasMany(models.room, {
      foreignKey: 'hostel_id'
    });
    Hostel.hasMany(models.student, {
      foreignKey: 'hostel_id'
    });
  };

  return Hostel;
};
