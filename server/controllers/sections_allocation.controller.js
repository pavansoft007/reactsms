/**
 * Sections Allocation controller for managing class-section assignments
 * 
 * @module controllers/sections_allocation.controller
 */

const db = require("../models");
const SectionsAllocation = db.sections_allocation;
const Class = db.class;
const Section = db.section;
const Branch = db.branch;
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Create a new class-section assignment
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.create = async (req, res) => {
  try {
    const { class_id, section_id } = req.body;

    // Check if class exists
    const classData = await Class.findByPk(class_id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Class with id ${class_id} not found`
      });
    }

    // Check if section exists
    const section = await Section.findByPk(section_id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Section with id ${section_id} not found`
      });
    }

    // Check if assignment already exists
    const existingAssignment = await SectionsAllocation.findOne({
      where: {
        class_id: class_id,
        section_id: section_id
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "This section is already assigned to the class"
      });
    }

    // Create the assignment
    const assignment = await SectionsAllocation.create({
      class_id: class_id,
      section_id: section_id
    });

    logger.info(`Section ${section_id} assigned to class ${class_id}`, {
      assignmentId: assignment.id,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: "Section assigned to class successfully",
      data: assignment
    });
  } catch (error) {
    logger.error(`Error creating assignment: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while creating the assignment."
    });
  }
};

/**
 * Get all class-section assignments
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findAll = async (req, res) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };

    const { count, rows } = await SectionsAllocation.findAndCountAll({
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'numeric_name'],
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'capacity'],
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      limit: limit,
      offset: offset,
      order: [['id', 'ASC']]
    });

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
    logger.error(`Error retrieving assignments: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving assignments."
    });
  }
};

/**
 * Delete a class-section assignment
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.delete = async (req, res) => {
  try {
    const { class_id, section_id } = req.params;

    const assignment = await SectionsAllocation.findOne({
      where: {
        class_id: class_id,
        section_id: section_id
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    await assignment.destroy();

    logger.info(`Section ${section_id} unassigned from class ${class_id}`, {
      assignmentId: assignment.id,
      userId: req.userId
    });

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting assignment: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting assignment"
    });
  }
};

/**
 * Get assignments for a specific class
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findByClass = async (req, res) => {
  try {
    const class_id = req.params.class_id;

    const assignments = await SectionsAllocation.findAll({
      where: { class_id: class_id },
      include: [
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name', 'capacity']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    logger.error(`Error retrieving class assignments: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: "Error retrieving assignments for class"
    });
  }
};
