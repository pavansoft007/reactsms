import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Grid,
  TextInput,
  Select,
  Divider,
  Notification,
} from '@mantine/core';

interface OptionType { id: string; name: string; }

const AdmissionCreate = () => {
  const [form, setForm] = useState({
    schoolname: '',
    class_id: '',
    section: '',
    admission_date: '',
    category: '',
    first_name: '',
    last_name: '',
    gender: '',
    birthday: '',
    blood_group: '',
    student_mobile_no: '',
    student_email: '',
  });
  const [classes, setClasses] = useState<OptionType[]>([]);
  const [sections, setSections] = useState<OptionType[]>([]);
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [bloodGroups] = useState([
    '', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admission/form-data').then(res => {
      setClasses(res.data.classes);
      setCategories(res.data.categories);
      setForm(f => ({ ...f, schoolname: res.data.schoolname, admission_date: res.data.admission_date }));
    });
  }, []);

  useEffect(() => {
    if (form.class_id) {
      axios.get(`/api/admission/sections?class_id=${form.class_id}`).then(res => {
        setSections(res.data.sections);
      });
    } else {
      setSections([]);
    }
  }, [form.class_id]);

  const handleChange = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/admission/create', form);
      setMessage('Admission created successfully!');
      setForm({
        schoolname: form.schoolname,
        class_id: '',
        section: '',
        admission_date: form.admission_date,
        category: '',
        first_name: '',
        last_name: '',
        gender: '',
        birthday: '',
        blood_group: '',
        student_mobile_no: '',
        student_email: '',
      });
    } catch (err) {
      setError('Error creating admission.');
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={2} mb="md">Create Admission</Title>
        {message && <Notification color="green" mb="md">{message}</Notification>}
        {error && <Notification color="red" mb="md">{error}</Notification>}
        <form onSubmit={handleSubmit}>
          <Divider label="Academic Details" mb="lg" labelPosition="left" />
          <Grid gutter="md">
            <Grid.Col span={12}>
              <TextInput label="School Name" value={form.schoolname} readOnly />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Class *"
                data={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                value={form.class_id}
                onChange={val => handleChange('class_id', val ?? '')}
                required
                placeholder="Select"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Section"
                data={sections.map(sec => ({ value: sec.id, label: sec.name }))}
                value={form.section}
                onChange={val => handleChange('section', val ?? '')}
                placeholder="Select"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Admission Date"
                type="date"
                value={form.admission_date}
                onChange={e => handleChange('admission_date', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Category"
                data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={form.category}
                onChange={val => handleChange('category', val ?? '')}
                placeholder="Select"
              />
            </Grid.Col>
          </Grid>

          <Divider label="Student Details" my="lg" labelPosition="left" />
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="First Name *"
                name="first_name"
                value={form.first_name}
                onChange={e => handleChange('first_name', e.target.value)}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={e => handleChange('last_name', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Gender"
                data={[
                  { value: '', label: 'Select' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                value={form.gender}
                onChange={val => handleChange('gender', val ?? '')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Birthday"
                type="date"
                value={form.birthday}
                onChange={e => handleChange('birthday', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Blood Group"
                data={bloodGroups.map(bg => ({ value: bg, label: bg || 'Select' }))}
                value={form.blood_group}
                onChange={val => handleChange('blood_group', val ?? '')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Student Mobile No"
                value={form.student_mobile_no}
                onChange={e => handleChange('student_mobile_no', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Student Email"
                type="email"
                value={form.student_email}
                onChange={e => handleChange('student_email', e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xl">
            <Button type="submit">Create Admission</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default AdmissionCreate;
