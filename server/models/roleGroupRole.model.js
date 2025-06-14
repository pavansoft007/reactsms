// RoleGroupRole mapping model
module.exports = (sequelize, Sequelize) => {
  const RoleGroupRole = sequelize.define('role_group_roles', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_group_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: false
  });
  return RoleGroupRole;
};
