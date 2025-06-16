/**
 * Class routes for class management
 * 
 * @module routes/class.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const filter = require("../middleware/filter.middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const classController = require("../controllers/class.controller");
const pagination = require("../middleware/pagination.middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept, x-access-token"
    );
    next();
  });

  // Define the allowed filter fields
  const allowedFilters = ['name', 'branch_id', 'is_active'];

  // Class validation rules
  const classValidationRules = [
    check('name')
      .notEmpty().withMessage('Class name is required')
      .isLength({ min: 1, max: 100 }).withMessage('Class name must be between 1 and 100 characters'),
    check('branch_id')
      .notEmpty().withMessage('Branch ID is required')
      .isInt().withMessage('Branch ID must be an integer'),
    check('numeric_name')
      .optional()
      .isInt().withMessage('Numeric name must be an integer'),
    check('rank_order')
      .optional()
      .isInt().withMessage('Rank order must be an integer')
  ];

  // Create a new class
  app.post(
    "/api/classes",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...classValidationRules,
      validate,
      detailedAuditLog('create', 'class')
    ],
    classController.create
  );

  // Retrieve all classes
  app.get(
    "/api/classes",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    classController.findAll
  );

  // Retrieve all classes for a specific branch
  app.get(
    "/api/branches/:branchId/classes",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    (req, res, next) => {
      req.filters = {
        ...req.filters,
        branch_id: req.params.branchId
      };
      next();
    },
    classController.findAll
  );

  // Retrieve a single class
  app.get(
    "/api/classes/:id",
    [
      authJwt.verifyToken
    ],
    classController.findOne
  );

  // Update a class
  app.put(
    "/api/classes/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...classValidationRules.map(rule => rule.optional()),
      validate,
      detailedAuditLog('update', 'class')
    ],
    classController.update
  );

  // Delete a class
  app.delete(
    "/api/classes/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'class')
    ],
    classController.delete
  );

  // Toggle class active status
  app.patch(
    "/api/classes/:id/toggle-status",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('toggle-status', 'class')
    ],
    classController.toggleActive
  );

  // Assign sections to a class
  app.post(
    "/api/classes/:classId/sections",
    [authJwt.verifyToken, roleMiddleware.isAdmin],
    classController.assignSections
  );

  // Remove section from a class
  app.delete(
    "/api/classes/:classId/sections/:sectionId",
    [authJwt.verifyToken, roleMiddleware.isAdmin],
    classController.removeSection
  );
};