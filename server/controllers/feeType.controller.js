/**
 * Fee Type Controller for managing fee types
 * 
 * @module controllers/feeType.controller
 */

const db = require("../models");
const FeeType = db.feeType;
const Class = db.class;
const Branch = db.branch;
const Op = db.Sequelize.Op;
const logger = require("../utils/logger");

/**
 * Create a new fee type
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created fee type or error
 */
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.amount) {
      return res.status(400).send({
        success: false,
        message: "Name and Amount are required fields"
      });
    }

    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== parseInt(req.body.branch_id)) {
      logger.warn(`User ${req.userId} attempted to create fee type for another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only create fee types for your branch"
      });
    }

    // Create fee type object
    const feeType = {
      name: req.body.name,
      description: req.body.description || null,
      amount: req.body.amount,
      frequency: req.body.frequency || 'one-time',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      applicable_to: req.body.applicable_to || 'all',
      class_id: req.body.applicable_to === 'class' ? req.body.class_id : null,
      branch_id: req.body.branch_id || req.userBranchId,
      created_at: new Date()
    };

    // Save fee type in the database
    const data = await FeeType.create(feeType);
    
    logger.info(`Fee type created with ID: ${data.id}`);
    
    res.status(201).send({
      success: true,
      message: "Fee type created successfully",
      data: data
    });
  } catch (err) {
    logger.error(`Error creating fee type: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while creating the fee type."
    });
  }
};

/**
 * Retrieve all fee types with pagination and filtering
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with fee types list or error
 */
exports.findAll = async (req, res) => {
  try {
    const { page, limit, offset, sort } = req.pagination || { page: 1, limit: 10, offset: 0 };
    const where = req.filters || {};
    
    // Handle specific filters
    if (req.query.name) {
      where.name = { [Op.like]: `%${req.query.name}%` };
    }
    
    if (req.query.frequency) {
      where.frequency = req.query.frequency;
    }
    
    if (req.query.applicable_to) {
      where.applicable_to = req.query.applicable_to;
    }
    
    if (req.query.class_id) {
      where.class_id = req.query.class_id;
    }
    
    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === 'true';
    }
    
    // Branch permission check
    if (req.userRole !== 'admin') {
      where.branch_id = req.userBranchId;
    } else if (req.query.branch_id) {
      where.branch_id = req.query.branch_id;
    }
    
    // Set up order based on sort parameter or default to id DESC
    const order = sort 
      ? [[sort.field, sort.order]] 
      : [['id', 'DESC']];
    
    // Find fee types with pagination
    const { count, rows } = await FeeType.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    logger.info(`Retrieved ${rows.length} fee types (page ${page}/${totalPages})`);
    
    res.send({
      success: true,
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      }
    });
  } catch (err) {
    logger.error(`Error retrieving fee types: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while retrieving fee types."
    });
  }
};

/**
 * Find a single fee type by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with fee type details or error
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const feeType = await FeeType.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    if (!feeType) {
      logger.warn(`Fee type with ID ${id} not found`);
      return res.status(404).send({
        success: false,
        message: `Fee type not found with id=${id}`
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== feeType.branch_id) {
      logger.warn(`User ${req.userId} attempted to access fee type from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only access fee types from your branch"
      });
    }
    
    logger.info(`Retrieved fee type with ID: ${id}`);
    
    res.send({
      success: true,
      data: feeType
    });
  } catch (err) {
    logger.error(`Error retrieving fee type: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error retrieving fee type"
    });
  }
};

/**
 * Update a fee type by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find fee type first to check permissions
    const feeType = await FeeType.findByPk(id);
    
    if (!feeType) {
      logger.warn(`Attempted to update non-existent fee type with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Fee type not found with id=${id}`
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== feeType.branch_id) {
      logger.warn(`User ${req.userId} attempted to update fee type from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only update fee types from your branch"
      });
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // Don't allow changing branch_id
    delete updateData.branch_id;
    delete updateData.created_at;
    
    // Update class_id based on applicable_to
    if (updateData.applicable_to && updateData.applicable_to !== 'class') {
      updateData.class_id = null;
    }
    
    // Update the fee type
    const result = await FeeType.update(updateData, {
      where: { id: id }
    });
    
    if (result[0] === 1) {
      logger.info(`Fee type with ID ${id} updated successfully`);
      
      // Get updated fee type data
      const updatedFeeType = await FeeType.findByPk(id);
      
      res.send({
        success: true,
        message: "Fee type updated successfully",
        data: updatedFeeType
      });
    } else {
      logger.warn(`Fee type update failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot update Fee type with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error updating fee type: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error updating fee type"
    });
  }
};

/**
 * Delete a fee type by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find fee type first to check permissions
    const feeType = await FeeType.findByPk(id);
    
    if (!feeType) {
      logger.warn(`Attempted to delete non-existent fee type with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Fee type not found with id=${id}`
      });
    }
    
    // Check branch permission and role
    if (req.userRole !== 'admin') {
      logger.warn(`Non-admin user ${req.userId} attempted to delete fee type ${id}`);
      return res.status(403).send({
        success: false,
        message: "Only administrators can delete fee types"
      });
    }
    
    // Check if fee type is used in any fees
    const feeCount = await db.fee.count({ where: { fee_type_id: id } });
    if (feeCount > 0) {
      logger.warn(`Cannot delete fee type ${id} with existing fees`);
      return res.status(400).send({
        success: false,
        message: "Cannot delete fee type that is used in existing fees"
      });
    }
    
    // Delete the fee type
    const result = await FeeType.destroy({
      where: { id: id }
    });
    
    if (result === 1) {
      logger.info(`Fee type with ID ${id} deleted successfully`);
      res.send({
        success: true,
        message: "Fee type deleted successfully"
      });
    } else {
      logger.warn(`Fee type deletion failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot delete Fee type with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error deleting fee type: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error deleting fee type"
    });
  }
};