const axios = require('axios');

async function testStudentsAPI() {
  try {
    console.log('Testing student API authentication...');
    
    // First, login as admin to get a token
    const loginResponse = await axios.post('http://localhost:8080/api/auth/signin', {
      username: 'admin@gmail.com',
      password: 'admin123' // Assuming this is the admin password
    });
    
    console.log('Login successful!');
    const token = loginResponse.data.accessToken;
    const userRole = loginResponse.data.role;
    console.log('User role:', userRole);
    
    // Now try to fetch students
    const studentsResponse = await axios.get('http://localhost:8080/api/students?page=1&limit=10&session_id=9', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Students API call successful!');
    console.log('Response:', JSON.stringify(studentsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStudentsAPI();
