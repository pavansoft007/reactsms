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
  IconUsers,
  IconPlus,
  IconSearch,
  IconEdit,
  IconPhone,
  IconMail,
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
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";

interface Parent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  occupation?: string;
  children_count?: number;
  guardian_type: "father" | "mother" | "guardian";
  emergency_contact?: string;
  is_active: boolean;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  class_name: string;
}

const ParentsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    guardian_type: "father",
    emergency_contact: "",
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [parentsResponse, studentsResponse] = await Promise.all([
          api.get("/parents"),
          api.get("/students"),
        ]);

        if (parentsResponse.data.success) {
          setParents(parentsResponse.data.data || []);
        }

        if (studentsResponse.data.success) {
          setStudents(studentsResponse.data.data || []);
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
      const url = editingParent ? `/parents/${editingParent.id}` : "/parents";
      const method = editingParent ? "put" : "post";

      const response = await api[method](url, formData);

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Parent ${
            editingParent ? "updated" : "created"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        // Refresh parents
        const parentsResponse = await api.get("/parents");
        if (parentsResponse.data.success) {
          setParents(parentsResponse.data.data || []);
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

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);
    setFormData({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      guardian_type: parent.guardian_type,
      emergency_contact: parent.emergency_contact || "",
      is_active: parent.is_active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this parent record?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/parents/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Parent record deleted successfully",
          color: "green",
        });
        // Refresh parents
        const parentsResponse = await api.get("/parents");
        if (parentsResponse.data.success) {
          setParents(parentsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to delete parent record",
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
      address: "",
      occupation: "",
      guardian_type: "father",
      emergency_contact: "",
      is_active: true,
    });
    setEditingParent(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter parents based on search and filters
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" || parent.guardian_type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? parent.is_active : !parent.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const activeParents = parents.filter((p) => p.is_active).length;
  const fathers = parents.filter((p) => p.guardian_type === "father").length;
  const mothers = parents.filter((p) => p.guardian_type === "mother").length;
  const guardians = parents.filter(
    (p) => p.guardian_type === "guardian"
  ).length;

  const getGuardianIcon = (type: string) => {
    return <IconUsers size={20} />;
  };

  const getGuardianColor = (type: string) => {
    switch (type) {
      case "father":
        return "blue";
      case "mother":
        return "pink";
      case "guardian":
        return "green";
      default:
        return "gray";
    }
  };

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
              Parents & Guardians
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage parent information, contact details, and relationships
            </Text>
          </div>
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Add Parent
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
            {filteredParents.length}
          </Text>
          <Text c="dimmed" size="sm">
            Total Parents
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {activeParents}
          </Text>
          <Text c="dimmed" size="sm">
            Active Records
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {fathers}
          </Text>
          <Text c="dimmed" size="sm">
            Fathers
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
            <IconUsers size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {mothers}
          </Text>
          <Text c="dimmed" size="sm">
            Mothers
          </Text>
        </UltraCard>
      </div>

      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search parents..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Guardian Type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              { value: "all", label: "All Types" },
              { value: "father", label: "Father" },
              { value: "mother", label: "Mother" },
              { value: "guardian", label: "Guardian" },
            ]}
            style={{ minWidth: 150 }}
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
            style={{ minWidth: 120 }}
          />
        </Group>
      </UltraCard>

      {/* Parents Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Parent/Guardian</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Occupation</th>
                <th>Children</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent.id}>
                  <td>
                    <Group gap="sm">
                      <Avatar
                        radius="xl"
                        size="md"
                        style={{
                          border: `2px solid ${theme.colors.primary}22`,
                        }}
                      >
                        {parent.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={500} c={theme.text.primary}>
                          {parent.name}
                        </Text>
                        <Text size="sm" c={theme.text.muted}>
                          {parent.email}
                        </Text>
                      </Stack>
                    </Group>
                  </td>
                  <td>
                    <Badge
                      variant="light"
                      color={getGuardianColor(parent.guardian_type)}
                      size="sm"
                      leftSection={getGuardianIcon(parent.guardian_type)}
                    >
                      {parent.guardian_type}
                    </Badge>
                  </td>
                  <td>
                    <Stack gap={2}>
                      <Group gap="xs">
                        <IconPhone size={14} />
                        <Text size="sm" c={theme.text.primary}>
                          {parent.phone || "N/A"}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <IconMail size={14} />
                        <Text size="xs" c={theme.text.muted}>
                          {parent.email}
                        </Text>
                      </Group>
                    </Stack>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {parent.occupation || "Not specified"}
                    </Text>
                  </td>
                  <td>
                    <Badge variant="light" color="blue" size="sm">
                      {parent.children_count || 0}
                    </Badge>
                  </td>
                  <td>
                    <UltraTableBadge
                      variant={parent.is_active ? "success" : "error"}
                    >
                      {parent.is_active ? "Active" : "Inactive"}
                    </UltraTableBadge>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(parent)}
                      >
                        <IconEdit size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(parent.id)}
                      >
                        <IconUsers size={16} />
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
        title={
          editingParent ? "Edit Parent/Guardian" : "Add New Parent/Guardian"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UltraInput
              label="Full Name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <UltraSelect
              label="Guardian Type"
              value={formData.guardian_type}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  guardian_type: value || "father",
                }))
              }
              data={[
                { value: "father", label: "Father" },
                { value: "mother", label: "Mother" },
                { value: "guardian", label: "Guardian" },
              ]}
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
            />
            <UltraInput
              label="Occupation"
              placeholder="Enter occupation"
              value={formData.occupation}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, occupation: e.target.value }))
              }
            />
            <UltraInput
              label="Emergency Contact"
              placeholder="Enter emergency contact"
              value={formData.emergency_contact}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergency_contact: e.target.value,
                }))
              }
            />
            <div className="md:col-span-2">
              <UltraInput
                label="Address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
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
                editingParent ? <IconEdit size={16} /> : <IconPlus size={16} />
              }
              onClick={handleSubmit}
            >
              {editingParent ? "Update Parent" : "Add Parent"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default ParentsPageUltra;
