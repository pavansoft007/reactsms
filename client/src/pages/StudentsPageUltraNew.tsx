import { useState, useEffect } from 'react';
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
  Card,
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
  NumberInput,
  Textarea,
  Menu,
  Divider,
  Progress,
  Indicator,
  UnstyledButton,
  Kbd,
  Anchor,
  Image,
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
  MdFilterList,
  MdFileDownload,
  MdGridView,
  MdTableRows,
  MdInfo,
  MdClose,
  MdSave,
  MdRefresh,
  MdTune,
  MdMoreVert,
  MdStar,
  MdStarBorder,
  MdLocationOn,
  MdCalendarToday,
  MdBloodtype,
  MdHome,
  MdFamily,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdSort,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTheme } from "../context/ThemeContext";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraLoader,
} from "../components/ui";
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

const StudentsPageUltra = () => {
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
      updateStats();
    }
  }, [academicYear, selectedClass]);

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
      active: students.filter((s) => true).length, // Assuming all are active for now
      classes: new Set(students.map((s) => s.class?.id)).size,
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

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  // Modern Header Component
  const ModernHeader = () => (
    <Paper
      shadow="xs"
      p="xl"
      radius="xl"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.accent}10)`,
        border: `1px solid ${theme.colors.primary}20`,
        backdropFilter: "blur(20px)",
      }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <Group>
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <MdPeople size={28} color="white" />
          </Box>
          <Box>
            <Text size="xl" fw={700} c={theme.text.primary} mb={4}>
              Students Management
            </Text>
            <Text size="sm" c={theme.text.muted}>
              Manage student records with advanced features
            </Text>
          </Box>
        </Group>

        <Group gap="sm">
          <Tooltip label="Refresh Data">
            <ActionIcon
              size="lg"
              variant="subtle"
              color={theme.colors.primary}
              onClick={() =>
                fetchStudents(
                  currentPage,
                  searchQuery,
                  selectedClass || "",
                  academicYear?.id?.toString() || ""
                )
              }
            >
              <MdRefresh size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Export Data">
            <ActionIcon size="lg" variant="subtle" color={theme.colors.success}>
              <MdFileDownload size={20} />
            </ActionIcon>
          </Tooltip>

          <Button
            leftSection={<MdAdd size={18} />}
            onClick={() => {
              setEditingStudent(null);
              form.reset();
              setShowCreateForm(true);
            }}
            gradient={{ from: theme.colors.primary, to: theme.colors.accent }}
            size="md"
            radius="xl"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            Add Student
          </Button>
        </Group>
      </Flex>
    </Paper>
  );

  // Statistics Cards
  const StatsGrid = () => (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
      {[
        {
          label: "Total Students",
          value: stats.total,
          icon: MdPeople,
          color: theme.colors.primary,
        },
        {
          label: "Active Students",
          value: stats.active,
          icon: MdCheckCircle,
          color: theme.colors.success,
        },
        {
          label: "Classes",
          value: stats.classes,
          icon: MdSchool,
          color: theme.colors.info,
        },
        {
          label: "New This Month",
          value: stats.newThisMonth,
          icon: MdCalendarToday,
          color: theme.colors.warning,
        },
      ].map((stat, index) => (
        <Paper
          key={index}
          p="lg"
          radius="xl"
          style={{
            background: theme.glassmorphism.primary,
            border: `1px solid ${stat.color}20`,
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          className="hover:scale-105 hover:shadow-lg"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text
                size="xs"
                c={theme.text.muted}
                tt="uppercase"
                fw={600}
                mb={4}
              >
                {stat.label}
              </Text>
              <Text size="xl" fw={700} c={theme.text.primary}>
                {stat.value.toLocaleString()}
              </Text>
            </Box>
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <stat.icon size={24} color={stat.color} />
            </Box>
          </Flex>
        </Paper>
      ))}
    </SimpleGrid>
  );

  // Advanced Search and Filters
  const SearchAndFilters = () => (
    <Paper
      p="lg"
      radius="xl"
      style={{
        background: theme.glassmorphism.primary,
        border: `1px solid ${theme.border}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <Flex gap="md" wrap="wrap" align="end">
        <TextInput
          placeholder="Search students..."
          leftSection={<MdSearch size={16} />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, minWidth: 300 }}
          radius="md"
          size="md"
        />

        <Select
          placeholder="Filter by class"
          data={classes.map((c) => ({ value: c.id.toString(), label: c.name }))}
          value={selectedClass}
          onChange={(value) => handleClassFilter(value || "")}
          clearable
          style={{ minWidth: 150 }}
          radius="md"
          size="md"
        />

        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as "grid" | "list")}
          data={[
            { label: <MdGridView size={16} />, value: "grid" },
            { label: <MdTableRows size={16} />, value: "list" },
          ]}
          size="md"
          radius="md"
        />

        <ActionIcon
          size="lg"
          variant={showFilters ? "filled" : "subtle"}
          color={theme.colors.primary}
          onClick={() => setShowFilters(!showFilters)}
          radius="md"
        >
          <MdTune size={18} />
        </ActionIcon>
      </Flex>

      <Collapse in={showFilters}>
        <Divider my="md" />
        <Flex gap="md" wrap="wrap">
          <Select
            placeholder="Sort by"
            data={[
              { value: "name", label: "Name" },
              { value: "admission_no", label: "Admission No" },
              { value: "class", label: "Class" },
              { value: "created", label: "Date Created" },
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value as any)}
            style={{ minWidth: 120 }}
            size="sm"
          />

          <ActionIcon
            size="md"
            variant="subtle"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? (
              <MdArrowUpward size={16} />
            ) : (
              <MdArrowDownward size={16} />
            )}
          </ActionIcon>

          <Select
            placeholder="Items per page"
            data={[
              { value: "12", label: "12" },
              { value: "24", label: "24" },
              { value: "48", label: "48" },
            ]}
            value={itemsPerPage.toString()}
            onChange={(value) => setItemsPerPage(Number(value) || 12)}
            style={{ minWidth: 100 }}
            size="sm"
          />
        </Flex>
      </Collapse>
    </Paper>
  );

  // Modern Student Card
  const StudentCard = ({ student }: { student: Student }) => (
    <Paper
      p="lg"
      radius="xl"
      style={{
        background: theme.glassmorphism.primary,
        border: `1px solid ${theme.border}`,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      className="hover:scale-105 hover:shadow-xl"
    >
      {/* Selection Indicator */}
      <Box
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
        }}
      >
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            toggleStudentSelection(student.id);
          }}
        >
          {selectedStudents.includes(student.id) ? (
            <MdCheckCircle size={16} color={theme.colors.primary} />
          ) : (
            <MdRadioButtonUnchecked size={16} />
          )}
        </ActionIcon>
      </Box>

      <Stack gap="md">
        {/* Student Header */}
        <Flex align="center" gap="md">
          <Indicator
            inline
            size={12}
            offset={8}
            position="bottom-end"
            color="green"
            withBorder
          >
            <Avatar
              src={student.user?.photo}
              size="lg"
              radius="xl"
              style={{
                border: `3px solid ${theme.colors.primary}20`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {student.user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Indicator>

          <Box style={{ flex: 1 }}>
            <Text fw={600} size="md" c={theme.text.primary} lineClamp={1}>
              {student.user?.name || "N/A"}
            </Text>
            <Badge size="sm" variant="light" color="blue" radius="md">
              {student.admission_no}
            </Badge>
          </Box>
        </Flex>

        {/* Student Details */}
        <Stack gap="xs">
          <Group gap="xs">
            <MdSchool size={16} color={theme.colors.primary} />
            <Text size="sm" c={theme.text.primary}>
              {student.class?.name || "N/A"} - {student.section?.name || "N/A"}
            </Text>
          </Group>

          <Group gap="xs">
            <MdPerson size={16} color={theme.colors.success} />
            <Text size="sm" c={theme.text.primary}>
              Roll: {student.roll}
            </Text>
          </Group>

          {student.user?.phone && (
            <Group gap="xs">
              <MdPhone size={16} color={theme.colors.info} />
              <Text size="sm" c={theme.text.muted}>
                {student.user.phone}
              </Text>
            </Group>
          )}

          {student.father_name && (
            <Group gap="xs">
              <MdFamily size={16} color={theme.colors.warning} />
              <Text size="sm" c={theme.text.muted}>
                Father: {student.father_name}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Actions */}
        <Group justify="flex-end" gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" color={theme.colors.info} size="sm">
              <MdVisibility size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit Student">
            <ActionIcon
              variant="subtle"
              color={theme.colors.primary}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(student);
              }}
            >
              <MdEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Student">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(student.id);
              }}
            >
              <MdDelete size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Paper>
  );

  // List View Component
  const ListView = () => (
    <Stack gap="xs">
      {students.map((student) => (
        <Paper
          key={student.id}
          p="md"
          radius="md"
          style={{
            background: theme.glassmorphism.primary,
            border: `1px solid ${theme.border}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex justify="space-between" align="center" gap="md">
            <Group gap="md">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => toggleStudentSelection(student.id)}
              >
                {selectedStudents.includes(student.id) ? (
                  <MdCheckCircle size={16} color={theme.colors.primary} />
                ) : (
                  <MdRadioButtonUnchecked size={16} />
                )}
              </ActionIcon>

              <Avatar src={student.user?.photo} size="md" radius="xl">
                {student.user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box>
                <Text fw={500} c={theme.text.primary}>
                  {student.user?.name || "N/A"}
                </Text>
                <Text size="sm" c={theme.text.muted}>
                  {student.admission_no} • {student.class?.name || "N/A"} -{" "}
                  {student.section?.name || "N/A"}
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              <Badge size="sm" variant="light" color="blue">
                Roll: {student.roll}
              </Badge>

              <ActionIcon variant="subtle" color={theme.colors.info} size="sm">
                <MdVisibility size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color={theme.colors.primary}
                size="sm"
                onClick={() => handleEdit(student)}
              >
                <MdEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => handleDelete(student.id)}
              >
                <MdDelete size={16} />
              </ActionIcon>
            </Group>
          </Flex>
        </Paper>
      ))}
    </Stack>
  );

  // Bulk Actions Bar
  const BulkActionsBar = () =>
    selectedStudents.length > 0 && (
      <Transition mounted={selectedStudents.length > 0} transition="slide-up">
        {(styles) => (
          <Paper
            p="md"
            radius="xl"
            style={{
              ...styles,
              background: theme.colors.primary,
              color: "white",
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <Group gap="md">
              <Text fw={500}>
                {selectedStudents.length} student
                {selectedStudents.length > 1 ? "s" : ""} selected
              </Text>
              <Button
                variant="white"
                color={theme.colors.primary}
                size="sm"
                onClick={() => {
                  // Bulk delete logic
                  console.log("Bulk delete:", selectedStudents);
                }}
              >
                Delete Selected
              </Button>
              <Button
                variant="white"
                color={theme.colors.primary}
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
              </Button>
            </Group>
          </Paper>
        )}
      </Transition>
    );

  // Create/Edit Form
  const CreateEditForm = () => (
    <Drawer
      opened={showCreateForm}
      onClose={() => {
        setShowCreateForm(false);
        setEditingStudent(null);
        form.reset();
      }}
      title={
        <Group>
          <MdPerson size={24} color={theme.colors.primary} />
          <Text size="lg" fw={600}>
            {editingStudent ? "Edit Student" : "Add New Student"}
          </Text>
        </Group>
      }
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <ScrollArea style={{ height: "calc(100vh - 80px)" }}>
        <form
          onSubmit={form.onSubmit(
            editingStudent ? () => {} : handleCreateStudent
          )}
        >
          <Stack gap="lg">
            {/* Personal Information */}
            <Paper
              p="lg"
              radius="md"
              style={{ background: theme.glassmorphism.secondary }}
            >
              <Text size="md" fw={600} mb="md" c={theme.text.primary}>
                Personal Information
              </Text>

              <SimpleGrid cols={1} spacing="md">
                <TextInput
                  label="Full Name"
                  placeholder="Enter student name"
                  leftSection={<MdPerson size={16} />}
                  {...form.getInputProps("name")}
                  radius="md"
                />

                <TextInput
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  leftSection={<MdEmail size={16} />}
                  {...form.getInputProps("email")}
                  radius="md"
                />

                <TextInput
                  label="Phone"
                  placeholder="Enter phone number"
                  leftSection={<MdPhone size={16} />}
                  {...form.getInputProps("phone")}
                  radius="md"
                />
              </SimpleGrid>
            </Paper>

            {/* Academic Information */}
            <Paper
              p="lg"
              radius="md"
              style={{ background: theme.glassmorphism.secondary }}
            >
              <Text size="md" fw={600} mb="md" c={theme.text.primary}>
                Academic Information
              </Text>

              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="Admission Number"
                  placeholder="Enter admission number"
                  leftSection={<MdSchool size={16} />}
                  {...form.getInputProps("admission_no")}
                  radius="md"
                />

                <TextInput
                  label="Roll Number"
                  placeholder="Enter roll number"
                  {...form.getInputProps("roll")}
                  radius="md"
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
                />
              </SimpleGrid>
            </Paper>

            {/* Family Information */}
            <Paper
              p="lg"
              radius="md"
              style={{ background: theme.glassmorphism.secondary }}
            >
              <Text size="md" fw={600} mb="md" c={theme.text.primary}>
                Family Information
              </Text>

              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="Father's Name"
                  placeholder="Enter father's name"
                  leftSection={<MdFamily size={16} />}
                  {...form.getInputProps("father_name")}
                  radius="md"
                />

                <TextInput
                  label="Father's Phone"
                  placeholder="Enter father's phone"
                  leftSection={<MdPhone size={16} />}
                  {...form.getInputProps("father_phone")}
                  radius="md"
                />

                <TextInput
                  label="Mother's Name"
                  placeholder="Enter mother's name"
                  leftSection={<MdFamily size={16} />}
                  {...form.getInputProps("mother_name")}
                  radius="md"
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
                />
              </SimpleGrid>
            </Paper>

            {/* Address Information */}
            <Paper
              p="lg"
              radius="md"
              style={{ background: theme.glassmorphism.secondary }}
            >
              <Text size="md" fw={600} mb="md" c={theme.text.primary}>
                Address Information
              </Text>

              <Textarea
                label="Current Address"
                placeholder="Enter current address"
                leftSection={<MdHome size={16} />}
                {...form.getInputProps("current_address")}
                radius="md"
                minRows={3}
              />
            </Paper>

            {/* Action Buttons */}
            <Group justify="flex-end" gap="md">
              <Button
                variant="subtle"
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
                leftSection={<MdSave size={16} />}
                gradient={{
                  from: theme.colors.primary,
                  to: theme.colors.accent,
                }}
                loading={loading}
              >
                {editingStudent ? "Update Student" : "Create Student"}
              </Button>
            </Group>
          </Stack>
        </form>
      </ScrollArea>
    </Drawer>
  );

  return (
    <Container size="xl" py="md" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        <ModernHeader />
        <StatsGrid />
        <SearchAndFilters />

        {/* Content Area */}
        <Box style={{ position: "relative" }}>
          {loading && (
            <Center style={{ position: "absolute", inset: 0, zIndex: 100 }}>
              <UltraLoader size="lg" message="Loading students..." />
            </Center>
          )}

          {students.length === 0 && !loading ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <MdPeople size={64} color={theme.text.muted} />
                <Text size="lg" c={theme.text.muted}>
                  No students found
                </Text>
                <Button
                  leftSection={<MdAdd size={16} />}
                  onClick={() => {
                    setEditingStudent(null);
                    form.reset();
                    setShowCreateForm(true);
                  }}
                >
                  Add Your First Student
                </Button>
              </Stack>
            </Center>
          ) : viewMode === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </SimpleGrid>
          ) : (
            <ListView />
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Center>
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
              size="md"
              radius="xl"
              styles={{
                control: {
                  backgroundColor: theme.glassmorphism.primary,
                  border: `1px solid ${theme.border}`,
                  color: theme.text.primary,
                  "&:hover": {
                    backgroundColor: theme.glassmorphism.hover,
                  },
                  "&[data-active]": {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                    color: "white",
                  },
                },
              }}
            />
          </Center>
        )}
      </Stack>

      <CreateEditForm />
      <BulkActionsBar />
    </Container>
  );
};

export default StudentsPageUltra;
