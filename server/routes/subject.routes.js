/**
 * Subject routes for subject management
 * 
 * @module routes/subject.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const filter = require("../middleware/filter.middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const subjectController = require("../controllers/subject.controller");
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
  const allowedFilters = ['name', 'subject_code', 'subject_type', 'branch_id'];

  // Subject validation rules
  const subjectValidationRules = [
    check('name')
      .notEmpty().withMessage('Subject name is required')
      .isLength({ min: 1, max: 100 }).withMessage('Subject name must be between 1 and 100 characters'),
    check('subject_code')
      .notEmpty().withMessage('Subject code is required')
      .isLength({ min: 1, max: 50 }).withMessage('Subject code must be between 1 and 50 characters'),
    check('subject_type')
      .notEmpty().withMessage('Subject type is required')
      .isLength({ min: 1, max: 50 }).withMessage('Subject type must be between 1 and 50 characters'),
    check('branch_id')
      .notEmpty().withMessage('Branch ID is required')
      .isInt().withMessage('Branch ID must be an integer'),
    check('subject_author')
      .optional()
      .isLength({ max: 100 }).withMessage('Subject author must be at most 100 characters')
  ];

  // Create a new subject
  app.post(
    "/api/subjects",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...subjectValidationRules,
      validate,
      detailedAuditLog('create', 'subject')
    ],
    subjectController.create
  );

  // Retrieve all subjects
  app.get(
    "/api/subjects",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    subjectController.findAll
  );

  // Retrieve a single subject
  app.get(
    "/api/subjects/:id",
    [
      authJwt.verifyToken
    ],
    subjectController.findOne
  );

  // Update a subject
  app.put(
    "/api/subjects/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...subjectValidationRules.map(rule => rule.optional()),
      validate,
      detailedAuditLog('update', 'subject')
    ],
    subjectController.update
  );

  // Delete a subject
  app.delete(
    "/api/subjects/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'subject')
    ],
    subjectController.delete
  );
};
