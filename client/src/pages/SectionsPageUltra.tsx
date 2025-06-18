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
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconEdit,
  IconSchool,
} from "@tabler/icons-react";
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
  LoadingTableRows,
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";

interface Section {
  id: number;
  name: string;
  class_id: number;
  class_name?: string;
  branch_id: number;
  branch_name?: string;
  capacity?: number;
  teacher_id?: number;
  teacher_name?: string;
  student_count?: number;
  is_active?: boolean;
}

interface Class {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
}

const SectionsPageUltra = () => {
  const { theme } = useTheme();
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    class_id: "",
    branch_id: "",
    capacity: "",
    teacher_id: "",
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          sectionsResponse,
          classesResponse,
          branchesResponse,
          teachersResponse,
        ] = await Promise.all([
          api.get("/sections"),
          api.get("/classes"),
          api.get("/branches"),
          api.get("/teachers"),
        ]);

        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data || []);
        }

        if (classesResponse.data.success) {
          setClasses(classesResponse.data.data || []);
        }

        if (branchesResponse.data.success) {
          setBranches(branchesResponse.data.data || []);
        }

        if (teachersResponse.data.success) {
          setTeachers(teachersResponse.data.data || []);
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
      const url = editingSection
        ? `/sections/${editingSection.id}`
        : "/sections";
      const method = editingSection ? "put" : "post";

      const response = await api[method](url, formData);

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Section ${
            editingSection ? "updated" : "created"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        // Refresh sections
        const sectionsResponse = await api.get("/sections");
        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data || []);
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

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      class_id: section.class_id.toString(),
      branch_id: section.branch_id.toString(),
      capacity: section.capacity?.toString() || "",
      teacher_id: section.teacher_id?.toString() || "",
      is_active: section.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/sections/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Section deleted successfully",
          color: "green",
        });
        // Refresh sections
        const sectionsResponse = await api.get("/sections");
        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete section",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      class_id: "",
      branch_id: "",
      capacity: "",
      teacher_id: "",
      is_active: true,
    });
    setEditingSection(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter sections based on search and filters
  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === "all" || section.class_id.toString() === classFilter;
    const matchesBranch =
      branchFilter === "all" || section.branch_id.toString() === branchFilter;

    return matchesSearch && matchesClass && matchesBranch;
  });

  // Calculate stats
  const activeSections = sections.filter((s) => s.is_active).length;
  const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalStudents = sections.reduce(
    (sum, s) => sum + (s.student_count || 0),
    0
  );

  return (
    <Container size="xl" className="ultra-container">
      {" "}
      {/* Header */}
      <UltraCard className="mb-4">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title
              order={2}
              className="ultra-gradient-text"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              Sections Management
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage class sections, capacity, and teacher assignments
            </Text>
          </div>
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Add Section
          </UltraButton>
        </Group>
      </UltraCard>{" "}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
            <IconSchool size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {filteredSections.length}
          </Text>
          <Text c="dimmed" size="sm">
            Total Sections
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconSchool size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {activeSections}
          </Text>
          <Text c="dimmed" size="sm">
            Active Sections
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {totalCapacity}
          </Text>
          <Text c="dimmed" size="sm">
            Total Capacity
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {totalStudents}
          </Text>
          <Text c="dimmed" size="sm">
            Total Students
          </Text>
        </UltraCard>
      </div>
      {/* Filters */}
      <UltraCard className="mb-4">
        <Group gap="md">
          <UltraInput
            placeholder="Search sections..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Class"
            value={classFilter}
            onChange={(value) => setClassFilter(value || "all")}
            data={[
              { value: "all", label: "All Classes" },
              ...classes.map((cls) => ({
                value: cls.id.toString(),
                label: cls.name,
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
      {/* Sections Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Class</th>
                <th>Branch</th>
                <th>Teacher</th>
                <th>Capacity</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>{" "}
            <tbody>
              <LoadingTableRows
                loading={loading}
                itemCount={filteredSections.length}
                colspan={8}
                loadingMessage="Loading sections..."
                emptyMessage="No sections found"
              >
                {filteredSections.map((section) => (
                  <tr key={section.id}>
                    <td>
                      <Group gap="sm">
                        <Avatar
                          radius="xl"
                          size="md"
                          style={{
                            border: `2px solid ${theme.colors.primary}22`,
                          }}
                        >
                          {section.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Stack gap={2}>
                          <Text fw={500} c={theme.text.primary}>
                            {section.name}
                          </Text>
                          <Text size="sm" c={theme.text.muted}>
                            ID: {section.id}
                          </Text>
                        </Stack>
                      </Group>
                    </td>
                    <td>
                      <Text fw={500} c={theme.text.primary}>
                        {section.class_name || "N/A"}
                      </Text>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.primary}>
                        {section.branch_name || "N/A"}
                      </Text>
                    </td>
                    <td>
                      <Text size="sm" c={theme.text.primary}>
                        {section.teacher_name || "Not Assigned"}
                      </Text>
                    </td>
                    <td>
                      <Badge variant="light" color="blue" size="sm">
                        {section.capacity || 0}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="light" color="green" size="sm">
                        {section.student_count || 0}
                      </Badge>
                    </td>
                    <td>
                      <UltraTableBadge
                        variant={section.is_active ? "success" : "error"}
                      >
                        {section.is_active ? "Active" : "Inactive"}
                      </UltraTableBadge>
                    </td>
                    <td>
                      <UltraTableActions>
                        <UltraButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(section)}
                        >
                          <IconEdit size={16} />
                        </UltraButton>
                        <UltraButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
                        >
                          <IconSchool size={16} />
                        </UltraButton>
                      </UltraTableActions>
                    </td>
                  </tr>
                ))}
              </LoadingTableRows>
            </tbody>
          </UltraTable>
        )}
      </UltraCard>
      {/* Add/Edit Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSection ? "Edit Section" : "Add New Section"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UltraInput
              label="Section Name"
              placeholder="Enter section name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <UltraSelect
              label="Class"
              placeholder="Select class"
              value={formData.class_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, class_id: value || "" }))
              }
              data={classes.map((cls) => ({
                value: cls.id.toString(),
                label: cls.name,
              }))}
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
            <UltraInput
              label="Capacity"
              type="number"
              placeholder="Enter section capacity"
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, capacity: e.target.value }))
              }
            />
            <UltraSelect
              label="Class Teacher"
              placeholder="Select teacher (optional)"
              value={formData.teacher_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, teacher_id: value || "" }))
              }
              data={teachers.map((teacher) => ({
                value: teacher.id.toString(),
                label: teacher.name,
              }))}
            />
            <UltraSelect
              label="Status"
              value={formData.is_active ? "active" : "inactive"}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: value === "active",
                }))
              }
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
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
                editingSection ? <IconEdit size={16} /> : <IconPlus size={16} />
              }
              onClick={handleSubmit}
            >
              {editingSection ? "Update Section" : "Add Section"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default SectionsPageUltra;
