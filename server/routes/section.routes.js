/**
 * Section routes for section management
 * 
 * @module routes/section.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const filter = require("../middleware/filter.middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const sectionController = require("../controllers/section.controller");
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
  const allowedFilters = ['name', 'class_id', 'branch_id', 'is_active'];

  // Section validation rules
  const sectionValidationRules = [
    check('name')
      .notEmpty().withMessage('Section name is required')
      .isLength({ min: 1, max: 50 }).withMessage('Section name must be between 1 and 50 characters'),
    check('branch_id')
      .notEmpty().withMessage('Branch ID is required')
      .isInt().withMessage('Branch ID must be an integer'),
    check('capacity')
      .optional()
      .isInt({ min: 1, max: 200 }).withMessage('Capacity must be an integer between 1 and 200')
  ];

  // Create a new section
  app.post(
    "/api/sections",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...sectionValidationRules,
      validate,
      detailedAuditLog('create', 'section')
    ],
    sectionController.create
  );

  // Retrieve all sections
  app.get(
    "/api/sections",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    sectionController.findAll
  );

  // Retrieve all sections for a specific class
  app.get(
    "/api/classes/:classId/sections",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    (req, res, next) => {
      req.filters = {
        ...req.filters,
        class_id: req.params.classId
      };
      next();
    },
    sectionController.findAll
  );

  // Retrieve all sections for a specific branch
  app.get(
    "/api/branches/:branchId/sections",
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
    sectionController.findAll
  );

  // Retrieve a single section
  app.get(
    "/api/sections/:id",
    [
      authJwt.verifyToken
    ],
    sectionController.findOne
  );

  // Update a section
  app.put(
    "/api/sections/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...sectionValidationRules.map(rule => rule.optional()),
      validate,
      detailedAuditLog('update', 'section')
    ],
    sectionController.update
  );

  // Delete a section
  app.delete(
    "/api/sections/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'section')
    ],
    sectionController.delete
  );

  // Toggle section active status
  app.patch(
    "/api/sections/:id/toggle-status",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('toggle-status', 'section')
    ],
    sectionController.toggleActive
  );
};