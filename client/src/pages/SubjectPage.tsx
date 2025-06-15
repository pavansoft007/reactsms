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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import api from "../api/config";

interface SubjectType {
  id: number;
  name: string;
  subject_code: string;
  subject_type: string;
  subject_author: string;
  branch_id: number;
}

interface BranchType {
  id: number;
  name: string;
}

const SubjectPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectType | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      subject_code: "",
      subject_type: "",
      subject_author: "",
      branch_id: "",
    },
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/subjects");
      setSubjects(res.data.data || []);
    } catch {
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
    } catch {}
  };

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingSubject) {
        await api.put(`/api/subjects/${editingSubject.id}`, values);
        notifications.show({
          title: "Success",
          message: "Subject updated",
          color: "green",
        });
      } else {
        await api.post("/api/subjects", values);
        notifications.show({
          title: "Success",
          message: "Subject created",
          color: "green",
        });
      }
      setModalOpen(false);
      fetchSubjects();
      form.reset();
      setEditingSubject(null);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed",
        color: "red",
      });
    }
  };

  const handleEdit = (subject: SubjectType) => {
    setEditingSubject(subject);
    form.setValues({
      ...subject,
      branch_id: subject.branch_id.toString(),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      notifications.show({
        title: "Deleted",
        message: "Subject deleted",
        color: "green",
      });
      fetchSubjects();
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
        Subjects
      </Title>
      <Button
        onClick={() => {
          setModalOpen(true);
          setEditingSubject(null);
          form.reset();
        }}
        mb="md"
      >
        Add Subject
      </Button>
      <Paper withBorder p="md" mb="md" style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>Author</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.name}</td>
                <td>{subject.subject_code}</td>
                <td>{subject.subject_type}</td>
                <td>{subject.subject_author}</td>
                <td>{branches.find((b) => b.id === subject.branch_id)?.name || subject.branch_id}</td>
                <td>
                  <Group>
                    <Button size="xs" onClick={() => handleEdit(subject)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(subject.id)}
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
        title={editingSubject ? "Edit Subject" : "Add Subject"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <TextInput label="Code" required {...form.getInputProps("subject_code")} />
          <TextInput label="Type" required {...form.getInputProps("subject_type")} />
          <TextInput label="Author" {...form.getInputProps("subject_author")} />
          <Select
            label="Branch"
            required
            data={branches.map((b) => ({ value: b.id.toString(), label: b.name }))}
            {...form.getInputProps("branch_id")}
            value={form.values.branch_id?.toString() || ''}
            onChange={(value) => form.setFieldValue("branch_id", value || "")}
          />
          <Button type="submit" mt="md" fullWidth>
            {editingSubject ? "Update" : "Create"}
          </Button>
        </form>
      </Modal>
    </Container>
  );
};

export default SubjectPage;
