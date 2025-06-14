
const db = require("../models");
const Student = db.student;
const Class = db.class;
const Section = db.section;
const Branch = db.branch;
const Op = db.Sequelize.Op;
const logger = require("../utils/logger");

/**
 * Create and Save a new Student
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created student or error
 */
exports.create = async (req, res) => {
  try {
    // Create a Student object
    const student = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      blood_group: req.body.blood_group,
      birthday: req.body.birthday,
      religion: req.body.religion,
      present_address: req.body.present_address,
      permanent_address: req.body.permanent_address,
      phone: req.body.phone,
      category_id: req.body.category_id,
      register_no: req.body.register_no || generateRegistrationNumber(),
      parent_id: req.body.parent_id,
      branch_id: req.body.branch_id,
      created_at: new Date()
    };

    // Check if user has permission for this branch
    if (req.userRole !== 'admin' && req.userBranchId !== student.branch_id) {
      logger.warn(`User ${req.userId} attempted to create student in unauthorized branch ${student.branch_id}`);
      return res.status(403).send({
        success: false,
        message: "You can only create students in your assigned branch"
      });
    }

    // Save Student in the database
    const data = await Student.create(student);
    
    logger.info(`Student created with ID: ${data.id}`);
    
    res.status(201).send({
      success: true,
      message: "Student created successfully",
      data: data
    });
  } catch (err) {
    logger.error(`Error creating student: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while creating the Student."
    });
  }
};

/**
 * Retrieve all Students from the database with pagination and filtering
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with students list or error
 */
exports.findAll = async (req, res) => {
  try {
    const { page, limit, offset, sort } = req.pagination || { page: 1, limit: 10, offset: 0 };
    const where = req.filters || {};
    
    // Handle specific filters
    if (req.query.branch && !where.branch_id) {
      where.branch_id = req.query.branch;
    }
    
    if (req.query.class) {
      // This requires a join with the class_students table
      // For simplicity, we'll just filter by class_id if it exists in the student table
      if (Student.rawAttributes.class_id) {
        where.class_id = req.query.class;
      }
    }
    
    // Handle search term if provided
    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      where[Op.or] = [
        { name: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        { register_no: { [Op.like]: searchTerm } },
        { phone: { [Op.like]: searchTerm } }
      ];
    }
    
    // Set up order based on sort parameter or default to id DESC
    const order = sort 
      ? [[sort.field, sort.order]] 
      : [['id', 'DESC']];
    
    // Find students with pagination
    const { count, rows } = await Student.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
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
    
    logger.info(`Retrieved ${rows.length} students (page ${page}/${totalPages})`);
    
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
    logger.error(`Error retrieving students: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while retrieving students."
    });
  }
};

/**
 * Find a single Student with an id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with student details or error
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ]
    });
    
    if (!student) {
      logger.warn(`Student with ID ${id} not found`);
      return res.status(404).send({
        success: false,
        message: `Student not found with id=${id}`
      });
    }
    
    // Check if user has permission to view this student
    if (req.userRole !== 'admin' && 
        req.userRole !== 'accountant' && 
        req.userBranchId !== student.branch_id) {
      
      // For parents, check if this is their child
      if (req.userRole === 'parent' && req.userId !== student.parent_id) {
        logger.warn(`User ${req.userId} attempted to access unauthorized student ${id}`);
        return res.status(403).send({
          success: false,
          message: "You don't have permission to view this student"
        });
      }
      
      // For teachers, check if they teach this student's class
      if (req.userRole === 'teacher') {
        // This would require a more complex check with class assignments
        // For simplicity, we'll just check branch
        if (req.userBranchId !== student.branch_id) {
          logger.warn(`Teacher ${req.userId} attempted to access student from another branch`);
          return res.status(403).send({
            success: false,
            message: "You don't have permission to view this student"
          });
        }
      }
    }
    
    logger.info(`Retrieved student with ID: ${id}`);
    
    res.send({
      success: true,
      data: student
    });
  } catch (err) {
    logger.error(`Error retrieving student: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error retrieving student"
    });
  }
};

/**
 * Update a Student by the id in the request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find student first to check permissions
    const student = await Student.findByPk(id);
    
    if (!student) {
      logger.warn(`Attempted to update non-existent student with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Student not found with id=${id}`
      });
    }
    
    // Check if user has permission to update this student
    if (req.userRole !== 'admin' && req.userBranchId !== student.branch_id) {
      logger.warn(`User ${req.userId} attempted to update student from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only update students in your assigned branch"
      });
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // If branch_id is being changed, check if user has permission
    if (updateData.branch_id && 
        updateData.branch_id !== student.branch_id && 
        req.userRole !== 'admin') {
      
      logger.warn(`User ${req.userId} attempted to change student branch`);
      return res.status(403).send({
        success: false,
        message: "Only administrators can change a student's branch"
      });
    }

    // Update the student
    const result = await Student.update(updateData, {
      where: { id: id }
    });
    
    if (result[0] === 1) {
      logger.info(`Student with ID ${id} updated successfully`);
      
      // Get updated student data
      const updatedStudent = await Student.findByPk(id);
      
      res.send({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent
      });
    } else {
      logger.warn(`Student update failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot update Student with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error updating student: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error updating student"
    });
  }
};

/**
 * Delete a Student with the specified id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find student first to check permissions
    const student = await Student.findByPk(id);
    
    if (!student) {
      logger.warn(`Attempted to delete non-existent student with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Student not found with id=${id}`
      });
    }
    
    // Only admins can delete students
    if (req.userRole !== 'admin') {
      logger.warn(`Non-admin user ${req.userId} attempted to delete student ${id}`);
      return res.status(403).send({
        success: false,
        message: "Only administrators can delete students"
      });
    }
    
    // Delete the student
    const result = await Student.destroy({
      where: { id: id }
    });
    
    if (result === 1) {
      logger.info(`Student with ID ${id} deleted successfully`);
      res.send({
        success: true,
        message: "Student deleted successfully"
      });
    } else {
      logger.warn(`Student deletion failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot delete Student with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error deleting student: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error deleting student"
    });
  }
};

/**
 * Delete all Students from the database (admin only)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.deleteAll = async (req, res) => {
  try {
    // Only super admins should have this power
    if (req.userRole !== 'admin') {
      logger.warn(`Non-admin user ${req.userId} attempted to delete all students`);
      return res.status(403).send({
        success: false,
        message: "Only administrators can perform this action"
      });
    }
    
    // Add branch filter if specified
    const where = {};
    if (req.query.branch_id) {
      where.branch_id = req.query.branch_id;
    }
    
    // Delete students
    const nums = await Student.destroy({
      where,
      truncate: false
    });
    
    logger.info(`${nums} students deleted successfully`);
    
    res.send({
      success: true,
      message: `${nums} Students were deleted successfully!`
    });
  } catch (err) {
    logger.error(`Error deleting all students: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while removing all students."
    });
  }
};

/**
 * Generate a unique registration number for a student
 * 
 * @returns {String} A unique registration number
 */
function generateRegistrationNumber() {
  const prefix = 'STU';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}