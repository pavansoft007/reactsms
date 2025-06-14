/**
 * Fee Controller for managing student fees
 * 
 * @module controllers/fee.controller
 */

const db = require("../models");
const Fee = db.fee;
const FeeType = db.feeType;
const Student = db.student;
const Payment = db.payment;
const Branch = db.branch;
const Class = db.class;
const Op = db.Sequelize.Op;
const logger = require("../utils/logger");

/**
 * Create a new fee record
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created fee or error
 */
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.student_id || !req.body.fee_type_id || !req.body.amount || !req.body.due_date) {
      return res.status(400).send({
        success: false,
        message: "Student ID, Fee Type ID, Amount, and Due Date are required fields"
      });
    }

    // Check if student exists
    const student = await Student.findByPk(req.body.student_id);
    if (!student) {
      return res.status(404).send({
        success: false,
        message: "Student not found"
      });
    }

    // Check if fee type exists
    const feeType = await FeeType.findByPk(req.body.fee_type_id);
    if (!feeType) {
      return res.status(404).send({
        success: false,
        message: "Fee Type not found"
      });
    }

    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== student.branch_id) {
      logger.warn(`User ${req.userId} attempted to create fee for student in another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only create fees for students in your branch"
      });
    }

    // Create fee object
    const fee = {
      student_id: req.body.student_id,
      fee_type_id: req.body.fee_type_id,
      amount: req.body.amount,
      due_date: req.body.due_date,
      status: req.body.status || 'pending',
      paid_amount: req.body.paid_amount || 0,
      payment_date: req.body.payment_date || null,
      payment_method: req.body.payment_method || null,
      transaction_id: req.body.transaction_id || null,
      remarks: req.body.remarks || null,
      academic_year: req.body.academic_year,
      term: req.body.term || null,
      branch_id: student.branch_id,
      created_by: req.userId,
      created_at: new Date()
    };

    // Save fee in the database
    const data = await Fee.create(fee);
    
    logger.info(`Fee created with ID: ${data.id} for student: ${student.id}`);
    
    res.status(201).send({
      success: true,
      message: "Fee created successfully",
      data: data
    });
  } catch (err) {
    logger.error(`Error creating fee: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while creating the fee."
    });
  }
};

/**
 * Retrieve all fees with pagination and filtering
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with fees list or error
 */
