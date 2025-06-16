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

interface SectionType {
  id: number;
  name: string;
  class_id: number;
  branch_id: number;
  capacity?: number;
  is_active?: boolean;
}

const SectionPage: React.FC = () => {
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionType | null>(
    null
  );

  const form = useForm({
    initialValues: {
      name: "",
      class_id: "",
      branch_id: "",
      capacity: "",
      is_active: true,
    },
  });

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sections");
      setSections(res.data.data || []);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to fetch sections",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingSection) {
        await api.put(`/api/sections/${editingSection.id}`, values);
        notifications.show({
          title: "Success",
          message: "Section updated",
          color: "green",
        });
      } else {
        await api.post("/api/sections", values);
        notifications.show({
          title: "Success",
          message: "Section created",
          color: "green",
        });
      }
      setModalOpen(false);
      fetchSections();
      form.reset();
      setEditingSection(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const handleEdit = (section: SectionType) => {
    setEditingSection(section);
    form.setValues(section);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await api.delete(`/api/sections/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Section deleted",
        color: "green",
      });
      fetchSections();
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
        Sections
      </Title>
      <Button
        onClick={() => {
          setModalOpen(true);
          setEditingSection(null);
          form.reset();
        }}
        mb="md"
      >
        Add Section
      </Button>
      <Paper withBorder p="md" mb="md" style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class ID</th>
              <th>Branch ID</th>
              <th>Capacity</th>
              <th>Teacher ID</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{section.class_id}</td>
                <td>{section.branch_id}</td>
                <td>{section.capacity}</td>
                <td>{section.is_active ? "Yes" : "No"}</td>
                <td>
                  <Group>
                    <Button size="xs" onClick={() => handleEdit(section)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(section.id)}
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
        title={editingSection ? "Edit Section" : "Add Section"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <TextInput
            label="Class ID"
            required
            {...form.getInputProps("class_id")}
          />
          <TextInput
            label="Branch ID"
            required
            {...form.getInputProps("branch_id")}
          />
          <TextInput label="Capacity" {...form.getInputProps("capacity")} />
          <Button type="submit" mt="md" fullWidth>
            {editingSection ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </Container>
  );
};

export default SectionPage;
