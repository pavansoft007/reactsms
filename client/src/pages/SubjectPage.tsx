import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  TextInput,
  Group,
  Paper,
  Title,
  LoadingOverlay,
  Select,
  Card,
  Text,
  Badge,
  Avatar,
  Stack,
  Grid,
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
  Transition
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
  IconBook,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconFileText,
  IconX,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconSchool,
  IconCode,
  IconUser
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";
import { useDebouncedValue } from "@mantine/hooks";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";

interface SubjectType {
  id: number;
  name: string;
  subject_code: string;
  subject_type: string;
  subject_author: string;
  branch_id: number;
  is_active?: boolean;
  total_classes?: number;
  total_students?: number;
  created_at?: string;
  updated_at?: string;
}

interface BranchType {
  id: number;
  name: string;
}

const SubjectPage: React.FC = () => {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'type' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const form = useForm({
    initialValues: {
      name: "",
      subject_code: "",
      subject_type: "",
      subject_author: "",
      branch_id: "",
      is_active: true,
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Subject name is required' : null),
      subject_code: (value) => (value.length < 1 ? 'Subject code is required' : null),
      subject_type: (value) => (value.length < 1 ? 'Subject type is required' : null),
      branch_id: (value) => (!value ? 'Branch is required' : null),
    },
  });

  // Fetch data functions
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/subjects");
      setSubjects(res.data.data || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch subjects",
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

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
  }, []);

  // Filter and sort subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      subject.subject_author.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesBranch = !selectedBranch || subject.branch_id.toString() === selectedBranch;
    const matchesType = !selectedType || subject.subject_type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'active' && subject.is_active) ||
      (selectedStatus === 'inactive' && !subject.is_active);
    
    return matchesSearch && matchesBranch && matchesType && matchesStatus;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'code':
        aValue = a.subject_code.toLowerCase();
        bValue = b.subject_code.toLowerCase();
        break;
      case 'type':
        aValue = a.subject_type.toLowerCase();
        bValue = b.subject_type.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at || '');
        bValue = new Date(b.created_at || '');
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / pageSize);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats calculations
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter(s => s.is_active !== false).length;  const subjectTypes = new Set(subjects.map(s => s.subject_type)).size;
  const totalBranches = new Set(subjects.map(s => s.branch_id)).size;

  // CRUD operations
  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formattedValues = {
        ...values,
        branch_id: parseInt(values.branch_id),
      };

      if (editingSubject) {
        await api.put(`/api/subjects/${editingSubject.id}`, formattedValues);
        notifications.show({
          title: "Success",
          message: "Subject updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/subjects", formattedValues);
        notifications.show({
          title: "Success",
          message: "Subject created successfully",
          color: "green",
        });
      }
      setModalOpened(false);
      fetchSubjects();
      form.reset();
      setEditingSubject(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed to save subject",
        color: "red",
      });
    }
  };

  const handleEdit = (subject: SubjectType) => {
    setEditingSubject(subject);
    form.setValues({
      name: subject.name,
      subject_code: subject.subject_code,
      subject_type: subject.subject_type,
      subject_author: subject.subject_author,
      branch_id: subject.branch_id.toString(),
      is_active: subject.is_active ?? true,
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      notifications.show({
        title: "Success",
        message: "Subject deleted successfully",
        color: "green",
      });
      fetchSubjects();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete subject",
        color: "red",
      });
    }
  };

  const handleViewSubject = (subject: SubjectType) => {
    // Could open a detailed view modal or navigate to subject details
    console.log("View subject:", subject);
  };

  // Helper functions
  const getStatusColor = (status: boolean | undefined) => {
    return status !== false ? 'green' : 'red';
  };

  const getBranchName = (branchId: number) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || `Branch ${branchId}`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'core': 'blue',
      'elective': 'green',
      'practical': 'orange',
      'theory': 'purple',
      'laboratory': 'red',
      'seminar': 'teal',
    };
    return colors[type.toLowerCase()] || 'gray';
  };

  return (
    <Container size="xl" py="md">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="md">
        <Anchor href="/" size="sm">Dashboard</Anchor>
        <Text size="sm">Subjects</Text>
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
            background: `linear-gradient(135deg, ${theme.colors?.primary?.[6] || '#3b82f6'} 0%, ${theme.colors?.primary?.[8] || '#1e40af'} 100%)`,
            color: 'white',
            border: 'none',
          }}
          mb="xl"
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={1} size="h2" mb="xs">
                Subjects Management
              </Title>
              <Text size="lg" style={{ opacity: 0.9 }}>
                Manage academic subjects, codes, and curriculum
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
                  setEditingSubject(null);
                  form.reset();
                  setModalOpened(true);
                }}
              >
                Add Subject
              </Button>
            </Group>
          </Group>

          {/* Stats Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} mt="xl" spacing="lg">
            {[
              { 
                label: 'Total Subjects', 
                value: totalSubjects, 
                icon: IconBook, 
                color: 'blue' 
              },
              { 
                label: 'Active Subjects', 
                value: activeSubjects, 
                icon: IconTrendingUp, 
                color: 'green' 
              },
              { 
                label: 'Subject Types', 
                value: subjectTypes, 
                icon: IconCode, 
                color: 'purple' 
              },
              { 
                label: 'Branches', 
                value: totalBranches, 
                icon: IconSchool, 
                color: 'orange' 
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
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
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
                      <Text size="xl" fw="bold" style={{ color: 'white' }}>
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
                placeholder="Search subjects..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                radius="xl"
                size="md"
                rightSection={
                  searchQuery && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setSearchQuery('')}
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
                    { value: '', label: 'All Branches' },
                    ...branches.map(b => ({ value: b.id.toString(), label: b.name }))
                  ]}
                  value={selectedBranch}
                  onChange={(value) => setSelectedBranch(value || '')}
                  radius="xl"
                  leftSection={<IconFilter size={16} />}
                  clearable
                />
                <Select
                  placeholder="All Types"
                  data={[
                    { value: '', label: 'All Types' },
                    { value: 'core', label: 'Core' },
                    { value: 'elective', label: 'Elective' },
                    { value: 'practical', label: 'Practical' },
                    { value: 'theory', label: 'Theory' },
                    { value: 'laboratory', label: 'Laboratory' },
                  ]}
                  value={selectedType}
                  onChange={(value) => setSelectedType(value || '')}
                  radius="xl"
                  leftSection={<IconCode size={16} />}
                  clearable
                />
                <Select
                  placeholder="All Status"
                  data={[
                    { value: '', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value || '')}
                  radius="xl"
                  clearable
                />
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: 'name', label: 'Name' },
                    { value: 'code', label: 'Code' },
                    { value: 'type', label: 'Type' },
                    { value: 'created_at', label: 'Date Created' }
                  ]}
                  value={sortBy}
                  onChange={(value: any) => setSortBy(value)}
                  radius="xl"
                  leftSection={sortDirection === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                />
                <ActionIcon
                  variant="light"
                  size="lg"
                  radius="xl"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                </ActionIcon>
                <SegmentedControl
                  data={[
                    { label: <IconGrid3x3 size={16} />, value: 'grid' },
                    { label: <IconList size={16} />, value: 'list' },
                    { label: <IconTableAlias size={16} />, value: 'table' },
                  ]}
                  value={viewMode}
                  onChange={(value: any) => setViewMode(value)}
                  radius="xl"
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>
      </motion.div>

      {/* Content Area */}
      {loading ? (
        <Center h={200}>
          <Loader size="xl" />
        </Center>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {/* Grid View */}
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mb="xl">
                  {paginatedSubjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        radius="xl"
                        style={{
                          background: theme.bg?.elevated,
                          border: `1px solid ${theme.border}`,
                          height: '100%',
                        }}
                        p="lg"
                      >
                        <Group justify="space-between" mb="md">
                          <Avatar size={50} radius="xl" color={getTypeColor(subject.subject_type)}>
                            <IconBook size={24} />
                          </Avatar>
                          <Menu>
                            <Menu.Target>
                              <ActionIcon variant="light" size="sm" radius="xl">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEye size={16} />} onClick={() => handleViewSubject(subject)}>
                                View Details
                              </Menu.Item>
                              <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => handleEdit(subject)}>
                                Edit Subject
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(subject.id)}>
                                Delete Subject
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>

                        <div>
                          <Text size="lg" fw={600} mb="xs">
                            {subject.name}
                          </Text>
                          <Text size="sm" c="dimmed" mb="md">
                            {subject.subject_code} • {getBranchName(subject.branch_id)}
                          </Text>

                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="dimmed">Type</Text>
                            <Badge color={getTypeColor(subject.subject_type)} variant="light" radius="xl">
                              {subject.subject_type}
                            </Badge>
                          </Group>

                          <Group justify="space-between" mb="sm">
                            <Text size="sm" c="dimmed">Author</Text>
                            <Text size="sm" fw={500}>{subject.subject_author || 'N/A'}</Text>
                          </Group>

                          <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed">Status</Text>
                            <Badge
                              color={getStatusColor(subject.is_active)}
                              variant="light"
                              radius="xl"
                            >
                              {subject.is_active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </Group>

                          <Group gap="xs" mt="md">
                            <Button
                              variant="light"
                              size="xs"
                              radius="xl"
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleEdit(subject)}
                              flex={1}
                            >
                              Edit
                            </Button>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              radius="xl"
                              onClick={() => handleDelete(subject.id)}
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
            {viewMode === 'list' && (
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
                    {paginatedSubjects.map((subject, index) => (
                      <motion.div
                        key={subject.id}
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
                              <Avatar size={40} radius="xl" color={getTypeColor(subject.subject_type)}>
                                <IconBook size={20} />
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {subject.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {subject.subject_code} • {subject.subject_type} • {getBranchName(subject.branch_id)}
                                </Text>
                              </div>
                            </Group>
                            <Group gap="md">
                              <Badge color={getStatusColor(subject.is_active)} variant="light">
                                {subject.is_active !== false ? 'Active' : 'Inactive'}
                              </Badge>
                              <Text size="sm" c="dimmed">
                                {subject.subject_author || 'N/A'}
                              </Text>
                              <Group gap="xs">
                                <ActionIcon variant="light" size="sm" onClick={() => handleViewSubject(subject)}>
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon variant="light" size="sm" onClick={() => handleEdit(subject)}>
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <Menu>
                                  <Menu.Target>
                                    <ActionIcon variant="light" size="sm">
                                      <IconDots size={16} />
                                    </ActionIcon>
                                  </Menu.Target>
                                  <Menu.Dropdown>
                                    <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(subject.id)}>
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
            {viewMode === 'table' && (
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
                        <Table.Th>Subject</Table.Th>
                        <Table.Th>Code</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Author</Table.Th>
                        <Table.Th>Branch</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedSubjects.map((subject) => (
                        <Table.Tr key={subject.id}>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar size={40} radius="xl" color={getTypeColor(subject.subject_type)}>
                                <IconBook size={20} />
                              </Avatar>
                              <div>
                                <Text size="sm" fw={500}>
                                  {subject.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  ID: {subject.id}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{subject.subject_code}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={getTypeColor(subject.subject_type)} variant="light">
                              {subject.subject_type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{subject.subject_author || 'N/A'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{getBranchName(subject.branch_id)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getStatusColor(subject.is_active)}
                              variant="light"
                            >
                              {subject.is_active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="light" size="sm" onClick={() => handleViewSubject(subject)}>
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="light" size="sm" onClick={() => handleEdit(subject)}>
                                <IconEdit size={16} />
                              </ActionIcon>
                              <Menu>
                                <Menu.Target>
                                  <ActionIcon variant="light" size="sm">
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(subject.id)}>
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
                    {Math.min(currentPage * pageSize, filteredSubjects.length)} of{" "}
                    {filteredSubjects.length} subjects
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

      {/* Add/Edit Subject Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Subject Name"
                  placeholder="Enter subject name"
                  {...form.getInputProps('name')}
                  required
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Subject Code"
                  placeholder="Enter subject code"
                  {...form.getInputProps('subject_code')}
                  required
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Subject Type"
                  placeholder="Select type"
                  data={[
                    { value: 'core', label: 'Core' },
                    { value: 'elective', label: 'Elective' },
                    { value: 'practical', label: 'Practical' },
                    { value: 'theory', label: 'Theory' },
                    { value: 'laboratory', label: 'Laboratory' },
                    { value: 'seminar', label: 'Seminar' },
                  ]}
                  {...form.getInputProps('subject_type')}
                  required
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Branch"
                  placeholder="Select branch"
                  data={branches.map(branch => ({ value: branch.id.toString(), label: branch.name }))}
                  {...form.getInputProps('branch_id')}
                  required
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Subject Author"
                  placeholder="Enter author name (optional)"
                  {...form.getInputProps('subject_author')}
                  radius="md"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <div>
                  <Text size="sm" fw={500} mb="xs">Status</Text>
                  <Switch
                    label="Active"
                    {...form.getInputProps('is_active', { type: 'checkbox' })}
                  />
                </div>
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setModalOpened(false)} radius="md">
                Cancel
              </Button>
              <Button type="submit" loading={loading} radius="md">
                {editingSubject ? 'Update' : 'Create'} Subject
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default SubjectPage;
