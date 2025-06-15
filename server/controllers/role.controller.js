// Controller for Roles
const db = require("../models");
const Role = db.role;
const Permission = db.permission;
const StaffPrivilege = db.staffPrivilege;

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

// Get a single role by ID
exports.findOne = async (req, res) => {
  try {
    const role = await Role.sequelize.query(
      'SELECT id, name, prefix, is_system FROM roles WHERE id = ?',
      { 
        replacements: [req.params.id],
        type: Role.sequelize.QueryTypes.SELECT 
      }
    );
    if (role.length === 0) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }
    res.json({ success: true, data: role[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new role
exports.create = async (req, res) => {
  try {
    const { name, prefix, is_system } = req.body;
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Role name is required" 
      });
    }

    const result = await Role.sequelize.query(
      'INSERT INTO roles (name, prefix, is_system) VALUES (?, ?, ?)',
      { 
        replacements: [name.trim(), prefix || null, is_system || false],
        type: Role.sequelize.QueryTypes.INSERT 
      }
    );

    res.status(201).json({ 
      success: true, 
      message: "Role created successfully",
      data: { id: result[0], name, prefix, is_system }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update a role
exports.update = async (req, res) => {
  try {
    const { name, prefix, is_system } = req.body;
    const roleId = req.params.id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Role name is required" 
      });
    }

    const result = await Role.sequelize.query(
      'UPDATE roles SET name = ?, prefix = ?, is_system = ? WHERE id = ?',
      { 
        replacements: [name.trim(), prefix || null, is_system || false, roleId],
        type: Role.sequelize.QueryTypes.UPDATE 
      }
    );

    if (result[1] === 0) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    res.json({ 
      success: true, 
      message: "Role updated successfully" 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a role
exports.delete = async (req, res) => {
  try {
    const roleId = req.params.id;

    // Check if role is a system role
    const role = await Role.sequelize.query(
      'SELECT is_system FROM roles WHERE id = ?',
      { 
        replacements: [roleId],
        type: Role.sequelize.QueryTypes.SELECT 
      }
    );

    if (role.length === 0) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    if (role[0].is_system) {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete system roles" 
      });
    }

    const result = await Role.sequelize.query(
      'DELETE FROM roles WHERE id = ? AND is_system = 0',
      { 
        replacements: [roleId],
        type: Role.sequelize.QueryTypes.DELETE 
      }
    );    if (result[1] === 0) {
      return res.status(404).json({ success: false, message: "Role not found or cannot be deleted" });
    }

    res.json({ 
      success: true, 
      message: "Role deleted successfully" 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get permissions for a specific role
exports.getRolePermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    
    // Get all permissions
    const allPermissions = await Permission.sequelize.query(
      'SELECT id, name, module_id FROM permission ORDER BY module_id, name',
      { type: Permission.sequelize.QueryTypes.SELECT }
    );

    // Get current role permissions
    const rolePermissions = await StaffPrivilege.sequelize.query(
      'SELECT permission_id, is_view, is_add, is_edit, is_delete FROM staff_privileges WHERE role_id = ?',
      { 
        replacements: [roleId],
        type: StaffPrivilege.sequelize.QueryTypes.SELECT 
      }
    );

    // Map permissions with current role settings
    const permissionsWithStatus = allPermissions.map(permission => {
      const rolePermission = rolePermissions.find(rp => rp.permission_id === permission.id);
      return {
        id: permission.id,
        feature: permission.name,
        view: rolePermission ? Boolean(rolePermission.is_view) : false,
        add: rolePermission ? Boolean(rolePermission.is_add) : false,
        edit: rolePermission ? Boolean(rolePermission.is_edit) : false,
        delete: rolePermission ? Boolean(rolePermission.is_delete) : false,
      };
    });

    res.json({ success: true, data: permissionsWithStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Save permissions for a specific role
exports.saveRolePermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;

    console.log("Saving permissions for role ID:", roleId);
    console.log("Received permissions:", JSON.stringify(permissions, null, 2));

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ 
        success: false, 
        message: "Permissions array is required" 
      });
    }

    // First, delete existing permissions for this role
    await StaffPrivilege.sequelize.query(
      'DELETE FROM staff_privileges WHERE role_id = ?',
      { 
        replacements: [roleId],
        type: StaffPrivilege.sequelize.QueryTypes.DELETE 
      }
    );    // Get all permission IDs to validate
    const allPermissions = await Permission.sequelize.query(
      'SELECT id, name FROM permission',
      { type: Permission.sequelize.QueryTypes.SELECT }
    );

    console.log("Available permissions in database:", allPermissions.length);
    if (allPermissions.length > 0) {
      console.log("Permission names:", allPermissions.map(p => p.name));
    }

    // If no permissions exist in database, create basic ones from frontend
    if (allPermissions.length === 0) {
      console.log("No permissions found in database. Creating basic permissions...");
      
      // Get unique feature names from frontend
      const uniqueFeatures = [...new Set(permissions.map(p => p.feature))];
      
      // Create permissions for each feature
      for (let i = 0; i < uniqueFeatures.length; i++) {
        const feature = uniqueFeatures[i];
        const prefix = feature.toLowerCase().replace(/\s+/g, '_');
        await Permission.sequelize.query(
          'INSERT INTO permission (module_id, name, prefix, show_view, show_add, show_edit, show_delete) VALUES (?, ?, ?, 1, 1, 1, 1)',
          { 
            replacements: [1, feature, prefix],
            type: Permission.sequelize.QueryTypes.INSERT 
          }
        );
      }
      
      // Re-fetch permissions after creation
      const newPermissions = await Permission.sequelize.query(
        'SELECT id, name FROM permission',
        { type: Permission.sequelize.QueryTypes.SELECT }
      );
      allPermissions.length = 0; // Clear array
      allPermissions.push(...newPermissions);
      console.log("Created permissions, new count:", allPermissions.length);
    }

    // Insert new permissions
    let savedCount = 0;
    for (const permission of permissions) {
      // Find permission ID by name
      const permissionRecord = allPermissions.find(p => p.name === permission.feature);
      
      console.log(`Processing permission: ${permission.feature}, found in DB: ${!!permissionRecord}`);
      
      if (permissionRecord && (permission.view || permission.add || permission.edit || permission.delete)) {
        console.log(`Saving permission for ${permission.feature}:`, {
          view: permission.view,
          add: permission.add,
          edit: permission.edit,
          delete: permission.delete
        });
        
        await StaffPrivilege.sequelize.query(
          'INSERT INTO staff_privileges (role_id, permission_id, is_view, is_add, is_edit, is_delete) VALUES (?, ?, ?, ?, ?, ?)',
          { 
            replacements: [
              roleId, 
              permissionRecord.id,
              permission.view ? 1 : 0,
              permission.add ? 1 : 0,
              permission.edit ? 1 : 0,
              permission.delete ? 1 : 0
            ],
            type: StaffPrivilege.sequelize.QueryTypes.INSERT 
          }
        );
        savedCount++;
      } else if (!permissionRecord) {
        console.log(`Warning: Permission '${permission.feature}' not found in database`);
      }
    }

    console.log(`Saved ${savedCount} permissions for role ${roleId}`);

    res.json({ 
      success: true, 
      message: "Role permissions updated successfully",
      savedCount: savedCount 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all available permissions
exports.getAllPermissions = async (req, res) => {
  try {
    // First check the table structure
    const tableInfo = await Permission.sequelize.query(
      'DESCRIBE permission',
      { type: Permission.sequelize.QueryTypes.SELECT }
    );
    
    console.log("Permission table structure:", tableInfo);
    
    const permissions = await Permission.sequelize.query(
      'SELECT id, name, module_id FROM permission ORDER BY module_id, name',
      { type: Permission.sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, data: permissions, tableStructure: tableInfo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
