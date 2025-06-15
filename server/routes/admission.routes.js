const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');

// Get form data for admission (classes, categories, etc.)
router.get('/form-data', admissionController.getFormData);
// Get sections for a class
router.get('/sections', admissionController.getSections);
// Create admission
router.post('/create', admissionController.createAdmission);

module.exports = router;
