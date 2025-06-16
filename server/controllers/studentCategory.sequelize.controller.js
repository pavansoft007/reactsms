/**
 * Student Category Controller for managing student categories
 * 
 * @module controllers/studentCategory.controller
 */

const db = require("../models");
const StudentCategory = db.studentCategory;
const Branch = db.branch;
const Op = db.Sequelize.Op;
const logger = require("../utils/logger");

/**
 * Create a new student category
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created category or error
 */
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).send({
        success: false,
        message: "Category name is required"
      });
    }

    if (!req.body.branch_id) {
      return res.status(400).send({
        success: false,
        message: "Branch ID is required"
      });
    }

    // Check if branch exists
    const branch = await Branch.findByPk(req.body.branch_id);
    if (!branch) {
      return res.status(404).send({
        success: false,
        message: `Branch not found with id ${req.body.branch_id}`
      });
    }

    // Check for existing category with same name in same branch
    const existingCategory = await StudentCategory.findOne({
      where: {
        name: req.body.name,
        branch_id: req.body.branch_id
      }
    });

    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category with this name already exists in this branch"
      });
    }

    // Create student category
    const studentCategory = {
      name: req.body.name,
      branch_id: req.body.branch_id
    };

    const data = await StudentCategory.create(studentCategory);
    
    // Fetch the created category with branch information
    const categoryWithBranch = await StudentCategory.findByPk(data.id, {
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name']
      }]
    });

    logger.info(`Student category created with ID ${data.id}`);
    res.send({
      success: true,
      message: "Student category created successfully",
      data: categoryWithBranch
    });
  } catch (err) {
    logger.error(`Error creating student category: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while creating the student category."
    });
  }
};

/**
 * Retrieve all student categories
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with categories list or error
 */
exports.findAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, branch_id } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = {};
    
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`
      };
    }

    if (branch_id) {
      whereConditions.branch_id = branch_id;
    }

    // Check user role and branch permissions
    if (req.userRole !== 'admin' && req.userBranchId) {
      whereConditions.branch_id = req.userBranchId;
    }

    const { count, rows } = await StudentCategory.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.send({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    logger.error(`Error fetching student categories: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while retrieving student categories."
    });
  }
};

/**
 * Find a single student category by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with category details or error
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const studentCategory = await StudentCategory.findByPk(id, {
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name']
      }]
    });

    if (!studentCategory) {
      return res.status(404).send({
        success: false,
        message: `Student category not found with id=${id}`
      });
    }

    // Check if user has permission to view this category
    if (req.userRole !== 'admin' && req.userBranchId !== studentCategory.branch_id) {
      return res.status(403).send({
        success: false,
        message: "You can only view categories in your assigned branch"
      });
    }

    res.send({
      success: true,
      data: studentCategory
    });
  } catch (err) {
    logger.error(`Error finding student category: ${err.message}`);
    res.status(500).send({
      success: false,
      message: `Error retrieving student category with id=${req.params.id}`
    });
  }
};

/**
 * Update a student category by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success status or error
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    // Find category first to check permissions
    const studentCategory = await StudentCategory.findByPk(id);
    
    if (!studentCategory) {
      return res.status(404).send({
        success: false,
        message: `Student category not found with id=${id}`
      });
    }

    // Check if user has permission to update this category
    if (req.userRole !== 'admin' && req.userBranchId !== studentCategory.branch_id) {
      return res.status(403).send({
        success: false,
        message: "You can only update categories in your assigned branch"
      });
    }

    // Validate request
    if (!req.body.name) {
      return res.status(400).send({
        success: false,
        message: "Category name is required"
      });
    }

    // Check for existing category with same name in same branch (excluding current)
    const existingCategory = await StudentCategory.findOne({
      where: {
        name: req.body.name,
        branch_id: studentCategory.branch_id,
        id: {
          [Op.ne]: id
        }
      }
    });

    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category with this name already exists in this branch"
      });
    }

    // Update the category
    const result = await StudentCategory.update({
      name: req.body.name
    }, {
      where: { id: id }
    });

    if (result[0] === 1) {
      logger.info(`Student category with ID ${id} updated successfully`);
      
      // Get updated category data
      const updatedCategory = await StudentCategory.findByPk(id, {
        include: [{
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        }]
      });

      res.send({
        success: true,
        message: "Student category updated successfully",
        data: updatedCategory
      });
    } else {
      res.send({
        success: false,
        message: `Cannot update student category with id=${id}. Maybe the category was not found or req.body is empty!`
      });
    }
  } catch (err) {
    logger.error(`Error updating student category: ${err.message}`);
    res.status(500).send({
      success: false,
      message: `Error updating student category with id=${req.params.id}`
    });
  }
};

/**
 * Delete a student category by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success status or error
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Find category first to check permissions
    const studentCategory = await StudentCategory.findByPk(id);
    
    if (!studentCategory) {
      return res.status(404).send({
        success: false,
        message: `Student category not found with id=${id}`
      });
    }

    // Check if user has permission to delete this category
    if (req.userRole !== 'admin' && req.userBranchId !== studentCategory.branch_id) {
      return res.status(403).send({
        success: false,
        message: "You can only delete categories in your assigned branch"
      });
    }

    // TODO: Check if category is being used by any students
    // const studentsCount = await Student.count({
    //   where: { category_id: id }
    // });
    // 
    // if (studentsCount > 0) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Cannot delete category. It is being used by students."
    //   });
    // }

    await StudentCategory.destroy({
      where: { id: id }
    });

    logger.info(`Student category with ID ${id} deleted successfully`);
    res.send({
      success: true,
      message: "Student category deleted successfully!"
    });
  } catch (err) {
    logger.error(`Error deleting student category: ${err.message}`);
    res.status(500).send({
      success: false,
      message: `Could not delete student category with id=${req.params.id}`
    });
  }
};
