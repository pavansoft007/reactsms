import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  Group,
  LoadingOverlay,
  Tabs,
  Stack,
  Divider,
  Select,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconPlus, IconList } from "@tabler/icons-react";
import api from "../api/config";

interface ClassType {
  id: number;
  name: string;
  branch_id: number;
  numeric_name?: number;
  rank_order?: number;
  is_active?: boolean;
}

interface Branch {
  id: number;
  name: string;
}

const ClassPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const form = useForm({
    initialValues: {
      name: "",
      branch_id: "",
      numeric_name: "",
      rank_order: "",
      is_active: true,
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0
          ? "Class name is required"
          : null,
      branch_id: (value: string) =>
        !value || value.trim().length === 0
          ? "Branch ID is required"
          : null,
    },
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data.data || []);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to fetch classes",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      setBranches(response.data.data || []);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to fetch branches",
        color: "red",
      });
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setValidationErrors([]);
      if (editingClass) {
        await api.put(`/api/classes/${editingClass.id}`, values);
        notifications.show({
          title: "Success",
          message: "Class updated",
          color: "green",
        });
      } else {
        await api.post("/api/classes", values);
        notifications.show({
          title: "Success",
          message: "Class created",
          color: "green",
        });
      }
      resetForm();
      fetchClasses();
      setActiveTab("list");
    } catch (err: any) {
      setValidationErrors([err.response?.data?.message || "Failed"]);
      setActiveTab("create");
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingClass(null);
    setValidationErrors([]);
  };

  const handleEdit = (cls: ClassType) => {
    setEditingClass(cls);
    form.setValues({
      ...cls,
      branch_id: cls.branch_id?.toString() || "",
      numeric_name: cls.numeric_name?.toString() || "",
      rank_order: cls.rank_order?.toString() || "",
    });
    setActiveTab("create");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await api.delete(`/api/classes/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Class deleted",
        color: "green",
      });
      fetchClasses();
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to delete",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <div style={{ position: "relative" }}>
          <LoadingOverlay visible={loading} />
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value || "list")}
          >
            <Tabs.List>
              <Tabs.Tab
                value="list"
                leftSection={<IconList size={16} />}
                style={{ cursor: "pointer" }}
              >
                Class List
              </Tabs.Tab>
              <Tabs.Tab
                value="create"
                leftSection={<IconPlus size={16} />}
                style={{ cursor: "pointer" }}
              >
                {editingClass ? "Edit Class" : "Create Class"}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="list" pt="xs">
              <div style={{ marginBottom: 16 }}>
                <Button
                  onClick={() => {
                    setActiveTab("create");
                    resetForm();
                  }}
                  leftSection={<IconPlus size={16} />}
                  mb="md"
                >
                  Add Class
                </Button>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>SL</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Branch</Table.Th>
                      <Table.Th>Numeric Name</Table.Th>
                      <Table.Th>Rank Order</Table.Th>
                      <Table.Th>Active</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {classes.map((cls, idx) => (
                      <Table.Tr key={cls.id}>
                        <Table.Td>{idx + 1}</Table.Td>
                        <Table.Td>{cls.name}</Table.Td>
                        <Table.Td>{branches.find((b) => b.id === cls.branch_id)?.name || cls.branch_id}</Table.Td>
                        <Table.Td>{cls.numeric_name || "-"}</Table.Td>
                        <Table.Td>{cls.rank_order || "-"}</Table.Td>
                        <Table.Td>{cls.is_active ? "Yes" : "No"}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Button
                              size="xs"
                              onClick={() => handleEdit(cls)}
                              leftSection={<IconEdit size={16} />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="xs"
                              color="red"
                              onClick={() => handleDelete(cls.id)}
                              leftSection={<IconTrash size={16} />}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                {classes.length === 0 && !loading && (
                  <Text ta="center" py="xl" c="dimmed">
                    No classes found. Click "Create Class" to add your first class.
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
                    label="Class Name"
                    placeholder="Enter class name"
                    required
                    {...form.getInputProps("name")}
                  />
                  <Select
                    label="Branch"
                    placeholder="Select branch"
                    required
                    data={branches.map((b) => ({ value: b.id.toString(), label: b.name }))}
                    {...form.getInputProps("branch_id")}
                    value={form.values.branch_id}
                    onChange={(v) => form.setFieldValue("branch_id", v || "")}
                  />
                  <TextInput
                    label="Numeric Name"
                    placeholder="Enter numeric name"
                    {...form.getInputProps("numeric_name")}
                  />
                  <TextInput
                    label="Rank Order"
                    placeholder="Enter rank order"
                    {...form.getInputProps("rank_order")}
                  />
                  <Select
                    label="Active"
                    data={[
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                    {...form.getInputProps("is_active")}
                    value={form.values.is_active ? "true" : "false"}
                    onChange={(v) => form.setFieldValue("is_active", v === "true")}
                  />
                  <Group justify="flex-start" mt="lg">
                    <Button
                      type="submit"
                      leftSection={<IconPlus size={16} />}
                      loading={loading}
                    >
                      {editingClass ? "Update" : "Save"}
                    </Button>
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

export default ClassPage;
