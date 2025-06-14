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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import api from "../api/config";

interface RoleGroupType {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

const RoleGroupPage: React.FC = () => {
  const [roleGroups, setRoleGroups] = useState<RoleGroupType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RoleGroupType | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const fetchRoleGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/role-groups");
      setRoleGroups(res.data || []);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to fetch role groups",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoleGroups();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingGroup) {
        await api.put(`/api/role-groups/${editingGroup.id}`, values);
        notifications.show({
          title: "Success",
          message: "Role group updated",
          color: "green",
        });
      } else {
        await api.post("/api/role-groups", values);
        notifications.show({
          title: "Success",
          message: "Role group created",
          color: "green",
        });
      }
      setModalOpen(false);
      fetchRoleGroups();
      form.reset();
      setEditingGroup(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const handleEdit = (group: RoleGroupType) => {
    setEditingGroup(group);
    form.setValues(group);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this role group?")) return;
    try {
      await api.delete(`/api/role-groups/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Role group deleted",
        color: "green",
      });
      fetchRoleGroups();
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to delete",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Title order={2} mb="md">
        Role Groups
      </Title>
      <Button
        onClick={() => {
          setModalOpen(true);
          setEditingGroup(null);
          form.reset();
        }}
        mb="md"
      >
        Add Role Group
      </Button>
      <Paper withBorder p="md" mb="md" style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roleGroups.map((group) => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>{group.description}</td>
                <td>{group.is_active ? "Yes" : "No"}</td>
                <td>
                  <Group>
                    <Button size="xs" onClick={() => handleEdit(group)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(group.id)}
                    >
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? "Edit Role Group" : "Add Role Group"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <TextInput
            label="Description"
            {...form.getInputProps("description")}
          />
          <Button type="submit" mt="md" fullWidth>
            {editingGroup ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </Container>
  );
};

export default RoleGroupPage;
