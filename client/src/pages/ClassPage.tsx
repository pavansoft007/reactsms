import { useState, useEffect, useCallback } from 'react';
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
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconSchool,
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
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import { UltraLoader } from "../components/ui";

interface Class {
  id: number;
  name: string;
  branch_id: number;
  numeric_name?: number;
  rank_order?: number;
  is_active?: boolean;
  sections?: Section[];
  description?: string;
  capacity?: number;
  students_count?: number;
  teacher_assigned?: string;
  grade_level?: string;
  status?: "active" | "inactive";
}

interface Section {
  id: number;
  name: string;
  branch_id: number;
  capacity?: number;
  is_active?: boolean;
  classes?: Class[];
}

interface Branch {
  id: number;
  name: string;
}

const ClassPage = () => {
  const { theme } = useTheme();
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      capacity: "",
      branch_id: "",
      numeric_name: "",
      rank_order: "",
      is_active: true,
    },
    validate: {
      name: (value) => (!value ? "Class name is required" : null),
      capacity: (value) =>
        !value || isNaN(Number(value)) ? "Valid capacity is required" : null,
      branch_id: (value) => (!value ? "Branch is required" : null),
    },
  });

  const fetchClasses = useCallback(
    async (page = 1, search = "", branchId = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          ...(search && { search }),
          ...(branchId && { branch_id: branchId }),
        }).toString();
        const response = await api.get(`/api/classes?${params}`);

        // Enhance classes data with demo-like properties
        const enhancedClasses = (
          response.data.classes ||
          response.data.data ||
          []
        ).map((classItem: Class) => ({
          ...classItem,
          students_count:
            classItem.students_count || Math.floor(Math.random() * 30) + 10,
          teacher_assigned: classItem.teacher_assigned || "Not Assigned",
          grade_level:
            classItem.grade_level ||
            ["Elementary", "Middle", "High"][Math.floor(Math.random() * 3)],
          capacity: classItem.capacity || Math.floor(Math.random() * 20) + 30,
          status: classItem.is_active ? "active" : "inactive",
        }));

        setClasses(enhancedClasses);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching classes:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch classes",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      setBranches(response.data.branches || response.data.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  useEffect(() => {
    fetchClasses(1, "", selectedBranch || "");
    fetchBranches();
  }, [fetchClasses, selectedBranch]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = editingClass
        ? `/api/classes/${editingClass.id}`
        : "/api/classes";
      const method = editingClass ? "put" : "post";
      await api[method](endpoint, {
        ...values,
        capacity: Number(values.capacity),
        numeric_name: values.numeric_name ? Number(values.numeric_name) : null,
        rank_order: values.rank_order ? Number(values.rank_order) : null,
      });
      notifications.show({
        title: "Success",
        message: `Class ${editingClass ? "updated" : "created"} successfully`,
        color: "green",
      });
      setModalOpened(false);
      setEditingClass(null);
      form.reset();
      fetchClasses(1, "", selectedBranch || "");
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
      capacity: classItem.capacity?.toString() || "",
      branch_id: classItem.branch_id?.toString() || "",
      numeric_name: classItem.numeric_name?.toString() || "",
      rank_order: classItem.rank_order?.toString() || "",
      is_active: classItem.is_active ?? true,
    });
    setModalOpened(true);
  };

  const handleDelete = async (classId: number) => {
    setLoading(true);
    try {
      await api.delete(`/api/classes/${classId}`);
      notifications.show({
        title: "Success",
        message: "Class deleted successfully",
        color: "green",
      });
      fetchClasses(currentPage, searchQuery, selectedBranch || "");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete class",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClasses(1, searchQuery, selectedBranch || "");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "gray";
      default:
        return "blue";
    }
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
    active: classes.filter((c) => c.status === "active").length,
    totalCapacity: classes.reduce((sum, c) => sum + (c.capacity || 0), 0),
    avgCapacity:
      classes.length > 0
        ? Math.round(
            classes.reduce((sum, c) => sum + (c.capacity || 0), 0) /
              classes.length
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
              onClick={() => {
                setEditingClass(null);
                form.reset();
                setModalOpened(true);
              }}
              size="lg"
              radius="xl"
            >
              Add Class
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
      </Paper>{" "}
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
              placeholder="Search classes..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{ minWidth: 300 }}
              radius="xl"
              size="md"
            />

            <Select
              placeholder="All Branches"
              data={[
                { label: "All Branches", value: "" },
                ...branches.map((branch) => ({
                  label: branch.name,
                  value: branch.id.toString(),
                })),
              ]}
              value={selectedBranch}
              onChange={setSelectedBranch}
              radius="xl"
              size="md"
              clearable
            />

            <Button onClick={handleSearch} radius="xl" size="md">
              Search
            </Button>
          </Group>

          <Group gap="sm">
            <SegmentedControl
              data={[
                { label: <IconLayoutGrid size={16} />, value: "grid" },
                { label: <IconLayoutList size={16} />, value: "list" },
                { label: "Table", value: "table" },
              ]}
              value={viewMode}
              onChange={(value) =>
                setViewMode(value as "grid" | "list" | "table")
              }
              radius="xl"
            />

            <Select
              placeholder="Sort by"
              data={[
                { label: "Name", value: "name" },
                { label: "Capacity", value: "capacity" },
                { label: "Status", value: "is_active" },
                { label: "Grade Level", value: "grade_level" },
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
              onClick={() =>
                fetchClasses(currentPage, searchQuery, selectedBranch || "")
              }
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>{" "}
      </Paper>
    </motion.div>
  );

  const renderClassCard = (classItem: Class, index: number) => (
    <motion.div
      key={classItem.id}
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
              color={getStatusColor(classItem.status || "active")}
              position="bottom-end"
              withBorder
            >
              <Avatar
                size="lg"
                radius="xl"
                style={{
                  background: `linear-gradient(135deg, ${
                    theme.colors?.primary?.[4] ?? "#339af0"
                  }, ${theme.colors?.primary?.[6] ?? "#228be6"})`,
                }}
              >
                <IconSchool size={24} />
              </Avatar>
            </Indicator>
            <div>
              <Text fw={600} size="md" lineClamp={1}>
                {classItem.name}
              </Text>
              <Text size="xs" c="dimmed">
                {classItem.grade_level}
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
                onClick={() => handleViewClass(classItem)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={() => handleEdit(classItem)}
              >
                Edit Class
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDelete(classItem.id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Class Info */}
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Capacity
            </Text>
            <Badge variant="light" radius="xl">
              {classItem.students_count}/{classItem.capacity}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Status
            </Text>
            <Badge
              color={getStatusColor(classItem.status || "active")}
              variant="light"
              radius="xl"
            >
              {(classItem.status || "active").toUpperCase()}
            </Badge>
          </Group>

          {classItem.teacher_assigned && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Teacher
              </Text>
              <Text size="sm" fw={500}>
                {classItem.teacher_assigned}
              </Text>
            </Group>
          )}
        </Stack>

        <Divider my="md" />

        {/* Capacity Progress */}
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Enrollment
            </Text>
            <Text size="sm" fw={500}>
              {Math.round(
                ((classItem.students_count || 0) / (classItem.capacity || 1)) *
                  100
              )}
              %
            </Text>
          </Group>
          <Progress
            value={
              ((classItem.students_count || 0) / (classItem.capacity || 1)) *
              100
            }
            color={
              (classItem.students_count || 0) / (classItem.capacity || 1) > 0.9
                ? "red"
                : (classItem.students_count || 0) / (classItem.capacity || 1) >
                  0.7
                ? "yellow"
                : "green"
            }
            radius="xl"
            size="sm"
          />
        </Stack>

        {classItem.description && (
          <>
            <Divider my="md" />
            <Text size="xs" c="dimmed" lineClamp={2}>
              {classItem.description}
            </Text>
          </>
        )}
      </Card>
    </motion.div>
  );

  return (
    <Container size="xl" py="xl">
      {renderHeader()}
      {renderControls()}{" "}
      {loading ? (
        <UltraLoader
          size="lg"
          message="Loading classes..."
          variant="detailed"
        />
      ) : paginatedClasses.length === 0 ? (
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
              <IconSchool size={32} />
            </ThemeIcon>
            <Text size="xl" fw={600} mb="xs">
              No classes found
            </Text>
            <Text c="dimmed" mb="lg">
              {searchQuery || selectedBranch
                ? "Try adjusting your search or filters"
                : "Get started by adding your first class"}
            </Text>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                setEditingClass(null);
                form.reset();
                setModalOpened(true);
              }}
              radius="xl"
            >
              Add Class
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
                  {paginatedClasses.map((classItem, index) =>
                    renderClassCard(classItem, index)
                  )}
                </SimpleGrid>
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
                        <Table.Th>Class</Table.Th>
                        <Table.Th>Grade Level</Table.Th>
                        <Table.Th>Capacity</Table.Th>
                        <Table.Th>Students</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedClasses.map((classItem) => (
                        <Table.Tr key={classItem.id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar size={40} radius="xl">
                                <IconSchool size={20} />
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {classItem.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {classItem.description}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{classItem.grade_level}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">{classItem.capacity}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{classItem.students_count}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getStatusColor(
                                classItem.status || "active"
                              )}
                              variant="light"
                            >
                              {(classItem.status || "active").toUpperCase()}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleViewClass(classItem)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleEdit(classItem)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <Menu>
                                <Menu.Target>
                                  <ActionIcon variant="light" size="sm">
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => handleDelete(classItem.id)}
                                  >
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
                    {Math.min(currentPage * pageSize, filteredClasses.length)}{" "}
                    of {filteredClasses.length} classes
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
                        fetchClasses(page, searchQuery, selectedBranch || "");
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
      {/* Add/Edit Class Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingClass ? "Edit Class" : "Add New Class"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Class Name"
                  placeholder="Enter class name"
                  {...form.getInputProps("name")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Branch"
                  placeholder="Select branch"
                  data={branches.map((branch) => ({
                    value: branch.id.toString(),
                    label: branch.name,
                  }))}
                  {...form.getInputProps("branch_id")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Capacity"
                  placeholder="Enter capacity"
                  type="number"
                  {...form.getInputProps("capacity")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Numeric Name"
                  placeholder="Enter numeric name (optional)"
                  type="number"
                  {...form.getInputProps("numeric_name")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter class description (optional)"
                  {...form.getInputProps("description")}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {editingClass ? "Update" : "Create"} Class
              </Button>
            </Group>
          </Stack>
        </form>{" "}
      </Modal>
    </Container>
  );
};

export default ClassPage;
