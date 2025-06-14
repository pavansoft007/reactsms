/**
 * Error handling middleware
 * 
 * @module middleware/error.middleware
 */

// Import logger utility
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error(`${err.name}: ${err.message}`, { 
    method: req.method,
    path: req.path,
    error: err.stack
  });
  
  // Determine appropriate status code
  let statusCode = err.statusCode || 500;
  
  // Handle Sequelize specific errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
  }
  
  // Prepare response message
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error'
  };
  
  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    errorResponse.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // In development, include error details
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Not found error handler for undefined routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};