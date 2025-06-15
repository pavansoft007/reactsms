const db = require("../models");
const LoginCredential = db.loginCredential;

// Check if user has specific role (by numeric ID)
hasRole = (roleId) => async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (user.role === roleId || user.role === 1) { // Super Admin always allowed
      return next();
    }
    return res.status(403).send({ message: `Requires role ID ${roleId}!` });
  } catch (error) {
    return res.status(500).send({ message: "Unable to validate user role!" });
  }
};

// Check if user has specific permission
hasPermission = (permissionName) => async (req, res, next) => {
  // If you have a permissions system, implement it here for loginCredential
  // For now, just allow admin
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (user.role === "admin") {
      return next();
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
    const requestBranchId = req.params.branchId || req.body.branch_id;
    if (!requestBranchId) {
      return next();
    }
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    // Only admin can access all branches
    if (user.role === "admin") {
      return next();
    }
    // If you store branch_id in login_credential, check here
    if (user.branch_id && user.branch_id === parseInt(requestBranchId)) {
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

// Check if user is super admin (role === 1) or admin (role === 2)
isAdmin = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (user.role === 1 || user.role === 2) { // 1: Super Admin, 2: Admin
      return next();
    }
    return res.status(403).send({ message: "Requires Admin Role!" });
  } catch (error) {
    return res.status(500).send({ message: "Unable to validate admin role!" });
  }
};

const roleMiddleware = {
  hasRole,
  hasPermission,
  hasBranchAccess,
  isAdmin
};

module.exports = roleMiddleware;
