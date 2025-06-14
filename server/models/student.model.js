
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "student",
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
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      gender: {
        type: DataTypes.STRING
      },
      blood_group: {
        type: DataTypes.STRING
      },
      birthday: {
        type: DataTypes.DATE
      },
      religion: {
        type: DataTypes.STRING
      },
      present_address: {
        type: DataTypes.TEXT
      },
      permanent_address: {
        type: DataTypes.TEXT
      },
      phone: {
        type: DataTypes.STRING
      },
      category_id: {
        type: DataTypes.INTEGER
      },
      register_no: {
        type: DataTypes.STRING
      },
      parent_id: {
        type: DataTypes.INTEGER
      },
      email_verified_at: {
        type: DataTypes.DATE
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      },
      branch_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps: false,
      tableName: 'student'
    }
  );

  return Student;
};