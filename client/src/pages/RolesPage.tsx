import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Table,
  TextInput,
  Group,
  ActionIcon,
  Stack,
  Text,
  Tabs,
  Badge,
  Switch,
  Modal,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconList,
  IconKey,
  IconShield,
  IconEye,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { UltraLoader } from "../components/ui";

interface Role {
  id: number;
  name: string;
  prefix?: string;
  is_system: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

const RolesPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const form = useForm({
    initialValues: {
      name: "",
      prefix: "",
      description: "",
      is_system: false,
    },

    validate: {
      name: (value) => (!value.trim() ? "Role name is required" : null),
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/roles");
      setRoles(response.data.data || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch roles",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setValidationErrors([]);

      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}`, values);
        notifications.show({
          title: "Success",
          message: "Role updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/roles", values);
        notifications.show({
          title: "Success",
          message: "Role created successfully",
          color: "green",
        });
      }

      resetForm();
      fetchRoles();
      setActiveTab("list");
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setValidationErrors(errorData.errors);
        setActiveTab("create");
      }
      notifications.show({
        title: "Error",
        message: errorData?.message || "Failed to save role",
        color: "red",
      });
    }
  };
  const resetForm = () => {
    form.reset();
    setEditingRole(null);
    setValidationErrors([]);
  };
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setValues({
      name: role.name,
      prefix: role.prefix || "",
      description: role.description || "",
      is_system: role.is_system,
    });
    setActiveTab("create");
  };

  const handleViewPermissions = (role: Role) => {
    // Navigate to role permissions page with the role ID
    navigate(`/settings/role-permission?roleId=${role.id}`);
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setViewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/api/roles/${id}`);
      notifications.show({
        title: "Success",
        message: "Role deleted successfully",
        color: "green",
      });
      fetchRoles();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete role",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="md">
      {" "}
      <Paper shadow="sm" p="md" radius="md">
        <div style={{ position: "relative" }}>
          {loading && (
            <UltraLoader
              fullscreen
              size="lg"
              message="Managing roles..."
              variant="detailed"
            />
          )}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value || "list")}
          >
            <Tabs.List>
              <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                Role List
              </Tabs.Tab>
              <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
                {editingRole ? "Edit Role" : "Create Role"}
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="list" pt="xs">
              <div style={{ marginBottom: 16 }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>SL</Table.Th>
                      <Table.Th>Role Name</Table.Th>
                      <Table.Th>Prefix</Table.Th>
                      <Table.Th>System Role</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {roles.map((role, index) => (
                      <Table.Tr key={role.id}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <IconKey size={16} color="#667eea" />
                            <Text fw={500}>{role.name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>{role.prefix || "N/A"}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={role.is_system ? "green" : "gray"}
                            variant="light"
                          >
                            {role.is_system ? "Yes" : "No"}
                          </Badge>
                        </Table.Td>{" "}
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => handleViewRole(role)}
                              title="View Role Details"
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEdit(role)}
                              title="Edit Role"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            {!role.is_system && (
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(role.id)}
                                title="Delete Role"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            )}
                            <Button
                              variant="light"
                              size="xs"
                              leftSection={<IconShield size={14} />}
                              onClick={() => handleViewPermissions(role)}
                            >
                              Permissions
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {roles.length === 0 && !loading && (
                  <Text ta="center" py="xl" c="dimmed">
                    No roles found. Click "Create Role" to add your first role.
                  </Text>
                )}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="create" pt="xs">
              {validationErrors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} c="red" size="sm">
                      • {error}
                    </Text>
                  ))}
                </div>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                  <TextInput
                    label="Role Name"
                    placeholder="Enter role name"
                    required
                    {...form.getInputProps("name")}
                  />{" "}
                  <TextInput
                    label="Prefix"
                    placeholder="Enter role prefix (optional)"
                    {...form.getInputProps("prefix")}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter role description (optional)"
                    {...form.getInputProps("description")}
                    rows={3}
                  />
                  <Switch
                    label="System Role"
                    description="System roles cannot be deleted"
                    {...form.getInputProps("is_system", { type: "checkbox" })}
                  />
                  <Group justify="flex-start" mt="lg">
                    <Button
                      type="submit"
                      leftSection={<IconPlus size={16} />}
                      loading={loading}
                    >
                      {editingRole ? "Update" : "Save"}
                    </Button>
                    {editingRole && (
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>{" "}
          </Tabs>
        </div>
      </Paper>
      {/* View Role Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Role Details"
        size="md"
      >
        {selectedRole && (
          <Stack>
            <Group>
              <Text fw={500}>Name:</Text>
              <Text>{selectedRole.name}</Text>
            </Group>

            {selectedRole.prefix && (
              <Group>
                <Text fw={500}>Prefix:</Text>
                <Text>{selectedRole.prefix}</Text>
              </Group>
            )}

            {selectedRole.description && (
              <Group>
                <Text fw={500}>Description:</Text>
                <Text>{selectedRole.description}</Text>
              </Group>
            )}

            <Group>
              <Text fw={500}>System Role:</Text>
              <Badge
                color={selectedRole.is_system ? "red" : "green"}
                variant="light"
              >
                {selectedRole.is_system ? "Yes" : "No"}
              </Badge>
            </Group>

            {selectedRole.created_at && (
              <Group>
                <Text fw={500}>Created:</Text>
                <Text>
                  {new Date(selectedRole.created_at).toLocaleDateString()}
                </Text>
              </Group>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                leftSection={<IconShield size={16} />}
                onClick={() => {
                  setViewModalOpen(false);
                  handleViewPermissions(selectedRole);
                }}
              >
                Manage Permissions
              </Button>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default RolesPage;
