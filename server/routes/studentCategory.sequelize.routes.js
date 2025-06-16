/**
 * Student Category routes for category management
 * 
 * @module routes/studentCategory.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const filter = require("../middleware/filter.middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const studentCategoryController = require("../controllers/studentCategory.sequelize.controller");
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
  const allowedFilters = ['name', 'branch_id'];

  // Student category validation rules
  const categoryValidationRules = [
    check('name')
      .notEmpty().withMessage('Category name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Category name must be between 2 and 255 characters'),
    check('branch_id')
      .notEmpty().withMessage('Branch ID is required')
      .isInt().withMessage('Branch ID must be an integer')
  ];

  // Create a new student category
  app.post(
    "/api/student-categories",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      ...categoryValidationRules,
      validate,
      detailedAuditLog('create', 'student_category')
    ],
    studentCategoryController.create
  );

  // Retrieve all student categories
  app.get(
    "/api/student-categories",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    studentCategoryController.findAll
  );

  // Retrieve a single student category
  app.get(
    "/api/student-categories/:id",
    [
      authJwt.verifyToken
    ],
    studentCategoryController.findOne
  );

  // Update a student category
  app.put(
    "/api/student-categories/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      check('name')
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 2, max: 255 }).withMessage('Category name must be between 2 and 255 characters'),
      validate,
      detailedAuditLog('update', 'student_category')
    ],
    studentCategoryController.update
  );

  // Delete a student category
  app.delete(
    "/api/student-categories/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'student_category')
    ],
    studentCategoryController.delete
  );
};
