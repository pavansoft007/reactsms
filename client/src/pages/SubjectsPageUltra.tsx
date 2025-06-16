import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Avatar,
  Stack,
} from "@mantine/core";
import {
  IconBook,
  IconPlus,
  IconSearch,
  IconEdit,
  IconBuildingBank,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraModal,
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";

interface Subject {
  id: number;
  name: string;
  subject_code: string;
  subject_type: string;
  subject_author: string;
  branch_id: number;
  branch_name?: string;
  class_count?: number;
  teacher_count?: number;
}

interface Branch {
  id: number;
  name: string;
}

const SubjectsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject_code: "",
    subject_type: "",
    subject_author: "",
    branch_id: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [subjectsResponse, branchesResponse] = await Promise.all([
          api.get("/subjects"),
          api.get("/branches"),
        ]);

        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.data || []);
        }

        if (branchesResponse.data.success) {
          setBranches(branchesResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch data",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSubject
        ? `/subjects/${editingSubject.id}`
        : "/subjects";
      const method = editingSubject ? "put" : "post";

      const response = await api[method](url, formData);

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Subject ${
            editingSubject ? "updated" : "created"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        // Refresh subjects
        const subjectsResponse = await api.get("/subjects");
        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Operation failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      subject_code: subject.subject_code,
      subject_type: subject.subject_type,
      subject_author: subject.subject_author,
      branch_id: subject.branch_id.toString(),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/subjects/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Subject deleted successfully",
          color: "green",
        });
        // Refresh subjects
        const subjectsResponse = await api.get("/subjects");
        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete subject",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject_code: "",
      subject_type: "",
      subject_author: "",
      branch_id: "",
    });
    setEditingSubject(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter subjects based on search and filters
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || subject.subject_type === typeFilter;
    const matchesBranch =
      branchFilter === "all" || subject.branch_id.toString() === branchFilter;

    return matchesSearch && matchesType && matchesBranch;
  });

  const subjectTypes = Array.from(new Set(subjects.map((s) => s.subject_type)));

  return (
    <Container size="xl" className="ultra-container">
      {/* Header */}
      <UltraCard className="mb-6">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title
              order={2}
              className="ultra-gradient-text"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              Subjects Management
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage academic subjects, curriculum, and course structure
            </Text>
          </div>
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Add Subject
          </UltraButton>
        </Group>
      </UltraCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
            <IconBook size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {filteredSubjects.length}
          </Text>
          <Text c="dimmed" size="sm">
            Total Subjects
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconBook size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {subjectTypes.length}
          </Text>
          <Text c="dimmed" size="sm">
            Subject Types
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconBuildingBank size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {branches.length}
          </Text>
          <Text c="dimmed" size="sm">
            Branches
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
            <IconEdit size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {Array.from(new Set(subjects.map((s) => s.subject_author))).length}
          </Text>
          <Text c="dimmed" size="sm">
            Authors
          </Text>
        </UltraCard>
      </div>

      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search subjects..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Subject Type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              { value: "all", label: "All Types" },
              ...subjectTypes.map((type) => ({
                value: type,
                label: type,
              })),
            ]}
            style={{ minWidth: 150 }}
          />
          <UltraSelect
            placeholder="Branch"
            value={branchFilter}
            onChange={(value) => setBranchFilter(value || "all")}
            data={[
              { value: "all", label: "All Branches" },
              ...branches.map((branch) => ({
                value: branch.id.toString(),
                label: branch.name,
              })),
            ]}
            style={{ minWidth: 200 }}
          />
        </Group>
      </UltraCard>

      {/* Subjects Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Type</th>
                <th>Author</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <Group gap="sm">
                      <Avatar
                        radius="xl"
                        size="md"
                        style={{
                          border: `2px solid ${theme.colors.primary}22`,
                        }}
                      >
                        {subject.subject_code?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={500} c={theme.text.primary}>
                          {subject.subject_code}
                        </Text>
                      </Stack>
                    </Group>
                  </td>
                  <td>
                    <Text fw={500} c={theme.text.primary}>
                      {subject.name}
                    </Text>
                  </td>
                  <td>
                    <Badge variant="light" color="blue" size="sm">
                      {subject.subject_type}
                    </Badge>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {subject.subject_author}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {subject.branch_name || "N/A"}
                    </Text>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <IconEdit size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(subject.id)}
                      >
                        <IconBook size={16} />
                      </UltraButton>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>

      {/* Add/Edit Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UltraInput
              label="Subject Name"
              placeholder="Enter subject name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Subject Code"
              placeholder="Enter subject code"
              value={formData.subject_code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subject_code: e.target.value,
                }))
              }
              required
            />
            <UltraSelect
              label="Subject Type"
              placeholder="Select subject type"
              value={formData.subject_type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, subject_type: value || "" }))
              }
              data={[
                { value: "Core", label: "Core Subject" },
                { value: "Elective", label: "Elective Subject" },
                { value: "Optional", label: "Optional Subject" },
                { value: "Practical", label: "Practical Subject" },
                { value: "Theory", label: "Theory Subject" },
              ]}
              required
            />
            <UltraInput
              label="Subject Author"
              placeholder="Enter subject author"
              value={formData.subject_author}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subject_author: e.target.value,
                }))
              }
              required
            />
            <UltraSelect
              label="Branch"
              placeholder="Select branch"
              value={formData.branch_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, branch_id: value || "" }))
              }
              data={branches.map((branch) => ({
                value: branch.id.toString(),
                label: branch.name,
              }))}
              required
            />
          </div>

          <Group justify="flex-end" mt="xl">
            <UltraButton
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </UltraButton>
            <UltraButton
              variant="primary"
              loading={loading}
              leftSection={
                editingSubject ? <IconEdit size={16} /> : <IconPlus size={16} />
              }
              onClick={handleSubmit}
            >
              {editingSubject ? "Update Subject" : "Add Subject"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default SubjectsPageUltra;
