/**
 * Branch controller for managing branch operations
 * 
 * @module controllers/branch.controller
 */

const db = require("../models");
const Branch = db.branch;
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Helper to ensure a field is a string
 * @param {any} field - The field to check
 * @returns {string} - The string value of the field, or an empty string if the field is an object
 */
function getStringField(field) {
  if (Array.isArray(field)) return field[0];
  if (typeof field === "object" && field !== null) return "";
  return field;
}

/**
 * Create a new branch
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.create = async (req, res) => {
  try {
    // Ensure name and code are strings
    const name = getStringField(req.body.name);
    const code = getStringField(req.body.code);
    const address = getStringField(req.body.address);
    const city = getStringField(req.body.city);
    const state = getStringField(req.body.state);
    const country = getStringField(req.body.country);
    const phone = getStringField(req.body.phone);
    const email = getStringField(req.body.email);
    // Create branch from request body
    const branch = await Branch.create({
      name,
      code,
      address,
      city,
      state,
      country,
      phone,
      email,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });

    logger.info(`Branch created: ${branch.name}`, {
      branchId: branch.id,
      userId: req.userId
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch
    });
  } catch (error) {
    logger.error(`Error creating branch: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while creating the branch."
    });
  }
};

/**
 * Find all branches with optional filtering
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findAll = async (req, res) => {
  try {
    // Extract pagination parameters
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
    
    // Build search condition from filters
    const condition = {};
    if (req.filters) {
      // Filter by name (case-insensitive partial match)
      if (req.filters.name) {
        condition.name = { [Op.like]: `%${req.filters.name}%` };
      }
      
      // Filter by code (exact match)
      if (req.filters.code) {
        condition.code = req.filters.code;
      }
      
      // Filter by active status
      if (req.filters.is_active !== undefined) {
        condition.is_active = req.filters.is_active === 'true';
      }
    }
    
    // Get branches with pagination
    const { count, rows } = await Branch.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [['name', 'ASC']]
    });
    
    // Return paginated result
    res.status(200).json({
      success: true,
      message: "Branches retrieved successfully",
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    logger.error(`Error retrieving branches: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving branches."
    });
  }
};

/**
 * Find a single branch by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: branch
    });
  } catch (error) {
    logger.error(`Error retrieving branch: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: "Error retrieving branch with id=" + req.params.id
    });
  }
};

/**
 * Update a branch by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find branch first
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with id ${id} not found`
      });
    }
    
    // Update branch with request body
    const [updated] = await Branch.update(req.body, {
      where: { id: id }
    });
    
    if (updated) {
      // Get updated branch
      const updatedBranch = await Branch.findByPk(id);
      
      logger.info(`Branch updated: ${updatedBranch.name}`, {
        branchId: id,
        userId: req.userId
      });
      
      return res.status(200).json({
        success: true,
        message: "Branch updated successfully",
        data: updatedBranch
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Cannot update Branch with id=${id}`
    });
  } catch (error) {
    logger.error(`Error updating branch: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error updating branch with id=" + req.params.id
    });
  }
};

/**
 * Delete a branch by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find branch first
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with id ${id} not found`
      });
    }
    
    // Soft delete using paranoid option
    await Branch.destroy({
      where: { id: id }
    });
    
    logger.info(`Branch deleted: ${branch.name}`, {
      branchId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: "Branch deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting branch: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Could not delete Branch with id=" + req.params.id
    });
  }
};

/**
 * Activate/deactivate a branch
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.toggleActive = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find branch first
    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with id ${id} not found`
      });
    }
    
    // Toggle active status
    const newStatus = !branch.is_active;
    
    await Branch.update(
      { is_active: newStatus },
      { where: { id: id } }
    );
    
    logger.info(`Branch ${newStatus ? 'activated' : 'deactivated'}: ${branch.name}`, {
      branchId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: `Branch ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    logger.error(`Error toggling branch status: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error toggling branch status"
    });
  }
};