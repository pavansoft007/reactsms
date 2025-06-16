/**
 * Branch controller for managing branch operations
 * 
 * @module controllers/branch.controller
 */

const db = require("../models");
const Branch = db.branch;
const LoginCredential = db.loginCredential;
const User = db.user;
const logger = require("../utils/logger");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * Helper to ensure a field is a string
 * @param {any} field - The field to check
 * @returns {string} - The string value of the field, or an empty string if the field is an object
 */
function getStringField(field) {
  // Handle undefined or null
  if (field === undefined || field === null) {
    return "";
  }
  
  // Handle arrays - take the first element if it's a string
  if (Array.isArray(field)) {
    if (field.length > 0 && typeof field[0] === 'string') {
      return field[0];
    }
    return "";
  }
  
  // Handle objects (but not null) - convert to empty string
  if (typeof field === "object") {
    return "";
  }
  
  // Handle other types - convert to string
  return String(field).trim();
}

/**
 * Process request body to ensure all fields are properly formatted
 * @param {Object} body - The request body
 * @returns {Object} - Processed body with proper string fields
 */
function processRequestBody(body) {
  return {
    name: getStringField(body.name),
    code: getStringField(body.code),
    address: getStringField(body.address),
    city: getStringField(body.city),
    state: getStringField(body.state),
    country: getStringField(body.country),
    phone: getStringField(body.phone),
    email: getStringField(body.email),
    school_name: getStringField(body.school_name),
    mobileno: getStringField(body.mobileno),
    currency: getStringField(body.currency),
    symbol: getStringField(body.symbol),
    stu_username_prefix: getStringField(body.stu_username_prefix),
    stu_default_password: getStringField(body.stu_default_password),
    grd_username_prefix: getStringField(body.grd_username_prefix),
    grd_default_password: getStringField(body.grd_default_password),
    branch_name: getStringField(body.branch_name),
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    stu_generate: body.stu_generate !== undefined ? Boolean(body.stu_generate) : false,
    grd_generate: body.grd_generate !== undefined ? Boolean(body.grd_generate) : false,
    teacher_restricted: body.teacher_restricted !== undefined ? Boolean(body.teacher_restricted) : false,
    due_with_fine: body.due_with_fine !== undefined ? Boolean(body.due_with_fine) : false,
    unique_roll: body.unique_roll !== undefined ? Boolean(body.unique_roll) : false,
    due_days: body.due_days ? parseInt(body.due_days) : null,
    role_group_id: body.role_group_id ? parseInt(body.role_group_id) : null,
    master_admin_id: body.master_admin_id ? parseInt(body.master_admin_id) : null
  };
}

/**
 * Create a new branch
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.create = async (req, res) => {
  let transaction;
  
  try {    // Start transaction
    transaction = await db.sequelize.transaction();
    
    // Process request body to ensure proper data types
    const processedData = processRequestBody(req.body);
    
    // Debug logging
    logger.info('Branch creation request data:', {
      originalBody: req.body,
      processedData: processedData
    });
    
    // Validate required fields
    if (!processedData.name || !processedData.code) {
      return res.status(400).json({
        success: false,
        message: "Branch name and code are required"
      });
    }
    
    // Handle uploaded files
    const fileFields = {};
    if (req.files) {
      if (req.files.logo_file && req.files.logo_file[0]) {
        fileFields.logo_file = req.files.logo_file[0].filename;
      }
      if (req.files.text_logo && req.files.text_logo[0]) {
        fileFields.text_logo = req.files.text_logo[0].filename;
      }
      if (req.files.print_file && req.files.print_file[0]) {
        fileFields.print_file = req.files.print_file[0].filename;
      }
      if (req.files.report_card && req.files.report_card[0]) {
        fileFields.report_card = req.files.report_card[0].filename;
      }
    }
      // Create branch from processed data
    const branch = await Branch.create({
      ...processedData,
      ...fileFields // Include uploaded file names
    }, { transaction });

    // Create login credentials for branch admin if provided
    if (req.body.admin_username && req.body.admin_password && req.body.admin_name) {
      // First create a user record (if User model exists)
      let userId = null;
      if (User) {
        const user = await User.create({
          name: req.body.admin_name,
          email: req.body.admin_email || processedData.email,
          mobile_no: req.body.admin_mobile || processedData.phone,
          password: bcrypt.hashSync(req.body.admin_password, 8),
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction });
        userId = user.id;
      }
        // Create login credentials for branch admin
      await LoginCredential.create({
        user_id: userId || branch.id, // Use user ID if available, otherwise branch ID
        username: req.body.admin_username,
        name: req.body.admin_name,
        password: bcrypt.hashSync(req.body.admin_password, 8),
        role: req.body.admin_role_group_id || "2", // Use admin role group ID
        active: true,
        branch_id: branch.id, // Associate with the branch
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      logger.info(`Branch admin credentials created for branch: ${branch.name}`, {
        branchId: branch.id,
        adminUsername: req.body.admin_username,
        userId: req.userId
      });
    }

    await transaction.commit();

    logger.info(`Branch created: ${branch.name}`, {
      branchId: branch.id,
      userId: req.userId
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Branch and admin credentials created successfully",
      data: branch
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    
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
    
    // Handle uploaded files
    const updateData = { ...req.body };
    if (req.files) {
      if (req.files.logo_file && req.files.logo_file[0]) {
        updateData.logo_file = req.files.logo_file[0].filename;
      }
      if (req.files.text_logo && req.files.text_logo[0]) {
        updateData.text_logo = req.files.text_logo[0].filename;
      }
      if (req.files.print_file && req.files.print_file[0]) {
        updateData.print_file = req.files.print_file[0].filename;
      }
      if (req.files.report_card && req.files.report_card[0]) {
        updateData.report_card = req.files.report_card[0].filename;
      }
    }
    
    // Update branch with request body and files
    const [updated] = await Branch.update(updateData, {
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