import React, { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Divider,
  FileButton,
  Tabs,
  LoadingOverlay,
} from "@mantine/core";
import {
  MdBusiness,
  MdSchool,
  MdEmail,
  MdPhone,
  MdLocationCity,
  MdAttachMoney,
  MdPerson,
  MdLock,
  MdSave,
  MdCancel,
  MdAdd,
  MdEdit,
  MdDelete,
  MdList,
  MdUpload,
  MdImage,
} from "react-icons/md";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTheme } from "../context/ThemeContext";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraPassword,
  UltraTextarea,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
} from "../components/ui";
import api from "../api/config";

interface Branch {
  id: number;
  name: string;
  school_name: string;
  email: string;
  mobileno: string;
  currency: string;
  symbol: string;
  city?: string;
  state?: string;
  address?: string;
  role_group_id?: number;
  logo_file?: string;
  text_logo?: string;
  print_file?: string;
  report_card?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface RoleGroup {
  id: number;
  name: string;
}

const BranchesPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [textLogoFile, setTextLogoFile] = useState<File | null>(null);
  const [printFile, setPrintFile] = useState<File | null>(null);
  const [reportCardFile, setReportCardFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      code: "",
      school_name: "",
      email: "",
      mobileno: "",
      currency: "",
      symbol: "",
      city: "",
      state: "",
      address: "",
      role_group_id: "",
      admin_name: "",
      admin_username: "",
      admin_password: "",
      admin_email: "",
      admin_mobile: "",
      admin_role_group_id: "",
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0 ? "Branch name is required" : null,
      code: (value: string) =>
        !value || value.trim().length === 0 ? "Branch code is required" : null,
      school_name: (value: string) =>
        !value || value.trim().length === 0 ? "School name is required" : null,
      email: (value: string) =>
        value && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)
          ? null
          : "Invalid email",
      mobileno: (value: string) =>
        !value || value.trim().length === 0
          ? "Mobile number is required"
          : null,
      currency: (value: string) =>
        !value || value.trim().length === 0 ? "Currency is required" : null,
      symbol: (value: string) =>
        !value || value.trim().length === 0
          ? "Currency symbol is required"
          : null,
      admin_name: (value: string) =>
        !editingBranch && (!value || value.trim().length === 0)
          ? "Admin name is required"
          : null,
      admin_username: (value: string) =>
        !editingBranch && (!value || value.trim().length === 0)
          ? "Admin username is required"
          : null,
      admin_password: (value: string) =>
        !editingBranch && (!value || value.length < 6)
          ? "Admin password must be at least 6 characters"
          : null,
      admin_role_group_id: (value: string) =>
        !editingBranch && (!value || value.trim().length === 0)
          ? "Admin role group is required"
          : null,
    },
  });

  useEffect(() => {
    fetchBranches();
    fetchRoleGroups();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/branches");
      setBranches(response.data.data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch branches",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleGroups = async () => {
    try {
      const response = await api.get("/api/role-groups");
      setRoleGroups(response.data.roleGroups || []);
    } catch (error) {
      console.error("Failed to fetch role groups:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setValidationErrors([]);

      const formData = new FormData();

      // Add form fields
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Add files
      if (logoFile) formData.append("logo_file", logoFile);
      if (textLogoFile) formData.append("text_logo", textLogoFile);
      if (printFile) formData.append("print_file", printFile);
      if (reportCardFile) formData.append("report_card", reportCardFile);

      const endpoint = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches";
      const method = editingBranch ? "put" : "post";

      await api({
        method,
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      notifications.show({
        title: "Success",
        message: `Branch ${editingBranch ? "updated" : "created"} successfully`,
        color: "green",
      });

      setActiveTab("list");
      setEditingBranch(null);
      form.reset();
      setLogoFile(null);
      setTextLogoFile(null);
      setPrintFile(null);
      setReportCardFile(null);
      fetchBranches();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${editingBranch ? "update" : "create"} branch`;
      const errors = error.response?.data?.errors || [];

      if (Array.isArray(errors) && errors.length > 0) {
        setValidationErrors(errors);
      } else {
        notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setValues({
      name: branch.name,
      code: branch.name, // Assuming code is derived from name
      school_name: branch.school_name,
      email: branch.email,
      mobileno: branch.mobileno,
      currency: branch.currency,
      symbol: branch.symbol,
      city: branch.city || "",
      state: branch.state || "",
      address: branch.address || "",
      role_group_id: branch.role_group_id?.toString() || "",
      admin_name: "",
      admin_username: "",
      admin_password: "",
      admin_email: "",
      admin_mobile: "",
      admin_role_group_id: "",
    });
    setActiveTab("create");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    try {
      setLoading(true);
      await api.delete(`/api/branches/${id}`);
      notifications.show({
        title: "Success",
        message: "Branch deleted successfully",
        color: "green",
      });
      fetchBranches();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete branch",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      size="xl"
      py="xl"
      style={{ background: theme.bg.surface, minHeight: "100vh" }}
    >
      <Stack gap="xl">
        {/* Header */}
        <UltraCard variant="gradient" style={{ padding: "32px" }}>
          <Group justify="space-between" align="center">
            <Group>
              <MdBusiness size={32} color="white" />
              <Stack gap="xs">
                <Text size="xl" fw={700} c="white">
                  Branch Management
                </Text>
                <Text size="md" c="rgba(255,255,255,0.9)">
                  Manage school branches and configurations
                </Text>
              </Stack>
            </Group>
            <UltraButton
              variant="secondary"
              size="lg"
              onClick={() => setActiveTab("create")}
              glass
            >
              <Group gap="xs">
                <MdAdd size={20} />
                Add New Branch
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
                  Total Branches
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {branches.length}
                </Text>
              </Stack>
              <MdBusiness size={24} color={theme.colors.primary} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Active Branches
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {branches.filter((b) => b.is_active).length}
                </Text>
              </Stack>
              <MdSchool size={24} color={theme.colors.success} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Cities
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {new Set(branches.map((b) => b.city).filter(Boolean)).size}
                </Text>
              </Stack>
              <MdLocationCity size={24} color={theme.colors.warning} />
            </Group>
          </UltraCard>

          <UltraCard variant="glassmorphic" hover>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" c={theme.text.muted} fw={500}>
                  Currencies
                </Text>
                <Text size="xl" fw={700} c={theme.text.primary}>
                  {
                    new Set(branches.map((b) => b.currency).filter(Boolean))
                      .size
                  }
                </Text>
              </Stack>
              <MdAttachMoney size={24} color={theme.colors.accent} />
            </Group>
          </UltraCard>
        </SimpleGrid>

        {/* Tabs for List and Create */}
        <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
          <div style={{ position: "relative" }}>
            <LoadingOverlay visible={loading} />
            <Tabs
              value={activeTab}
              onChange={(value) => setActiveTab(value || "list")}
              styles={{
                tab: {
                  backgroundColor: "transparent",
                  border: "none",
                  color: theme.text.muted,
                  "&[data-active]": {
                    color: theme.colors.primary,
                    backgroundColor: theme.glassmorphism.hover,
                    borderRadius: "12px",
                  },
                  "&:hover": {
                    backgroundColor: theme.glassmorphism.hover,
                    borderRadius: "12px",
                  },
                },
                list: {
                  borderBottom: `1px solid ${theme.border}`,
                },
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="list" leftSection={<MdList size={16} />}>
                  Branch List
                </Tabs.Tab>
                <Tabs.Tab
                  value="create"
                  leftSection={
                    editingBranch ? <MdEdit size={16} /> : <MdAdd size={16} />
                  }
                >
                  {editingBranch ? "Edit Branch" : "Create Branch"}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="list" pt="lg">
                <UltraTable variant="glass" hoverable>
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>School Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Currency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.id}>
                        <td>
                          <Stack gap={2}>
                            <Text fw={500} c={theme.text.primary}>
                              {branch.name}
                            </Text>
                            <Text size="sm" c={theme.text.muted}>
                              ID: {branch.id}
                            </Text>
                          </Stack>
                        </td>
                        <td>
                          <Text fw={500} c={theme.text.primary}>
                            {branch.school_name}
                          </Text>
                        </td>
                        <td>
                          <Stack gap={2}>
                            <Text size="sm" c={theme.text.primary}>
                              {branch.email}
                            </Text>
                            <Text size="sm" c={theme.text.muted}>
                              {branch.mobileno}
                            </Text>
                          </Stack>
                        </td>
                        <td>
                          <Stack gap={2}>
                            <Text size="sm" c={theme.text.primary}>
                              {branch.city || "N/A"}
                            </Text>
                            <Text size="sm" c={theme.text.muted}>
                              {branch.state || "N/A"}
                            </Text>
                          </Stack>
                        </td>
                        <td>
                          <Group gap="xs">
                            <Text fw={500} c={theme.text.primary}>
                              {branch.currency}
                            </Text>
                            <Text c={theme.text.muted}>({branch.symbol})</Text>
                          </Group>
                        </td>
                        <td>
                          <UltraTableBadge
                            variant={branch.is_active ? "success" : "error"}
                          >
                            {branch.is_active ? "Active" : "Inactive"}
                          </UltraTableBadge>
                        </td>
                        <td>
                          <UltraTableActions>
                            <UltraButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(branch)}
                            >
                              <MdEdit size={16} />
                            </UltraButton>
                            <UltraButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(branch.id)}
                            >
                              <MdDelete size={16} />
                            </UltraButton>
                          </UltraTableActions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </UltraTable>
              </Tabs.Panel>

              <Tabs.Panel value="create" pt="lg">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="xl">
                    {/* Branch Information */}
                    <UltraCard variant="elevated" style={{ padding: "24px" }}>
                      <Text size="lg" fw={600} mb="lg" c={theme.text.primary}>
                        Branch Information
                      </Text>

                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <UltraInput
                          label="Branch Name"
                          placeholder="Enter branch name"
                          required
                          leftSection={<MdBusiness size={18} />}
                          variant="glass"
                          {...form.getInputProps("name")}
                        />

                        <UltraInput
                          label="Branch Code"
                          placeholder="Enter branch code"
                          required
                          leftSection={<MdBusiness size={18} />}
                          variant="glass"
                          {...form.getInputProps("code")}
                        />

                        <UltraInput
                          label="School Name"
                          placeholder="Enter school name"
                          required
                          leftSection={<MdSchool size={18} />}
                          variant="glass"
                          {...form.getInputProps("school_name")}
                        />

                        <UltraInput
                          label="Email"
                          placeholder="Enter email address"
                          type="email"
                          required
                          leftSection={<MdEmail size={18} />}
                          variant="glass"
                          {...form.getInputProps("email")}
                        />

                        <UltraInput
                          label="Mobile Number"
                          placeholder="Enter mobile number"
                          required
                          leftSection={<MdPhone size={18} />}
                          variant="glass"
                          {...form.getInputProps("mobileno")}
                        />

                        <UltraInput
                          label="City"
                          placeholder="Enter city"
                          leftSection={<MdLocationCity size={18} />}
                          variant="glass"
                          {...form.getInputProps("city")}
                        />

                        <UltraInput
                          label="State"
                          placeholder="Enter state"
                          leftSection={<MdLocationCity size={18} />}
                          variant="glass"
                          {...form.getInputProps("state")}
                        />

                        <UltraInput
                          label="Currency"
                          placeholder="Enter currency (e.g., USD)"
                          required
                          leftSection={<MdAttachMoney size={18} />}
                          variant="glass"
                          {...form.getInputProps("currency")}
                        />

                        <UltraInput
                          label="Currency Symbol"
                          placeholder="Enter symbol (e.g., $)"
                          required
                          leftSection={<MdAttachMoney size={18} />}
                          variant="glass"
                          {...form.getInputProps("symbol")}
                        />
                      </SimpleGrid>

                      <UltraTextarea
                        label="Address"
                        placeholder="Enter complete address"
                        mt="md"
                        leftSection={<MdLocationCity size={18} />}
                        variant="glass"
                        minRows={3}
                        {...form.getInputProps("address")}
                      />
                    </UltraCard>

                    {/* File Uploads */}
                    <UltraCard variant="elevated" style={{ padding: "24px" }}>
                      <Text size="lg" fw={600} mb="lg" c={theme.text.primary}>
                        File Uploads
                      </Text>

                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Stack gap="sm">
                          <Text size="sm" fw={500} c={theme.text.primary}>
                            Logo File
                          </Text>
                          <FileButton accept="image/*" onChange={setLogoFile}>
                            {(props) => (
                              <UltraButton
                                {...props}
                                variant="outline"
                                size="sm"
                              >
                                <Group gap="xs">
                                  <MdUpload size={16} />
                                  {logoFile ? logoFile.name : "Choose Logo"}
                                </Group>
                              </UltraButton>
                            )}
                          </FileButton>
                        </Stack>

                        <Stack gap="sm">
                          <Text size="sm" fw={500} c={theme.text.primary}>
                            Text Logo
                          </Text>
                          <FileButton
                            accept="image/*"
                            onChange={setTextLogoFile}
                          >
                            {(props) => (
                              <UltraButton
                                {...props}
                                variant="outline"
                                size="sm"
                              >
                                <Group gap="xs">
                                  <MdImage size={16} />
                                  {textLogoFile
                                    ? textLogoFile.name
                                    : "Choose Text Logo"}
                                </Group>
                              </UltraButton>
                            )}
                          </FileButton>
                        </Stack>

                        <Stack gap="sm">
                          <Text size="sm" fw={500} c={theme.text.primary}>
                            Print Header
                          </Text>
                          <FileButton accept="image/*" onChange={setPrintFile}>
                            {(props) => (
                              <UltraButton
                                {...props}
                                variant="outline"
                                size="sm"
                              >
                                <Group gap="xs">
                                  <MdUpload size={16} />
                                  {printFile
                                    ? printFile.name
                                    : "Choose Print Header"}
                                </Group>
                              </UltraButton>
                            )}
                          </FileButton>
                        </Stack>

                        <Stack gap="sm">
                          <Text size="sm" fw={500} c={theme.text.primary}>
                            Report Card Template
                          </Text>
                          <FileButton
                            accept="image/*"
                            onChange={setReportCardFile}
                          >
                            {(props) => (
                              <UltraButton
                                {...props}
                                variant="outline"
                                size="sm"
                              >
                                <Group gap="xs">
                                  <MdUpload size={16} />
                                  {reportCardFile
                                    ? reportCardFile.name
                                    : "Choose Template"}
                                </Group>
                              </UltraButton>
                            )}
                          </FileButton>
                        </Stack>
                      </SimpleGrid>
                    </UltraCard>

                    {/* Admin Credentials - Only for new branches */}
                    {!editingBranch && (
                      <UltraCard variant="elevated" style={{ padding: "24px" }}>
                        <Text size="lg" fw={600} mb="lg" c={theme.text.primary}>
                          Admin Credentials
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                          <UltraInput
                            label="Admin Name"
                            placeholder="Enter admin full name"
                            required
                            leftSection={<MdPerson size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_name")}
                          />

                          <UltraInput
                            label="Admin Username"
                            placeholder="Enter admin username"
                            required
                            leftSection={<MdPerson size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_username")}
                          />

                          <UltraPassword
                            label="Admin Password"
                            placeholder="Enter admin password"
                            required
                            leftSection={<MdLock size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_password")}
                          />

                          <UltraInput
                            label="Admin Email"
                            placeholder="Enter admin email"
                            type="email"
                            leftSection={<MdEmail size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_email")}
                          />

                          <UltraInput
                            label="Admin Mobile"
                            placeholder="Enter admin mobile"
                            leftSection={<MdPhone size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_mobile")}
                          />

                          <UltraSelect
                            label="Admin Role Group"
                            placeholder="Select role group"
                            required
                            data={roleGroups.map((rg) => ({
                              value: rg.id.toString(),
                              label: rg.name,
                            }))}
                            leftSection={<MdPerson size={18} />}
                            variant="glass"
                            {...form.getInputProps("admin_role_group_id")}
                          />
                        </SimpleGrid>
                      </UltraCard>
                    )}

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <UltraCard
                        variant="elevated"
                        style={{
                          padding: "16px",
                          border: `1px solid ${theme.colors.error}`,
                        }}
                      >
                        <Text size="sm" fw={600} c={theme.colors.error} mb="xs">
                          Please fix the following errors:
                        </Text>
                        <Stack gap="xs">
                          {validationErrors.map((error, index) => (
                            <Text key={index} size="sm" c={theme.colors.error}>
                              • {error}
                            </Text>
                          ))}
                        </Stack>
                      </UltraCard>
                    )}

                    {/* Action Buttons */}
                    <Group justify="flex-end" gap="md">
                      <UltraButton
                        variant="ghost"
                        onClick={() => {
                          setActiveTab("list");
                          setEditingBranch(null);
                          form.reset();
                          setValidationErrors([]);
                        }}
                      >
                        <Group gap="xs">
                          <MdCancel size={18} />
                          Cancel
                        </Group>
                      </UltraButton>
                      <UltraButton
                        type="submit"
                        variant="gradient"
                        loading={loading}
                        glow
                      >
                        <Group gap="xs">
                          <MdSave size={18} />
                          {editingBranch ? "Update Branch" : "Create Branch"}
                        </Group>
                      </UltraButton>
                    </Group>
                  </Stack>
                </form>
              </Tabs.Panel>
            </Tabs>
          </div>
        </UltraCard>
      </Stack>
    </Container>
  );
};

export default BranchesPageUltra;
