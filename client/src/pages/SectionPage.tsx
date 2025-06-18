import { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Modal,
  TextInput,
  Group,
  Paper,
  Title,
  Card,
  Text,
  Badge,
  Avatar,
  Stack,
  Grid,
  Select,
  ActionIcon,
  Menu,
  Pagination,
  SimpleGrid,
  Breadcrumbs,
  Anchor,
  Textarea,
  Loader,
  Center,
  Flex,
  SegmentedControl,
  ThemeIcon,
  NumberInput,
  Switch,
  Skeleton,
  Transition,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconGrid3x3,
  IconList,
  IconTableAlias,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconSchool,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconFileText,
  IconX,
  IconRefresh,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";
import { useDebouncedValue } from "@mantine/hooks";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import { UltraLoader } from "../components/ui";

interface SectionType {
  id: number;
  name: string;
  class_id: number;
  branch_id: number;
  capacity?: number;
  is_active?: boolean;
  current_students?: number;
  class?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface BranchType {
  id: number;
  name: string;
}

interface ClassType {
  id: number;
  name: string;
  branch_id: number;
}

const SectionPage = () => {
  const { theme } = useTheme();
  const [sections, setSections] = useState<SectionType[]>([]);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionType | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name" | "capacity" | "students" | "created_at"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const form = useForm({
    initialValues: {
      name: "",
      class_id: "",
      branch_id: "",
      capacity: "",
      is_active: true,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Section name is required" : null),
      branch_id: (value) => (!value ? "Branch is required" : null),
      class_id: (value) => (!value ? "Class is required" : null),
    },
  });

  // Fetch data functions
  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sections");
      setSections(res.data.data || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch sections",
        color: "red",
      });
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("/api/branches");
      setBranches(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchBranches();
    fetchClasses();
  }, []);

  // Filter and sort sections
  const filteredSections = sections
    .filter((section) => {
      const matchesSearch = section.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesBranch =
        !selectedBranch || section.branch_id.toString() === selectedBranch;
      const matchesClass =
        !selectedClass || section.class_id.toString() === selectedClass;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "active" && section.is_active) ||
        (selectedStatus === "inactive" && !section.is_active);

      return matchesSearch && matchesBranch && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "capacity":
          aValue = a.capacity || 0;
          bValue = b.capacity || 0;
          break;
        case "students":
          aValue = a.current_students || 0;
          bValue = b.current_students || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at || "");
          bValue = new Date(b.created_at || "");
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredSections.length / pageSize);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats calculations
  const totalSections = sections.length;
  const activeSections = sections.filter((s) => s.is_active).length;
  const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalStudents = sections.reduce(
    (sum, s) => sum + (s.current_students || 0),
    0
  );

  // CRUD operations
  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formattedValues = {
        ...values,
        class_id: parseInt(values.class_id),
        branch_id: parseInt(values.branch_id),
        capacity: values.capacity ? parseInt(values.capacity) : null,
      };

      if (editingSection) {
        await api.put(`/api/sections/${editingSection.id}`, formattedValues);
        notifications.show({
          title: "Success",
          message: "Section updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/sections", formattedValues);
        notifications.show({
          title: "Success",
          message: "Section created successfully",
          color: "green",
        });
      }
      setModalOpened(false);
      fetchSections();
      form.reset();
      setEditingSection(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed to save section",
        color: "red",
      });
    }
  };

  const handleEdit = (section: SectionType) => {
    setEditingSection(section);
    form.setValues({
      name: section.name,
      class_id: section.class_id.toString(),
      branch_id: section.branch_id.toString(),
      capacity: section.capacity?.toString() || "",
      is_active: section.is_active ?? true,
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;
    try {
      await api.delete(`/api/sections/${id}`);
      notifications.show({
        title: "Success",
        message: "Section deleted successfully",
        color: "green",
      });
      fetchSections();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete section",
        color: "red",
      });
    }
  };

  const handleViewSection = (section: SectionType) => {
    // Could open a detailed view modal or navigate to section details
    console.log("View section:", section);
  };

  // Helper functions
  const getStatusColor = (status: boolean | undefined) => {
    return status ? "green" : "red";
  };

  const getBranchName = (branchId: number) => {
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || `Branch ${branchId}`;
  };

  const getClassName = (classId: number) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem?.name || `Class ${classId}`;
  };

  return (
    <Container size="xl" py="md">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="md">
        <Anchor href="/" size="sm">
          Dashboard
        </Anchor>
        <Text size="sm">Sections</Text>
      </Breadcrumbs>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper
          p="xl"
          radius="xl"
          style={{
            background: `linear-gradient(135deg, ${
              theme.colors?.primary?.[6] || "#3b82f6"
            } 0%, ${theme.colors?.primary?.[8] || "#1e40af"} 100%)`,
            color: "white",
            border: "none",
          }}
          mb="xl"
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={1} size="h2" mb="xs">
                Sections Management
              </Title>
              <Text size="lg" style={{ opacity: 0.9 }}>
                Manage school sections, capacities, and assignments
              </Text>
            </div>
            <Group gap="sm">
              <ActionIcon variant="white" size="lg" radius="xl">
                <IconRefresh size={20} />
              </ActionIcon>
              <Button
                leftSection={<IconPlus size={18} />}
                variant="white"
                color="dark"
                radius="xl"
                size="md"
                onClick={() => {
                  setEditingSection(null);
                  form.reset();
                  setModalOpened(true);
                }}
              >
                Add Section
              </Button>
            </Group>
          </Group>

          {/* Stats Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} mt="xl" spacing="lg">
            {[
              {
                label: "Total Sections",
                value: totalSections,
                icon: IconSchool,
                color: "blue",
              },
              {
                label: "Active Sections",
                value: activeSections,
                icon: IconTrendingUp,
                color: "green",
              },
              {
                label: "Total Capacity",
                value: totalCapacity,
                icon: IconUsers,
                color: "purple",
              },
              {
                label: "Total Students",
                value: totalStudents,
                icon: IconFileText,
                color: "orange",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  radius="xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Group gap="sm">
                    <ThemeIcon
                      size="lg"
                      radius="xl"
                      variant="white"
                      color={stat.color}
                    >
                      <stat.icon size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xl" fw="bold" style={{ color: "white" }}>
                        {stat.value}
                      </Text>
                      <Text size="sm" style={{ opacity: 0.8 }}>
                        {stat.label}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Paper>
      </motion.div>
      {/* Enhanced Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
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
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Search sections..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                radius="xl"
                size="md"
                rightSection={
                  searchQuery && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setSearchQuery("")}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Group gap="sm" justify="flex-end">
                <Select
                  placeholder="All Branches"
                  data={[
                    { value: "", label: "All Branches" },
                    ...branches.map((b) => ({
                      value: b.id.toString(),
                      label: b.name,
                    })),
                  ]}
                  value={selectedBranch}
                  onChange={(value) => setSelectedBranch(value || "")}
                  radius="xl"
                  leftSection={<IconFilter size={16} />}
                  clearable
                />
                <Select
                  placeholder="All Classes"
                  data={[
                    { value: "", label: "All Classes" },
                    ...classes.map((c) => ({
                      value: c.id.toString(),
                      label: c.name,
                    })),
                  ]}
                  value={selectedClass}
                  onChange={(value) => setSelectedClass(value || "")}
                  radius="xl"
                  leftSection={<IconSchool size={16} />}
                  clearable
                />
                <Select
                  placeholder="All Status"
                  data={[
                    { value: "", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value || "")}
                  radius="xl"
                  clearable
                />
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: "name", label: "Name" },
                    { value: "capacity", label: "Capacity" },
                    { value: "students", label: "Students" },
                    { value: "created_at", label: "Date Created" },
                  ]}
                  value={sortBy}
                  onChange={(value: any) => setSortBy(value)}
                  radius="xl"
                  leftSection={
                    sortDirection === "asc" ? (
                      <IconSortAscending size={16} />
                    ) : (
                      <IconSortDescending size={16} />
                    )
                  }
                />
                <ActionIcon
                  variant="light"
                  size="lg"
                  radius="xl"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                >
                  {sortDirection === "asc" ? (
                    <IconSortAscending size={16} />
                  ) : (
                    <IconSortDescending size={16} />
                  )}
                </ActionIcon>
                <SegmentedControl
                  data={[
                    { label: <IconGrid3x3 size={16} />, value: "grid" },
                    { label: <IconList size={16} />, value: "list" },
                    { label: <IconTableAlias size={16} />, value: "table" },
                  ]}
                  value={viewMode}
                  onChange={(value: any) => setViewMode(value)}
                  radius="xl"
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>
      </motion.div>{" "}
      {/* Content Area */}
      {loading ? (
        <UltraLoader
          size="lg"
          message="Loading sections..."
          variant="detailed"
        />
      ) : (
        <>
          <AnimatePresence mode="wait">
            {/* Grid View */}
            {viewMode === "grid" && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing="lg"
                  mb="xl"
                >
                  {paginatedSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        radius="xl"
                        style={{
                          background: theme.bg?.elevated,
                          border: `1px solid ${theme.border}`,
                          height: "100%",
                        }}
                        p="lg"
                      >
                        <Group justify="space-between" mb="md">
                          <Avatar size={50} radius="xl" color="blue">
                            <IconSchool size={24} />
                          </Avatar>
                          <Menu>
                            <Menu.Target>
                              <ActionIcon variant="light" size="sm" radius="xl">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={16} />}
                                onClick={() => handleViewSection(section)}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => handleEdit(section)}
                              >
                                Edit Section
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => handleDelete(section.id)}
                              >
                                Delete Section
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>

                        <div>
                          <Text size="lg" fw={600} mb="xs">
                            {section.name}
                          </Text>
                          <Text size="sm" c="dimmed" mb="md">
                            {getClassName(section.class_id)} •{" "}
                            {getBranchName(section.branch_id)}
                          </Text>

                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="dimmed">
                              Capacity
                            </Text>
                            <Text size="sm" fw={500}>
                              {section.capacity || "N/A"}
                            </Text>
                          </Group>

                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="dimmed">
                              Students
                            </Text>
                            <Text size="sm" fw={500}>
                              {section.current_students || 0}
                            </Text>
                          </Group>

                          <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed">
                              Status
                            </Text>
                            <Badge
                              color={getStatusColor(section.is_active)}
                              variant="light"
                              radius="xl"
                            >
                              {section.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Group>

                          <Group gap="xs" mt="md">
                            <Button
                              variant="light"
                              size="xs"
                              radius="xl"
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleEdit(section)}
                              flex={1}
                            >
                              Edit
                            </Button>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              radius="xl"
                              onClick={() => handleDelete(section.id)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </SimpleGrid>
              </motion.div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  radius="xl"
                  style={{
                    background: theme.bg?.elevated,
                    border: `1px solid ${theme.border}`,
                  }}
                  p="lg"
                  mb="xl"
                >
                  <Stack gap="md">
                    {paginatedSections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Paper
                          p="md"
                          radius="lg"
                          style={{
                            background: theme.bg?.surface,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <Group justify="space-between">
                            <Group gap="md">
                              <Avatar size={40} radius="xl" color="blue">
                                <IconSchool size={20} />
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {section.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {getClassName(section.class_id)} •{" "}
                                  {getBranchName(section.branch_id)}
                                </Text>
                              </div>
                            </Group>
                            <Group gap="md">
                              <Badge
                                color={getStatusColor(section.is_active)}
                                variant="light"
                              >
                                {section.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Text size="sm" c="dimmed">
                                {section.current_students || 0}/
                                {section.capacity || "N/A"}
                              </Text>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="light"
                                  size="sm"
                                  onClick={() => handleViewSection(section)}
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="light"
                                  size="sm"
                                  onClick={() => handleEdit(section)}
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
                                      onClick={() => handleDelete(section.id)}
                                    >
                                      Delete
                                    </Menu.Item>
                                  </Menu.Dropdown>
                                </Menu>
                              </Group>
                            </Group>
                          </Group>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Card>
              </motion.div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  radius="xl"
                  style={{
                    background: theme.bg?.elevated,
                    border: `1px solid ${theme.border}`,
                  }}
                  p="lg"
                  mb="xl"
                >
                  <Table highlightOnHover verticalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Section</Table.Th>
                        <Table.Th>Class</Table.Th>
                        <Table.Th>Branch</Table.Th>
                        <Table.Th>Capacity</Table.Th>
                        <Table.Th>Students</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedSections.map((section) => (
                        <Table.Tr key={section.id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar size={40} radius="xl" color="blue">
                                <IconSchool size={20} />
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {section.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  Section ID: {section.id}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {getClassName(section.class_id)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {getBranchName(section.branch_id)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {section.capacity || "N/A"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {section.current_students || 0}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getStatusColor(section.is_active)}
                              variant="light"
                            >
                              {section.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleViewSection(section)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleEdit(section)}
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
                                    onClick={() => handleDelete(section.id)}
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
                    {Math.min(currentPage * pageSize, filteredSections.length)}{" "}
                    of {filteredSections.length} sections
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
      {/* Add/Edit Section Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingSection ? "Edit Section" : "Add New Section"}
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Section Name"
                  placeholder="Enter section name"
                  {...form.getInputProps("name")}
                  required
                  radius="md"
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
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Class"
                  placeholder="Select class"
                  data={classes
                    .filter(
                      (cls) =>
                        !selectedBranch ||
                        cls.branch_id.toString() === form.values.branch_id
                    )
                    .map((cls) => ({
                      value: cls.id.toString(),
                      label: cls.name,
                    }))}
                  {...form.getInputProps("class_id")}
                  required
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Capacity"
                  placeholder="Enter capacity"
                  {...form.getInputProps("capacity")}
                  min={0}
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Status
                  </Text>
                  <Switch
                    label="Active"
                    {...form.getInputProps("is_active", { type: "checkbox" })}
                  />
                </div>
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setModalOpened(false)}
                radius="md"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} radius="md">
                {editingSection ? "Update" : "Create"} Section
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default SectionPage;
