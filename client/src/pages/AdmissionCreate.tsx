import React, { useState, useEffect } from 'react';
import {
  Container, Title, Button, Stack, Grid, TextInput, Select, Textarea, Group, FileInput, PasswordInput, Divider, LoadingOverlay, Checkbox
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAcademicYear } from '../context/AcademicYearContext';
import api from '../api/config';
import { notifications } from '@mantine/notifications';

const AdmissionCreate: React.FC = () => {
  const { academicYear } = useAcademicYear();
  
  // State for dropdown data
  const [branches, setBranches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [filteredSections, setFilteredSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  
  // State for form control
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardianExists, setGuardianExists] = useState(false);

  // Dropdown options
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  const relations = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' }
  ];

  const form = useForm({
    initialValues: {
      // Academic Details
      session_id: '',
      branch_id: '',
      register_no: '',
      roll: '',
      admission_date: new Date().toISOString().split('T')[0],
      class_id: '',
      section_id: '',
      category_id: '',
      
      // Student Details
      first_name: '',
      last_name: '',
      gender: '',
      blood_group: '',
      birthday: '',
      mother_tongue: '',
      religion: '',
      caste: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      present_address: '',
      permanent_address: '',
      student_photo: null,
      
      // Login Details
      student_username: '',
      student_password: '',
      student_password2: '',
      
      // Guardian Details
      guardian_exist: false,
      parent_id: '',
      guardian_name: '',
      guardian_relation: '',
      father_name: '',
      mother_name: '',
      guardian_occupation: '',
      guardian_income: '',
      guardian_education: '',
      guardian_city: '',
      guardian_state: '',
      guardian_phone: '',
      guardian_email: '',
      guardian_address: '',
      guardian_photo: null,
      guardian_username: '',
      guardian_password: '',
      guardian_password2: '',
      
      // Transport
      route_id: '',
      vehicle_id: '',
      
      // Hostel
      hostel_id: '',
      room_id: '',
      
      // Previous School
      prev_school: '',
      prev_qualification: '',
      prev_remarks: '',
    },
    validate: {
      first_name: (value) => (!value ? 'First name is required' : null),
      last_name: (value) => (!value ? 'Last name is required' : null),
      register_no: (value) => (!value ? 'Register number is required' : null),
      session_id: (value) => (!value ? 'Academic year is required' : null),
      class_id: (value) => (!value ? 'Class is required' : null),
      section_id: (value) => (!value ? 'Section is required' : null),
      student_username: (value) => (!value ? 'Username is required' : null),
      student_password: (value) => (!value ? 'Password is required' : null),
      student_password2: (value, values) => 
        value !== values.student_password ? 'Passwords do not match' : null,
      guardian_name: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian name is required' : null,
      guardian_relation: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian relation is required' : null,
      guardian_phone: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian phone is required' : null,
      guardian_email: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian email is required' : null,
      guardian_username: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian username is required' : null,
      guardian_password: (value, values) => 
        !values.guardian_exist && !value ? 'Guardian password is required' : null,
      guardian_password2: (value, values) => 
        !values.guardian_exist && value !== values.guardian_password ? 'Guardian passwords do not match' : null,
    },
  });

  // Set academic year when available
  useEffect(() => {
    if (academicYear?.id && !form.values.session_id) {
      form.setFieldValue('session_id', academicYear.id.toString());
    }
  }, [academicYear]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
    fetchNextRegisterNumber();
  }, []);
  // Filter sections when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchSectionsByClass(selectedClass);
    } else {
      setFilteredSections([]);
      form.setFieldValue('section_id', '');
    }
  }, [selectedClass]);
  const fetchSectionsByClass = async (classId: string) => {
    try {
      console.log('Fetching sections for class:', classId);
      const response = await api.get(`/api/admission/sections?class_id=${classId}`);
      const sections = response.data.sections || [];
      console.log('Received sections:', sections);
      setFilteredSections(sections);
      
      // Auto-select if only one section
      if (sections.length === 1) {
        form.setFieldValue('section_id', sections[0].id.toString());
      } else {
        form.setFieldValue('section_id', '');
      }
    } catch (error) {
      console.error('Error fetching sections for class:', error);
      setFilteredSections([]);
    }
  };
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admission/form-data');
      const data = response.data;
      
      console.log('Initial form data received:', data);
      
      setBranches(data.branches || []);
      setClasses(data.classes || []);
      setSections(data.sections || []);
      setCategories(data.categories || []);
      setRoutes(data.routes || []);
      setVehicles(data.vehicles || []);
      setHostels(data.hostels || []);
      setRooms(data.rooms || []);
      setAcademicYears(data.academicYears || []);
      
      console.log('Categories set:', data.categories);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load form data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNextRegisterNumber = async () => {
    try {
      const response = await api.get('/api/admission/register-number');
      form.setFieldValue('register_no', response.data.register_no);
    } catch (error) {
      console.error('Error fetching register number:', error);
    }
  };
  const handleClassChange = (value: string | null) => {
    console.log('Class changed to:', value);
    setSelectedClass(value || '');
    form.setFieldValue('class_id', value || '');
  };
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!values.first_name || !values.last_name) {
        notifications.show({
          title: 'Validation Error',
          message: 'First name and last name are required',
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // Validate that we can create a proper name
      const fullName = `${values.first_name} ${values.last_name}`.trim();
      if (!fullName || fullName.length < 2) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please provide valid first name and last name',
          color: 'red',
        });
        setLoading(false);
        return;      }

      // Check other required fields
      if (!values.session_id || !values.class_id || !values.section_id) {
        notifications.show({
          title: 'Validation Error',
          message: 'Academic year, class, and section are required',
          color: 'red',
        });
        setLoading(false);
        return;      }

      const formData = new FormData();
      
      // Add all form fields (no need for name field since database doesn't have it)
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Debug logging
      console.log('Submitting admission with data:', values);
      console.log('Full name would be:', fullName);
      
      // Log FormData contents
      console.log('FormData first_name field:', formData.get('first_name'));
      console.log('FormData last_name field:', formData.get('last_name'));
      console.log('FormData session_id field:', formData.get('session_id'));
      console.log('FormData class_id field:', formData.get('class_id'));
      console.log('FormData section_id field:', formData.get('section_id'));
      console.log('FormData register_no field:', formData.get('register_no'));
      
      const response = await api.post('/api/admission/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      notifications.show({
        title: 'Success',
        message: 'Admission created successfully',
        color: 'green',
      });
      
      console.log('Admission created successfully:', response.data);
      form.reset();
      fetchNextRegisterNumber(); // Get next register number
      
    } catch (err) {
      console.error('Error creating admission:', err);
      notifications.show({
        title: 'Error',
        message: 'Error creating admission',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test function to debug form submission
  const testSubmit = async () => {
    console.log('Testing direct submission...');
    
    const testData = new FormData();
    testData.append('name', 'Test Student');
    testData.append('first_name', 'Test');
    testData.append('last_name', 'Student');
    testData.append('register_no', '0001');
    testData.append('session_id', '9');
    testData.append('class_id', '5');
    testData.append('section_id', '2');
    testData.append('student_username', 'teststudent');
    testData.append('student_password', 'password123');
    
    console.log('Test FormData name:', testData.get('name'));
    console.log('Test FormData first_name:', testData.get('first_name'));
    console.log('Test FormData last_name:', testData.get('last_name'));
    
    try {
      const response = await api.post('/api/admission/create', testData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Test submission successful:', response.data);
      notifications.show({
        title: 'Test Success',
        message: 'Test submission worked!',
        color: 'green',
      });
    } catch (error) {
      console.error('Test submission failed:', error);
      notifications.show({
        title: 'Test Failed',
        message: 'Test submission failed',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Title order={2} mb="md">Student Admission</Title>
      
      {/* Test button for debugging */}
      <Button onClick={testSubmit} color="orange" mb="md">
        Test Submit (Debug)
      </Button>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Academic Details */}
        <Divider label="Academic Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Academic Year *"
              data={academicYears.map((year: any) => ({ 
                value: year.id.toString(), 
                label: year.school_year 
              }))}
              {...form.getInputProps('session_id')}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Branch *"
              data={branches.map((branch: any) => ({ 
                value: branch.id.toString(), 
                label: branch.name 
              }))}
              {...form.getInputProps('branch_id')}
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput 
              label="Register No *" 
              {...form.getInputProps('register_no')} 
              required 
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput 
              label="Roll" 
              {...form.getInputProps('roll')} 
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput 
              label="Admission Date *" 
              type="date" 
              {...form.getInputProps('admission_date')} 
              required 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Class *" 
              data={classes.map((cls: any) => ({ 
                value: cls.id.toString(), 
                label: cls.name 
              }))} 
              value={selectedClass}
              onChange={handleClassChange}
              required 
            />
          </Grid.Col>          <Grid.Col span={6}>
            <Select 
              label="Section *" 
              data={filteredSections.map((section: any) => ({ 
                value: section.id.toString(), 
                label: section.name 
              }))} 
              {...form.getInputProps('section_id')}
              placeholder={filteredSections.length === 0 ? "Select a class first" : "Select section"}
              required 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Category" 
              data={categories.map((cat: any) => ({ 
                value: cat.id.toString(), 
                label: cat.name 
              }))} 
              {...form.getInputProps('category_id')}
              placeholder={categories.length === 0 ? "Loading categories..." : "Select category"}
            />
          </Grid.Col>
        </Grid>

        {/* Student Details */}
        <Divider label="Student Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <TextInput label="First Name *" {...form.getInputProps('first_name')} required />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Last Name *" {...form.getInputProps('last_name')} required />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Gender" 
              data={genders} 
              {...form.getInputProps('gender')} 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Blood Group" 
              data={bloodGroups.map(bg => ({ value: bg, label: bg }))} 
              {...form.getInputProps('blood_group')} 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput 
              label="Date Of Birth" 
              type="date" 
              {...form.getInputProps('birthday')} 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Mother Tongue" {...form.getInputProps('mother_tongue')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Religion" {...form.getInputProps('religion')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Caste" {...form.getInputProps('caste')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Mobile No" {...form.getInputProps('phone')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Email" {...form.getInputProps('email')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="City" {...form.getInputProps('city')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="State" {...form.getInputProps('state')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Textarea label="Present Address" {...form.getInputProps('present_address')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Textarea label="Permanent Address" {...form.getInputProps('permanent_address')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <FileInput label="Profile Picture" {...form.getInputProps('student_photo')} />
          </Grid.Col>
        </Grid>

        {/* Login Details */}
        <Divider label="Login Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={4}>
            <TextInput label="Username *" {...form.getInputProps('student_username')} required />
          </Grid.Col>
          <Grid.Col span={4}>
            <PasswordInput label="Password *" {...form.getInputProps('student_password')} required />
          </Grid.Col>
          <Grid.Col span={4}>
            <PasswordInput label="Retype Password *" {...form.getInputProps('student_password2')} required />
          </Grid.Col>
        </Grid>

        {/* Guardian Details */}
        <Divider label="Guardian Details" my="lg" labelPosition="left" />
        <Checkbox
          label="Use existing guardian"
          checked={guardianExists}
          onChange={(event) => {
            setGuardianExists(event.currentTarget.checked);
            form.setFieldValue('guardian_exist', event.currentTarget.checked);
          }}
          mb="md"
        />
        
        {!guardianExists ? (
          <Grid>
            <Grid.Col span={6}>
              <TextInput label="Guardian Name *" {...form.getInputProps('guardian_name')} required />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select 
                label="Relation *" 
                data={relations} 
                {...form.getInputProps('guardian_relation')} 
                required 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Father Name" {...form.getInputProps('father_name')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Mother Name" {...form.getInputProps('mother_name')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Occupation *" {...form.getInputProps('guardian_occupation')} required />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Income" {...form.getInputProps('guardian_income')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Education" {...form.getInputProps('guardian_education')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="City" {...form.getInputProps('guardian_city')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="State" {...form.getInputProps('guardian_state')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Mobile No *" {...form.getInputProps('guardian_phone')} required />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Email *" {...form.getInputProps('guardian_email')} required />
            </Grid.Col>
            <Grid.Col span={6}>
              <Textarea label="Address" {...form.getInputProps('guardian_address')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <FileInput label="Guardian Picture" {...form.getInputProps('guardian_photo')} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Guardian Username *" {...form.getInputProps('guardian_username')} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <PasswordInput label="Guardian Password *" {...form.getInputProps('guardian_password')} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <PasswordInput label="Retype Guardian Password *" {...form.getInputProps('guardian_password2')} required />
            </Grid.Col>
          </Grid>
        ) : (
          <Grid>
            <Grid.Col span={12}>
              <Select 
                label="Select Existing Guardian *" 
                data={[]} // This would be populated with existing guardians
                {...form.getInputProps('parent_id')} 
                required 
              />
            </Grid.Col>
          </Grid>
        )}

        {/* Transport Details */}
        <Divider label="Transport Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <Select 
              label="Transport Route" 
              data={routes.map((route: any) => ({ 
                value: route.id.toString(), 
                label: route.name 
              }))} 
              {...form.getInputProps('route_id')} 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Vehicle No" 
              data={vehicles.map((vehicle: any) => ({ 
                value: vehicle.id.toString(), 
                label: vehicle.number 
              }))} 
              {...form.getInputProps('vehicle_id')} 
            />
          </Grid.Col>
        </Grid>

        {/* Hostel Details */}
        <Divider label="Hostel Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <Select 
              label="Hostel Name" 
              data={hostels.map((hostel: any) => ({ 
                value: hostel.id.toString(), 
                label: hostel.name 
              }))} 
              {...form.getInputProps('hostel_id')} 
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select 
              label="Room Name" 
              data={rooms.map((room: any) => ({ 
                value: room.id.toString(), 
                label: room.name 
              }))} 
              {...form.getInputProps('room_id')} 
            />
          </Grid.Col>
        </Grid>

        {/* Previous School Details */}
        <Divider label="Previous School Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <TextInput label="School Name" {...form.getInputProps('prev_school')} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Qualification" {...form.getInputProps('prev_qualification')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea label="Remarks" {...form.getInputProps('prev_remarks')} />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            Create Admission
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default AdmissionCreate;
