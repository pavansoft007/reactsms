import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Group,
  Button,
  Table,
  TextInput,
  Select,
  Modal,
  Stack,
  Grid,
  Card,
  Text,
  Badge,
  ActionIcon,
  Pagination,
  Avatar,
  Menu,

  Textarea,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconDownload,
  IconUpload,
  IconDots,
  IconPhone,
  IconMail,

} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import api from '../api/config';
import { useAcademicYear } from '../context/AcademicYearContext';

interface Student {
  id: number;
  user: {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
  };
  admission_no: string;
  roll: string;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  guardian_name?: string;
  guardian_phone?: string;
  admission_date: string;
  blood_group?: string;
  current_address?: string;
}

interface Class {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { academicYear } = useAcademicYear();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      admission_no: '',
      roll: '',
      class_id: '',
      section_id: '',
      father_name: '',
      father_phone: '',
      father_occupation: '',
      mother_name: '',
      mother_phone: '',
      mother_occupation: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_relation: '',
      admission_date: '',
      blood_group: '',
      current_address: '',
      permanent_address: '',
      medical_info: '',
    },
  });

  useEffect(() => {
    if (academicYear) {
      fetchStudents(1, '', selectedClass || '', academicYear.id);
    }
    fetchClasses();
    fetchSections();
  }, [academicYear]);

  const fetchStudents = async (page = 1, search = '', classId = '', sessionId = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(classId && { class_id: classId }),
        ...(sessionId && { session_id: sessionId })
      }).toString();
      const response = await api.get(`/api/students?${params}`);
      setStudents(response.data.students || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get('/api/sections');
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'put' : 'post';
      await api[method](endpoint, values);
      notifications.show({
        title: 'Success',
        message: `Student ${editingStudent ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
      setModalOpened(false);
      setEditingStudent(null);
      form.reset();
      fetchStudents(1, '', selectedClass || '', academicYear.id);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || `Failed to ${editingStudent ? 'update' : 'create'} student`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setValues({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone || '',
      admission_no: student.admission_no,
      roll: student.roll,
      class_id: student.class.id?.toString() || '',
      section_id: student.section.id?.toString() || '',
      father_name: student.father_name || '',
      father_phone: student.father_phone || '',
      mother_name: student.mother_name || '',
      mother_phone: student.mother_phone || '',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
      blood_group: student.blood_group || '',
      current_address: student.current_address || '',
    });
    setModalOpened(true);
  };

  const handleDelete = async (studentId: number) => {
    setLoading(true);
    try {
      await api.delete(`/api/students/${studentId}`);
      notifications.show({
        title: 'Success',
        message: 'Student deleted successfully',
        color: 'green',
      });
      fetchStudents(currentPage, '', selectedClass || '', academicYear.id);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete student',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStudents(1, searchQuery, selectedClass || '', academicYear.id);
  };

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Students Management</Title>
            <Text c="dimmed">Manage student registrations and information</Text>
          </div>
          <Group>
            <Button leftSection={<IconUpload size={16} />} variant="light">
              Import
            </Button>
            <Button leftSection={<IconDownload size={16} />} variant="light">
              Export
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingStudent(null);
                form.reset();
                setModalOpened(true);
              }}
            >
              Add Student
            </Button>
          </Group>
        </Group>

        {/* Filters */}
        <Card withBorder radius="md" p="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                placeholder="Search students..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Select
                placeholder="Filter by class"
                data={classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))}
                value={selectedClass}
                onChange={setSelectedClass}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
              <Button onClick={handleSearch} fullWidth>
                Search
              </Button>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Students Table */}
        <Card withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Student</Table.Th>
                <Table.Th>Admission No</Table.Th>
                <Table.Th>Class & Section</Table.Th>
                <Table.Th>Roll No</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Parent Contact</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {students.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size={40} radius="xl" color="blue">
                        {student.user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {student.user.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {student.user.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{student.admission_no}</Text>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text size="sm" fw={500}>
                        {student.class.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {student.section.name}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{student.roll}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      {student.user.phone && (
                        <Group gap="xs">
                          <IconPhone size={12} />
                          <Text size="xs">{student.user.phone}</Text>
                        </Group>
                      )}
                      <Group gap="xs">
                        <IconMail size={12} />
                        <Text size="xs">{student.user.email}</Text>
                      </Group>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      {student.father_phone && (
                        <Group gap="xs">
                          <IconPhone size={12} />
                          <Text size="xs">F: {student.father_phone}</Text>
                        </Group>
                      )}
                      {student.mother_phone && (
                        <Group gap="xs">
                          <IconPhone size={12} />
                          <Text size="xs">M: {student.mother_phone}</Text>
                        </Group>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" size="sm">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="light" size="sm" onClick={() => handleEdit(student)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(student.id)}>
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={(page) => fetchStudents(page, searchQuery, selectedClass || '', academicYear.id)}
                total={totalPages}
              />
            </Group>
          )}
        </Card>

        {/* Add/Edit Student Modal */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
          size="xl"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={4}>Personal Information</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Full Name"
                    placeholder="Enter student name"
                    {...form.getInputProps('name')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    placeholder="Enter email address"
                    {...form.getInputProps('email')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone"
                    placeholder="Enter phone number"
                    {...form.getInputProps('phone')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Admission Number"
                    placeholder="Enter admission number"
                    {...form.getInputProps('admission_no')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    label="Class"
                    placeholder="Select class"
                    data={classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))}
                    {...form.getInputProps('class_id')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    label="Section"
                    placeholder="Select section"
                    data={sections.map(sec => ({ value: sec.id.toString(), label: sec.name }))}
                    {...form.getInputProps('section_id')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    label="Roll Number"
                    placeholder="Enter roll number"
                    {...form.getInputProps('roll')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Admission Date"
                    type="date"
                    {...form.getInputProps('admission_date')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Blood Group"
                    placeholder="Select blood group"
                    data={bloodGroups}
                    {...form.getInputProps('blood_group')}
                  />
                </Grid.Col>
              </Grid>

              <Title order={4}>Parent/Guardian Information</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Father's Name"
                    placeholder="Enter father's name"
                    {...form.getInputProps('father_name')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Father's Phone"
                    placeholder="Enter father's phone"
                    {...form.getInputProps('father_phone')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Mother's Name"
                    placeholder="Enter mother's name"
                    {...form.getInputProps('mother_name')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Mother's Phone"
                    placeholder="Enter mother's phone"
                    {...form.getInputProps('mother_phone')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Guardian's Name"
                    placeholder="Enter guardian's name"
                    {...form.getInputProps('guardian_name')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Guardian's Phone"
                    placeholder="Enter guardian's phone"
                    {...form.getInputProps('guardian_phone')}
                  />
                </Grid.Col>
              </Grid>

              <Title order={4}>Address Information</Title>
              <Textarea
                label="Current Address"
                placeholder="Enter current address"
                {...form.getInputProps('current_address')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {editingStudent ? 'Update' : 'Create'} Student
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default StudentsPage;