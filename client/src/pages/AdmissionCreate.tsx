import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Title, Button, Stack, Grid, TextInput, Select, Textarea, Group, FileInput, PasswordInput, Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAcademicYear } from '../context/AcademicYearContext';
import api from '../api/config';

const AdmissionCreate: React.FC = () => {
  const { academicYear, years, setYears } = useAcademicYear();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

  const form = useForm({
    initialValues: {
      // Academic Details
      session_id: academicYear?.id || '',
      register_no: '',
      roll: '',
      admission_date: '',
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
      pen: '',
      student_photo: null,
      // Login Details
      student_username: '',
      student_password: '',
      student_password2: '',
      // Guardian Details
      guardian_exist: false,
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
  });

  useEffect(() => {
    // Fetch academic years if not already loaded
    if (years.length === 0) {
      api.get('/api/schoolyear').then(res => setYears(res.data || []));
    }
    // Fetch branches with auth
    api.get('/api/branches').then(res => setBranches(res.data.data || []));
    // Fetch other data
    api.get('/api/classes').then(res => setClasses(res.data.classes || []));
    api.get('/api/sections').then(res => setSections(res.data.sections || []));
    api.get('/api/categories').then(res => setCategories(res.data.categories || []));
    api.get('/api/routes').then(res => setRoutes(res.data.routes || []));
    api.get('/api/vehicles').then(res => setVehicles(res.data.vehicles || []));
    api.get('/api/hostels').then(res => setHostels(res.data.hostels || []));
    api.get('/api/rooms').then(res => setRooms(res.data.rooms || []));
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      await axios.post('/api/admission/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      form.reset();
      // Optionally show a notification
    } catch (err) {
      // Optionally show an error notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md">Student Admission</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Divider label="Academic Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Academic Year *"
              data={years.map((y: any) => ({ value: y.id.toString(), label: y.school_year }))}
              value={form.values.session_id?.toString() || ''}
              onChange={v => form.setFieldValue('session_id', v)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Branch *"
              data={branches.map((b: any) => ({ value: b.id.toString(), label: b.name }))}
              value={selectedBranch}
              onChange={v => {
                setSelectedBranch(v || '');
                form.setFieldValue('branch_id', v);
              }}
              required
              disabled={/* logic to auto-select and lock for branch user */ false}
            />
          </Grid.Col>
          <Grid.Col span={6}><TextInput label="Register No *" {...form.getInputProps('register_no')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Roll" {...form.getInputProps('roll')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Admission Date *" type="date" {...form.getInputProps('admission_date')} required /></Grid.Col>
          <Grid.Col span={6}><Select label="Class *" data={classes.map((c: any) => ({ value: c.id, label: c.name }))} {...form.getInputProps('class_id')} required /></Grid.Col>
          <Grid.Col span={6}><Select label="Section *" data={sections.map((s: any) => ({ value: s.id, label: s.name }))} {...form.getInputProps('section_id')} required /></Grid.Col>
          <Grid.Col span={6}><Select label="Category *" data={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))} {...form.getInputProps('category_id')} required /></Grid.Col>
        </Grid>
        <Divider label="Student Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><TextInput label="First Name *" {...form.getInputProps('first_name')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Last Name *" {...form.getInputProps('last_name')} /></Grid.Col>
          <Grid.Col span={6}><Select label="Gender" data={genders.map(g => ({ value: g, label: g }))} {...form.getInputProps('gender')} /></Grid.Col>
          <Grid.Col span={6}><Select label="Blood Group" data={bloodGroups.map(bg => ({ value: bg, label: bg }))} {...form.getInputProps('blood_group')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Date Of Birth" type="date" {...form.getInputProps('birthday')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Mother Tongue" {...form.getInputProps('mother_tongue')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Religion" {...form.getInputProps('religion')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Caste" {...form.getInputProps('caste')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Mobile No" {...form.getInputProps('phone')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Email" {...form.getInputProps('email')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="City" {...form.getInputProps('city')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="State" {...form.getInputProps('state')} /></Grid.Col>
          <Grid.Col span={6}><Textarea label="Present Address" {...form.getInputProps('present_address')} /></Grid.Col>
          <Grid.Col span={6}><Textarea label="Permanent Address" {...form.getInputProps('permanent_address')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Student PEN" {...form.getInputProps('pen')} /></Grid.Col>
          <Grid.Col span={6}><FileInput label="Profile Picture" {...form.getInputProps('student_photo')} /></Grid.Col>
        </Grid>
        <Divider label="Login Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><TextInput label="Username *" {...form.getInputProps('student_username')} required /></Grid.Col>
          <Grid.Col span={6}><PasswordInput label="Password *" {...form.getInputProps('student_password')} required /></Grid.Col>
          <Grid.Col span={6}><PasswordInput label="Retype Password *" {...form.getInputProps('student_password2')} required /></Grid.Col>
        </Grid>
        <Divider label="Guardian Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><TextInput label="Guardian Name *" {...form.getInputProps('guardian_name')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Relation *" {...form.getInputProps('guardian_relation')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Father Name" {...form.getInputProps('father_name')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Mother Name" {...form.getInputProps('mother_name')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Occupation *" {...form.getInputProps('guardian_occupation')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Income *" {...form.getInputProps('guardian_income')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Education *" {...form.getInputProps('guardian_education')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="City" {...form.getInputProps('guardian_city')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="State" {...form.getInputProps('guardian_state')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Mobile No *" {...form.getInputProps('guardian_phone')} required /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Email *" {...form.getInputProps('guardian_email')} required /></Grid.Col>
          <Grid.Col span={6}><Textarea label="Address *" {...form.getInputProps('guardian_address')} required /></Grid.Col>
          <Grid.Col span={6}><FileInput label="Guardian Picture" {...form.getInputProps('guardian_photo')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Guardian Username *" {...form.getInputProps('guardian_username')} required /></Grid.Col>
          <Grid.Col span={6}><PasswordInput label="Guardian Password *" {...form.getInputProps('guardian_password')} required /></Grid.Col>
          <Grid.Col span={6}><PasswordInput label="Retype Guardian Password *" {...form.getInputProps('guardian_password2')} required /></Grid.Col>
        </Grid>
        <Divider label="Transport Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><Select label="Transport Route" data={routes.map((r: any) => ({ value: r.id, label: r.name }))} {...form.getInputProps('route_id')} /></Grid.Col>
          <Grid.Col span={6}><Select label="Vehicle No" data={vehicles.map((v: any) => ({ value: v.id, label: v.number }))} {...form.getInputProps('vehicle_id')} /></Grid.Col>
        </Grid>
        <Divider label="Hostel Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><Select label="Hostel Name" data={hostels.map((h: any) => ({ value: h.id, label: h.name }))} {...form.getInputProps('hostel_id')} /></Grid.Col>
          <Grid.Col span={6}><Select label="Room Name" data={rooms.map((r: any) => ({ value: r.id, label: r.name }))} {...form.getInputProps('room_id')} /></Grid.Col>
        </Grid>
        <Divider label="Previous School Details" my="lg" labelPosition="left" />
        <Grid>
          <Grid.Col span={6}><TextInput label="School Name" {...form.getInputProps('prev_school')} /></Grid.Col>
          <Grid.Col span={6}><TextInput label="Qualification" {...form.getInputProps('prev_qualification')} /></Grid.Col>
          <Grid.Col span={12}><Textarea label="Remarks" {...form.getInputProps('prev_remarks')} /></Grid.Col>
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
