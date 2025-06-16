const db = require('../models');

// Get initial form data
exports.getFormData = async (req, res) => {
  try {
    let data = {
      branches: [],
      academicYears: [],
      classes: [],
      categories: [],
      routes: [],
      vehicles: [],
      hostels: [],
      rooms: []
    };

    // Get branches
    try {
      const branches = await db.branch.findAll({
        attributes: ['id', 'name'],
        where: { is_active: 1 }
      });
      data.branches = branches || [];
    } catch (error) {
      console.error('Error fetching branches:', error);
      data.branches = [];
    }

    // Get academic years
    try {
      const academicYears = await db.schoolyear.findAll({
        attributes: ['id', 'school_year'],
        order: [['school_year', 'DESC']]
      });
      data.academicYears = academicYears || [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      data.academicYears = [];
    }

    // Get classes
    try {
      const classes = await db.class.findAll({
        attributes: ['id', 'name'],
        where: { is_active: 1 }
      });
      data.classes = classes || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      data.classes = [];
    }    // Get student categories
    try {
      const categories = await db.studentCategory.findAll({
        attributes: ['id', 'name']
      });
      data.categories = categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      data.categories = [];
    }

    // Get routes
    try {
      if (db.route) {
        const routes = await db.route.findAll({
          attributes: ['id', 'name'],
          where: { is_active: 1 }
        });
        data.routes = routes || [];
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      data.routes = [];
    }

    // Get vehicles
    try {
      if (db.vehicle) {
        const vehicles = await db.vehicle.findAll({
          attributes: ['id', 'number'],
          where: { is_active: 1 }
        });
        data.vehicles = vehicles || [];
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      data.vehicles = [];
    }

    // Get hostels
    try {
      if (db.hostel) {
        const hostels = await db.hostel.findAll({
          attributes: ['id', 'name'],
          where: { is_active: 1 }
        });
        data.hostels = hostels || [];
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
      data.hostels = [];
    }

    // Get rooms
    try {
      if (db.room) {
        const rooms = await db.room.findAll({
          attributes: ['id', 'name'],
          where: { is_active: 1 }
        });
        data.rooms = rooms || [];
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      data.rooms = [];
    }    // Get all sections (we'll filter by class on the frontend)
    try {
      const sections = await db.section.findAll({
        attributes: ['id', 'name'],
        where: { is_active: 1 }
      });
      data.sections = sections || [];
    } catch (error) {
      console.error('Error fetching sections:', error);
      data.sections = [];
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sections by class
exports.getSections = async (req, res) => {
  try {
    const { class_id } = req.query;
    if (!class_id) {
      return res.json({ sections: [] });
    }
    
    // Use sections_allocation to find sections for a class
    const sectionsAllocations = await db.sections_allocation.findAll({
      where: { class_id: class_id },
      include: [{
        model: db.section,
        as: 'section',
        attributes: ['id', 'name'],
        where: { is_active: 1 }
      }]
    });
    
    const sections = sectionsAllocations.map(allocation => allocation.section);
    res.json({ sections: sections || [] });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate next register number
exports.getNextRegisterNumber = async (req, res) => {
  try {
    const lastStudent = await db.student.findOne({
      attributes: ['register_no'],
      order: [['id', 'DESC']]
    });
    
    let nextRegisterNo = '0001';
    if (lastStudent && lastStudent.register_no) {
      const lastNumber = parseInt(lastStudent.register_no);
      nextRegisterNo = String(lastNumber + 1).padStart(4, '0');
    }
    
    res.json({ register_no: nextRegisterNo });
  } catch (error) {
    console.error('Error generating register number:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new admission
exports.createAdmission = async (req, res) => {
  const t = await db.sequelize.transaction();  try {
    console.log('Received request body:', req.body);
    console.log('Name field:', req.body.name);
    console.log('First name:', req.body.first_name);
    console.log('Last name:', req.body.last_name);
    console.log('Admission date raw:', req.body.admission_date, typeof req.body.admission_date);
    console.log('Birthday raw:', req.body.birthday, typeof req.body.birthday);
      // Helper function to safely convert date to string format
    const safeParseDate = (dateValue) => {
      if (!dateValue) return null;
      if (Array.isArray(dateValue)) {
        dateValue = dateValue[0]; // Take first element if array
      }
      if (typeof dateValue === 'object' && dateValue.value) {
        dateValue = dateValue.value; // Extract value if object
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const parsedDate = new Date(dateValue);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }
      return null;
    };

    // Helper function to format date as string for database
    const formatDateForDB = (dateValue) => {
      if (!dateValue) return null;
      if (Array.isArray(dateValue)) {
        dateValue = dateValue[0]; // Take first element if array
      }
      if (typeof dateValue === 'object' && dateValue.value) {
        dateValue = dateValue.value; // Extract value if object
      }
      if (typeof dateValue === 'string') {
        // If it's already a string in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        // Otherwise try to parse and format
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
      }
      if (typeof dateValue === 'number') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
      }
      return null;
    };
    
    // 1. Handle guardian creation
    let parentId = null;
    if (!req.body.guardian_exist && req.body.guardian_name && db.parent) {
      try {
        const parentData = {
          name: req.body.guardian_name,
          relation: req.body.guardian_relation,
          father_name: req.body.father_name,
          mother_name: req.body.mother_name,
          occupation: req.body.guardian_occupation,
          income: req.body.guardian_income,
          education: req.body.guardian_education,
          email: req.body.guardian_email,
          mobileno: req.body.guardian_phone,
          address: req.body.guardian_address,
          city: req.body.guardian_city,
          state: req.body.guardian_state,
          branch_id: req.body.branch_id || 1,
          photo: req.files && req.files.guardian_photo ? req.files.guardian_photo[0].filename : 'default.png',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const parent = await db.parent.create(parentData, { transaction: t });
        parentId = parent.id;
        
        // Create guardian login credentials
        if (db.loginCredential) {
          const guardianCredentials = {
            user_id: parentId,
            username: req.body.guardian_username,
            password: req.body.guardian_password, // Should be hashed in production
            role: 6, // Guardian role
            created_at: new Date(),
            updated_at: new Date()
          };
          await db.loginCredential.create(guardianCredentials, { transaction: t });
        }      } catch (parentError) {
        console.error('Error creating parent:', parentError);
        // Continue without parent if creation fails
      }
    } else if (req.body.guardian_exist && req.body.parent_id) {
      parentId = req.body.parent_id;
    }

    // 2. Create student
    const previousDetails = {
      school_name: req.body.prev_school,
      qualification: req.body.prev_qualification,
      remarks: req.body.prev_remarks
    };
    
    // Validate required fields - just check for first_name
    if (!req.body.first_name || req.body.first_name.trim().length === 0) {
      console.log('No first_name provided. Available fields:', {
        first_name: req.body.first_name,
        last_name: req.body.last_name
      });
      return res.status(400).json({ error: 'Student first name is required' });
    }
      console.log('Student first_name:', req.body.first_name);
    console.log('Student last_name:', req.body.last_name);    const studentData = {
      register_no: req.body.register_no,
      admission_date: formatDateForDB(req.body.admission_date) || new Date().toISOString().split('T')[0],
      first_name: req.body.first_name,
      last_name: req.body.last_name || '',
      gender: req.body.gender,
      birthday: formatDateForDB(req.body.birthday),
      religion: req.body.religion,
      caste: req.body.caste,
      blood_group: req.body.blood_group,
      mother_tongue: req.body.mother_tongue,
      current_address: req.body.present_address,
      permanent_address: req.body.permanent_address,
      city: req.body.city,
      state: req.body.state,
      mobileno: req.body.phone,
      email: req.body.email,
      category_id: req.body.category_id,
      parent_id: parentId,
      route_id: req.body.route_id || 0,
      vehicle_id: req.body.vehicle_id || 0,
      hostel_id: req.body.hostel_id || 0,
      room_id: req.body.room_id || 0,
      previous_details: JSON.stringify(previousDetails),
      photo: req.files && req.files.student_photo ? req.files.student_photo[0].filename : 'default.png',
      created_at: new Date()
    };

    console.log('Creating student with data:', JSON.stringify(studentData, null, 2));
    const student = await db.student.create(studentData, { transaction: t });
    console.log('Student created successfully with ID:', student.id);

    // 3. Create student login credentials
    if (db.loginCredential) {
      try {
        const studentCredentials = {
          user_id: student.id,
          username: req.body.student_username,
          password: req.body.student_password, // Should be hashed in production
          role: 7, // Student role
          created_at: new Date(),
          updated_at: new Date()
        };
        await db.loginCredential.create(studentCredentials, { transaction: t });
      } catch (credError) {
        console.error('Error creating student credentials:', credError);
        // Continue without credentials if creation fails
      }
    }    // 4. Create enrollment record
    // Generate roll number if not provided
    let rollNumber = req.body.roll;
    if (!rollNumber) {
      // If no roll number provided, get the next available roll number for this class and section
      const lastEnrollment = await db.enroll.findOne({
        where: {
          class_id: req.body.class_id,
          section_id: req.body.section_id,
          session_id: req.body.session_id
        },
        order: [['roll', 'DESC']],
        transaction: t
      });
      rollNumber = lastEnrollment ? lastEnrollment.roll + 1 : 1;
    }

    const enrollmentData = {
      student_id: student.id,
      class_id: req.body.class_id,
      section_id: req.body.section_id,
      roll: rollNumber,
      session_id: req.body.session_id,
      branch_id: req.body.branch_id || 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    await db.enroll.create(enrollmentData, { transaction: t });

    await t.commit();
    res.status(201).json({ 
      message: 'Admission created successfully',
      student_id: student.id,
      register_no: student.register_no
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating admission:', err);
    res.status(500).json({ error: err.message || 'Error creating admission' });
  }
};
