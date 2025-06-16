
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { check } = require("express-validator");
const { validate } = require("../middleware/validation.middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization, X-Requested-With"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  /**
   * @route POST /api/auth/signup
   * @desc Register a new user
   * @access Public
   */
  app.post(
    "/api/auth/signup",
    [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
      validate,
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  /**
   * @route POST /api/auth/login
   * @desc Authenticate user & get token
   * @access Public
   */
  app.post(
    "/api/auth/login", 
    [
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password is required").exists(),
      validate
    ],
    controller.signin
  );
  
  /**
   * @route POST /api/auth/refresh-token
   * @desc Refresh access token
   * @access Public
   */
  app.post(
    "/api/auth/refresh-token", 
    [
      check("refreshToken", "Refresh token is required").not().isEmpty(),
      validate
    ],
    controller.refreshToken
  );
  
  /**
   * @route POST /api/auth/logout
   * @desc Logout user / clear refresh token
   * @access Public
   */
  app.post(
    "/api/auth/logout", 
    [
      check("refreshToken", "Refresh token is required").not().isEmpty(),
      validate
    ],
    controller.logout
  );

  /**
   * @route POST /api/auth/forgot-password
   * @desc Request password reset
   * @access Public
   */
  app.post(
    "/api/auth/forgot-password",
    [
      check("email", "Please include a valid email").isEmail(),
      validate
    ],
    controller.forgotPassword
  );

  /**
   * @route POST /api/auth/reset-password
   * @desc Reset password with token
   * @access Public
   */
  app.post(
    "/api/auth/reset-password",
    [
      check("token", "Reset token is required").not().isEmpty(),
      check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
      validate
    ],
    controller.resetPassword
  );
};