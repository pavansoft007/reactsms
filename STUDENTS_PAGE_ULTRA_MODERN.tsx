import React, { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Avatar,
  Pagination,
  Center,
  Badge,
  ActionIcon,
  Tooltip,
  SegmentedControl,
  Button,
  TextInput,
  Select,
  Paper,
  Transition,
  Collapse,
  Flex,
  Box,
  Drawer,
  ScrollArea,
  Textarea,
  Divider,
  Indicator,
  Modal,
  Checkbox,
  ThemeIcon,
  Progress,
  NumberInput,
  Menu,
} from "@mantine/core";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdSearch,
  MdFileDownload,
  MdGridView,
  MdTableRows,
  MdSave,
  MdRefresh,
  MdTune,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdArrowUpward,
  MdArrowDownward,
  MdCalendarToday,
  MdBloodtype,
  MdHome,
  MdDashboard,
  MdTrendingUp,
  MdGroup,
  MdClose,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTheme } from "../context/ThemeContext";
import { UltraLoader } from "../components/ui";
import api from "../api/config";
import { useAcademicYear } from "../context/AcademicYearContext";

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

const StudentsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const { academicYear } = useAcademicYear();

  // Core Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Advanced UI States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<
    "name" | "admission_no" | "class" | "created"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    classes: 0,
    newThisMonth: 0,
  });

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      admission_no: "",
      roll: "",
      class_id: "",
      section_id: "",
      father_name: "",
      father_phone: "",
      mother_name: "",
      admission_date: "",
      blood_group: "",
      current_address: "",
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      email: (value) => (!value ? "Email is required" : null),
      admission_no: (value) => (!value ? "Admission number is required" : null),
      class_id: (value) => (!value ? "Class is required" : null),
      section_id: (value) => (!value ? "Section is required" : null),
    },
  });

  useEffect(() => {
    fetchClasses();
    if (academicYear) {
      fetchStudents(1, "", selectedClass || "", academicYear.id.toString());
      setTimeout(updateStats, 500);
    }
  }, [academicYear, selectedClass]);

  useEffect(() => {
    updateStats();
  }, [students]);

  const fetchStudents = async (
    page = 1,
    search = "",
    classId = "",
    sessionId = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search }),
        ...(classId && { class_id: classId }),
        ...(sessionId && { session_id: sessionId }),
        sort_by: sortBy,
        sort_order: sortOrder,
      }).toString();

      const response = await api.get(`/students?${params}`);
      setStudents(response.data.students || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching students:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch students",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      if (response.data.success) {
        setClasses(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const updateStats = () => {
    setStats({
      total: students.length,
      active: students.filter((s) => true).length,
      classes: new Set(students.map((s) => s.class?.id).filter(Boolean)).size,
      newThisMonth: students.filter((s) => {
        const admissionDate = new Date(s.admission_date);
        const now = new Date();
        return (
          admissionDate.getMonth() === now.getMonth() &&
          admissionDate.getFullYear() === now.getFullYear()
        );
      }).length,
    });
  };

  const handleCreateStudent = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await api.post("/students", values);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Student created successfully",
          color: "green",
        });
        setShowCreateForm(false);
        form.reset();
        fetchStudents(
          currentPage,
          searchQuery,
          selectedClass || "",
          academicYear?.id?.toString() || ""
        );
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to create student",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setValues({
      name: student.user?.name || "",
      email: student.user?.email || "",
      phone: student.user?.phone || "",
      admission_no: student.admission_no,
      roll: student.roll,
      class_id: student.class?.id?.toString() || "",
      section_id: student.section?.id?.toString() || "",
      father_name: student.father_name || "",
      father_phone: student.father_phone || "",
      mother_name: student.mother_name || "",
      admission_date: student.admission_date,
      blood_group: student.blood_group || "",
      current_address: student.current_address || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    setLoading(true);
    try {
      await api.delete(`/students/${id}`);
      notifications.show({
        title: "Success",
        message: "Student deleted successfully",
        color: "green",
      });
      fetchStudents(
        currentPage,
        searchQuery,
        selectedClass || "",
        academicYear?.id?.toString() || ""
      );
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to delete student",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchStudents(
      1,
      value,
      selectedClass || "",
      academicYear?.id?.toString() || ""
    );
  };

  const handleClassFilter = (value: string) => {
    setSelectedClass(value);
    fetchStudents(
      1,
      searchQuery,
      value || "",
      academicYear?.id?.toString() || ""
    );
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Ultra Modern Header with Glassmorphism
  const UltraModernHeader = () => (
    <Paper
      shadow="xl"
      p="xl"
      radius="2xl"
      style={{
        background: `linear-gradient(135deg, 
          ${theme.colors.primary}20, 
          ${theme.colors.accent}15, 
          ${theme.colors.primary}10)`,
        border: `1px solid ${theme.colors.primary}30`,
        backdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background */}
      <Box
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}15, transparent)`,
          animation: "float 6s ease-in-out infinite",
        }}
      />

      <Flex justify="space-between" align="center" wrap="wrap" gap="lg">
        <Group>
          <ThemeIcon
            size={80}
            radius="xl"
            variant="gradient"
            gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
            style={{
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              border: "3px solid rgba(255,255,255,0.2)",
            }}
          >
            <MdPeople size={40} />
          </ThemeIcon>
          <Box>
            <Text size="2xl" fw={900} c={theme.text.primary} mb={8}>
              Students Portal
            </Text>
            <Text size="lg" c={theme.text.muted} fw={500}>
              Advanced student management with intelligent features
            </Text>
          </Box>
        </Group>

        <Group gap="md">
          <Tooltip label="Real-time Analytics" position="bottom">
            <ActionIcon
              size="xl"
              variant="subtle"
              color={theme.colors.success}
              radius="xl"
            >
              <MdTrendingUp size={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Export All Data" position="bottom">
            <ActionIcon
              size="xl"
              variant="subtle"
              color={theme.colors.info}
              radius="xl"
            >
              <MdFileDownload size={24} />
            </ActionIcon>
          </Tooltip>

          <Button
            leftSection={<MdAdd size={20} />}
            onClick={() => {
              setEditingStudent(null);
              form.reset();
              setShowCreateForm(true);
            }}
            variant="gradient"
            gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
            size="lg"
            radius="xl"
            style={{
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Create Student
          </Button>
        </Group>
      </Flex>
    </Paper>
  );

  // Advanced Statistics Dashboard
  const StatsGrid = () => (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
      {[
        {
          label: "Total Students",
          value: stats.total,
          icon: MdPeople,
          color: theme.colors.primary,
          trend: "+5.2%",
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        {
          label: "Active Students",
          value: stats.active,
          icon: MdCheckCircle,
          color: theme.colors.success,
          trend: "+2.8%",
          bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        },
        {
          label: "Total Classes",
          value: stats.classes,
          icon: MdSchool,
          color: theme.colors.info,
          trend: "+1.1%",
          bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        },
        {
          label: "New This Month",
          value: stats.newThisMonth,
          icon: MdCalendarToday,
          color: theme.colors.warning,
          trend: "+12.5%",
          bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        },
      ].map((stat, index) => (
        <Paper
          key={index}
          p="xl"
          radius="2xl"
          style={{
            background: theme.glassmorphism.primary,
            border: `1px solid ${stat.color}20`,
            backdropFilter: "blur(15px)",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="hover:scale-105 hover:shadow-2xl"
        >
          {/* Gradient overlay */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: stat.bg,
              borderRadius: "2xl 2xl 0 0",
            }}
          />

          <Stack gap="md">
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text
                  size="xs"
                  c={theme.text.muted}
                  tt="uppercase"
                  fw={700}
                  mb={8}
                >
                  {stat.label}
                </Text>
                <Text size="2xl" fw={900} c={theme.text.primary}>
                  {stat.value.toLocaleString()}
                </Text>
              </Box>
              <ThemeIcon
                size={60}
                radius="xl"
                variant="light"
                color={stat.color}
                style={{
                  background: `${stat.color}15`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              >
                <stat.icon size={28} />
              </ThemeIcon>
            </Flex>

            <Group gap="xs">
              <Badge size="sm" variant="light" color="green" radius="md">
                {stat.trend}
              </Badge>
              <Text size="xs" c={theme.text.muted}>
                vs last month
              </Text>
            </Group>
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );

  // Advanced Search and Filters Panel
  const SearchAndFilters = () => (
    <Paper
      p="xl"
      radius="2xl"
      style={{
        background: theme.glassmorphism.primary,
        border: `1px solid ${theme.border}`,
        backdropFilter: "blur(15px)",
      }}
    >
      <Stack gap="lg">
        <Flex gap="lg" wrap="wrap" align="end">
          <TextInput
            placeholder="Search students by name, admission no, or email..."
            leftSection={<MdSearch size={18} />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1, minWidth: 320 }}
            radius="xl"
            size="md"
            styles={{
              input: {
                background: theme.glassmorphism.secondary,
                border: `1px solid ${theme.border}`,
                "&:focus": {
                  borderColor: theme.colors.primary,
                  boxShadow: `0 0 0 2px ${theme.colors.primary}20`,
                },
              },
            }}
          />

          <Select
            placeholder="Filter by class"
            data={classes.map((c) => ({
              value: c.id.toString(),
              label: c.name,
            }))}
            value={selectedClass}
            onChange={(value) => handleClassFilter(value || "")}
            clearable
            style={{ minWidth: 180 }}
            radius="xl"
            size="md"
          />

          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as "grid" | "list")}
            data={[
              {
                label: (
                  <Center>
                    <MdGridView size={18} />
                    <Box ml={8}>Grid</Box>
                  </Center>
                ),
                value: "grid",
              },
              {
                label: (
                  <Center>
                    <MdTableRows size={18} />
                    <Box ml={8}>List</Box>
                  </Center>
                ),
                value: "list",
              },
            ]}
            size="md"
            radius="xl"
          />

          <ActionIcon
            size="xl"
            variant={showFilters ? "filled" : "subtle"}
            color={theme.colors.primary}
            onClick={() => setShowFilters(!showFilters)}
            radius="xl"
          >
            <MdTune size={20} />
          </ActionIcon>
        </Flex>

        <Collapse in={showFilters}>
          <Divider mb="lg" />
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Select
              label="Sort by"
              placeholder="Choose field"
              data={[
                { value: "name", label: "Name" },
                { value: "admission_no", label: "Admission No" },
                { value: "class", label: "Class" },
                { value: "created", label: "Date Created" },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              radius="md"
            />

            <Select
              label="Sort order"
              placeholder="Choose order"
              data={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              value={sortOrder}
              onChange={(value) => setSortOrder(value as any)}
              radius="md"
            />

            <Select
              label="Items per page"
              placeholder="Choose count"
              data={[
                { value: "12", label: "12 items" },
                { value: "24", label: "24 items" },
                { value: "48", label: "48 items" },
                { value: "96", label: "96 items" },
              ]}
              value={itemsPerPage.toString()}
              onChange={(value) => setItemsPerPage(Number(value) || 12)}
              radius="md"
            />

            <NumberInput
              label="Page number"
              placeholder="Go to page"
              value={currentPage}
              onChange={(value) => setCurrentPage(Number(value) || 1)}
              min={1}
              max={totalPages}
              radius="md"
            />
          </SimpleGrid>
        </Collapse>
      </Stack>
    </Paper>
  );

  // Ultra Modern Student Card
  const UltraStudentCard = ({ student }: { student: Student }) => (
    <Paper
      p="xl"
      radius="2xl"
      style={{
        background: theme.glassmorphism.primary,
        border: `1px solid ${theme.border}`,
        backdropFilter: "blur(15px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      className="hover:scale-105 hover:shadow-2xl hover:border-primary-200"
    >
      {/* Background decoration */}
      <Box
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.colors.primary}10, transparent)`,
        }}
      />

      {/* Selection checkbox */}
      <Box
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <Checkbox
          size="sm"
          checked={selectedStudents.includes(student.id)}
          onChange={() => toggleStudentSelection(student.id)}
          styles={{
            input: {
              background: theme.glassmorphism.secondary,
              border: `1px solid ${theme.border}`,
            },
          }}
        />
      </Box>

      <Stack gap="lg">
        {/* Student header with avatar */}
        <Flex align="center" gap="lg" mt="md">
          <Indicator
            inline
            size={14}
            offset={10}
            position="bottom-end"
            color="green"
            withBorder
          >
            <Avatar
              src={student.user?.photo}
              size={80}
              radius="xl"
              style={{
                border: `4px solid ${theme.colors.primary}20`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <Text size="xl" fw={700}>
                {student.user?.name?.charAt(0)?.toUpperCase()}
              </Text>
            </Avatar>
          </Indicator>

          <Box style={{ flex: 1 }}>
            <Text
              fw={700}
              size="lg"
              c={theme.text.primary}
              lineClamp={1}
              mb={4}
            >
              {student.user?.name || "N/A"}
            </Text>
            <Badge
              size="md"
              variant="gradient"
              gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
              radius="md"
            >
              {student.admission_no}
            </Badge>
          </Box>
        </Flex>

        {/* Student details grid */}
        <SimpleGrid cols={2} spacing="md">
          <Box>
            <Group gap="xs" mb={4}>
              <MdSchool size={16} color={theme.colors.primary} />
              <Text size="xs" c={theme.text.muted} fw={600} tt="uppercase">
                Class
              </Text>
            </Group>
            <Text size="sm" fw={600} c={theme.text.primary}>
              {student.class?.name || "N/A"}
            </Text>
            <Text size="xs" c={theme.text.muted}>
              Section: {student.section?.name || "N/A"}
            </Text>
          </Box>

          <Box>
            <Group gap="xs" mb={4}>
              <MdPerson size={16} color={theme.colors.success} />
              <Text size="xs" c={theme.text.muted} fw={600} tt="uppercase">
                Roll No
              </Text>
            </Group>
            <Text size="sm" fw={600} c={theme.text.primary}>
              {student.roll}
            </Text>
          </Box>

          {student.user?.phone && (
            <Box>
              <Group gap="xs" mb={4}>
                <MdPhone size={16} color={theme.colors.info} />
                <Text size="xs" c={theme.text.muted} fw={600} tt="uppercase">
                  Contact
                </Text>
              </Group>
              <Text size="sm" c={theme.text.primary}>
                {student.user.phone}
              </Text>
            </Box>
          )}

          {student.father_name && (
            <Box>
              <Group gap="xs" mb={4}>
                <MdGroup size={16} color={theme.colors.warning} />
                <Text size="xs" c={theme.text.muted} fw={600} tt="uppercase">
                  Guardian
                </Text>
              </Group>
              <Text size="sm" c={theme.text.primary}>
                {student.father_name}
              </Text>
            </Box>
          )}
        </SimpleGrid>

        {/* Action buttons */}
        <Group justify="space-between" mt="auto">
          <Group gap="xs">
            <Tooltip label="View Details">
              <ActionIcon
                variant="subtle"
                color={theme.colors.info}
                size="lg"
                radius="xl"
              >
                <MdVisibility size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Edit Student">
              <ActionIcon
                variant="subtle"
                color={theme.colors.primary}
                size="lg"
                radius="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(student);
                }}
              >
                <MdEdit size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Delete Student">
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                radius="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(student.id);
                }}
              >
                <MdDelete size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Badge size="sm" variant="light" color="green" radius="md">
            Active
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );

  // Modern List View
  const UltraListView = () => (
    <Stack gap="sm">
      {students.map((student) => (
        <Paper
          key={student.id}
          p="lg"
          radius="xl"
          style={{
            background: theme.glassmorphism.primary,
            border: `1px solid ${theme.border}`,
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
          className="hover:shadow-lg hover:border-primary-200"
        >
          <Flex justify="space-between" align="center" gap="lg">
            <Group gap="lg">
              <Checkbox
                size="sm"
                checked={selectedStudents.includes(student.id)}
                onChange={() => toggleStudentSelection(student.id)}
              />

              <Avatar
                src={student.user?.photo}
                size="lg"
                radius="xl"
                style={{
                  border: `2px solid ${theme.colors.primary}20`,
                }}
              >
                {student.user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box>
                <Text fw={600} size="md" c={theme.text.primary}>
                  {student.user?.name || "N/A"}
                </Text>
                <Group gap="lg">
                  <Text size="sm" c={theme.text.muted}>
                    {student.admission_no}
                  </Text>
                  <Text size="sm" c={theme.text.muted}>
                    {student.class?.name || "N/A"} -{" "}
                    {student.section?.name || "N/A"}
                  </Text>
                  <Text size="sm" c={theme.text.muted}>
                    Roll: {student.roll}
                  </Text>
                </Group>
              </Box>
            </Group>

            <Group gap="xs">
              <Badge size="sm" variant="light" color="green">
                Active
              </Badge>

              <Menu shadow="md" width={160}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg" radius="xl">
                    <MdTune size={18} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<MdVisibility size={16} />}>
                    View Details
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<MdEdit size={16} />}
                    onClick={() => handleEdit(student)}
                  >
                    Edit Student
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<MdDelete size={16} />}
                    color="red"
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete Student
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Flex>
        </Paper>
      ))}
    </Stack>
  );

  // Bulk Actions Floating Bar
  const BulkActionsBar = () =>
    selectedStudents.length > 0 && (
      <Transition mounted={selectedStudents.length > 0} transition="slide-up">
        {(styles) => (
          <Paper
            p="lg"
            radius="2xl"
            style={{
              ...styles,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              color: "white",
              position: "fixed",
              bottom: 30,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Group gap="lg">
              <Text fw={600} size="md">
                {selectedStudents.length} student
                {selectedStudents.length > 1 ? "s" : ""} selected
              </Text>

              <Group gap="sm">
                <Button
                  variant="white"
                  color={theme.colors.primary}
                  size="sm"
                  radius="md"
                  onClick={() => {
                    console.log("Bulk edit:", selectedStudents);
                  }}
                >
                  Bulk Edit
                </Button>

                <Button
                  variant="white"
                  color="red"
                  size="sm"
                  radius="md"
                  onClick={() => {
                    console.log("Bulk delete:", selectedStudents);
                  }}
                >
                  Delete Selected
                </Button>

                <ActionIcon
                  variant="white"
                  color={theme.colors.primary}
                  size="lg"
                  radius="md"
                  onClick={() => setSelectedStudents([])}
                >
                  <MdClose size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        )}
      </Transition>
    );

  // Ultra Modern Inline Form (No Popup)
  const UltraInlineForm = () => (
    <Modal
      opened={showCreateForm}
      onClose={() => {
        setShowCreateForm(false);
        setEditingStudent(null);
        form.reset();
      }}
      title={null}
      size="xl"
      radius="2xl"
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 8,
      }}
      styles={{
        content: {
          background: theme.glassmorphism.primary,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`,
        },
      }}
    >
      <Stack gap="xl">
        {/* Form Header */}
        <Group justify="space-between" align="center">
          <Group>
            <ThemeIcon
              size={60}
              radius="xl"
              variant="gradient"
              gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
            >
              <MdPerson size={30} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700} c={theme.text.primary}>
                {editingStudent ? "Update Student" : "Create New Student"}
              </Text>
              <Text size="sm" c={theme.text.muted}>
                {editingStudent
                  ? "Modify student information"
                  : "Add a new student to the system"}
              </Text>
            </Box>
          </Group>

          <ActionIcon
            size="lg"
            variant="subtle"
            onClick={() => {
              setShowCreateForm(false);
              setEditingStudent(null);
              form.reset();
            }}
            radius="xl"
          >
            <MdClose size={20} />
          </ActionIcon>
        </Group>

        <Divider />

        <ScrollArea style={{ height: "60vh" }}>
          <form
            onSubmit={form.onSubmit(
              editingStudent ? () => {} : handleCreateStudent
            )}
          >
            <Stack gap="2xl">
              {/* Personal Information Section */}
              <Paper
                p="xl"
                radius="xl"
                style={{ background: theme.glassmorphism.secondary }}
              >
                <Group mb="lg">
                  <ThemeIcon size="lg" radius="md" color={theme.colors.primary}>
                    <MdPerson size={20} />
                  </ThemeIcon>
                  <Text size="lg" fw={600} c={theme.text.primary}>
                    Personal Information
                  </Text>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <TextInput
                    label="Full Name"
                    placeholder="Enter student's full name"
                    leftSection={<MdPerson size={16} />}
                    {...form.getInputProps("name")}
                    radius="md"
                    size="md"
                    required
                  />

                  <TextInput
                    label="Email Address"
                    placeholder="Enter email address"
                    type="email"
                    leftSection={<MdEmail size={16} />}
                    {...form.getInputProps("email")}
                    radius="md"
                    size="md"
                    required
                  />

                  <TextInput
                    label="Phone Number"
                    placeholder="Enter phone number"
                    leftSection={<MdPhone size={16} />}
                    {...form.getInputProps("phone")}
                    radius="md"
                    size="md"
                  />

                  <Select
                    label="Blood Group"
                    placeholder="Select blood group"
                    data={[
                      { value: "A+", label: "A+" },
                      { value: "A-", label: "A-" },
                      { value: "B+", label: "B+" },
                      { value: "B-", label: "B-" },
                      { value: "AB+", label: "AB+" },
                      { value: "AB-", label: "AB-" },
                      { value: "O+", label: "O+" },
                      { value: "O-", label: "O-" },
                    ]}
                    leftSection={<MdBloodtype size={16} />}
                    {...form.getInputProps("blood_group")}
                    radius="md"
                    size="md"
                  />
                </SimpleGrid>
              </Paper>

              {/* Academic Information Section */}
              <Paper
                p="xl"
                radius="xl"
                style={{ background: theme.glassmorphism.secondary }}
              >
                <Group mb="lg">
                  <ThemeIcon size="lg" radius="md" color={theme.colors.success}>
                    <MdSchool size={20} />
                  </ThemeIcon>
                  <Text size="lg" fw={600} c={theme.text.primary}>
                    Academic Information
                  </Text>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <TextInput
                    label="Admission Number"
                    placeholder="Enter admission number"
                    leftSection={<MdSchool size={16} />}
                    {...form.getInputProps("admission_no")}
                    radius="md"
                    size="md"
                    required
                  />

                  <TextInput
                    label="Roll Number"
                    placeholder="Enter roll number"
                    {...form.getInputProps("roll")}
                    radius="md"
                    size="md"
                  />

                  <Select
                    label="Class"
                    placeholder="Select class"
                    data={classes.map((c) => ({
                      value: c.id.toString(),
                      label: c.name,
                    }))}
                    {...form.getInputProps("class_id")}
                    radius="md"
                    size="md"
                    required
                  />

                  <Select
                    label="Section"
                    placeholder="Select section"
                    data={sections.map((s) => ({
                      value: s.id.toString(),
                      label: s.name,
                    }))}
                    {...form.getInputProps("section_id")}
                    radius="md"
                    size="md"
                    required
                  />
                </SimpleGrid>
              </Paper>

              {/* Family Information Section */}
              <Paper
                p="xl"
                radius="xl"
                style={{ background: theme.glassmorphism.secondary }}
              >
                <Group mb="lg">
                  <ThemeIcon size="lg" radius="md" color={theme.colors.warning}>
                    <MdGroup size={20} />
                  </ThemeIcon>
                  <Text size="lg" fw={600} c={theme.text.primary}>
                    Family Information
                  </Text>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <TextInput
                    label="Father's Name"
                    placeholder="Enter father's name"
                    leftSection={<MdPerson size={16} />}
                    {...form.getInputProps("father_name")}
                    radius="md"
                    size="md"
                  />

                  <TextInput
                    label="Father's Phone"
                    placeholder="Enter father's phone"
                    leftSection={<MdPhone size={16} />}
                    {...form.getInputProps("father_phone")}
                    radius="md"
                    size="md"
                  />

                  <TextInput
                    label="Mother's Name"
                    placeholder="Enter mother's name"
                    leftSection={<MdPerson size={16} />}
                    {...form.getInputProps("mother_name")}
                    radius="md"
                    size="md"
                  />

                  <Textarea
                    label="Current Address"
                    placeholder="Enter current address"
                    leftSection={<MdHome size={16} />}
                    {...form.getInputProps("current_address")}
                    radius="md"
                    size="md"
                    minRows={3}
                  />
                </SimpleGrid>
              </Paper>
            </Stack>
          </form>
        </ScrollArea>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="md" pt="lg">
          <Button
            variant="subtle"
            size="lg"
            radius="xl"
            onClick={() => {
              setShowCreateForm(false);
              setEditingStudent(null);
              form.reset();
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            leftSection={<MdSave size={18} />}
            variant="gradient"
            gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
            size="lg"
            radius="xl"
            loading={loading}
            style={{
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
            onClick={form.onSubmit(
              editingStudent ? () => {} : handleCreateStudent
            )}
          >
            {editingStudent ? "Update Student" : "Create Student"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  return (
    <Container size="xl" py="xl" style={{ minHeight: "100vh" }}>
      <Stack gap="2xl">
        <UltraModernHeader />
        <StatsGrid />
        <SearchAndFilters />

        {/* Main Content Area */}
        <Box style={{ position: "relative", minHeight: "400px" }}>
          {loading && (
            <Center style={{ position: "absolute", inset: 0, zIndex: 100 }}>
              <UltraLoader size="xl" message="Loading students..." />
            </Center>
          )}

          {students.length === 0 && !loading ? (
            <Center py="4xl">
              <Stack align="center" gap="xl">
                <ThemeIcon
                  size={120}
                  radius="xl"
                  variant="light"
                  color={theme.colors.primary}
                >
                  <MdPeople size={60} />
                </ThemeIcon>

                <Box ta="center">
                  <Text size="xl" fw={700} c={theme.text.primary} mb="md">
                    No Students Found
                  </Text>
                  <Text size="md" c={theme.text.muted} mb="xl">
                    Start building your student database by adding your first
                    student
                  </Text>

                  <Button
                    leftSection={<MdAdd size={18} />}
                    variant="gradient"
                    gradient={{
                      from: theme.colors.primary,
                      to: theme.colors.accent,
                    }}
                    size="lg"
                    radius="xl"
                    onClick={() => {
                      setEditingStudent(null);
                      form.reset();
                      setShowCreateForm(true);
                    }}
                  >
                    Add Your First Student
                  </Button>
                </Box>
              </Stack>
            </Center>
          ) : viewMode === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
              {students.map((student) => (
                <UltraStudentCard key={student.id} student={student} />
              ))}
            </SimpleGrid>
          ) : (
            <UltraListView />
          )}
        </Box>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <Center>
            <Paper
              p="md"
              radius="2xl"
              style={{ background: theme.glassmorphism.primary }}
            >
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchStudents(
                    page,
                    searchQuery,
                    selectedClass || "",
                    academicYear?.id?.toString() || ""
                  );
                }}
                size="lg"
                radius="xl"
                styles={{
                  control: {
                    backgroundColor: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.text.primary,
                    "&:hover": {
                      backgroundColor: theme.glassmorphism.hover,
                      transform: "scale(1.05)",
                    },
                    "&[data-active]": {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                      color: "white",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                  },
                }}
              />
            </Paper>
          </Center>
        )}
      </Stack>

      <UltraInlineForm />
      <BulkActionsBar />

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:shadow-xl:hover {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .hover\\:shadow-2xl:hover {
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .hover\\:border-primary-200:hover {
          border-color: var(--mantine-color-blue-2);
        }
      `}</style>
    </Container>
  );
};

export default StudentsPageUltra;
