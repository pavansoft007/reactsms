/**
 * Subject controller for managing subject operations
 * 
 * @module controllers/subject.controller
 */

const db = require("../models");
const Subject = db.subject;
const Branch = db.branch;
const { Op } = require("sequelize");
const logger = require("../utils/logger");

// Create a new subject
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

    // Check if subject with the same code already exists in this branch
    const existingSubject = await Subject.findOne({
      where: {
        subject_code: req.body.subject_code,
        branch_id: req.body.branch_id
      }
    });
    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: `Subject with code '${req.body.subject_code}' already exists in this branch`
      });
    }

    // Create subject from request body
    const subjectData = await Subject.create({
      name: req.body.name,
      subject_code: req.body.subject_code,
      subject_type: req.body.subject_type,
      subject_author: req.body.subject_author,
      branch_id: req.body.branch_id
    });

    logger.info(`Subject created: ${subjectData.name}`, {
      subjectId: subjectData.id,
      branchId: subjectData.branch_id,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subjectData
    });
  } catch (error) {
    logger.error(`Error creating subject: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while creating the subject."
    });
  }
};

// Retrieve all subjects with pagination and filtering
exports.findAll = async (req, res) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
    const condition = {};
    if (req.filters) {
      if (req.filters.name) {
        condition.name = { [Op.like]: `%${req.filters.name}%` };
      }
      if (req.filters.subject_code) {
        condition.subject_code = { [Op.like]: `%${req.filters.subject_code}%` };
      }
      if (req.filters.subject_type) {
        condition.subject_type = req.filters.subject_type;
      }
      if (req.filters.branch_id) {
        condition.branch_id = req.filters.branch_id;
      }
    }
    const { count, rows } = await Subject.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [["id", "DESC"]],
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"]
        }
      ]
    });
    res.status(200).json({
      success: true,
      message: "Subjects retrieved successfully",
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    logger.error(`Error retrieving subjects: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving subjects."
    });
  }
};

// Retrieve a single subject by id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const subjectData = await Subject.findByPk(id, {
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"]
        }
      ]
    });
    if (!subjectData) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    res.status(200).json({
      success: true,
      data: subjectData
    });
  } catch (error) {
    logger.error(`Error retrieving subject: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while retrieving the subject."
    });
  }
};

// Update a subject
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await Subject.update(req.body, {
      where: { id }
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    const updatedSubject = await Subject.findByPk(id);
    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject
    });
  } catch (error) {
    logger.error(`Error updating subject: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while updating the subject."
    });
  }
};

// Delete a subject
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Subject.destroy({
      where: { id }
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    res.status(200).json({
      success: true,
      message: "Subject deleted successfully"
    });
  } catch (error) {
    logger.error(`Error deleting subject: ${error.message}`, { error });
    res.status(500).json({
      success: false,
      message: error.message || "Some error occurred while deleting the subject."
    });
  }
};
