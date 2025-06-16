// Multer middleware for handling file uploads for branches
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/branches/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage (customize as needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Accept all possible branch files (customize field names as needed)
const branchUpload = upload.fields([
  { name: 'logo_file', maxCount: 1 },
  { name: 'text_logo', maxCount: 1 },
  { name: 'print_file', maxCount: 1 },
  { name: 'report_card', maxCount: 1 }
]);

module.exports = branchUpload;
