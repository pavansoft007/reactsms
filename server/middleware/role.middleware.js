
const db = require("../models");
const User = db.user;
const Role = db.role;
const Permission = db.permission;

// Check if user has specific role
hasRole = (roleName) => async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    const roles = await user.getRoles();
    
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === roleName) {
        return next();
      }
    }
    
    return res.status(403).send({
      message: `Requires ${roleName} Role!`
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

// Check if user has specific permission
hasPermission = (permissionName) => async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    const roles = await user.getRoles();
    
    for (let i = 0; i < roles.length; i++) {
      const permissions = await roles[i].getPermissions();
      
      for (let j = 0; j < permissions.length; j++) {
        if (permissions[j].name === permissionName) {
          return next();
        }
      }
    }
    
    return res.status(403).send({
      message: `Requires ${permissionName} permission!`
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate user permissions!"
    });
  }
};

// Check if user belongs to specific branch
hasBranchAccess = (branchId) => async (req, res, next) => {
  try {
    // Get the branch ID from request parameters or body
    const requestBranchId = req.params.branchId || req.body.branch_id;
    
    if (!requestBranchId) {
      return next();
    }
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    // Check if user is super admin (has access to all branches)
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }
    
    // For non-super admin users, check if they have access to this branch
    if (user.branch_id === parseInt(requestBranchId)) {
      return next();
    }
    
    return res.status(403).send({
      message: "You don't have access to this branch's data!"
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate branch access!"
    });
  }
};

// Check if user is admin
isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    const roles = await user.getRoles();
    
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }
    
    return res.status(403).send({
      message: "Requires Admin Role!"
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate admin role!"
    });
  }
};

const roleMiddleware = {
  hasRole,
  hasPermission,
  hasBranchAccess,
  isAdmin
};

module.exports = roleMiddleware;
