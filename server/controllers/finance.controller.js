/**
 * Finance Controller for comprehensive fee management
 * 
 * @module controllers/finance.controller
 */

const db = require("../models");
const Fee = db.fees;
const FeeType = db.feeType;
const Student = db.student;
const Branch = db.branch;
const Class = db.class;
const Op = db.Sequelize.Op;
const logger = require("../utils/logger");
const { validationResult } = require('express-validator');

/**
 * Get dashboard statistics for finance module
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const branchCondition = req.userRole === 'admin' ? {} : { branch_id: req.userBranchId };

    // Total fees collected this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [
      totalCollected,
      monthlyCollected,
      pendingFees,
      overdueFees,
      totalStudents,
      activeFeesCount
    ] = await Promise.all([
      Fee.sum('paid_amount', { where: branchCondition }),
      Fee.sum('paid_amount', {
        where: {
          ...branchCondition,
          payment_date: {
            [Op.gte]: currentMonth,
            [Op.lt]: nextMonth
          }
        }
      }),
      Fee.sum('amount', {
        where: {
          ...branchCondition,
          status: ['pending', 'partial']
        }
      }) - Fee.sum('paid_amount', {
        where: {
          ...branchCondition,
          status: ['pending', 'partial']
        }
      }),
      Fee.count({
        where: {
          ...branchCondition,
          status: 'overdue'
        }
      }),
      Student.count({ where: branchCondition }),
      Fee.count({
        where: {
          ...branchCondition,
          status: ['pending', 'partial']
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCollected: totalCollected || 0,
        monthlyCollected: monthlyCollected || 0,
        pendingFees: pendingFees || 0,
        overdueFees: overdueFees || 0,
        totalStudents: totalStudents || 0,
        activeFeesCount: activeFeesCount || 0
      }
    });
  } catch (error) {
    logger.error('Error getting finance dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics'
    });
  }
};

/**
 * Get all fee types with filtering and pagination
 */
exports.getFeeTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = req.userRole === 'admin' ? {} : { branch_id: req.userBranchId };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const { count, rows } = await FeeType.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'school_name']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        feeTypes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting fee types:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving fee types'
    });
  }
};

/**
 * Create a new fee type
 */
exports.createFeeType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const branchId = req.userRole === 'admin' ? req.body.branch_id : req.userBranchId;

    const feeType = await FeeType.create({
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount,
      frequency: req.body.frequency || 'one-time',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      applicable_to: req.body.applicable_to || 'all',
      class_id: req.body.applicable_to === 'class' ? req.body.class_id : null,
      branch_id: branchId
    });

    const createdFeeType = await FeeType.findByPk(feeType.id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'school_name']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    logger.info(`Fee type created by user ${req.userId}: ${feeType.name}`);

    res.status(201).json({
      success: true,
      message: 'Fee type created successfully',
      data: createdFeeType
    });
  } catch (error) {
    logger.error('Error creating fee type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee type'
    });
  }
};

/**
 * Update a fee type
 */
exports.updateFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const whereClause = { id };
    if (req.userRole !== 'admin') {
      whereClause.branch_id = req.userBranchId;
    }

    const feeType = await FeeType.findOne({ where: whereClause });

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found'
      });
    }

    await feeType.update(req.body);

    const updatedFeeType = await FeeType.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'school_name']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    logger.info(`Fee type updated by user ${req.userId}: ${feeType.name}`);

    res.status(200).json({
      success: true,
      message: 'Fee type updated successfully',
      data: updatedFeeType
    });
  } catch (error) {
    logger.error('Error updating fee type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fee type'
    });
  }
};

/**
 * Delete a fee type
 */
exports.deleteFeeType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const whereClause = { id };
    if (req.userRole !== 'admin') {
      whereClause.branch_id = req.userBranchId;
    }

    const feeType = await FeeType.findOne({ where: whereClause });

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found'
      });
    }

    // Check if fee type is being used
    const feesCount = await Fee.count({ where: { fee_type_id: id } });
    if (feesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fee type that is being used in fee records'
      });
    }

    await feeType.destroy();

    logger.info(`Fee type deleted by user ${req.userId}: ${feeType.name}`);

    res.status(200).json({
      success: true,
      message: 'Fee type deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting fee type:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee type'
    });
  }
};

