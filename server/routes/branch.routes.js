/**
 * Branch routes for branch management
 * 
 * @module routes/branch.routes
 */

const { authJwt, roleMiddleware, validate } = require("../middleware");
const pagination = require("../middleware/pagination.middleware");
const filter = require("../middleware/filter.middleware");
const { detailedAuditLog } = require("../middleware/audit-logger.middleware");
const { check } = require("express-validator");
const branchController = require("../controllers/branch.controller");
const branchUpload = require("../middleware/multer.middleware");
const path = require("path");
const fs = require("fs");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept, x-access-token, Authorization, X-Requested-With"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  // Define the allowed filter fields
  const allowedFilters = ['name', 'code', 'is_active'];

  // Branch validation rules
  const branchValidationRules = [
    check('name')
      .notEmpty().withMessage('Branch name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Branch name must be between 2 and 100 characters'),
    check('code')
      .notEmpty().withMessage('Branch code is required')
      .isLength({ min: 2, max: 20 }).withMessage('Branch code must be between 2 and 20 characters')
      .matches(/^[A-Z0-9-_]+$/).withMessage('Branch code must contain only uppercase letters, numbers, dashes, and underscores'),
    check('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
  ];

  // Create a new branch
  app.post(
    "/api/branches",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      branchUpload, // <-- multer middleware for file uploads
      ...branchValidationRules,
      validate,
      detailedAuditLog('create', 'branch')
    ],
    branchController.create
  );

  // Retrieve all branches
  app.get(
    "/api/branches",
    [
      authJwt.verifyToken,
      pagination,
      filter(allowedFilters)
    ],
    branchController.findAll
  );

  // Retrieve a single branch
  app.get(
    "/api/branches/:id",
    [
      authJwt.verifyToken
    ],
    branchController.findOne
  );

  // Update a branch
  app.put(
    "/api/branches/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      branchUpload, // <-- multer middleware for file uploads
      ...branchValidationRules.map(rule => rule.optional()),
      validate,
      detailedAuditLog('update', 'branch')
    ],
    branchController.update
  );

  // Delete a branch
  app.delete(
    "/api/branches/:id",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('delete', 'branch')
    ],
    branchController.delete
  );
  // Toggle branch active status
  app.patch(
    "/api/branches/:id/toggle-status",
    [
      authJwt.verifyToken,
      roleMiddleware.isAdmin,
      detailedAuditLog('toggle-status', 'branch')
    ],
    branchController.toggleActive
  );
  // Serve branch logo files
  app.get("/api/branches/logo/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/branches/", filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ success: false, message: "Logo file not found" });
    }
  });

  // Serve branch text logo files
  app.get("/api/branches/text-logo/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/branches/", filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ success: false, message: "Text logo file not found" });
    }
  });

  // Serve branch print files
  app.get("/api/branches/print/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/branches/", filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ success: false, message: "Print file not found" });
    }
  });

  // Serve branch report card files
  app.get("/api/branches/report-card/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/branches/", filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ success: false, message: "Report card file not found" });
    }
  });
};