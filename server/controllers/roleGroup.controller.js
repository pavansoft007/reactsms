// Controller for Role Groups
const db = require("../models");
const RoleGroup = db.roleGroup;
const Role = db.role;
const RoleGroupRole = db.roleGroupRole;

// Get all role groups
exports.findAll = async (req, res) => {
  try {
    // Get role groups with their associated roles
    const groups = await RoleGroup.sequelize.query(
      `SELECT 
        rg.id, 
        rg.name, 
        rg.description,
        rg.created_at,
        rg.updated_at
      FROM role_groups rg
      ORDER BY rg.name`,
      { type: RoleGroup.sequelize.QueryTypes.SELECT }
    );

    // Get roles for each group
    for (let group of groups) {
      const roles = await Role.sequelize.query(
        `SELECT r.id, r.name, r.prefix 
         FROM roles r 
         INNER JOIN role_group_roles rgr ON r.id = rgr.role_id 
         WHERE rgr.role_group_id = ?`,
        { 
          replacements: [group.id],
          type: Role.sequelize.QueryTypes.SELECT 
        }
      );
      group.roles = roles;
    }    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single role group by ID
exports.findOne = async (req, res) => {
  try {
    const group = await RoleGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "Role group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new role group
exports.create = async (req, res) => {
  const transaction = await RoleGroup.sequelize.transaction();
  try {
    const { name, description, role_ids } = req.body;
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Role group name is required" 
      });
    }

    // Create the role group
    const newGroup = await RoleGroup.create({
      name: name.trim(),
      description: description || null
    }, { transaction });

    // Add roles to the group if provided
    if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
      const roleGroupRoleData = role_ids.map(roleId => ({
        role_group_id: newGroup.id,
        role_id: parseInt(roleId)
      }));

      await RoleGroupRole.bulkCreate(roleGroupRoleData, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ 
      success: true, 
      message: "Role group created successfully",
      data: newGroup
    });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update a role group
exports.update = async (req, res) => {
  const transaction = await RoleGroup.sequelize.transaction();
  try {
    const { name, description, role_ids } = req.body;
    const groupId = req.params.id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Role group name is required" 
      });
    }

    // Update the role group
    const [updated] = await RoleGroup.update({
      name: name.trim(),
      description: description || null
    }, { 
      where: { id: groupId },
      transaction
    });

    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Role group not found" });
    }

    // Delete existing role assignments
    await RoleGroupRole.destroy({
      where: { role_group_id: groupId },
      transaction
    });

    // Add new role assignments if provided
    if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
      const roleGroupRoleData = role_ids.map(roleId => ({
        role_group_id: parseInt(groupId),
        role_id: parseInt(roleId)
      }));

      await RoleGroupRole.bulkCreate(roleGroupRoleData, { transaction });
    }

    await transaction.commit();
    res.json({ 
      success: true, 
      message: "Role group updated successfully" 
    });
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a role group
exports.delete = async (req, res) => {
  try {
    const deleted = await RoleGroup.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Role group not found" });
    res.json({ message: "Role group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get roles for a specific role group
exports.getRolesForGroup = async (req, res) => {
  try {
    const roleGroupId = req.params.id;
    
    // Get roles associated with this role group
    const roles = await Role.sequelize.query(
      `SELECT r.id, r.name, r.prefix 
       FROM roles r 
       INNER JOIN role_group_roles rgr ON r.id = rgr.role_id 
       WHERE rgr.role_group_id = ?`,
      { 
        replacements: [roleGroupId],
        type: Role.sequelize.QueryTypes.SELECT 
      }
    );
    
    res.json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
