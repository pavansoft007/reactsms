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
  const t = await db.sequelize.transaction();
  try {
    // 1. Create student
    const student = await db.student.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birthday: req.body.birthday,
      blood_group: req.body.blood_group,
      phone: req.body.student_mobile_no,
      email: req.body.student_email,
      category_id: req.body.category,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    // 2. Create enroll record for selected academic year
    await db.enroll.create({
      student_id: student.id,
      class_id: req.body.class_id,
      section_id: req.body.section,
      roll: null, // or generate roll number logic
      session_id: req.body.session_id,
      branch_id: 1, // set branch_id as needed
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Admission created successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message || 'Error creating admission' });
  }
};
