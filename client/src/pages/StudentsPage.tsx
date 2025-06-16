import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  SimpleGrid,
  ThemeIcon,
  Progress,
  Divider,
  SegmentedControl,
  Indicator,
  NumberFormatter,
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
  IconUser,
  IconUsers,
  IconActivity,
  IconClock,
  IconTrendingUp,
  IconSortAscending,
  IconLayoutGrid,
  IconLayoutList,
  IconRefresh,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/config';
import { useAcademicYear } from '../context/AcademicYearContext';
import { useTheme } from '../context/ThemeContext';

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
  status?: 'active' | 'inactive' | 'suspended';
  grade?: string;
  attendance?: number;
  performance?: number;
  subjects?: string[];
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
  const { theme } = useTheme();
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(12);
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
  });  useEffect(() => {
    if (academicYear) {
      fetchStudents(1, '', selectedClass || '', academicYear.id.toString());
    }
    fetchClasses();
    fetchSections();
  }, [academicYear, selectedClass]);
  const fetchStudents = useCallback(async (page = 1, search = '', classId = '', sessionId = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(search && { search }),
        ...(classId && { class_id: classId }),
        ...(sessionId && { session_id: sessionId })
      }).toString();
      const response = await api.get(`/api/students?${params}`);
      
      // Enhance students data with demo-like properties
      const enhancedStudents = (response.data.students || []).map((student: Student) => ({
        ...student,
        status: student.status || 'active',
        grade: student.grade || ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.floor(Math.random() * 8)],
        attendance: student.attendance || Math.floor(Math.random() * 30) + 70,
        performance: student.performance || Math.floor(Math.random() * 30) + 70,
        subjects: student.subjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].slice(0, Math.floor(Math.random() * 3) + 3)
      }));
      
      setStudents(enhancedStudents);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

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
      fetchStudents(1, '', selectedClass || '', academicYear?.id?.toString() || '');
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
      fetchStudents(currentPage, '', selectedClass || '', academicYear?.id?.toString() || '');
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
    setCurrentPage(1);
    fetchStudents(1, searchQuery, selectedClass || '', academicYear?.id?.toString() || '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'suspended':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade?.includes('A')) return 'green';
    if (grade?.includes('B')) return 'blue';
    if (grade?.includes('C')) return 'yellow';
    return 'red';
  };

  const handleViewStudent = (student: Student) => {
    notifications.show({
      title: 'View Profile',
      message: `Viewing ${student.user.name}'s profile...`,
      color: 'blue',
    });
  };

  // Calculate stats
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    suspended: students.filter((s) => s.status === 'suspended').length,
    avgAttendance: students.length > 0 
      ? students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length
      : 0,
    avgPerformance: students.length > 0
      ? students.reduce((acc, s) => acc + (s.performance || 0), 0) / students.length
      : 0,
  };
  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        p="xl"
        radius="xl"
        style={{
          background: `linear-gradient(135deg, ${
            theme.colors?.primary?.[6] ?? "#228be6"
          } 0%, ${theme.colors?.primary?.[4] ?? "#339af0"} 100%)`,
          border: "none",
          color: "white",
          marginBottom: "2rem",
        }}
      >
        <Group justify="space-between" align="center" mb="lg">
          <div>
            <Text size="2rem" fw={700} mb="xs">
              Students Management
            </Text>
            <Text size="lg" opacity={0.9}>
              Manage student registrations and information with advanced analytics
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="white"
              color="dark"
              leftSection={<IconUpload size={18} />}
              size="lg"
              radius="xl"
            >
              Import
            </Button>
            <Button
              variant="white"
              color="dark"
              leftSection={<IconDownload size={18} />}
              size="lg"
              radius="xl"
            >
              Export
            </Button>
            <Button
              variant="white"
              color="dark"
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                setEditingStudent(null);
                form.reset();
                setModalOpened(true);
              }}
              size="lg"
              radius="xl"
            >
              Add Student
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              radius="lg"
              p="md"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon size="lg" radius="xl" variant="white" color="dark">
                  <IconUsers size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Total Students
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.total}
              </Text>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              radius="lg"
              p="md"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon size="lg" radius="xl" variant="white" color="green">
                  <IconActivity size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Active
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.active}
              </Text>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              radius="lg"
              p="md"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon size="lg" radius="xl" variant="white" color="blue">
                  <IconClock size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Attendance
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.avgAttendance.toFixed(1)}%
              </Text>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              radius="lg"
              p="md"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon size="lg" radius="xl" variant="white" color="yellow">
                  <IconTrendingUp size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Performance
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.avgPerformance.toFixed(1)}%
              </Text>
            </Card>
          </motion.div>
        </SimpleGrid>
      </Paper>    </motion.div>
  );

  const renderControls = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Paper
        p="lg"
        radius="xl"
        mb="xl"
        style={{
          background: theme.bg?.elevated,
          border: `1px solid ${theme.border}`,
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Group gap="lg">
            <TextInput
              placeholder="Search students..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ minWidth: 300 }}
              radius="xl"
              size="md"
            />

            <Select
              placeholder="All Classes"
              data={[
                { label: "All Classes", value: "" },
                ...classes.map(cls => ({ label: cls.name, value: cls.id.toString() }))
              ]}
              value={selectedClass}
              onChange={setSelectedClass}
              radius="xl"
              size="md"
              clearable
            />

            <Button onClick={handleSearch} radius="xl" size="md">
              Search
            </Button>
          </Group>

          <Group gap="sm">            <SegmentedControl
              data={[
                { label: <IconLayoutGrid size={16} />, value: "grid" },
                { label: <IconLayoutList size={16} />, value: "list" },
                { label: "Table", value: "table" },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as "grid" | "list" | "table")}
              radius="xl"
            />

            <Select
              placeholder="Sort by"
              data={[
                { label: "Name", value: "name" },
                { label: "Class", value: "className" },
                { label: "Admission No", value: "admission_no" },
                { label: "Performance", value: "performance" },
                { label: "Attendance", value: "attendance" },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value || "name")}
              radius="xl"
              size="md"
              leftSection={<IconSortAscending size={16} />}
            />

            <ActionIcon
              variant="light"
              size="xl"
              radius="xl"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <IconSortAscending
                size={18}
                style={{
                  transform: sortOrder === "desc" ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            </ActionIcon>            <ActionIcon
              variant="light"
              size="xl"
              radius="xl"
              onClick={() => fetchStudents(currentPage, searchQuery, selectedClass || '', academicYear?.id?.toString() || '')}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>      </Paper>
    </motion.div>
  );

  const renderStudentCard = (student: Student, index: number) => (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        radius="xl"
        p="lg"
        style={{
          background: theme.bg?.elevated,
          border: `1px solid ${theme.border}`,
          height: "100%",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 20px 40px ${
            theme.colors?.primary?.[2] ?? "rgba(34, 139, 230, 0.2)"
          }`;
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Card Header */}
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <Indicator
              size={12}
              color={getStatusColor(student.status || 'active')}
              position="bottom-end"
              withBorder
            >
              <Avatar
                src={student.user.photo}
                size="lg"
                radius="xl"
                style={{
                  background: `linear-gradient(135deg, ${
                    theme.colors?.primary?.[4] ?? "#339af0"
                  }, ${theme.colors?.primary?.[6] ?? "#228be6"})`,
                }}
              >
                <IconUser size={24} />
              </Avatar>
            </Indicator>
            <div>              <Text fw={600} size="md" lineClamp={1}>
                {student.user?.name || 'N/A'}
              </Text>
              <Text size="xs" c="dimmed">
                {student.admission_no}
              </Text>
            </div>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" radius="xl">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={16} />}
                onClick={() => handleViewStudent(student)}
              >
                View Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={() => handleEdit(student)}
              >
                Edit Student
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDelete(student.id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Student Info */}
        <Stack gap="sm">          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Class & Section
            </Text>
            <Badge variant="light" radius="xl">
              {student.class?.name || 'N/A'} - {student.section?.name || 'N/A'}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Roll No
            </Text>
            <Badge variant="light" radius="xl">
              {student.roll}
            </Badge>
          </Group>

          {student.grade && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Grade
              </Text>
              <Badge
                color={getGradeColor(student.grade)}
                variant="light"
                radius="xl"
              >
                {student.grade}
              </Badge>
            </Group>
          )}

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Status
            </Text>
            <Badge
              color={getStatusColor(student.status || 'active')}
              variant="light"
              radius="xl"
            >
              {(student.status || 'active').toUpperCase()}
            </Badge>
          </Group>
        </Stack>

        <Divider my="md" />

        {/* Performance Metrics */}
        {(student.attendance || student.performance) && (
          <Stack gap="sm">
            {student.attendance && (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Attendance
                  </Text>
                  <Text size="sm" fw={500}>
                    {student.attendance}%
                  </Text>
                </Group>
                <Progress
                  value={student.attendance}
                  color={
                    student.attendance > 85
                      ? "green"
                      : student.attendance > 70
                      ? "yellow"
                      : "red"
                  }
                  radius="xl"
                  size="sm"
                />
              </>
            )}

            {student.performance && (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Performance
                  </Text>
                  <Text size="sm" fw={500}>
                    {student.performance}%
                  </Text>
                </Group>
                <Progress
                  value={student.performance}
                  color={
                    student.performance > 85
                      ? "green"
                      : student.performance > 70
                      ? "yellow"
                      : "red"
                  }
                  radius="xl"
                  size="sm"
                />
              </>
            )}
          </Stack>
        )}

        {(student.attendance || student.performance) && <Divider my="md" />}

        {/* Contact Info */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconMail size={14} style={{ color: '#666' }} />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {student.user.email}
            </Text>
          </Group>
          {student.user.phone && (
            <Group gap="xs">
              <IconPhone size={14} style={{ color: '#666' }} />
              <Text size="xs" c="dimmed">
                {student.user.phone}
              </Text>
            </Group>
          )}
        </Stack>
      </Card>
    </motion.div>
  );

  const renderStudentList = (student: Student, index: number) => (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        radius="lg"
        p="md"
        mb="sm"
        style={{
          background: theme.bg?.elevated,
          border: `1px solid ${theme.border}`,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor =
            theme.colors?.primary?.[4] ?? "#339af0";
          e.currentTarget.style.transform = "translateX(4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Indicator
              size={12}
              color={getStatusColor(student.status || 'active')}
              position="bottom-end"
              withBorder
            >
              <Avatar src={student.user.photo} size="md" radius="xl">
                <IconUser size={20} />
              </Avatar>
            </Indicator>

            <div>              <Text fw={600} size="md">
                {student.user?.name || 'N/A'}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {student.admission_no}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>                <Text size="sm" c="dimmed">
                  {student.class?.name || 'N/A'} - {student.section?.name || 'N/A'}
                </Text>
              </Group>
            </div>
          </Group>

          <Group gap="lg">
            {student.grade && (
              <div style={{ textAlign: "center" }}>
                <Text size="xs" c="dimmed">
                  Grade
                </Text>
                <Badge
                  color={getGradeColor(student.grade)}
                  variant="light"
                  radius="xl"
                >
                  {student.grade}
                </Badge>
              </div>
            )}

            {student.attendance && (
              <div style={{ textAlign: "center" }}>
                <Text size="xs" c="dimmed">
                  Attendance
                </Text>
                <Text size="sm" fw={500}>
                  {student.attendance}%
                </Text>
              </div>
            )}

            {student.performance && (
              <div style={{ textAlign: "center" }}>
                <Text size="xs" c="dimmed">
                  Performance
                </Text>
                <Text size="sm" fw={500}>
                  {student.performance}%
                </Text>
              </div>
            )}

            <Badge
              color={getStatusColor(student.status || 'active')}
              variant="light"
              radius="xl"
            >
              {(student.status || 'active').toUpperCase()}
            </Badge>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" radius="xl">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleViewStudent(student)}
                >
                  View Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={() => handleEdit(student)}
                >
                  Edit Student
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => handleDelete(student.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Card>
    </motion.div>
  );
  return (
    <Container size="xl" py="xl">
      {renderHeader()}
      {renderControls()}

      {loading ? (
        <Stack align="center" py={60}>
          <Text>Loading students...</Text>
        </Stack>
      ) : students.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            p="xl"
            radius="xl"
            style={{
              background: theme.bg?.elevated,
              border: `1px solid ${theme.border}`,
              textAlign: "center",
            }}
          >
            <ThemeIcon size={64} radius="xl" variant="light" mx="auto" mb="md">
              <IconUser size={32} />
            </ThemeIcon>
            <Text size="xl" fw={600} mb="xs">
              No students found
            </Text>
            <Text c="dimmed" mb="lg">
              {searchQuery || selectedClass
                ? "Try adjusting your search or filters"
                : "Get started by adding your first student"}
            </Text>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                setEditingStudent(null);
                form.reset();
                setModalOpened(true);
              }}
              radius="xl"
            >
              Add Student
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing="lg"
                  mb="xl"
                >
                  {students.map((student, index) =>
                    renderStudentCard(student, index)
                  )}
                </SimpleGrid>
              </motion.div>
            ) : viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: "2rem" }}>
                  {students.map((student, index) =>
                    renderStudentList(student, index)
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card withBorder radius="xl" mb="xl">
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
                            <Group gap="sm">                              <Avatar size={40} radius="xl" src={student.user?.photo}>
                                {student.user?.name?.charAt(0) || 'N'}
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {student.user?.name || 'N/A'}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {student.user?.email || 'N/A'}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{student.admission_no}</Text>
                          </Table.Td>
                          <Table.Td>                            <div>
                              <Text size="sm" fw={500}>
                                {student.class?.name || 'N/A'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {student.section?.name || 'N/A'}
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
                              <ActionIcon variant="light" size="sm" onClick={() => handleViewStudent(student)}>
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
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Paper
                p="lg"
                radius="xl"
                style={{
                  background: theme.bg?.elevated,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, students.length)} of{" "}
                    {students.length} students
                  </Text>

                  <Group gap="sm">
                    <Select
                      size="sm"
                      data={["12", "24", "36", "48"]}
                      value={pageSize.toString()}
                      onChange={(value) => {
                        setPageSize(parseInt(value ?? "12"));
                        setCurrentPage(1);
                      }}
                      style={{ width: 80 }}
                      radius="xl"
                    />

                    <Pagination
                      value={currentPage}
                      onChange={(page) => {
                        setCurrentPage(page);
                        fetchStudents(page, searchQuery, selectedClass || '', academicYear?.id?.toString() || '');
                      }}
                      total={totalPages}
                      size="sm"
                      radius="xl"
                    />
                  </Group>
                </Group>
              </Paper>
            </motion.div>
          )}
        </>
      )}

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
                </Button>                <Button type="submit" loading={loading}>
                  {editingStudent ? 'Update' : 'Create'} Student
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
    </Container>
  );
};

export default StudentsPage;