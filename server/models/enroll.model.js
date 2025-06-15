module.exports = (sequelize, DataTypes) => {
  const Enroll = sequelize.define(
    "enroll",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      roll: {
        type: DataTypes.STRING,
        allowNull: true
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: false,
      tableName: 'enroll'
    }
  );
  return Enroll;
};
