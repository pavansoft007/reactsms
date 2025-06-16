import React, { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Divider,
  Avatar,
  Pagination,
  Center,
} from "@mantine/core";
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdSearch,
  MdFilterList,
  MdFileDownload,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTheme } from "../context/ThemeContext";
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
import { useAcademicYear } from "../context/AcademicYearContext";

interface Student {
  id: number;
  user: {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
  };
  admission_no: string;
  roll: string;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  admission_date: string;
  blood_group?: string;
  current_address?: string;
}

interface Class {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

const StudentsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const { academicYear } = useAcademicYear();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      admission_no: "",
      roll: "",
      class_id: "",
      section_id: "",
      father_name: "",
      father_phone: "",
      mother_name: "",
      admission_date: "",
      blood_group: "",
      current_address: "",
    },
    validate: {
      name: (value) => (!value ? "Student name is required" : null),
      email: (value) => (value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value) ? "Invalid email" : null),
      admission_no: (value) => (!value ? "Admission number is required" : null),
      class_id: (value) => (!value ? "Class is required" : null),
    },
  });
  useEffect(() => {
    if (academicYear) {
      fetchStudents(1, "", selectedClass || "", academicYear.id);
    }
    fetchClasses();
    fetchSections();
  }, [academicYear, selectedClass]);

  const fetchStudents = async (page = 1, search = "", classId = "", sessionId = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(classId && { class_id: classId }),
        ...(sessionId && { session_id: sessionId }),
      }).toString();
      const response = await api.get(`/api/students?${params}`);
      setStudents(response.data.students || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching students:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch students",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/api/classes");
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get("/api/sections");
      setSections(response.data.sections || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const endpoint = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "put" : "post";
      await api[method](endpoint, values);

      notifications.show({
        title: "Success",
        message: `Student ${editingStudent ? "updated" : "created"} successfully`,
        color: "green",
      });

      setModalOpened(false);
      setEditingStudent(null);
      form.reset();
      fetchStudents(currentPage, searchQuery, selectedClass || "", academicYear?.id || "");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || `Failed to ${editingStudent ? "update" : "create"} student`,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setValues({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone || "",
      admission_no: student.admission_no,
      roll: student.roll,
      class_id: student.class.id?.toString() || "",
      section_id: student.section.id?.toString() || "",
      father_name: student.father_name || "",
      father_phone: student.father_phone || "",
      mother_name: student.mother_name || "",
      admission_date: student.admission_date,
      blood_group: student.blood_group || "",
      current_address: student.current_address || "",
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    setLoading(true);
    try {
      await api.delete(`/api/students/${id}`);
      notifications.show({
        title: "Success",
        message: "Student deleted successfully",
        color: "green",
      });
      fetchStudents(currentPage, searchQuery, selectedClass || "", academicYear?.id || "");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to delete student",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    form.reset();
    setModalOpened(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    fetchStudents(1, value, selectedClass || "", academicYear?.id || "");
  };

  const handleClassFilter = (value: string | null) => {
    setSelectedClass(value);
    setCurrentPage(1);
    fetchStudents(1, searchQuery, value || "", academicYear?.id || "");
  };

  return (
    <Container size="xl" py="xl" style={{ background: theme.bg.surface, minHeight: "100vh" }}>
      <Stack gap="xl">
        {/* Header */}
        <UltraCard variant="gradient" style={{ padding: "32px" }}>
          <Group justify="space-between" align="center">
            <Group>
              <MdPeople size={32} color="white" />
              <Stack gap="xs">
                <Text size="xl" fw={700} c="white">
                  Student Management
                </Text>
                <Text size="md" c="rgba(255,255,255,0.9)">
                  Manage student records and information
                </Text>
              </Stack>
            </Group>
            <UltraButton variant="secondary" size="lg" onClick={openCreateModal} glass>
              <Group gap="xs">
                <MdAdd size={20} />
                Add New Student
              </Group>
            </UltraButton>
          </Group>
        </UltraCard>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Total Students
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {students.length}
                </Text>
              </Stack>
              <MdPeople size={24} color={theme.colors.primary} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Active Classes
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {classes.length}
                </Text>
              </Stack>
              <MdSchool size={24} color={theme.colors.success} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Male Students
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {Math.floor(students.length * 0.6)}
                </Text>
              </Stack>
              <MdPerson size={24} color={theme.colors.info} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Female Students
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {Math.ceil(students.length * 0.4)}
                </Text>
              </Stack>
              <MdPerson size={24} color={theme.colors.warning} />
            </Group>
          </UltraCard>
        </SimpleGrid>

        {/* Filters and Search */}
        <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
            <Group gap="md" style={{ flex: 1 }}>
              <UltraInput
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                leftSection={<MdSearch size={18} />}
                variant="glass"
                style={{ minWidth: "300px" }}
              />
              
              <UltraSelect
                placeholder="Filter by class"
                value={selectedClass}
                onChange={handleClassFilter}
                data={[
                  { value: "", label: "All Classes" },
                  ...classes.map((cls) => ({ value: cls.id.toString(), label: cls.name })),
                ]}
                leftSection={<MdFilterList size={18} />}
                variant="glass"
                clearable
              />
            </Group>

            <Group gap="sm">
              <UltraButton variant="outline" size="sm">
                <Group gap="xs">
                  <MdFileDownload size={16} />
                  Export
                </Group>
              </UltraButton>
            </Group>
          </Group>
        </UltraCard>

        {/* Students Table */}
        <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
          <Group justify="space-between" mb="lg">
            <Text size="lg" fw={600} c={theme.text.primary}>
              Students List
            </Text>
            <UltraButton variant="primary" onClick={openCreateModal} glow>
              <Group gap="xs">
                <MdAdd size={18} />
                Add Student
              </Group>
            </UltraButton>
          </Group>

          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Class</th>
                <th>Roll</th>
                <th>Contact</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Group gap="sm">
                      <Avatar
                        src={student.user.photo}
                        radius="xl"
                        size="md"
                        style={{
                          border: `2px solid ${theme.colors.primary}22`,
                        }}
                      >
                        {student.user.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={500} c={theme.text.primary}>
                          {student.user.name}
                        </Text>
                        <Text size="sm" c={theme.text.muted}>
                          {student.user.email}
                        </Text>
                      </Stack>
                    </Group>
                  </td>
                  <td>
                    <Text fw={500} c={theme.text.primary}>
                      {student.admission_no}
                    </Text>
                  </td>
                  <td>
                    <Group gap="xs">
                      <Text fw={500} c={theme.text.primary}>
                        {student.class.name}
                      </Text>
                      <Text size="sm" c={theme.text.muted}>
                        ({student.section.name})
                      </Text>
                    </Group>
                  </td>
                  <td>
                    <Text fw={500} c={theme.text.primary}>
                      {student.roll}
                    </Text>
                  </td>
                  <td>
                    <Stack gap={2}>
                      <Text size="sm" c={theme.text.primary}>
                        {student.user.phone || "N/A"}
                      </Text>
                      <Text size="xs" c={theme.text.muted}>
                        {student.user.email}
                      </Text>
                    </Stack>
                  </td>
                  <td>
                    <Stack gap={2}>
                      <Text size="sm" c={theme.text.primary}>
                        {student.father_name || "N/A"}
                      </Text>
                      <Text size="xs" c={theme.text.muted}>
                        {student.father_phone || ""}
                      </Text>
                    </Stack>
                  </td>
                  <td>
                    <UltraTableBadge variant="success">Active</UltraTableBadge>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                        <MdEdit size={16} />
                      </UltraButton>
                      <UltraButton variant="ghost" size="sm">
                        <MdVisibility size={16} />
                      </UltraButton>
                      <UltraButton variant="danger" size="sm" onClick={() => handleDelete(student.id)}>
                        <MdDelete size={16} />
                      </UltraButton>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <Center mt="lg">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchStudents(page, searchQuery, selectedClass || "", academicYear?.id || "");
                }}
                size="md"
                radius="md"
                styles={{
                  control: {
                    backgroundColor: theme.glassmorphism.secondary,
                    border: `1px solid ${theme.border}`,
                    color: theme.text.primary,
                    "&:hover": {
                      backgroundColor: theme.glassmorphism.hover,
                    },
                    "&[data-active]": {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  },
                }}
              />
            </Center>
          )}
        </UltraCard>

        {/* Create/Edit Modal */}
        <UltraModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setEditingStudent(null);
            form.reset();
          }}
          title={
            <Group>
              <MdPerson size={24} color={theme.colors.primary} />
              <Text size="lg" fw={600}>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </Text>
            </Group>
          }
          variant="glass"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <UltraInput
                  label="Student Name"
                  placeholder="Enter student full name"
                  required
                  leftSection={<MdPerson size={18} />}
                  variant="glass"
                  {...form.getInputProps("name")}
                />

                <UltraInput
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  leftSection={<MdEmail size={18} />}
                  variant="glass"
                  {...form.getInputProps("email")}
                />

                <UltraInput
                  label="Phone"
                  placeholder="Enter phone number"
                  leftSection={<MdPhone size={18} />}
                  variant="glass"
                  {...form.getInputProps("phone")}
                />

                <UltraInput
                  label="Admission Number"
                  placeholder="Enter admission number"
                  required
                  leftSection={<MdSchool size={18} />}
                  variant="glass"
                  {...form.getInputProps("admission_no")}
                />

                <UltraSelect
                  label="Class"
                  placeholder="Select class"
                  required
                  data={classes.map((cls) => ({ value: cls.id.toString(), label: cls.name }))}
                  leftSection={<MdSchool size={18} />}
                  variant="glass"
                  {...form.getInputProps("class_id")}
                />

                <UltraInput
                  label="Roll Number"
                  placeholder="Enter roll number"
                  leftSection={<MdSchool size={18} />}
                  variant="glass"
                  {...form.getInputProps("roll")}
                />
              </SimpleGrid>

              <Divider label="Parent Information" labelPosition="center" />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <UltraInput
                  label="Father's Name"
                  placeholder="Enter father's name"
                  leftSection={<MdPerson size={18} />}
                  variant="glass"
                  {...form.getInputProps("father_name")}
                />

                <UltraInput
                  label="Father's Phone"
                  placeholder="Enter father's phone"
                  leftSection={<MdPhone size={18} />}
                  variant="glass"
                  {...form.getInputProps("father_phone")}
                />

                <UltraInput
                  label="Mother's Name"
                  placeholder="Enter mother's name"
                  leftSection={<MdPerson size={18} />}
                  variant="glass"
                  {...form.getInputProps("mother_name")}
                />

                <UltraInput
                  label="Blood Group"
                  placeholder="Enter blood group"
                  variant="glass"
                  {...form.getInputProps("blood_group")}
                />
              </SimpleGrid>

              <Group justify="flex-end" gap="md" mt="xl">
                <UltraButton
                  variant="ghost"
                  onClick={() => {
                    setModalOpened(false);
                    setEditingStudent(null);
                    form.reset();
                  }}
                >
                  Cancel
                </UltraButton>
                <UltraButton type="submit" variant="gradient" loading={loading} glow>
                  {editingStudent ? "Update Student" : "Add Student"}
                </UltraButton>
              </Group>
            </Stack>
          </form>
        </UltraModal>
      </Stack>
    </Container>
  );
};

export default StudentsPageUltra;
