
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "master_admins",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING
      },
      active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
      },
      reset_password_key: {
        type: DataTypes.STRING
      },
      mobile_no: {
        type: DataTypes.STRING
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      tableName: 'master_admins'
    }
  );

  // Instance methods
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};