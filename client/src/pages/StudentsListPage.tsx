import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Badge,
  Avatar,
  ActionIcon,
  Menu,
  Button,
  TextInput,
  Select,
  Stack,
  Card,
  SimpleGrid,
  Pagination,
  ThemeIcon,
  Progress,
  Divider,
  SegmentedControl,
  Indicator,
  NumberFormatter,
} from "@mantine/core";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconPlus,
  IconRefresh,
  IconUsers,
  IconActivity,
  IconClock,
  IconTrendingUp,
  IconSortAscending,
  IconLayoutGrid,
  IconLayoutList,
} from "@tabler/icons-react";
import { useTheme } from "../context/ThemeContext";
import { notifications } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  section: string;
  fatherName?: string;
  motherName?: string;
  status: "active" | "inactive" | "suspended";
  admissionDate: string;
  bloodGroup?: string;
  photo?: string;
  grade?: string;
  attendance?: number;
  performance?: number;
  subjects?: string[];
  address?: string;
  dateOfBirth?: string;
  guardian?: string;
  emergencyContact?: string;
  fees?: {
    paid: number;
    pending: number;
    total: number;
  };
}

const StudentsListPage = () => {
  const { theme } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loadStudents = useCallback(async () => {
    setLoading(true);

    // Enhanced mock data with more comprehensive information
    const mockStudents: Student[] = [
      {
        id: 1,
        name: "Emma Thompson",
        email: "emma.thompson@school.edu",
        phone: "+1-555-0123",
        admissionNo: "ADM001",
        rollNo: "R001",
        className: "Grade 10",
        section: "A",
        fatherName: "Robert Thompson",
        motherName: "Sarah Thompson",
        status: "active",
        admissionDate: "2023-08-15",
        bloodGroup: "O+",
        photo:
          "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150",
        grade: "A+",
        attendance: 95,
        performance: 92,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
        address: "123 Oak Street, Springfield",
        dateOfBirth: "2008-03-15",
        guardian: "Robert Thompson",
        emergencyContact: "+1-555-0124",
        fees: { paid: 8500, pending: 1500, total: 10000 },
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael.chen@school.edu",
        phone: "+1-555-0125",
        admissionNo: "ADM002",
        rollNo: "R002",
        className: "Grade 11",
        section: "B",
        fatherName: "David Chen",
        motherName: "Lisa Chen",
        status: "active",
        admissionDate: "2022-08-20",
        bloodGroup: "A+",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        grade: "A",
        attendance: 88,
        performance: 89,
        subjects: ["Computer Science", "Mathematics", "Physics", "English"],
        address: "456 Pine Avenue, Springfield",
        dateOfBirth: "2007-07-22",
        guardian: "David Chen",
        emergencyContact: "+1-555-0126",
        fees: { paid: 9000, pending: 1000, total: 10000 },
      },
      {
        id: 3,
        name: "Sophia Rodriguez",
        email: "sophia.rodriguez@school.edu",
        phone: "+1-555-0127",
        admissionNo: "ADM003",
        rollNo: "R003",
        className: "Grade 12",
        section: "A",
        fatherName: "Carlos Rodriguez",
        motherName: "Maria Rodriguez",
        status: "active",
        admissionDate: "2021-08-18",
        bloodGroup: "B+",
        photo:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        grade: "A+",
        attendance: 97,
        performance: 96,
        subjects: ["Literature", "History", "Art", "Psychology"],
        address: "789 Maple Drive, Springfield",
        dateOfBirth: "2006-11-08",
        guardian: "Carlos Rodriguez",
        emergencyContact: "+1-555-0128",
        fees: { paid: 10000, pending: 0, total: 10000 },
      },
      {
        id: 4,
        name: "James Wilson",
        email: "james.wilson@school.edu",
        phone: "+1-555-0129",
        admissionNo: "ADM004",
        rollNo: "R004",
        className: "Grade 9",
        section: "C",
        fatherName: "Mark Wilson",
        motherName: "Jennifer Wilson",
        status: "suspended",
        admissionDate: "2024-08-12",
        bloodGroup: "AB+",
        photo:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        grade: "B",
        attendance: 72,
        performance: 75,
        subjects: ["Mathematics", "Science", "English", "Social Studies"],
        address: "321 Elm Street, Springfield",
        dateOfBirth: "2009-01-30",
        guardian: "Mark Wilson",
        emergencyContact: "+1-555-0130",
        fees: { paid: 6000, pending: 4000, total: 10000 },
      },
      {
        id: 5,
        name: "Olivia Johnson",
        email: "olivia.johnson@school.edu",
        phone: "+1-555-0131",
        admissionNo: "ADM005",
        rollNo: "R005",
        className: "Grade 10",
        section: "B",
        fatherName: "Thomas Johnson",
        motherName: "Amanda Johnson",
        status: "active",
        admissionDate: "2023-08-14",
        bloodGroup: "O-",
        photo:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        grade: "A-",
        attendance: 91,
        performance: 88,
        subjects: ["Biology", "Chemistry", "Mathematics", "English"],
        address: "654 Cedar Lane, Springfield",
        dateOfBirth: "2008-05-12",
        guardian: "Thomas Johnson",
        emergencyContact: "+1-555-0132",
        fees: { paid: 7500, pending: 2500, total: 10000 },
      },
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStudents(mockStudents);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleCreateStudent = () => {
    notifications.show({
      title: "Add Student",
      message: "Opening student creation form...",
      color: "blue",
    });
  };

  const handleEditStudent = (student: Student) => {
    notifications.show({
      title: "Edit Student",
      message: `Editing ${student.name}...`,
      color: "blue",
    });
  };

  const handleViewStudent = (student: Student) => {
    notifications.show({
      title: "View Profile",
      message: `Viewing ${student.name}'s profile...`,
      color: "blue",
    });
  };
  const handleDeleteStudent = (student: Student) => {
    notifications.show({
      title: "Delete Student",
      message: `${student.name} has been deleted`,
      color: "red",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "gray";
      case "suspended":
        return "red";
      default:
        return "blue";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "green";
    if (grade.includes("B")) return "blue";
    if (grade.includes("C")) return "yellow";
    return "red";
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply filters
    let matchesFilters = true;
    if (filters.class && filters.class !== "all") {
      matchesFilters = matchesFilters && student.className === filters.class;
    }
    if (filters.status && filters.status !== "all") {
      matchesFilters = matchesFilters && student.status === filters.status;
    }
    if (filters.section && filters.section !== "all") {
      matchesFilters = matchesFilters && student.section === filters.section;
    }

    return matchesSearch && matchesFilters;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy as keyof Student] as string;
    let bVal = b[sortBy as keyof Student] as string;

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    suspended: students.filter((s) => s.status === "suspended").length,
    avgAttendance:
      students.reduce((acc, s) => acc + (s.attendance || 0), 0) /
      students.length,
    avgPerformance:
      students.reduce((acc, s) => acc + (s.performance || 0), 0) /
      students.length,
  };

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
              Students Directory
            </Text>
            <Text size="lg" opacity={0.9}>
              Manage and monitor student information with advanced analytics
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="white"
              color="dark"
              leftSection={<IconPlus size={18} />}
              onClick={handleCreateStudent}
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
      </Paper>
    </motion.div>
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
              style={{ minWidth: 300 }}
              radius="xl"
              size="md"
            />

            <Select
              placeholder="All Classes"
              data={[
                { label: "All Classes", value: "all" },
                { label: "Grade 9", value: "Grade 9" },
                { label: "Grade 10", value: "Grade 10" },
                { label: "Grade 11", value: "Grade 11" },
                { label: "Grade 12", value: "Grade 12" },
              ]}
              value={filters.class}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, class: value }))
              }
              radius="xl"
              size="md"
            />

            <Select
              placeholder="All Status"
              data={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ]}
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              radius="xl"
              size="md"
            />
          </Group>

          <Group gap="sm">
            <SegmentedControl
              data={[
                { label: <IconLayoutGrid size={16} />, value: "grid" },
                { label: <IconLayoutList size={16} />, value: "list" },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as "grid" | "list")}
              radius="xl"
            />

            <Select
              placeholder="Sort by"
              data={[
                { label: "Name", value: "name" },
                { label: "Class", value: "className" },
                { label: "Admission No", value: "admissionNo" },
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
            </ActionIcon>

            <ActionIcon
              variant="light"
              size="xl"
              radius="xl"
              onClick={loadStudents}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>{" "}
        {/* Active Filters - Removed for simplicity */}
      </Paper>
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
              color={getStatusColor(student.status)}
              position="bottom-end"
              withBorder
            >
              <Avatar
                src={student.photo}
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
            <div>
              <Text fw={600} size="md" lineClamp={1}>
                {student.name}
              </Text>
              <Text size="xs" c="dimmed">
                {student.admissionNo}
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
                onClick={() => handleEditStudent(student)}
              >
                Edit Student
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDeleteStudent(student)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Student Info */}
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Class & Section
            </Text>
            <Badge variant="light" radius="xl">
              {student.className} - {student.section}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Grade
            </Text>
            <Badge
              color={getGradeColor(student.grade || "")}
              variant="light"
              radius="xl"
            >
              {student.grade}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Status
            </Text>
            <Badge
              color={getStatusColor(student.status)}
              variant="light"
              radius="xl"
            >
              {student.status.toUpperCase()}
            </Badge>
          </Group>
        </Stack>

        <Divider my="md" />

        {/* Performance Metrics */}
        <Stack gap="sm">
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
              student.attendance && student.attendance > 85
                ? "green"
                : student.attendance && student.attendance > 70
                ? "yellow"
                : "red"
            }
            radius="xl"
            size="sm"
          />

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
              student.performance && student.performance > 85
                ? "green"
                : student.performance && student.performance > 70
                ? "yellow"
                : "red"
            }
            radius="xl"
            size="sm"
          />
        </Stack>

        <Divider my="md" />

        {/* Contact Info */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconMail size={14} color={theme.colors?.gray?.[6]} />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {student.email}
            </Text>
          </Group>
          {student.phone && (
            <Group gap="xs">
              <IconPhone size={14} color={theme.colors?.gray?.[6]} />
              <Text size="xs" c="dimmed">
                {student.phone}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Fees Status */}
        {student.fees && (
          <>
            <Divider my="md" />
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Fee Status
                </Text>
                <Text size="sm" fw={500}>
                  <NumberFormatter
                    value={student.fees.paid}
                    prefix="$"
                    thousandSeparator
                  />{" "}
                  /
                  <NumberFormatter
                    value={student.fees.total}
                    prefix="$"
                    thousandSeparator
                  />
                </Text>
              </Group>
              <Progress
                value={(student.fees.paid / student.fees.total) * 100}
                color={
                  student.fees.pending === 0
                    ? "green"
                    : student.fees.pending <= 2000
                    ? "yellow"
                    : "red"
                }
                radius="xl"
                size="sm"
              />
            </Stack>
          </>
        )}
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
              color={getStatusColor(student.status)}
              position="bottom-end"
              withBorder
            >
              <Avatar src={student.photo} size="md" radius="xl">
                <IconUser size={20} />
              </Avatar>
            </Indicator>

            <div>
              <Text fw={600} size="md">
                {student.name}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {student.admissionNo}
                </Text>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  {student.className} - {student.section}
                </Text>
              </Group>
            </div>
          </Group>

          <Group gap="lg">
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">
                Grade
              </Text>
              <Badge
                color={getGradeColor(student.grade || "")}
                variant="light"
                radius="xl"
              >
                {student.grade}
              </Badge>
            </div>

            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">
                Attendance
              </Text>
              <Text size="sm" fw={500}>
                {student.attendance}%
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">
                Performance
              </Text>
              <Text size="sm" fw={500}>
                {student.performance}%
              </Text>
            </div>

            <Badge
              color={getStatusColor(student.status)}
              variant="light"
              radius="xl"
            >
              {student.status.toUpperCase()}
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
                  onClick={() => handleEditStudent(student)}
                >
                  Edit Student
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => handleDeleteStudent(student)}
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
      ) : paginatedStudents.length === 0 ? (
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
              {searchQuery ||
              Object.values(filters).some((f) => f && f !== "all")
                ? "Try adjusting your search or filters"
                : "Get started by adding your first student"}
            </Text>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleCreateStudent}
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
                  {paginatedStudents.map((student, index) =>
                    renderStudentCard(student, index)
                  )}
                </SimpleGrid>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: "2rem" }}>
                  {paginatedStudents.map((student, index) =>
                    renderStudentList(student, index)
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
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
                  {Math.min(currentPage * pageSize, filteredStudents.length)} of{" "}
                  {filteredStudents.length} students
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
                    onChange={setCurrentPage}
                    total={Math.ceil(filteredStudents.length / pageSize)}
                    size="sm"
                    radius="xl"
                  />
                </Group>
              </Group>
            </Paper>
          </motion.div>
        </>
      )}
    </Container>
  );
};

export default StudentsListPage;
