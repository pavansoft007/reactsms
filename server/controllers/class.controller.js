/**
 * Class controller for managing class operations
 * 
 * @module controllers/class.controller
 */

const db = require("../models");
const Class = db.class;
const Branch = db.branch;
const Section = db.section;
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Create a new class
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.create = async (req, res) => {
  try {
    // Check if branch exists
    const branch = await Branch.findByPk(req.body.branch_id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with id ${req.body.branch_id} not found`
      });
    }

    // Check if class with the same name already exists in this branch
    const existingClass = await Class.findOne({
      where: {
        name: req.body.name,
        branch_id: req.body.branch_id
      }
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: `Class with name '${req.body.name}' already exists in this branch`
      });
    }

    // Create class from request body
    const classData = await Class.create({
      name: req.body.name,
      numeric_name: req.body.numeric_name,
      branch_id: req.body.branch_id,
      description: req.body.description,
      rank_order: req.body.rank_order,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });

    logger.info(`Class created: ${classData.name}`, {
      classId: classData.id,
      branchId: classData.branch_id,
      userId: req.userId
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: classData
    });
  } catch (error) {
    logger.error(`Error creating class: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while creating the class."
    });
  }
};

/**
 * Find all classes with optional filtering
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
      
      // Filter by branch_id (exact match)
      if (req.filters.branch_id) {
        condition.branch_id = req.filters.branch_id;
      }
      
      // Filter by active status
      if (req.filters.is_active !== undefined) {
        condition.is_active = req.filters.is_active === 'true';
      }
    }
    
    // Get classes with pagination
    const { count, rows } = await Class.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [
        ['rank_order', 'ASC'],
        ['name', 'ASC']
      ],
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Return paginated result
    res.status(200).json({
      success: true,
      message: "Classes retrieved successfully",
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    logger.error(`Error retrieving classes: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving classes."
    });
  }
};

/**
 * Find a single class by id with its sections
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const classData = await Class.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'sections',
          attributes: ['id', 'name', 'capacity', 'is_active']
        }
      ]
    });
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Class with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    logger.error(`Error retrieving class: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: "Error retrieving class with id=" + req.params.id
    });
  }
};

/**
 * Update a class by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find class first
    const classData = await Class.findByPk(id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Class with id ${id} not found`
      });
    }
    
    // If branch_id is being updated, check if branch exists
    if (req.body.branch_id && req.body.branch_id !== classData.branch_id) {
      const branch = await Branch.findByPk(req.body.branch_id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch with id ${req.body.branch_id} not found`
        });
      }
    }
    
    // Check for duplicate class name in the branch
    if (req.body.name && req.body.name !== classData.name) {
      const existingClass = await Class.findOne({
        where: {
          name: req.body.name,
          branch_id: req.body.branch_id || classData.branch_id,
          id: { [Op.ne]: id } // Exclude current class
        }
      });

      if (existingClass) {
        return res.status(409).json({
          success: false,
          message: `Class with name '${req.body.name}' already exists in this branch`
        });
      }
    }
    
    // Update class with request body
    const [updated] = await Class.update(req.body, {
      where: { id: id }
    });
    
    if (updated) {
      // Get updated class
      const updatedClass = await Class.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ]
      });
      
      logger.info(`Class updated: ${updatedClass.name}`, {
        classId: id,
        userId: req.userId
      });
      
      return res.status(200).json({
        success: true,
        message: "Class updated successfully",
        data: updatedClass
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Cannot update Class with id=${id}`
    });
  } catch (error) {
    logger.error(`Error updating class: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error updating class with id=" + req.params.id
    });
  }
};

/**
 * Delete a class by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find class first
    const classData = await Class.findByPk(id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Class with id ${id} not found`
      });
    }
    
    // Check if class has sections
    const sectionCount = await Section.count({
      where: { class_id: id }
    });
    
    if (sectionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class with id=${id} because it has ${sectionCount} sections. Remove sections first.`
      });
    }
    
    // Soft delete using paranoid option
    await Class.destroy({
      where: { id: id }
    });
    
    logger.info(`Class deleted: ${classData.name}`, {
      classId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: "Class deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting class: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Could not delete Class with id=" + req.params.id
    });
  }
};

/**
 * Activate/deactivate a class
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.toggleActive = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find class first
    const classData = await Class.findByPk(id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Class with id ${id} not found`
      });
    }
    
    // Toggle active status
    const newStatus = !classData.is_active;
    
    await Class.update(
      { is_active: newStatus },
      { where: { id: id } }
    );
    
    logger.info(`Class ${newStatus ? 'activated' : 'deactivated'}: ${classData.name}`, {
      classId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: `Class ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    logger.error(`Error toggling class status: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error toggling class status"
    });
  }
};