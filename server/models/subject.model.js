// Subject model for Sequelize
module.exports = (sequelize, Sequelize) => {
  const Subject = sequelize.define("subject", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subject_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subject_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subject_author: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    branch_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'subject',
    timestamps: false
  });

  Subject.associate = (models) => {
    Subject.belongsTo(models.branch, {
      foreignKey: 'branch_id',
      as: 'branch'
    });
    models.branch.hasMany(Subject, {
      foreignKey: 'branch_id',
      as: 'subjects'
    });
  };

  return Subject;
};
