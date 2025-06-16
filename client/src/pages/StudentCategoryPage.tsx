import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Button,
  Table,
  TextInput,
  Group,
  LoadingOverlay,
  Stack,
  Select,
  Text,
  Badge,
  Modal,
  Title,
  ActionIcon,
  Pagination,
  Card,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import api from "../api/config";

interface StudentCategoryType {
  id: number;
  name: string;
  branch_id: number;
  branch?: {
    id: number;
    name: string;
  };
}

interface Branch {
  id: number;
  name: string;
}

const StudentCategoryPage: React.FC = () => {
  // State
  const [categories, setCategories] = useState<StudentCategoryType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudentCategoryType | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form state
  const form = useForm({
    initialValues: {
      name: "",
      branch_id: "",
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0
          ? "Category name is required"
          : value.trim().length < 2
          ? "Category name must be at least 2 characters"
          : null,
      branch_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Branch is required"
          : null,
    },
  });

  // API Calls
  const fetchCategories = async (page = 1, search = "", branchId = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(branchId && { branch_id: branchId }),
      });

      const res = await api.get(`/api/student-categories?${params}`);
      setCategories(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.total || 0);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch student categories",
        color: "red",
      });
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      setBranches(response.data.data || []);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch branches",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBranches();
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = editingCategory
        ? `/api/student-categories/${editingCategory.id}`
        : "/api/student-categories";
      const method = editingCategory ? "put" : "post";

      await api[method](endpoint, values);

      notifications.show({
        title: "Success",
        message: `Student category ${editingCategory ? "updated" : "created"} successfully`,
        color: "green",
      });

      setModalOpened(false);
      setEditingCategory(null);
      form.reset();
      fetchCategories(currentPage, searchQuery, selectedBranch);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || `Failed to ${editingCategory ? "update" : "create"} student category`,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: StudentCategoryType) => {
    setEditingCategory(category);
    form.setValues({
      name: category.name,
      branch_id: category.branch_id.toString(),
    });
    setModalOpened(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/student-categories/${categoryId}`);
      notifications.show({
        title: "Success",
        message: "Student category deleted successfully",
        color: "green",
      });
      fetchCategories(currentPage, searchQuery, selectedBranch);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete student category",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories(1, searchQuery, selectedBranch);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCategories(page, searchQuery, selectedBranch);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.reset();
    setModalOpened(true);
  };

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Student Categories</Title>
          <Text size="sm" c="dimmed">
            Manage student categories for different branches
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Add Category
        </Button>
      </Group>

      {/* Search and Filter */}
      <Card withBorder radius="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <TextInput
              placeholder="Search categories..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Select
              placeholder="Filter by branch"
              data={branches.map(branch => ({ value: branch.id.toString(), label: branch.name }))}
              value={selectedBranch}
              onChange={(value) => setSelectedBranch(value || "")}
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

      {/* Categories Table */}
      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>Categories ({totalItems})</Text>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category Name</Table.Th>
                <Table.Th>Branch</Table.Th>
                <Table.Th width={120}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {categories.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed" py="xl">
                      No student categories found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                categories.map((category) => (
                  <Table.Tr key={category.id}>
                    <Table.Td>
                      <Text fw={500}>{category.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">
                        {category.branch?.name || 'Unknown Branch'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(category)}
                          size="sm"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(category.id)}
                          size="sm"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={handlePageChange}
                total={totalPages}
                size="sm"
              />
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingCategory(null);
          form.reset();
        }}
        title={editingCategory ? "Edit Student Category" : "Create Student Category"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Category Name"
              placeholder="Enter category name"
              required
              {...form.getInputProps("name")}
            />

            <Select
              label="Branch"
              placeholder="Select branch"
              required
              data={branches.map(branch => ({ 
                value: branch.id.toString(), 
                label: branch.name 
              }))}
              {...form.getInputProps("branch_id")}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setModalOpened(false);
                  setEditingCategory(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {editingCategory ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default StudentCategoryPage;
