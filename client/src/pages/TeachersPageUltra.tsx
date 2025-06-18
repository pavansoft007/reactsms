import { useState, useEffect } from 'react';
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
import { IconUsers, IconPlus, IconSearch, IconEdit } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
  UltraModal,
  UltraLoader,
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  employee_id: string;
  qualification: string;
  experience: number;
  join_date: string;
  status: "active" | "inactive";
  salary: number;
  branch_id: number;
  branch_name?: string;
}

interface Branch {
  id: number;
  name: string;
}

const TeachersPageUltra = () => {
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    employee_id: "",
    qualification: "",
    experience: "",
    join_date: "",
    salary: "",
    branch_id: "",
    status: "active",
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/teachers");
      if (response.data.success) {
        setTeachers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch teachers",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/branches");
      if (response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTeacher
        ? `/teachers/${editingTeacher.id}`
        : "/teachers";
      const method = editingTeacher ? "put" : "post";

      const response = await api[method](url, formData);

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Teacher ${
            editingTeacher ? "updated" : "created"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        fetchTeachers();
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

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      employee_id: teacher.employee_id,
      qualification: teacher.qualification,
      experience: teacher.experience.toString(),
      join_date: teacher.join_date,
      salary: teacher.salary.toString(),
      branch_id: teacher.branch_id.toString(),
      status: teacher.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/teachers/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Teacher deleted successfully",
          color: "green",
        });
        fetchTeachers();
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete teacher",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      employee_id: "",
      qualification: "",
      experience: "",
      join_date: "",
      salary: "",
      branch_id: "",
      status: "active",
    });
    setEditingTeacher(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };
  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;
    const matchesBranch =
      branchFilter === "all" || teacher.branch_id.toString() === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

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
              Teachers Management
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage teacher profiles, assignments, and performance
            </Text>{" "}
          </div>{" "}
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Add Teacher
          </UltraButton>
        </Group>
      </UltraCard>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {filteredTeachers.length}
          </Text>
          <Text c="dimmed" size="sm">
            Total Teachers
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {filteredTeachers.filter((t) => t.status === "active").length}
          </Text>
          <Text c="dimmed" size="sm">
            Active Teachers
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {new Set(teachers.map((t) => t.subject)).size}
          </Text>
          <Text c="dimmed" size="sm">
            Subjects Taught
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {branches.length}
          </Text>
          <Text c="dimmed" size="sm">
            Branches
          </Text>
        </UltraCard>
      </div>
      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search teachers..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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
      </UltraCard>{" "}
      {/* Teachers Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>{" "}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ border: "none", padding: 0 }}>
                    <UltraLoader
                      size="lg"
                      message="Loading teachers..."
                      variant="detailed"
                    />
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <Text size="md" c={theme.text.muted}>
                      No teachers found
                    </Text>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <Text fw={500} size="sm" c={theme.text.primary}>
                        {teacher.employee_id}
                      </Text>
                    </td>
                    <td>
                      <Group gap="sm">
                        <Avatar
                          radius="xl"
                          size="md"
                          style={{
                            border: `2px solid ${theme.colors.primary}22`,
                          }}
                        >
                          {teacher.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Stack gap={2}>
                          <Text fw={500} c={theme.text.primary}>
                            {teacher.name}
                          </Text>
                          <Text size="sm" c={theme.text.muted}>
                            {teacher.email}
                          </Text>
                        </Stack>
                      </Group>
                    </td>
                    <td>
                      <Badge variant="light" color="blue" size="sm">
                        {teacher.subject}
                      </Badge>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.primary}>
                        {teacher.qualification}
                      </Text>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.primary}>
                        {teacher.experience} years
                      </Text>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.primary}>
                        {teacher.branch_name || "N/A"}
                      </Text>
                    </td>
                    <td>
                      <UltraTableBadge
                        variant={
                          teacher.status === "active" ? "success" : "error"
                        }
                      >
                        {teacher.status}
                      </UltraTableBadge>
                    </td>
                    <td>
                      <UltraTableActions>
                        <UltraButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                        >
                          <IconEdit size={16} />
                        </UltraButton>
                        <UltraButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <IconUsers size={16} />
                        </UltraButton>
                      </UltraTableActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>
      {/* Add/Edit Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UltraInput
              label="Full Name"
              placeholder="Enter teacher's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Employee ID"
              placeholder="Enter employee ID"
              value={formData.employee_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employee_id: e.target.value,
                }))
              }
              required
            />
            <UltraInput
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Subject"
              placeholder="Enter primary subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Qualification"
              placeholder="Enter qualification"
              value={formData.qualification}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  qualification: e.target.value,
                }))
              }
              required
            />
            <UltraInput
              label="Experience (Years)"
              type="number"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, experience: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Join Date"
              type="date"
              value={formData.join_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, join_date: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Salary"
              type="number"
              placeholder="Monthly salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, salary: e.target.value }))
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
            <UltraSelect
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value || "active" }))
              }
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              required
            />
          </div>{" "}
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
                editingTeacher ? <IconEdit size={16} /> : <IconPlus size={16} />
              }
              onClick={handleSubmit}
            >
              {editingTeacher ? "Update Teacher" : "Add Teacher"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default TeachersPageUltra;
