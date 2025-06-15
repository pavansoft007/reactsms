const { authJwt } = require("../middleware");
const controller = require("../controllers/student.controller");
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
   * @route POST /api/students
   * @desc Create a new student
   * @access Private (Admin, Teacher)
   */
  app.post(
    "/api/students", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "teacher"]),
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").optional().isEmail(),
      check("gender", "Gender is required").not().isEmpty(),
      check("birthday", "Birthday must be a valid date").optional().isDate(),
      check("branch_id", "Branch ID is required").isInt(),
      validate
    ], 
    controller.create
  );

  /**
   * @route GET /api/students
   * @desc Get all students with pagination and filtering
   * @access Private (Admin, Teacher, Accountant)
   */
  app.get(
    "/api/students", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "teacher", "accountant", "parent", "student"]), // Added parent and student roles
      pagination,
      filter(['name', 'student_id', 'branch_id', 'gender', 'is_active'])
    ], 
    controller.findAll
  );

  /**
   * @route GET /api/students/:id
   * @desc Get student by ID
   * @access Private (Admin, Teacher, Accountant, Parent)
   */
  app.get(
    "/api/students/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "teacher", "accountant", "parent"])
    ], 
    controller.findOne
  );

  /**
   * @route PUT /api/students/:id
   * @desc Update a student
   * @access Private (Admin, Teacher)
   */
  app.put(
    "/api/students/:id", 
    [
      authJwt.verifyToken, 
      authJwt.hasRoles(["admin", "teacher"]),
      check("name", "Name is required").optional().not().isEmpty(),
      check("email", "Please include a valid email").optional().isEmail(),
      check("gender", "Gender must be valid").optional().isIn(["male", "female", "other"]),
      check("birthday", "Birthday must be a valid date").optional().isDate(),
      check("branch_id", "Branch ID must be a number").optional().isInt(),
      validate
    ], 
    controller.update
  );

  /**
   * @route DELETE /api/students/:id
   * @desc Delete a student
   * @access Private (Admin)
   */
  app.delete(
    "/api/students/:id", 
    [
      authJwt.verifyToken, 
      authJwt.isAdmin
    ], 
    controller.delete
  );

  /**
   * @route DELETE /api/students
   * @desc Delete all students
   * @access Private (Admin)
   */
  app.delete(
    "/api/students", 
    [
      authJwt.verifyToken, 
      authJwt.isAdmin
    ], 
    controller.deleteAll
  );
};