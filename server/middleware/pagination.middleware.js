/**
 * Pagination middleware for handling paging of API results
 * 
 * @module middleware/pagination.middleware
 */

const logger = require("../utils/logger");

/**
 * Middleware that extracts pagination parameters from request query
 * and adds them to the request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const pagination = (req, res, next) => {
  try {
    // Parse page and limit from query or use defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate against negative or unrealistic values
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 10;
    
    // Calculate offset for database queries
    const offset = (validPage - 1) * validLimit;
    
    // Add pagination object to request for controllers to use
    req.pagination = {
      page: validPage,
      limit: validLimit,
      offset: offset
    };
    
    // Add sort parameters if provided
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      
      const sortOrder = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      
      req.pagination.sort = {
        field: sortField,
        order: sortOrder
      };
    }
    
    logger.debug(`Pagination applied: page=${validPage}, limit=${validLimit}, offset=${offset}`);
    
    next();
  } catch (error) {
    logger.error(`Pagination middleware error: ${error.message}`);
    next();
  }
};

module.exports = pagination;