import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  PasswordInput,
  Textarea,
  Group,
  ActionIcon,
  Badge,
  Stack,
  Text,
  LoadingOverlay,
  Tabs,
  FileButton,
  Select,
  Divider,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconList,
  IconUpload,
  IconUser,
  IconLock,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
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

const BranchesPage: React.FC = () => {
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
      role_group_id: "", // Admin credentials
      admin_name: "",
      admin_username: "",
      admin_password: "",
      admin_email: "",
      admin_mobile: "",
      admin_role_group_id: "", // Changed from admin_role to admin_role_group_id
    },
    validate: {
      name: (value: string) =>
        !value || value.trim().length === 0 ? "Branch name is required" : null,
      code: (value: string) =>
        !value || value.trim().length === 0 ? "Branch code is required" : null,
      school_name: (value: string) =>
        !value || value.trim().length === 0 ? "School name is required" : null,
      email: (value: string) =>
        value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
      // Admin validation
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
      setBranches(response.data.data); // Use the 'data' property from the response
    } catch (error) {
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
      const response = await api.get("/api/roles");
      setRoleGroups(response.data.data ?? []); // Ensure always an array
    } catch (error) {
      console.error("Failed to fetch role groups:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setValidationErrors([]);

      const formData = new FormData();

      // Append form values
      Object.keys(values).forEach((key) => {
        if (values[key as keyof typeof values]) {
          formData.append(key, values[key as keyof typeof values] as string);
        }
      });

      // Append files
      if (logoFile) formData.append("logo_file", logoFile);
      if (textLogoFile) formData.append("text_logo", textLogoFile);
      if (printFile) formData.append("print_file", printFile);
      if (reportCardFile) formData.append("report_card", reportCardFile);

      formData.append("name", form.values.name);
      formData.append("code", form.values.code);

      if (editingBranch) {
        await api.put(`/api/branches/${editingBranch.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notifications.show({
          title: "Success",
          message: "Branch updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/branches", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notifications.show({
          title: "Success",
          message: form.values.admin_username
            ? "Branch and admin credentials created successfully"
            : "Branch created successfully",
          color: "green",
        });
      }

      resetForm();
      fetchBranches();
      setActiveTab("list");
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setValidationErrors(errorData.errors);
        setActiveTab("create");
      }
      notifications.show({
        title: "Error",
        message: errorData?.message || "Failed to save branch",
        color: "red",
      });
    }
  };
  const resetForm = () => {
    form.reset();
    setEditingBranch(null);
    setLogoFile(null);
    setTextLogoFile(null);
    setPrintFile(null);
    setReportCardFile(null);
    setValidationErrors([]);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setValues({
      name: branch.name,
      code: branch.code,
      school_name: branch.school_name,
      email: branch.email,
      mobileno: branch.mobileno,
      currency: branch.currency,
      symbol: branch.symbol,
      city: branch.city || "",
      state: branch.state || "",
      address: branch.address || "",
      role_group_id: branch.role_group_id?.toString() || "",
    });
    setActiveTab("create");
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this branch? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/api/branches/${id}`);
      notifications.show({
        title: "Success",
        message: "Branch deleted successfully",
        color: "green",
      });
      fetchBranches();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete branch",
        color: "red",
      });
    }
  };

  return (
    <>
      <Container size="xl" py="md">
        <Paper shadow="sm" p="md" radius="md">
          <div style={{ position: "relative" }}>
            <LoadingOverlay visible={loading} />
            <Tabs
              value={activeTab}
              onChange={(value) => setActiveTab(value || "list")}
            >
              <Tabs.List>
                <Tabs.Tab value="list" leftSection={<IconList size={16} />}>
                  Branch List
                </Tabs.Tab>
                <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
                  {editingBranch ? "Edit Branch" : "Create Branch"}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="list" pt="xs">
                <div style={{ marginBottom: 16 }}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>SL</Table.Th>
                        <Table.Th>Branch Name</Table.Th>
                        <Table.Th>School Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Mobile No</Table.Th>
                        <Table.Th>Currency</Table.Th>
                        <Table.Th>Symbol</Table.Th>
                        <Table.Th>City</Table.Th>
                        <Table.Th>State</Table.Th>
                        <Table.Th>Address</Table.Th>
                        <Table.Th>Action</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {branches.map((branch, index) => (
                        <Table.Tr key={branch.id}>
                          <Table.Td>{index + 1}</Table.Td>
                          <Table.Td>{branch.name}</Table.Td>
                          <Table.Td>{branch.school_name}</Table.Td>
                          <Table.Td>{branch.email}</Table.Td>
                          <Table.Td>{branch.mobileno}</Table.Td>
                          <Table.Td>{branch.currency}</Table.Td>
                          <Table.Td>{branch.symbol}</Table.Td>
                          <Table.Td>{branch.city || "N/A"}</Table.Td>
                          <Table.Td>{branch.state || "N/A"}</Table.Td>
                          <Table.Td>
                            <Text size="sm" truncate style={{ maxWidth: 150 }}>
                              {branch.address || "N/A"}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => handleEdit(branch)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(branch.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>

                  {branches.length === 0 && !loading && (
                    <Text ta="center" py="xl" c="dimmed">
                      No branches found. Click "Create Branch" to add your first
                      branch.
                    </Text>
                  )}
                </div>
              </Tabs.Panel>

              <Tabs.Panel value="create" pt="xs">
                {validationErrors.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {validationErrors.map((error, index) => (
                      <Text key={index} c="red" size="sm">
                        • {error}
                      </Text>
                    ))}
                  </div>
                )}

                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack>
                    <TextInput
                      label="Branch Name"
                      placeholder="Enter branch name"
                      required
                      {...form.getInputProps("name")}
                    />
                    <TextInput
                      label="Branch Code"
                      placeholder="Enter branch code"
                      required
                      {...form.getInputProps("code")}
                    />
                    <TextInput
                      label="School Name"
                      placeholder="Enter school name"
                      required
                      {...form.getInputProps("school_name")}
                    />
                    <TextInput
                      label="Email"
                      placeholder="Enter email address"
                      required
                      {...form.getInputProps("email")}
                    />
                    <TextInput
                      label="Mobile No"
                      placeholder="Enter mobile number"
                      required
                      {...form.getInputProps("mobileno")}
                    />
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Currency"
                          placeholder="Enter currency"
                          required
                          {...form.getInputProps("currency")}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Currency Symbol"
                          placeholder="Enter currency symbol"
                          required
                          {...form.getInputProps("symbol")}
                        />
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          label="City"
                          placeholder="Enter city"
                          {...form.getInputProps("city")}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="State"
                          placeholder="Enter state"
                          {...form.getInputProps("state")}
                        />
                      </Grid.Col>
                    </Grid>
                    <Textarea
                      label="Address"
                      placeholder="Enter branch address"
                      rows={3}
                      {...form.getInputProps("address")}
                    />{" "}
                    <Select
                      label="Role Group"
                      placeholder="Select Role Group"
                      data={roleGroups.map((group) => ({
                        value: group.id.toString(),
                        label: group.name,
                      }))}
                      {...form.getInputProps("role_group_id")}
                      onChange={(value) => {
                        form.setFieldValue("role_group_id", value ?? "");
                        // No need to reset admin role since it's independent now
                      }}
                    />
                    {!editingBranch && (
                      <>
                        <Divider my="md" />
                        <Text
                          fw={500}
                          mb="md"
                          style={{
                            color: "#667eea",
                            fontSize: "1.1rem",
                          }}
                        >
                          Branch Admin Credentials
                        </Text>
                        <Text size="sm" c="dimmed" mb="md">
                          Create login credentials for the branch administrator
                        </Text>{" "}
                        <Grid>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Admin Name"
                              placeholder="Enter admin full name"
                              required={!editingBranch}
                              leftSection={<IconUser size={16} />}
                              {...form.getInputProps("admin_name")}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Admin Username"
                              placeholder="Enter admin username"
                              required={!editingBranch}
                              leftSection={<IconUser size={16} />}
                              {...form.getInputProps("admin_username")}
                            />
                          </Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={6}>
                            <PasswordInput
                              label="Admin Password"
                              placeholder="Enter admin password"
                              required={!editingBranch}
                              leftSection={<IconLock size={16} />}
                              {...form.getInputProps("admin_password")}
                            />
                          </Grid.Col>{" "}
                          <Grid.Col span={6}>
                            <Select
                              label="Admin Role"
                              placeholder="Select admin role group"
                              data={roleGroups.map((group) => ({
                                value: group.id.toString(),
                                label: group.name,
                              }))}
                              {...form.getInputProps("admin_role_group_id")}
                            />
                            <Text size="sm" c="dimmed" mt="xs">
                              Select the role group for the branch administrator
                            </Text>
                          </Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Admin Email (Optional)"
                              placeholder="Enter admin email"
                              leftSection={<IconMail size={16} />}
                              {...form.getInputProps("admin_email")}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Admin Mobile (Optional)"
                              placeholder="Enter admin mobile"
                              leftSection={<IconPhone size={16} />}
                              {...form.getInputProps("admin_mobile")}
                            />
                          </Grid.Col>
                        </Grid>
                      </>
                    )}
                    <Divider my="md" />
                    <Text fw={500} mb="md">
                      Upload Images
                    </Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" mb="xs">
                          System Logo
                        </Text>
                        <FileButton onChange={setLogoFile} accept="image/png">
                          {(props) => (
                            <Button
                              {...props}
                              variant="light"
                              leftSection={<IconUpload size={16} />}
                            >
                              {logoFile ? logoFile.name : "Upload System Logo"}
                            </Button>
                          )}
                        </FileButton>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" mb="xs">
                          Text Logo
                        </Text>
                        <FileButton
                          onChange={setTextLogoFile}
                          accept="image/png"
                        >
                          {(props) => (
                            <Button
                              {...props}
                              variant="light"
                              leftSection={<IconUpload size={16} />}
                            >
                              {textLogoFile
                                ? textLogoFile.name
                                : "Upload Text Logo"}
                            </Button>
                          )}
                        </FileButton>
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" mb="xs">
                          Printing Logo
                        </Text>
                        <FileButton onChange={setPrintFile} accept="image/png">
                          {(props) => (
                            <Button
                              {...props}
                              variant="light"
                              leftSection={<IconUpload size={16} />}
                            >
                              {printFile
                                ? printFile.name
                                : "Upload Printing Logo"}
                            </Button>
                          )}
                        </FileButton>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" mb="xs">
                          Report Card Logo
                        </Text>
                        <FileButton
                          onChange={setReportCardFile}
                          accept="image/png"
                        >
                          {(props) => (
                            <Button
                              {...props}
                              variant="light"
                              leftSection={<IconUpload size={16} />}
                            >
                              {reportCardFile
                                ? reportCardFile.name
                                : "Upload Report Card Logo"}
                            </Button>
                          )}
                        </FileButton>
                      </Grid.Col>
                    </Grid>
                    <Group justify="flex-start" mt="lg">
                      <Button
                        type="submit"
                        leftSection={<IconPlus size={16} />}
                        loading={loading}
                      >
                        {editingBranch ? "Update" : "Save"}
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Paper>
      </Container>
    </>
  );
};

export default BranchesPage;
