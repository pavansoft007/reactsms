/**
 * Section controller for managing section operations
 * 
 * @module controllers/section.controller
 */

const db = require("../models");
const Section = db.section;
const Class = db.class;
const Branch = db.branch;
const User = db.user;
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Create a new section
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

    // Check if section with the same name already exists in this branch
    const existingSection = await Section.findOne({
      where: {
        name: req.body.name,
        branch_id: req.body.branch_id
      }
    });

    if (existingSection) {
      return res.status(409).json({
        success: false,
        message: `Section with name '${req.body.name}' already exists in this branch`
      });
    }

    // Validate numeric fields
    if (req.body.capacity && isNaN(parseInt(req.body.capacity))) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be an integer"
      });
    }

    // Create section from request body
    const section = await Section.create({
      name: req.body.name,
      branch_id: req.body.branch_id,
      capacity: req.body.capacity,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });

    // If class_id is provided, associate it with the class
    if (req.body.class_id) {
      const classData = await Class.findByPk(req.body.class_id);
      if (classData) {
        await section.setClasses([classData]);
      }
    }

    logger.info(`Section created: ${section.name}`, {
      sectionId: section.id,
      branchId: section.branch_id,
      userId: req.userId
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section
    });
  } catch (error) {
    logger.error(`Error creating section: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while creating the section."
    });
  }
};

/**
 * Find all sections with optional filtering
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
        // Filter by branch_id (exact match)
      if (req.filters.branch_id) {
        condition.branch_id = req.filters.branch_id;
      }
      
      // Filter by active status
      if (req.filters.is_active !== undefined) {
        condition.is_active = req.filters.is_active === 'true';
      }
    }
    
    // Set up include options
    const includeOptions = [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name']
      },
      {
        model: Class,
        as: 'classes',
        attributes: ['id', 'name', 'numeric_name'],
        through: { attributes: [] } // Don't include join table data
      }
    ];
    
    // If filtering by class_id, filter through the many-to-many relationship
    if (req.filters && req.filters.class_id) {
      const classId = req.filters.class_id;
      includeOptions.find(inc => inc.model === Class).where = { id: classId };
    }

    // Get sections with pagination
    const { count, rows } = await Section.findAndCountAll({
      where: condition,
      include: includeOptions,
      distinct: true, // Important for correct count with includes
      limit: limit,
      offset: offset,
      order: [
        ['name', 'ASC']
      ]
    });
    
    // Format pagination metadata
    const totalItems = count;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: totalItems,
        per_page: limit,
        current_page: currentPage,
        last_page: totalPages,
        from: offset + 1,
        to: offset + rows.length,
        has_next_page: hasNext,
        has_prev_page: hasPrev
      }
    });
  } catch (error) {
    logger.error(`Error retrieving sections: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving sections."
    });
  }
};

/**
 * Find a single section by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
      const section = await Section.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'name', 'numeric_name'],
          through: { attributes: [] } // Don't include join table data
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    logger.error(`Error retrieving section: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: "Error retrieving section with id=" + req.params.id
    });
  }
};

/**
 * Update a section by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find section first
    const section = await Section.findByPk(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section with id ${id} not found`
      });
    }
    
    // If class_id is provided, update class association
    if (req.body.class_id) {
      const classData = await Class.findByPk(req.body.class_id);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: `Class with id ${req.body.class_id} not found`
        });
      }
      
      // Update class association
      await section.setClasses([classData]);
    }
    
    // If branch_id is being updated, check if branch exists
    if (req.body.branch_id && req.body.branch_id !== section.branch_id) {
      const branch = await Branch.findByPk(req.body.branch_id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch with id ${req.body.branch_id} not found`
        });
      }
    }
      // Check for duplicate section name in the branch
    if (req.body.name && req.body.name !== section.name) {
      const existingSection = await Section.findOne({
        where: {
          name: req.body.name,
          branch_id: req.body.branch_id || section.branch_id,
          id: { [Op.ne]: id } // Exclude current section
        }
      });

      if (existingSection) {
        return res.status(409).json({
          success: false,
          message: `Section with name '${req.body.name}' already exists in this branch`
        });
      }
    }
    
    // Create update object (excluding teacher_id)
    const updateData = {
      name: req.body.name,
      branch_id: req.body.branch_id,
      capacity: req.body.capacity,
      is_active: req.body.is_active !== undefined ? req.body.is_active : section.is_active
    };
    
    // Update section with request body
    const [updated] = await Section.update(updateData, {
      where: { id: id }
    });
    
    if (updated) {
      // Get updated section
      const updatedSection = await Section.findByPk(id, {
        include: [
          {
            model: Class,
            as: 'classes',
            attributes: ['id', 'name'],
            through: { attributes: [] } // Don't include join table data
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ]
      });
      
      logger.info(`Section updated: ${updatedSection.name}`, {
        sectionId: id,
        userId: req.userId
      });
      
      return res.status(200).json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection
      });
    }
    
    res.status(500).json({
      success: false,
      message: `Cannot update Section with id=${id}`
    });
  } catch (error) {
    logger.error(`Error updating section: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error updating section with id=" + req.params.id
    });
  }
};

/**
 * Delete a section by id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find section first
    const section = await Section.findByPk(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section with id ${id} not found`
      });
    }
    
    // Check if section has students (to be implemented when student model is associated with sections)
    // For now, we'll proceed with deletion
    
    // Soft delete using paranoid option
    await Section.destroy({
      where: { id: id }
    });
    
    logger.info(`Section deleted: ${section.name}`, {
      sectionId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: "Section deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting section: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Could not delete Section with id=" + req.params.id
    });
  }
};

/**
 * Activate/deactivate a section
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.toggleActive = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find section first
    const section = await Section.findByPk(id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section with id ${id} not found`
      });
    }
    
    // Toggle active status
    const newStatus = !section.is_active;
    
    await Section.update(
      { is_active: newStatus },
      { where: { id: id } }
    );
    
    logger.info(`Section ${newStatus ? 'activated' : 'deactivated'}: ${section.name}`, {
      sectionId: id,
      userId: req.userId
    });
    
    res.status(200).json({
      success: true,
      message: `Section ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    logger.error(`Error toggling section status: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error toggling section status"
    });
  }
};