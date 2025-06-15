const db = require('../models');

// Dummy data for dropdowns (replace with DB queries as needed)
const classes = [
  { id: '1', name: 'Class 1' },
  { id: '2', name: 'Class 2' },
];
const categories = [
  { id: '1', name: 'General' },
  { id: '2', name: 'OBC' },
  { id: '3', name: 'SC/ST' },
];
const sectionsByClass = {
  '1': [ { id: 'A', name: 'A' }, { id: 'B', name: 'B' } ],
  '2': [ { id: 'A', name: 'A' } ],
};

exports.getFormData = (req, res) => {
  res.json({
    schoolname: 'Demo School',
    admission_date: new Date().toISOString().slice(0, 10),
    classes,
    categories,
  });
};

exports.getSections = (req, res) => {
  const { class_id } = req.query;
  res.json({ sections: sectionsByClass[class_id] || [] });
};

exports.createAdmission = async (req, res) => {
  // Here you would save the admission to the database
  // For now, just return success
  res.status(201).json({ message: 'Admission created successfully' });
};
