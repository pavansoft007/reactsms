import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Divider,
  Paper,
  Card,
  Badge,
  ActionIcon,
  Menu,
  Button,
  TextInput,
  Select,
  Pagination,
  Avatar,
  ThemeIcon,
  Progress,
  SegmentedControl,
  Indicator,
} from "@mantine/core";
import {
  IconSchool,
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconUsers,
  IconActivity,
  IconTrendingUp,
  IconSortAscending,
  IconLayoutGrid,
  IconLayoutList,
  IconRefresh,
  IconBook,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSchool,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPerson,
  MdSave,
  MdCancel,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraTextarea,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
  UltraModal,
  LoadingTableRows,
  LoadingContainer,
} from "../components/ui";
import api from "../api/config";

interface Class {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  students_count?: number;
  teacher_assigned?: string;
  grade_level?: string;
}

const ClassPageUltra = () => {
  const { theme } = useTheme();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      capacity: "",
    },
    validate: {
      name: (value) => (!value ? "Class name is required" : null),
      capacity: (value) =>
        !value || isNaN(Number(value)) ? "Valid capacity is required" : null,
    },
  });
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "green" : "gray";
  };

  const handleViewClass = (classItem: Class) => {
    notifications.show({
      title: "View Class",
      message: `Viewing ${classItem.name} details...`,
      color: "blue",
    });
  };

  // Calculate stats
  const stats = {
    total: classes.length,
    active: classes.filter((c) => c.is_active).length,
    totalCapacity: classes.reduce((sum, c) => sum + c.capacity, 0),
    avgCapacity:
      classes.length > 0
        ? Math.round(
            classes.reduce((sum, c) => sum + c.capacity, 0) / classes.length
          )
        : 0,
  };

  // Filter and sort classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      classItem.grade_level?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    let aVal = a[sortBy as keyof Class] as string | number;
    let bVal = b[sortBy as keyof Class] as string | number;

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (sortOrder === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const paginatedClasses = sortedClasses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/classes");

      // Enhance classes data with demo-like properties
      const enhancedClasses = (response.data.classes || []).map(
        (classItem: Class) => ({
          ...classItem,
          students_count:
            classItem.students_count || Math.floor(Math.random() * 30) + 10,
          teacher_assigned: classItem.teacher_assigned || "Not Assigned",
          grade_level:
            classItem.grade_level ||
            ["Elementary", "Middle", "High"][Math.floor(Math.random() * 3)],
        })
      );

      setClasses(enhancedClasses);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch classes",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const endpoint = editingClass
        ? `/api/classes/${editingClass.id}`
        : "/api/classes";
      const method = editingClass ? "put" : "post";

      await api[method](endpoint, {
        ...values,
        capacity: Number(values.capacity),
      });

      notifications.show({
        title: "Success",
        message: `Class ${editingClass ? "updated" : "created"} successfully`,
        color: "green",
      });

      setModalOpened(false);
      setEditingClass(null);
      form.reset();
      fetchClasses();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.error ||
          `Failed to ${editingClass ? "update" : "create"} class`,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    form.setValues({
      name: classItem.name,
      description: classItem.description || "",
      capacity: classItem.capacity.toString(),
    });
    setModalOpened(true);
  };
  const handleDelete = async (id: number) => {
    // Use modern browser confirm or implement a proper modal
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    setLoading(true);
    try {
      await api.delete(`/api/classes/${id}`);
      notifications.show({
        title: "Success",
        message: "Class deleted successfully",
        color: "green",
      });
      fetchClasses();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to delete class",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    form.reset();
    setModalOpened(true);
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
              Class Management
            </Text>
            <Text size="lg" opacity={0.9}>
              Manage and organize your school classes with advanced features
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="white"
              color="dark"
              leftSection={<IconPlus size={18} />}
              onClick={openCreateModal}
              size="lg"
              radius="xl"
            >
              Add Class
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
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
                  <IconSchool size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Total Classes
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
                  Active Classes
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
                  <IconUsers size={20} />
                </ThemeIcon>
                <Text size="sm" opacity={0.9}>
                  Total Capacity
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.totalCapacity}
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
                  Avg Capacity
                </Text>
              </Group>
              <Text size="2xl" fw={700}>
                {stats.avgCapacity}
              </Text>
            </Card>
          </motion.div>
        </SimpleGrid>
      </Paper>
    </motion.div>
  );
  return (
    <Container
      size="xl"
      py="md"
      style={{ background: theme.bg.surface, minHeight: "100vh" }}
    >
      <Stack gap="md">
        {/* Header */}
        {renderHeader()} {/* Classes Table */}{" "}
        <UltraCard variant="glassmorphic" style={{ padding: "16px" }}>
          <Group justify="space-between" mb="sm">
            <Text size="lg" fw={600} c={theme.text.primary}>
              All Classes
            </Text>
            <UltraButton variant="primary" onClick={openCreateModal} glow>
              <Group gap="xs">
                <MdAdd size={18} />
                Add Class
              </Group>
            </UltraButton>
          </Group>

          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>{" "}
            <tbody>
              <LoadingTableRows
                loading={loading}
                itemCount={classes.length}
                colspan={6}
                loadingMessage="Loading classes..."
                emptyMessage="No classes found"
              >
                {classes.map((classItem) => (
                  <tr key={classItem.id}>
                    <td>
                      <Text fw={500} c={theme.text.primary}>
                        {classItem.name}
                      </Text>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.muted}>
                        {classItem.description || "No description"}
                      </Text>
                    </td>
                    <td>
                      <Text fw={500} c={theme.text.primary}>
                        {classItem.capacity} students
                      </Text>
                    </td>
                    <td>
                      <UltraTableBadge
                        variant={classItem.is_active ? "success" : "error"}
                      >
                        {classItem.is_active ? "Active" : "Inactive"}
                      </UltraTableBadge>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.muted}>
                        {new Date(classItem.created_at).toLocaleDateString()}
                      </Text>
                    </td>
                    <td>
                      <UltraTableActions>
                        <UltraButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(classItem)}
                        >
                          <MdEdit size={16} />
                        </UltraButton>
                        <UltraButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(classItem.id)}
                        >
                          <MdDelete size={16} />
                        </UltraButton>
                      </UltraTableActions>
                    </td>
                  </tr>
                ))}
              </LoadingTableRows>
            </tbody>
          </UltraTable>
        </UltraCard>
        {/* Create/Edit Modal */}
        <UltraModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setEditingClass(null);
            form.reset();
          }}
          title={
            <Group>
              <MdSchool size={24} color={theme.colors.primary} />
              <Text size="lg" fw={600}>
                {editingClass ? "Edit Class" : "Create New Class"}
              </Text>
            </Group>
          }
          variant="glass"
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              <UltraInput
                label="Class Name"
                placeholder="Enter class name (e.g., Grade 1, Class A)"
                required
                leftSection={<MdSchool size={18} />}
                variant="glass"
                {...form.getInputProps("name")}
              />

              <UltraTextarea
                label="Description"
                placeholder="Enter class description (optional)"
                leftSection={<MdPerson size={18} />}
                variant="glass"
                minRows={3}
                {...form.getInputProps("description")}
              />

              <UltraInput
                label="Capacity"
                placeholder="Enter maximum number of students"
                required
                type="number"
                leftSection={<MdPerson size={18} />}
                variant="glass"
                {...form.getInputProps("capacity")}
              />

              <Divider my="md" />

              <Group justify="flex-end" gap="md">
                <UltraButton
                  variant="ghost"
                  onClick={() => {
                    setModalOpened(false);
                    setEditingClass(null);
                    form.reset();
                  }}
                >
                  <Group gap="xs">
                    <MdCancel size={18} />
                    Cancel
                  </Group>
                </UltraButton>
                <UltraButton
                  type="submit"
                  variant="gradient"
                  loading={loading}
                  glow
                >
                  <Group gap="xs">
                    <MdSave size={18} />
                    {editingClass ? "Update Class" : "Create Class"}
                  </Group>
                </UltraButton>
              </Group>
            </Stack>
          </form>
        </UltraModal>
      </Stack>
    </Container>
  );
};

export default ClassPageUltra;
