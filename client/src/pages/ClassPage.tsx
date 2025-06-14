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

interface ClassType {
  id: number;
  name: string;
  branch_id: number;
  numeric_name?: number;
  rank_order?: number;
  is_active?: boolean;
}

const ClassPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      branch_id: "",
      numeric_name: "",
      rank_order: "",
      is_active: true,
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
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
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
      setModalOpen(false);
      fetchClasses();
      form.reset();
      setEditingClass(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const handleEdit = (cls: ClassType) => {
    setEditingClass(cls);
    form.setValues(cls);
    setModalOpen(true);
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
    <Container>
      <Title order={2} mb="md">
        Classes
      </Title>
      <Button
        onClick={() => {
          setModalOpen(true);
          setEditingClass(null);
          form.reset();
        }}
        mb="md"
      >
        Add Class
      </Button>
      <Paper withBorder p="md" mb="md" style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch ID</th>
              <th>Numeric Name</th>
              <th>Rank Order</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td>{cls.name}</td>
                <td>{cls.branch_id}</td>
                <td>{cls.numeric_name}</td>
                <td>{cls.rank_order}</td>
                <td>{cls.is_active ? "Yes" : "No"}</td>
                <td>
                  <Group>
                    <Button size="xs" onClick={() => handleEdit(cls)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(cls.id)}
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
        title={editingClass ? "Edit Class" : "Add Class"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <TextInput
            label="Branch ID"
            required
            {...form.getInputProps("branch_id")}
          />
          <TextInput
            label="Numeric Name"
            {...form.getInputProps("numeric_name")}
          />
          <TextInput label="Rank Order" {...form.getInputProps("rank_order")} />
          <Button type="submit" mt="md" fullWidth>
            {editingClass ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </Container>
  );
};

export default ClassPage;
