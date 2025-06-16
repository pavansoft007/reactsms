/**
 * Sections Allocation routes for class-section assignment management
 * 
 * @module routes/sections_allocation.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const sectionsAllocationController = require("../controllers/sections_allocation.controller");
const pagination = require("../middleware/pagination.middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept, x-access-token"
    );
    next();
  });

  // Assignment validation rules
  const assignmentValidationRules = [
    check('class_id')
      .notEmpty().withMessage('Class ID is required')
      .isInt().withMessage('Class ID must be an integer'),
    check('section_id')
      .notEmpty().withMessage('Section ID is required')
      .isInt().withMessage('Section ID must be an integer')
  ];

  // Create a new assignment
  app.post(
    "/api/sections-allocation",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...assignmentValidationRules,
      validate,
      detailedAuditLog('create', 'sections_allocation')
    ],
    sectionsAllocationController.create
  );

  // Retrieve all assignments
  app.get(
    "/api/sections-allocation",
    [
      authJwt.verifyToken,
      pagination
    ],
    sectionsAllocationController.findAll
  );

  // Get assignments for a specific class
  app.get(
    "/api/classes/:class_id/sections-allocation",
    [authJwt.verifyToken],
    sectionsAllocationController.findByClass
  );

  // Delete an assignment
  app.delete(
    "/api/sections-allocation/:class_id/:section_id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'sections_allocation')
    ],
    sectionsAllocationController.delete
  );
};
