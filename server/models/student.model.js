module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "student",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      register_no: {
        type: DataTypes.STRING
      },
      admission_date: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      gender: {
        type: DataTypes.STRING
      },
      birthday: {
        type: DataTypes.STRING
      },
      religion: {
        type: DataTypes.STRING
      },
      caste: {
        type: DataTypes.STRING
      },
      blood_group: {
        type: DataTypes.STRING
      },
      mother_tongue: {
        type: DataTypes.STRING
      },
      current_address: {
        type: DataTypes.TEXT
      },
      permanent_address: {
        type: DataTypes.TEXT
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      mobileno: {
        type: DataTypes.STRING
      },
      category_id: {
        type: DataTypes.INTEGER
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      parent_id: {
        type: DataTypes.INTEGER
      },
      route_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      vehicle_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      hostel_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      room_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      previous_details: {
        type: DataTypes.TEXT
      },
      photo: {
        type: DataTypes.STRING
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: false,
      tableName: 'student'
    }
  );

  return Student;
};