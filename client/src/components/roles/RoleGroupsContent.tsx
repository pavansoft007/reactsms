import React, { useState, useEffect } from "react";
import {
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
import { IconEdit, IconTrash, IconPlus, IconList } from "@tabler/icons-react";
import api from "../../api/config";

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

const RoleGroupsContent: React.FC = () => {
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
      roles: [] as string[],
    },

    validate: {
      name: (value) => (!value.trim() ? "Role group name is required" : null),
    },
  });

  useEffect(() => {
    fetchRoleGroups();
    fetchRoles();
  }, []);
  const fetchRoleGroups = async () => {
    try {
      setLoading(true);
      console.log("Fetching role groups...");
      const response = await api.get("/api/role-groups");
      console.log("Role groups response:", response.data);
      setRoleGroups(response.data.data || []);
      console.log("Role groups set:", response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch role groups:", error);
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
      console.error("Failed to fetch roles for groups:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setValidationErrors([]);

      if (editingGroup) {
        await api.put(`/api/role-groups/${editingGroup.id}`, values);
        notifications.show({
          title: "Success",
          message: "Role group updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/role-groups", values);
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

  const handleEdit = (roleGroup: RoleGroup) => {
    setEditingGroup(roleGroup);
    form.setValues({
      name: roleGroup.name,
      description: roleGroup.description || "",
      roles: roleGroup.roles?.map((role) => role.id.toString()) || [],
    });
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
    } catch (error: any) {
      console.error("Failed to delete role group:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete role group",
        color: "red",
      });
    }
  };

  return (
    <Paper
      shadow="xs"
      p="md"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
      }}
    >
      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "list")}
        >
          <Tabs.List>
            <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
              List Role Groups
            </Tabs.Tab>
            <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
              {editingGroup ? "Edit Role Group" : "Create Role Group"}
            </Tabs.Tab>
          </Tabs.List>{" "}
          <Tabs.Panel value="list" pt="xs">
            {roleGroups.length === 0 && !loading ? (
              <Text ta="center" py="xl" c="dimmed">
                No role groups found. Click "Create Role Group" to add your
                first group.
              </Text>
            ) : (
              <div>
                <Text size="sm" c="dimmed" mb="md">
                  Found {roleGroups.length} role group(s)
                </Text>
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
                          <Text fw={500}>{group.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text>{group.description || "-"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            {group.roles && group.roles.length > 0 ? (
                              group.roles.map((role) => (
                                <Badge
                                  key={role.id}
                                  size="sm"
                                  variant="outline"
                                >
                                  {role.name}
                                </Badge>
                              ))
                            ) : (
                              <Text c="dimmed" fs="italic">
                                No roles assigned
                              </Text>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEdit(group)}
                              title="Edit Role Group"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(group.id)}
                              title="Delete Role Group"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}{" "}
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
                  label="Role Group Name"
                  placeholder="Enter role group name"
                  required
                  {...form.getInputProps("name")}
                />

                <Textarea
                  label="Description"
                  placeholder="Enter role group description (optional)"
                  {...form.getInputProps("description")}
                  rows={3}
                />

                <MultiSelect
                  label="Assign Roles"
                  placeholder="Select roles to include in this group"
                  data={roles.map((role) => ({
                    value: role.id.toString(),
                    label: role.name,
                  }))}
                  {...form.getInputProps("roles")}
                  searchable
                  clearable
                />

                <Group justify="flex-start" mt="lg">
                  <Button
                    type="submit"
                    leftSection={<IconPlus size={16} />}
                    loading={loading}
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
  );
};

export default RoleGroupsContent;
