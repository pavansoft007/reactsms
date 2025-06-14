/**
 * Audit logging middleware for tracking user actions
 * 
 * @module middleware/audit-logger.middleware
 */

// Import logger utility
const logger = require('../utils/logger');
const db = require('../models');

/**
 * Logs user actions for audit trail
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const auditLogger = (req, res, next) => {
  // Extract useful information from the request
  const auditData = {
    userId: req.userId || 'anonymous',
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date()
  };
  
  // Log audit data
  logger.info('AUDIT', auditData);
  
  // Store in database if needed (can be implemented later)
  // For now, just pass to next middleware
  
  next();
};

/**
 * Creates a more detailed audit log for specific actions
 * 
 * @param {string} action - Description of the action being performed
 * @param {string} resource - Resource type being accessed
 * @returns {Function} Express middleware function
 */
const detailedAuditLog = (action, resource) => {
  return (req, res, next) => {
    // Save original end function
    const originalEnd = res.end;
    
    // Override end function to capture response
    res.end = function(chunk, encoding) {
      // Restore original end function
      res.end = originalEnd;
      
      // Call original end function
      res.end(chunk, encoding);
      
      // Get response status code
      const statusCode = res.statusCode;
      
      // Log detailed audit information
      logger.info('DETAILED_AUDIT', {
        userId: req.userId || 'anonymous',
        action,
        resource,
        resourceId: req.params.id || null,
        statusCode,
        timestamp: new Date()
      });
    };
    
    next();
  };
};

module.exports = {
  auditLogger,
  detailedAuditLog
};