import React, { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import {
  MdSchool,
  MdPerson,
  MdSave,
  MdCancel,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
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
} from "../components/ui";
import api from "../api/config";

interface Class {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

const ClassPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      capacity: "",
    },
    validate: {
      name: (value) => (!value ? "Class name is required" : null),
      capacity: (value) => (!value || isNaN(Number(value)) ? "Valid capacity is required" : null),
    },
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/classes");
      setClasses(response.data.classes || []);    } catch (error) {
      console.error("Failed to fetch classes:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch classes",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const endpoint = editingClass ? `/api/classes/${editingClass.id}` : "/api/classes";
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
        message: error.response?.data?.error || `Failed to ${editingClass ? "update" : "create"} class`,
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

  return (
    <Container size="xl" py="xl" style={{ background: theme.bg.surface, minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <UltraCard variant="gradient" style={{ padding: "32px" }}>
          <Group justify="space-between" align="center">
            <Group>
              <MdSchool size={32} color="white" />
              <Stack gap="xs">
                <Text size="xl" fw={700} c="white">
                  Class Management
                </Text>
                <Text size="md" c="rgba(255,255,255,0.9)">
                  Manage and organize your school classes
                </Text>
              </Stack>
            </Group>
            <UltraButton 
              variant="secondary" 
              size="lg" 
              onClick={openCreateModal}
              glass
            >
              <Group gap="xs">
                <MdAdd size={20} />
                Add New Class
              </Group>
            </UltraButton>
          </Group>
        </UltraCard>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Total Classes
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {classes.length}
                </Text>
              </Stack>
              <MdSchool size={24} color={theme.colors.primary} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Active Classes
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {classes.filter(c => c.is_active).length}
                </Text>
              </Stack>
              <MdVisibility size={24} color={theme.colors.success} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Total Capacity
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {classes.reduce((sum, c) => sum + c.capacity, 0)}
                </Text>
              </Stack>
              <MdPerson size={24} color={theme.colors.warning} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Avg. Capacity
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {classes.length ? Math.round(classes.reduce((sum, c) => sum + c.capacity, 0) / classes.length) : 0}
                </Text>
              </Stack>
              <MdSchool size={24} color={theme.colors.accent} />
            </Group>
          </UltraCard>
        </SimpleGrid>

        {/* Classes Table */}
        <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
          <Group justify="space-between" mb="lg">
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
            </thead>
            <tbody>
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
