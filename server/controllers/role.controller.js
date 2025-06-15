// Controller for Roles
const db = require("../models");
const Role = db.role;

// Get all roles
exports.findAll = async (req, res) => {
  try {
    // Use correct table name 'roles' for MySQL, and select only valid columns
    const roles = await Role.sequelize.query(
      'SELECT id, name, prefix, is_system FROM roles',
      { type: Role.sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