/**
 * Get all fees with advanced filtering
 */
exports.getFees = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      class_id, 
      fee_type_id,
      date_from,
      date_to,
      overdue_only
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = req.userRole === 'admin' ? {} : { branch_id: req.userBranchId };

    if (status) {
      whereClause.status = status;
    }

    if (fee_type_id) {
      whereClause.fee_type_id = fee_type_id;
    }

    if (date_from && date_to) {
      whereClause.due_date = {
        [Op.between]: [date_from, date_to]
      };
    }

    if (overdue_only === 'true') {
      whereClause.due_date = { [Op.lt]: new Date() };
      whereClause.status = { [Op.in]: ['pending', 'partial'] };
    }

    const include = [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'first_name', 'last_name', 'register_no'],
        include: [
          {
            model: Class,
            as: 'enrolledClass',
            attributes: ['id', 'name'],
            where: class_id ? { id: class_id } : {},
            required: !!class_id
          }
        ]
      },
      {
        model: FeeType,
        as: 'feeType',
        attributes: ['id', 'name', 'description']
      }
    ];

    if (search) {
      include[0].where = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { register_no: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Fee.findAndCountAll({
      where: whereClause,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['due_date', 'ASC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        fees: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving fees'
    });
  }
};

/**
 * Create fee assignment for student(s)
 */
exports.createFee = async (req, res) => {
  try {
    const { student_ids, fee_type_id, amount, due_date, academic_year, term } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one student must be selected'
      });
    }

    const branchId = req.userRole === 'admin' ? req.body.branch_id : req.userBranchId;

    const fees = await Promise.all(
      student_ids.map(student_id => 
        Fee.create({
          student_id,
          fee_type_id,
          amount,
          due_date,
          academic_year,
          term,
          branch_id: branchId,
          created_by: req.userId,
          status: 'pending',
          paid_amount: 0
        })
      )
    );

    logger.info(`${fees.length} fee records created by user ${req.userId}`);

    res.status(201).json({
      success: true,
      message: `Fee assigned to ${fees.length} students successfully`,
      data: { created_count: fees.length }
    });
  } catch (error) {
    logger.error('Error creating fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee assignments'
    });
  }
};

/**
 * Collect fee payment
 */
