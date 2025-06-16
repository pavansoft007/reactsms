const db = require('./models');

async function testStudents() {
  try {
    await db.sequelize.sync();
    console.log('Database connected successfully');
    
    // Check students with login credentials
    const query = `
      SELECT s.id as student_id, s.register_no, s.first_name, s.last_name,
             lc.id as login_id, lc.username, lc.role, lc.active
      FROM student s 
      LEFT JOIN login_credential lc ON s.id = lc.user_id 
      WHERE lc.role = 7
      LIMIT 5
    `;
    
    const students = await db.sequelize.query(query, { 
      type: db.Sequelize.QueryTypes.SELECT 
    });
    
    console.log('Students with login credentials:');
    console.log(JSON.stringify(students, null, 2));
    
    // Also check enrollments
    const enrollQuery = `
      SELECT e.id, e.student_id, e.session_id, e.class_id, e.section_id,
             s.register_no, s.first_name, s.last_name
      FROM enroll e
      JOIN student s ON e.student_id = s.id
      LIMIT 5
    `;
    
    const enrollments = await db.sequelize.query(enrollQuery, { 
      type: db.Sequelize.QueryTypes.SELECT 
    });
    
    console.log('\nStudent enrollments:');
    console.log(JSON.stringify(enrollments, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testStudents();
