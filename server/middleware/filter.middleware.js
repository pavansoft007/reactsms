/**
 * Filter middleware for handling query filtering
 * 
 * @module middleware/filter.middleware
 */

const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Default allowed filters for common entities
 */
const DEFAULT_FILTERS = {
  student: ['name', 'email', 'gender', 'branch_id', 'class_id', 'section_id'],
  user: ['name', 'email', 'role', 'branch_id', 'status'],
  branch: ['name', 'code', 'is_active'],
  class: ['name', 'branch_id'],
  section: ['name', 'class_id', 'branch_id', 'teacher_id'],
  book: ['title', 'author', 'category_id', 'branch_id'],
  account: ['name', 'branch_id']
};

/**
 * Creates a filter middleware that processes query parameters
 * and builds a Sequelize-compatible filter object
 * 
 * @param {Array} allowedFilters - List of field names that can be filtered
 * @returns {Function} Express middleware function
 */
const filter = (allowedFilters) => {
  return (req, res, next) => {
    try {
      // Start with empty where clause
      const where = {};
      
      // Process each query parameter
      Object.keys(req.query).forEach(key => {
        // Skip pagination and sorting parameters
        if (['page', 'limit', 'sort'].includes(key)) {
          return;
        }
        
        // Check if this is an allowed filter field
        if (allowedFilters.includes(key)) {
          const value = req.query[key];
          
          // Handle special operators
          if (typeof value === 'string') {
            if (value.startsWith('gt:')) {
              where[key] = { [Op.gt]: value.substring(3) };
            } else if (value.startsWith('lt:')) {
              where[key] = { [Op.lt]: value.substring(3) };
            } else if (value.startsWith('like:')) {
              where[key] = { [Op.like]: `%${value.substring(5)}%` };
            } else if (value.includes(',')) {
              // Handle comma-separated values as IN operator
              where[key] = { [Op.in]: value.split(',') };
            } else {
              // Default exact match
              where[key] = value;
            }
          } else {
            where[key] = value;
          }
        }
      });
      
      // Special handling for branch filtering based on user's branch
      if (req.userBranchId && !req.query.branch_id && req.baseUrl.includes('branches') === false) {
        // Only filter by user's branch if not explicitly requesting all branches
        // and not an admin (who can see all branches)
        if (req.userRole !== 'admin') {
          where.branch_id = req.userBranchId;
        }
      }
      
      // Add filters object to request for controllers to use
      req.filters = where;
      
      logger.debug(`Filters applied: ${JSON.stringify(where)}`);
      
      next();
    } catch (error) {
      logger.error(`Filter middleware error: ${error.message}`);
      next();
    }
  };
};

module.exports = filter;