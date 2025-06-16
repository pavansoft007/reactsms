module.exports = (sequelize, DataTypes) => {
  const Parent = sequelize.define(
    "parent",
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
      relation: {
        type: DataTypes.STRING
      },
      father_name: {
        type: DataTypes.STRING
      },
      mother_name: {
        type: DataTypes.STRING
      },
      occupation: {
        type: DataTypes.STRING
      },
      income: {
        type: DataTypes.DECIMAL(10, 2)
      },
      education: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      mobileno: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.TEXT
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      photo: {
        type: DataTypes.STRING
      },
      branch_id: {
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
      tableName: 'parent',
      timestamps: false
    }
  );

  Parent.associate = function(models) {
    // associations can be defined here
    Parent.belongsTo(models.branch, {
      foreignKey: 'branch_id'
    });
    Parent.hasMany(models.student, {
      foreignKey: 'parent_id'
    });
  };

  return Parent;
};