exports.findAll = async (req, res) => {
  try {
    const { page, limit, offset, sort } = req.pagination || { page: 1, limit: 10, offset: 0 };
    const where = req.filters || {};
    
    // Handle specific filters
    if (req.query.student_id) {
      where.student_id = req.query.student_id;
    }
    
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    if (req.query.academic_year) {
      where.academic_year = req.query.academic_year;
    }
    
    if (req.query.term) {
      where.term = req.query.term;
    }
    
    if (req.query.due_date_from && req.query.due_date_to) {
      where.due_date = {
        [Op.between]: [req.query.due_date_from, req.query.due_date_to]
      };
    } else if (req.query.due_date_from) {
      where.due_date = {
        [Op.gte]: req.query.due_date_from
      };
    } else if (req.query.due_date_to) {
      where.due_date = {
        [Op.lte]: req.query.due_date_to
      };
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
    
    // Find fees with pagination
    const { count, rows } = await Fee.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'register_no', 'email']
        },
        {
          model: FeeType,
          as: 'fee_type',
          attributes: ['id', 'name', 'frequency']
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
    
    logger.info(`Retrieved ${rows.length} fees (page ${page}/${totalPages})`);
    
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
    logger.error(`Error retrieving fees: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while retrieving fees."
    });
  }
};

/**
 * Find a single fee by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with fee details or error
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    const fee = await Fee.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'register_no', 'email', 'phone']
        },
        {
          model: FeeType,
          as: 'fee_type',
          attributes: ['id', 'name', 'description', 'frequency']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'payment_date', 'payment_method', 'transaction_id', 'receipt_no', 'status']
        }
      ]
    });
    
    if (!fee) {
      logger.warn(`Fee with ID ${id} not found`);
      return res.status(404).send({
        success: false,
        message: `Fee not found with id=${id}`
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== fee.branch_id) {
      logger.warn(`User ${req.userId} attempted to access fee from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only access fees from your branch"
      });
    }
    
    logger.info(`Retrieved fee with ID: ${id}`);
    
    res.send({
      success: true,
      data: fee
    });
  } catch (err) {
    logger.error(`Error retrieving fee: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error retrieving fee"
    });
  }
};

/**
 * Update a fee by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find fee first to check permissions
    const fee = await Fee.findByPk(id);
    
    if (!fee) {
      logger.warn(`Attempted to update non-existent fee with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Fee not found with id=${id}`
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && req.userBranchId !== fee.branch_id) {
      logger.warn(`User ${req.userId} attempted to update fee from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only update fees from your branch"
      });
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };
    
    // Don't allow changing student_id or branch_id
    delete updateData.student_id;
    delete updateData.branch_id;
    delete updateData.created_by;
    delete updateData.created_at;
    
    // Update the fee
    const result = await Fee.update(updateData, {
      where: { id: id }
    });
    
    if (result[0] === 1) {
      logger.info(`Fee with ID ${id} updated successfully`);
      
      // Get updated fee data
      const updatedFee = await Fee.findByPk(id);
      
      res.send({
        success: true,
        message: "Fee updated successfully",
        data: updatedFee
      });
    } else {
      logger.warn(`Fee update failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot update Fee with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error updating fee: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error updating fee"
    });
  }
};

/**
 * Delete a fee by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Find fee first to check permissions
    const fee = await Fee.findByPk(id);
    
    if (!fee) {
      logger.warn(`Attempted to delete non-existent fee with ID ${id}`);
      return res.status(404).send({
        success: false,
        message: `Fee not found with id=${id}`
      });
    }
    
    // Check branch permission and role
    if (req.userRole !== 'admin') {
      logger.warn(`Non-admin user ${req.userId} attempted to delete fee ${id}`);
      return res.status(403).send({
        success: false,
        message: "Only administrators can delete fees"
      });
    }
    
    // Check if fee has payments
    const payments = await Payment.count({ where: { fee_id: id } });
    if (payments > 0) {
      logger.warn(`Cannot delete fee ${id} with existing payments`);
      return res.status(400).send({
        success: false,
        message: "Cannot delete fee with existing payments"
      });
    }
    
    // Delete the fee
    const result = await Fee.destroy({
      where: { id: id }
    });
    
    if (result === 1) {
      logger.info(`Fee with ID ${id} deleted successfully`);
      res.send({
        success: true,
        message: "Fee deleted successfully"
      });
    } else {
      logger.warn(`Fee deletion failed for ID ${id}`);
      res.send({
        success: false,
        message: `Cannot delete Fee with id=${id}`
      });
    }
  } catch (err) {
    logger.error(`Error deleting fee: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error deleting fee"
    });
  }
};

/**
 * Record a payment for a fee
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with payment details or error
 */