exports.collectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount_paid, 
      payment_method, 
      transaction_id, 
      remarks,
      discount = 0,
      fine = 0
    } = req.body;

    const whereClause = { id };
    if (req.userRole !== 'admin') {
      whereClause.branch_id = req.userBranchId;
    }

    const fee = await Fee.findOne({ where: whereClause });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    const totalDue = parseFloat(fee.amount) + parseFloat(fine) - parseFloat(discount);
    const currentPaid = parseFloat(fee.paid_amount || 0);
    const newPaidAmount = currentPaid + parseFloat(amount_paid);

    if (newPaidAmount > totalDue) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds due amount'
      });
    }

    let newStatus = 'pending';
    if (newPaidAmount >= totalDue) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    // Check if overdue
    if (new Date(fee.due_date) < new Date() && newStatus !== 'paid') {
      newStatus = 'overdue';
    }

    await fee.update({
      paid_amount: newPaidAmount,
      status: newStatus,
      payment_date: new Date(),
      payment_method,
      transaction_id,
      remarks
    });

    // Log payment history (you might want to create a separate payment history table)
    logger.info(`Payment collected: Fee ID ${id}, Amount: ${amount_paid}, User: ${req.userId}`);

    res.status(200).json({
      success: true,
      message: 'Payment collected successfully',
      data: {
        fee_id: fee.id,
        total_paid: newPaidAmount,
        remaining_balance: totalDue - newPaidAmount,
        status: newStatus
      }
    });
  } catch (error) {
    logger.error('Error collecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
};

/**
 * Generate fee invoice
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { academic_year, term } = req.query;

    const whereClause = { student_id };
    if (req.userRole !== 'admin') {
      whereClause.branch_id = req.userBranchId;
    }
    if (academic_year) whereClause.academic_year = academic_year;
    if (term) whereClause.term = term;

    const fees = await Fee.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'first_name', 'last_name', 'register_no'],
          include: [
            {
              model: Class,
              as: 'enrolledClass',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: FeeType,
          as: 'feeType',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['due_date', 'ASC']]
    });

    if (fees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee records found for this student'
      });
    }

    const student = fees[0].student;
    const totalAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + parseFloat(fee.paid_amount || 0), 0);
    const totalBalance = totalAmount - totalPaid;

    const invoice = {
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        register_no: student.register_no,
        class: student.enrolledClass?.name
      },
      fees: fees.map(fee => ({
        id: fee.id,
        fee_type: fee.feeType.name,
        amount: parseFloat(fee.amount),
        paid_amount: parseFloat(fee.paid_amount || 0),
        balance: parseFloat(fee.amount) - parseFloat(fee.paid_amount || 0),
        due_date: fee.due_date,
        status: fee.status
      })),
      summary: {
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_balance: totalBalance,
        generated_at: new Date()
      }
    };

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice'
    });
  }
};

/**
 * Get payment history for a student
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { 
      student_id,
      status: { [Op.in]: ['partial', 'paid'] }
    };
    
    if (req.userRole !== 'admin') {
      whereClause.branch_id = req.userBranchId;
    }

    const { count, rows } = await Fee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: FeeType,
          as: 'feeType',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        payments: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment history'
    });
  }
};

/**
 * Get fee reports
 */
exports.getReports = async (req, res) => {
  try {
    const { 
      report_type, 
      date_from, 
      date_to, 
      class_id, 
      fee_type_id 
    } = req.query;

    const branchCondition = req.userRole === 'admin' ? {} : { branch_id: req.userBranchId };
    const dateCondition = date_from && date_to ? {
      [Op.between]: [date_from, date_to]
    } : {};

    let result = {};

    switch (report_type) {
      case 'collection_summary':
        result = await Fee.findAll({
          where: {
            ...branchCondition,
            payment_date: dateCondition,
            status: { [Op.in]: ['partial', 'paid'] }
          },
          attributes: [
            [db.sequelize.fn('DATE', db.sequelize.col('payment_date')), 'date'],
            [db.sequelize.fn('SUM', db.sequelize.col('paid_amount')), 'total_collected'],
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'transaction_count']
          ],
          group: [db.sequelize.fn('DATE', db.sequelize.col('payment_date'))],
          order: [[db.sequelize.fn('DATE', db.sequelize.col('payment_date')), 'DESC']]
        });
        break;

      case 'outstanding_fees':
        result = await Fee.findAll({
          where: {
            ...branchCondition,
            status: { [Op.in]: ['pending', 'partial', 'overdue'] }
          },
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'first_name', 'last_name', 'register_no']
            },
            {
              model: FeeType,
              as: 'feeType',
              attributes: ['id', 'name']
            }
          ],
          order: [['due_date', 'ASC']]
        });
        break;

      case 'fee_type_analysis':
        result = await Fee.findAll({
          where: {
            ...branchCondition,
            ...(fee_type_id && { fee_type_id })
          },
          attributes: [
            'fee_type_id',
            [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total_assigned'],
            [db.sequelize.fn('SUM', db.sequelize.col('paid_amount')), 'total_collected'],
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'student_count']
          ],
          include: [
            {
              model: FeeType,
              as: 'feeType',
              attributes: ['name']
            }
          ],
          group: ['fee_type_id'],
          order: [[db.sequelize.fn('SUM', db.sequelize.col('amount')), 'DESC']]
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error generating reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating reports'
    });
  }
};

module.exports = exports;
