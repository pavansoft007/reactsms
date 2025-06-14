/**
 * Fee Type routes for managing fee types
 * 
 * @module routes/feeType.routes
 */

const { authJwt } = require("../middleware");
const controller = require("../controllers/feeType.controller");
const { check } = require("express-validator");
const { validate } = require("../middleware/validation.middleware");
const pagination = require("../middleware/pagination.middleware");
const filter = require("../middleware/filter.middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  /**
   * @route POST /api/fee-types
   * @desc Create a new fee type
   * @access Private (Admin, Accountant)
   */
  app.post(
    "/api/fee-types", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant"]),
      check("name", "Name is required").not().isEmpty(),
      check("amount", "Amount is required and must be a positive number").isFloat({ min: 0 }),
      check("frequency", "Frequency must be valid").optional().isIn(['one-time', 'monthly', 'quarterly', 'semi-annual', 'annual']),
      check("applicable_to", "Applicable to must be valid").optional().isIn(['all', 'class', 'student']),
      check("class_id", "Class ID must be a number").optional().isInt(),
      check("branch_id", "Branch ID is required").isInt(),
      validate
    ], 
    controller.create
  );

  /**
   * @route GET /api/fee-types
   * @desc Get all fee types with pagination and filtering
   * @access Private (Admin, Accountant, Teacher)
   */
  app.get(
    "/api/fee-types", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant", "teacher"]),
      pagination,
      filter
    ], 
    controller.findAll
  );

  /**
   * @route GET /api/fee-types/:id
   * @desc Get fee type by ID
   * @access Private (Admin, Accountant, Teacher)
   */
  app.get(
    "/api/fee-types/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant", "teacher"])
    ], 
    controller.findOne
  );

  /**
   * @route PUT /api/fee-types/:id
   * @desc Update a fee type
   * @access Private (Admin, Accountant)
   */
  app.put(
    "/api/fee-types/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant"]),
      check("name", "Name is required").optional().not().isEmpty(),
      check("amount", "Amount must be a positive number").optional().isFloat({ min: 0 }),
      check("frequency", "Frequency must be valid").optional().isIn(['one-time', 'monthly', 'quarterly', 'semi-annual', 'annual']),
      check("applicable_to", "Applicable to must be valid").optional().isIn(['all', 'class', 'student']),
      check("class_id", "Class ID must be a number").optional().isInt(),
      check("is_active", "Is active must be a boolean").optional().isBoolean(),
      validate
    ], 
    controller.update
  );

  /**
   * @route DELETE /api/fee-types/:id
   * @desc Delete a fee type
   * @access Private (Admin)
   */
  app.delete(
    "/api/fee-types/:id", 
    [
      authJwt.verifyToken, 
      authJwt.isAdmin
    ], 
    controller.delete
  );
};