exports.recordPayment = async (req, res) => {
  try {
    const feeId = req.params.id;
    
    // Validate request
    if (!req.body.amount || !req.body.payment_method) {
      return res.status(400).send({
        success: false,
        message: "Amount and Payment Method are required fields"
      });
    }
    
    // Find fee first to check permissions
    const fee = await Fee.findByPk(feeId);
    
    if (!fee) {
      logger.warn(`Attempted to record payment for non-existent fee with ID ${feeId}`);
      return res.status(404).send({
        success: false,
        message: `Fee not found with id=${feeId}`
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && req.userRole !== 'accountant' && req.userBranchId !== fee.branch_id) {
      logger.warn(`User ${req.userId} attempted to record payment for fee from another branch`);
      return res.status(403).send({
        success: false,
        message: "You can only record payments for fees from your branch"
      });
    }
    
    // Check if payment amount is valid
    const remainingAmount = fee.amount - fee.paid_amount;
    if (req.body.amount > remainingAmount) {
      logger.warn(`Payment amount ${req.body.amount} exceeds remaining fee amount ${remainingAmount}`);
      return res.status(400).send({
        success: false,
        message: `Payment amount exceeds remaining fee amount (${remainingAmount})`
      });
    }
    
    // Generate receipt number
    const receiptNo = generateReceiptNumber();
    
    // Create payment object
    const payment = {
      fee_id: feeId,
      amount: req.body.amount,
      payment_date: req.body.payment_date || new Date(),
      payment_method: req.body.payment_method,
      transaction_id: req.body.transaction_id || null,
      receipt_no: receiptNo,
      remarks: req.body.remarks || null,
      status: 'completed',
      collected_by: req.userId,
      branch_id: fee.branch_id,
      created_at: new Date()
    };
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
      // Save payment in the database
      const paymentData = await Payment.create(payment, { transaction });
      
      // Update fee paid amount and status
      const newPaidAmount = fee.paid_amount + parseFloat(req.body.amount);
      const newStatus = newPaidAmount >= fee.amount ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');
      
      await Fee.update({
        paid_amount: newPaidAmount,
        status: newStatus,
        payment_date: new Date(),
        payment_method: req.body.payment_method,
        transaction_id: req.body.transaction_id || null,
        updated_at: new Date()
      }, {
        where: { id: feeId },
        transaction
      });
      
      // Commit transaction
      await transaction.commit();
      
      logger.info(`Payment recorded with ID: ${paymentData.id} for fee: ${feeId}`);
      
      res.status(201).send({
        success: true,
        message: "Payment recorded successfully",
        data: {
          payment: paymentData,
          fee_status: newStatus,
          receipt_no: receiptNo
        }
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    logger.error(`Error recording payment: ${err.message}`);
    res.status(500).send({
      success: false,
      message: err.message || "Some error occurred while recording the payment."
    });
  }
};

/**
 * Get student fee summary
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with fee summary or error
 */
exports.getStudentFeeSummary = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send({
        success: false,
        message: "Student not found"
      });
    }
    
    // Check branch permission
    if (req.userRole !== 'admin' && 
        req.userRole !== 'accountant' && 
        req.userBranchId !== student.branch_id) {
      
      // For parents, check if this is their child
      if (req.userRole === 'parent' && req.userId !== student.parent_id) {
        logger.warn(`User ${req.userId} attempted to access unauthorized student fee summary ${studentId}`);
        return res.status(403).send({
          success: false,
          message: "You don't have permission to view this student's fees"
        });
      }
    }
    
    // Get academic year filter
    const academicYear = req.query.academic_year || null;
    const where = { student_id: studentId };
    
    if (academicYear) {
      where.academic_year = academicYear;
    }
    
    // Get all fees for the student
    const fees = await Fee.findAll({
      where,
      include: [
        {
          model: FeeType,
          as: 'fee_type',
          attributes: ['id', 'name', 'frequency']
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'amount', 'payment_date', 'payment_method', 'receipt_no']
        }
      ],
      order: [['due_date', 'ASC']]
    });
    
    // Calculate summary
    const totalFees = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount), 0);
    const totalDue = totalFees - totalPaid;
    
    const pendingFees = fees.filter(fee => fee.status === 'pending' || fee.status === 'partial');
    const paidFees = fees.filter(fee => fee.status === 'paid');
    const overdueFees = fees.filter(fee => 
      (fee.status === 'pending' || fee.status === 'partial') && 
      new Date(fee.due_date) < new Date()
    );
    
    logger.info(`Retrieved fee summary for student: ${studentId}`);
    
    res.send({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          register_no: student.register_no,
          email: student.email
        },
        summary: {
          total_fees: totalFees,
          total_paid: totalPaid,
          total_due: totalDue,
          pending_count: pendingFees.length,
          paid_count: paidFees.length,
          overdue_count: overdueFees.length
        },
        fees: fees
      }
    });
  } catch (err) {
    logger.error(`Error retrieving student fee summary: ${err.message}`);
    res.status(500).send({
      success: false,
      message: "Error retrieving student fee summary"
    });
  }
};

/**
 * Generate a unique receipt number
 * 
 * @returns {String} A unique receipt number
 */
function generateReceiptNumber() {
  const prefix = 'RCPT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}