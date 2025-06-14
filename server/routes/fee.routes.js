/**
 * Fee routes for managing student fees
 * 
 * @module routes/fee.routes
 */

const { authJwt } = require("../middleware");
const controller = require("../controllers/fee.controller");
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
   * @route POST /api/fees
   * @desc Create a new fee
   * @access Private (Admin, Accountant)
   */
  app.post(
    "/api/fees", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant"]),
      check("student_id", "Student ID is required").isInt(),
      check("fee_type_id", "Fee Type ID is required").isInt(),
      check("amount", "Amount is required and must be a positive number").isFloat({ min: 0.01 }),
      check("due_date", "Due date must be a valid date").isDate(),
      check("academic_year", "Academic year is required").not().isEmpty(),
      validate
    ], 
    controller.create
  );

  /**
   * @route GET /api/fees
   * @desc Get all fees with pagination and filtering
   * @access Private (Admin, Accountant, Teacher)
   */
  app.get(
    "/api/fees", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant", "teacher"]),
      pagination,
      filter
    ], 
    controller.findAll
  );

  /**
   * @route GET /api/fees/:id
   * @desc Get fee by ID
   * @access Private (Admin, Accountant, Teacher, Parent, Student)
   */
  app.get(
    "/api/fees/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant", "teacher", "parent", "student"])
    ], 
    controller.findOne
  );

  /**
   * @route PUT /api/fees/:id
   * @desc Update a fee
   * @access Private (Admin, Accountant)
   */
  app.put(
    "/api/fees/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant"]),
      check("amount", "Amount must be a positive number").optional().isFloat({ min: 0.01 }),
      check("due_date", "Due date must be a valid date").optional().isDate(),
      check("status", "Status must be valid").optional().isIn(['pending', 'partial', 'paid', 'overdue']),
      validate
    ], 
    controller.update
  );

  /**
   * @route DELETE /api/fees/:id
   * @desc Delete a fee
   * @access Private (Admin)
   */
  app.delete(
    "/api/fees/:id", 
    [
      authJwt.verifyToken, 
      authJwt.isAdmin
    ], 
    controller.delete
  );

  /**
   * @route POST /api/fees/:id/payments
   * @desc Record a payment for a fee
   * @access Private (Admin, Accountant)
   */
  app.post(
    "/api/fees/:id/payments", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant"]),
      check("amount", "Amount is required and must be a positive number").isFloat({ min: 0.01 }),
      check("payment_method", "Payment method is required").not().isEmpty(),
      check("payment_date", "Payment date must be a valid date").optional().isDate(),
      validate
    ], 
    controller.recordPayment
  );

  /**
   * @route GET /api/students/:studentId/fees
   * @desc Get fee summary for a student
   * @access Private (Admin, Accountant, Teacher, Parent, Student)
   */
  app.get(
    "/api/students/:studentId/fees", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "accountant", "teacher", "parent", "student"])
    ], 
    controller.getStudentFeeSummary
  );
};