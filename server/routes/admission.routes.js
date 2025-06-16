const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get form data for admission (classes, categories, etc.)
router.get('/form-data', admissionController.getFormData);
// Get sections for a class
router.get('/sections', admissionController.getSections);
// Get next register number
router.get('/register-number', admissionController.getNextRegisterNumber);
// Create admission - with file upload support
router.post('/create', upload.fields([
  { name: 'student_photo', maxCount: 1 },
  { name: 'guardian_photo', maxCount: 1 }
]), admissionController.createAdmission);

module.exports = router;
