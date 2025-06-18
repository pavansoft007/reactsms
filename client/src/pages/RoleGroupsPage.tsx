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
  LoadingOverlay,
  Tabs,
  Badge,
  Textarea,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconList,
  IconUsers,
} from "@tabler/icons-react";
import api from "../api/config";

interface Role {
  id: number;
  name: string;
  prefix?: string;
}

interface RoleGroup {
  id: number;
  name: string;
  description?: string;
  roles?: Role[];
  created_at?: string;
  updated_at?: string;
}

const RoleGroupsPage = () => {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RoleGroup | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      role_ids: [] as string[],
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0
          ? "Role group name is required"
          : null,
    },
  });

  useEffect(() => {
    fetchRoleGroups();
    fetchRoles();
  }, []);

  const fetchRoleGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/role-groups");
      setRoleGroups(response.data || []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch role groups",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/api/roles");
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setValidationErrors([]);

      const payload = {
        name: values.name,
        description: values.description,
        role_ids: values.role_ids.map((id) => parseInt(id)),
      };

      if (editingGroup) {
        await api.put(`/api/role-groups/${editingGroup.id}`, payload);
        notifications.show({
          title: "Success",
          message: "Role group updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/role-groups", payload);
        notifications.show({
          title: "Success",
          message: "Role group created successfully",
          color: "green",
        });
      }

      resetForm();
      fetchRoleGroups();
      setActiveTab("list");
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setValidationErrors(errorData.errors);
        setActiveTab("create");
      }
      notifications.show({
        title: "Error",
        message: errorData?.message || "Failed to save role group",
        color: "red",
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingGroup(null);
    setValidationErrors([]);
  };

  const handleEdit = async (group: RoleGroup) => {
    setEditingGroup(group);

    // Fetch roles for this group
    try {
      const response = await api.get(`/api/role-groups/${group.id}/roles`);
      const groupRoles = response.data.data || [];

      form.setValues({
        name: group.name,
        description: group.description || "",
        role_ids: groupRoles.map((role: Role) => role.id.toString()),
      });
    } catch (error) {
      console.error("Failed to fetch group roles:", error);
      form.setValues({
        name: group.name,
        description: group.description || "",
        role_ids: [],
      });
    }

    setActiveTab("create");
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this role group? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/api/role-groups/${id}`);
      notifications.show({
        title: "Success",
        message: "Role group deleted successfully",
        color: "green",
      });
      fetchRoleGroups();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete role group",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <div style={{ position: "relative" }}>
          <LoadingOverlay visible={loading} />

          <Group justify="space-between" mb="lg">
            <Text size="xl" fw={600} style={{ color: "#667eea" }}>
              Role Groups
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setActiveTab("create")}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none",
              }}
            >
              Add Group
            </Button>
          </Group>

          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value || "list")}
          >
            <Tabs.List>
              <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                Group List
              </Tabs.Tab>
              <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
                {editingGroup ? "Edit Group" : "Create Group"}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="list" pt="xs">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Roles</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {roleGroups.map((group) => (
                    <Table.Tr key={group.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <IconUsers size={16} color="#667eea" />
                          <Text fw={500}>{group.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {group.description || "No description"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {group.roles && group.roles.length > 0 ? (
                            group.roles.slice(0, 3).map((role) => (
                              <Badge
                                key={role.id}
                                variant="light"
                                color="blue"
                                size="sm"
                              >
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <Text size="sm" c="dimmed">
                              No roles assigned
                            </Text>
                          )}
                          {group.roles && group.roles.length > 3 && (
                            <Badge variant="outline" size="sm">
                              +{group.roles.length - 3} more
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="orange"
                            onClick={() => handleEdit(group)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDelete(group.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {roleGroups.length === 0 && !loading && (
                <Text ta="center" py="xl" c="dimmed">
                  No role groups found. Click "Add Group" to create your first
                  role group.
                </Text>
              )}
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
                    label="Group Name"
                    placeholder="Enter role group name"
                    required
                    {...form.getInputProps("name")}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Enter role group description (optional)"
                    rows={3}
                    {...form.getInputProps("description")}
                  />

                  <MultiSelect
                    label="Roles"
                    placeholder="Select roles for this group"
                    data={roles.map((role) => ({
                      value: role.id.toString(),
                      label: role.name,
                    }))}
                    {...form.getInputProps("role_ids")}
                    searchable
                    clearable
                  />

                  <Group justify="flex-start" mt="lg">
                    <Button
                      type="submit"
                      leftSection={<IconPlus size={16} />}
                      loading={loading}
                      style={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        border: "none",
                      }}
                    >
                      {editingGroup ? "Update" : "Save"}
                    </Button>
                    {editingGroup && (
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </Group>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </div>
      </Paper>
    </Container>
  );
};

export default RoleGroupsPage;
