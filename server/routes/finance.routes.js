/**
 * Finance module routes
 * 
 * @module routes/finance.routes
 */

const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const authJwt = require('../middleware/auth.jwt');
const { body, param, query } = require('express-validator');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Dashboard and statistics routes
router.get('/dashboard/stats', financeController.getDashboardStats);

// Fee Types routes
router.get('/fee-types', financeController.getFeeTypes);

router.post('/fee-types', [
  body('name').notEmpty().withMessage('Fee type name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('frequency').optional().isIn(['one-time', 'monthly', 'quarterly', 'annual']),
  body('applicable_to').optional().isIn(['all', 'class']),
  body('class_id').optional().isInt({ min: 1 }),
  body('branch_id').optional().isInt({ min: 1 })
], financeController.createFeeType);

router.put('/fee-types/:id', [
  param('id').isInt({ min: 1 }).withMessage('Valid fee type ID is required'),
  body('name').optional().notEmpty().withMessage('Fee type name cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('frequency').optional().isIn(['one-time', 'monthly', 'quarterly', 'annual']),
  body('applicable_to').optional().isIn(['all', 'class']),
  body('class_id').optional().isInt({ min: 1 })
], financeController.updateFeeType);

router.delete('/fee-types/:id', [
  param('id').isInt({ min: 1 }).withMessage('Valid fee type ID is required')
], financeController.deleteFeeType);

// Fees management routes
router.get('/fees', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'partial', 'paid', 'overdue']),
  query('class_id').optional().isInt({ min: 1 }),
  query('fee_type_id').optional().isInt({ min: 1 }),
  query('overdue_only').optional().isBoolean()
], financeController.getFees);

router.post('/fees', [
  body('student_ids').isArray({ min: 1 }).withMessage('At least one student must be selected'),
  body('student_ids.*').isInt({ min: 1 }).withMessage('Valid student IDs are required'),
  body('fee_type_id').isInt({ min: 1 }).withMessage('Valid fee type ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('academic_year').optional().notEmpty(),
  body('term').optional().notEmpty(),
  body('branch_id').optional().isInt({ min: 1 })
], financeController.createFee);

// Fee collection routes
router.post('/fees/:id/collect', [
  param('id').isInt({ min: 1 }).withMessage('Valid fee ID is required'),
  body('amount_paid').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  body('transaction_id').optional().notEmpty(),
  body('remarks').optional().isLength({ max: 500 }),
  body('discount').optional().isFloat({ min: 0 }),
  body('fine').optional().isFloat({ min: 0 })
], financeController.collectPayment);

// Invoice routes
router.get('/invoices/student/:student_id', [
  param('student_id').isInt({ min: 1 }).withMessage('Valid student ID is required'),
  query('academic_year').optional().notEmpty(),
  query('term').optional().notEmpty()
], financeController.generateInvoice);

// Payment history routes
router.get('/payments/history/:student_id', [
  param('student_id').isInt({ min: 1 }).withMessage('Valid student ID is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], financeController.getPaymentHistory);

// Reports routes
router.get('/reports', [
  query('report_type').isIn(['collection_summary', 'outstanding_fees', 'fee_type_analysis'])
    .withMessage('Valid report type is required'),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
  query('class_id').optional().isInt({ min: 1 }),
  query('fee_type_id').optional().isInt({ min: 1 })
], financeController.getReports);

module.exports = router;
