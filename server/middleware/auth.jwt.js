const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const LoginCredential = db.loginCredential;
const logger = require("../utils/logger");

/**
 * Middleware to verify JWT token
 */
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  // Remove Bearer prefix if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      logger.error(`Token verification failed: ${err.message}`);
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role; // Save role for quick access
    next();
  });
};

/**
 * Middleware to check if user has admin role
 */
isAdmin = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    if (user.role === 1 || user.role === 2) { // 1: Admin, 2: Super Admin
      return next();
    }
    logger.warn(`User ${req.userId} attempted to access admin-only resource`);
    return res.status(403).send({
      message: "Admin role required!"
    });
  } catch (error) {
    logger.error(`Role validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

/**
 * Middleware to check if user has accountant role
 */
isAccountant = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    if (user.role === 4 || user.role === 1 || user.role === 2) { // 4: Accountant, 1-2: Admin
      return next();
    }
    logger.warn(`User ${req.userId} attempted to access accountant-only resource`);
    return res.status(403).send({
      message: "Accountant role required!"
    });
  } catch (error) {
    logger.error(`Role validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

/**
 * Middleware to check if user has teacher role
 */
/**
 * Middleware to check if user has teacher role
 */
isTeacher = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    if (user.role === 3 || user.role === 1 || user.role === 2) { // 3: Teacher, 1-2: Admin
      return next();
    }
    logger.warn(`User ${req.userId} attempted to access teacher-only resource`);
    return res.status(403).send({
      message: "Teacher role required!"
    });
  } catch (error) {
    logger.error(`Role validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

/**
 * Middleware to check if user has student role
 */
isStudent = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    if (user.role === 7 || user.role === 1 || user.role === 2) { // 7: Student, 1-2: Admin
      return next();
    }
    logger.warn(`User ${req.userId} attempted to access student-only resource`);
    return res.status(403).send({
      message: "Student role required!"
    });
  } catch (error) {
    logger.error(`Role validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

/**
 * Middleware to check if user has parent role
 */
isParent = async (req, res, next) => {
  try {
    const user = await LoginCredential.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    if (user.role === 6 || user.role === 1 || user.role === 2) { // 6: Parent, 1-2: Admin
      return next();
    }
    logger.warn(`User ${req.userId} attempted to access parent-only resource`);
    return res.status(403).send({
      message: "Parent role required!"
    });
  } catch (error) {
    logger.error(`Role validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

/**
 * Middleware to check if user has any of the specified roles
 */
hasRoles = (roleNames) => {
  return async (req, res, next) => {
    try {
      const user = await LoginCredential.findByPk(req.userId);
      if (!user) {
        return res.status(404).send({
          message: "User not found!"
        });
      }
      
      // Role mapping from numeric IDs to role names
      const roleMapping = {
        1: "admin",        // Administrator
        2: "admin",        // Super Admin (also treat as admin)
        3: "teacher",      // Teacher
        4: "accountant",   // Accountant
        5: "librarian",    // Librarian
        6: "parent",       // Parent
        7: "student"       // Student
      };
      
      const userRoleName = roleMapping[user.role];
      
      // Check if user has required role or is admin
      if (roleNames.includes(userRoleName) || userRoleName === "admin") {
        return next();
      }
      
      logger.warn(`User ${req.userId} (role: ${user.role}/${userRoleName}) attempted to access resource requiring roles: ${roleNames.join(', ')}`);
      return res.status(403).send({
        message: `Required roles: ${roleNames.join(', ')}`
      });
    } catch (error) {
      logger.error(`Role validation error: ${error.message}`);
      return res.status(500).send({
        message: "Unable to validate user role!"
      });
    }
  };
};

/**
 * Middleware to check if user belongs to the specified branch
 */
isBranchMember = (req, res, next) => {
  try {
    const branchId = parseInt(req.params.branchId || req.body.branch_id);

    if (!branchId) {
      return res.status(400).send({
        message: "Branch ID is required!"
      });
    }

    // Admin can access all branches
    if (req.userRole === "admin") {
      return next();
    }

    if (req.userBranchId !== branchId) {
      logger.warn(`User ${req.userId} attempted to access resource from another branch`);
      return res.status(403).send({
        message: "You can only access resources from your branch!"
      });
    }

    next();
  } catch (error) {
    logger.error(`Branch validation error: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate branch access!"
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isAccountant,
  isTeacher,
  isStudent,
  isParent,
  hasRoles,
  isBranchMember
};

module.exports = authJwt;