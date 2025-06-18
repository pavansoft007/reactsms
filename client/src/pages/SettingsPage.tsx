import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Tabs,
  TextInput,
  Textarea,
  Button,
  Switch,
  Select,
  NumberInput,
  PasswordInput,
  Group,
  Stack,
  Card,
  Text,
  Divider,
  Badge,
  ActionIcon,
  Modal,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconSettings,
  IconUser,
  IconSchool,
  IconMail,
  IconShield,
  IconDatabase,
  IconBell,
  IconEdit,
  IconTrash,
  IconPlus,
  IconInfoCircle,
} from "@tabler/icons-react";
import axios from "axios";
import { UltraLoader } from "../components/ui";

interface GeneralSettings {
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_website: string;
  academic_year: string;
  timezone: string;
  currency: string;
  language: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  fee_reminders: boolean;
  attendance_alerts: boolean;
  exam_notifications: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("general");
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const generalForm = useForm<GeneralSettings>({
    initialValues: {
      school_name: "",
      school_address: "",
      school_phone: "",
      school_email: "",
      school_website: "",
      academic_year: "2024-2025",
      timezone: "UTC",
      currency: "USD",
      language: "en",
    },
  });

  const notificationForm = useForm<NotificationSettings>({
    initialValues: {
      email_notifications: true,
      sms_notifications: false,
      fee_reminders: true,
      attendance_alerts: true,
      exam_notifications: true,
    },
  });

  const profileForm = useForm<UserProfile>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const passwordForm = useForm({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validate: {
      new_password: (value: string) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirm_password: (value: string, values: any) =>
        value !== values.new_password ? "Passwords do not match" : null,
    },
  });

  const userForm = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
    },
  });

  useEffect(() => {
    fetchSettings();
    fetchSystemUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock data - replace with actual API calls
      generalForm.setValues({
        school_name: "Springfield Elementary School",
        school_address: "123 Education Street, Springfield, IL",
        school_phone: "+1-555-123-4567",
        school_email: "info@springfieldelementary.edu",
        school_website: "www.springfieldelementary.edu",
        academic_year: "2024-2025",
        timezone: "America/Chicago",
        currency: "USD",
        language: "en",
      });

      profileForm.setValues({
        name: "Admin User",
        email: "admin@springfieldelementary.edu",
        phone: "+1-555-987-6543",
        role: "Administrator",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      // Mock data - replace with actual API call
      setSystemUsers([
        {
          id: 1,
          name: "Admin User",
          email: "admin@school.edu",
          role: "Administrator",
          status: "active",
          created_at: "2024-01-01",
        },
        {
          id: 2,
          name: "John Teacher",
          email: "john@school.edu",
          role: "Teacher",
          status: "active",
          created_at: "2024-01-15",
        },
        {
          id: 3,
          name: "Mary Staff",
          email: "mary@school.edu",
          role: "Staff",
          status: "inactive",
          created_at: "2024-02-01",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch system users:", error);
    }
  };

  const handleGeneralSubmit = async (values: GeneralSettings) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notifications.show({
        title: "Success",
        message: "General settings updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update general settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (values: NotificationSettings) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notifications.show({
        title: "Success",
        message: "Notification settings updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update notification settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (values: UserProfile) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update profile",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      passwordForm.reset();
      notifications.show({
        title: "Success",
        message: "Password updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update password",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (values: typeof userForm.values) => {
    try {
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      userForm.reset();
      setEditingUser(null);
      close();
      fetchSystemUsers();

      notifications.show({
        title: "Success",
        message: editingUser
          ? "User updated successfully"
          : "User created successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save user",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    userForm.setValues({
      name: user.name,
      email: user.email,
      phone: "",
      role: user.role,
      password: "",
    });
    open();
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      fetchSystemUsers();
      notifications.show({
        title: "Success",
        message: "User deleted successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete user",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    userForm.reset();
    setEditingUser(null);
    close();
  };

  const roleOptions = [
    { value: "Administrator", label: "Administrator" },
    { value: "Teacher", label: "Teacher" },
    { value: "Staff", label: "Staff" },
    { value: "Accountant", label: "Accountant" },
  ];

  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
  ];

  const currencyOptions = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "INR", label: "INR (₹)" },
  ];

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Title order={2} mb="md">
          <IconSettings size={28} style={{ marginRight: 8 }} />
          System Settings
        </Title>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IconSchool size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab
              value="notifications"
              leftSection={<IconBell size={16} />}
            >
              Notifications
            </Tabs.Tab>
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconDatabase size={16} />}>
              System Users
            </Tabs.Tab>
          </Tabs.List>{" "}
          <div style={{ position: "relative", marginTop: 16 }}>
            {loading && (
              <UltraLoader
                fullscreen
                size="lg"
                message="Loading settings..."
                variant="detailed"
              />
            )}

            <Tabs.Panel value="general">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <form onSubmit={generalForm.onSubmit(handleGeneralSubmit)}>
                  <Stack>
                    <TextInput
                      label="School Name"
                      placeholder="Enter school name"
                      required
                      {...generalForm.getInputProps("school_name")}
                    />

                    <Textarea
                      label="School Address"
                      placeholder="Enter school address"
                      rows={3}
                      {...generalForm.getInputProps("school_address")}
                    />

                    <Group grow>
                      <TextInput
                        label="Phone"
                        placeholder="Enter phone number"
                        {...generalForm.getInputProps("school_phone")}
                      />
                      <TextInput
                        label="Email"
                        placeholder="Enter email address"
                        {...generalForm.getInputProps("school_email")}
                      />
                    </Group>

                    <TextInput
                      label="Website"
                      placeholder="Enter website URL"
                      {...generalForm.getInputProps("school_website")}
                    />

                    <Group grow>
                      <TextInput
                        label="Academic Year"
                        placeholder="2024-2025"
                        {...generalForm.getInputProps("academic_year")}
                      />
                      <Select
                        label="Timezone"
                        data={timezoneOptions}
                        {...generalForm.getInputProps("timezone")}
                      />
                    </Group>

                    <Group grow>
                      <Select
                        label="Currency"
                        data={currencyOptions}
                        {...generalForm.getInputProps("currency")}
                      />
                      <Select
                        label="Language"
                        data={[
                          { value: "en", label: "English" },
                          { value: "es", label: "Spanish" },
                          { value: "fr", label: "French" },
                        ]}
                        {...generalForm.getInputProps("language")}
                      />
                    </Group>

                    <Button type="submit" mt="md">
                      Save General Settings
                    </Button>
                  </Stack>
                </form>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="notifications">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <form
                  onSubmit={notificationForm.onSubmit(handleNotificationSubmit)}
                >
                  <Stack>
                    <Switch
                      label="Email Notifications"
                      description="Receive notifications via email"
                      {...notificationForm.getInputProps(
                        "email_notifications",
                        { type: "checkbox" }
                      )}
                    />

                    <Switch
                      label="SMS Notifications"
                      description="Receive notifications via SMS"
                      {...notificationForm.getInputProps("sms_notifications", {
                        type: "checkbox",
                      })}
                    />

                    <Switch
                      label="Fee Reminders"
                      description="Send automatic fee payment reminders"
                      {...notificationForm.getInputProps("fee_reminders", {
                        type: "checkbox",
                      })}
                    />

                    <Switch
                      label="Attendance Alerts"
                      description="Send alerts for attendance issues"
                      {...notificationForm.getInputProps("attendance_alerts", {
                        type: "checkbox",
                      })}
                    />

                    <Switch
                      label="Exam Notifications"
                      description="Send notifications about upcoming exams"
                      {...notificationForm.getInputProps("exam_notifications", {
                        type: "checkbox",
                      })}
                    />

                    <Button type="submit" mt="md">
                      Save Notification Settings
                    </Button>
                  </Stack>
                </form>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="profile">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
                  <Stack>
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      {...profileForm.getInputProps("name")}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="Enter your email"
                      required
                      {...profileForm.getInputProps("email")}
                    />

                    <TextInput
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      {...profileForm.getInputProps("phone")}
                    />

                    <TextInput
                      label="Role"
                      placeholder="Your role"
                      disabled
                      {...profileForm.getInputProps("role")}
                    />

                    <Button type="submit" mt="md">
                      Update Profile
                    </Button>
                  </Stack>
                </form>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="security">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                  <Stack>
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      title="Password Requirements"
                    >
                      Password must be at least 6 characters long and contain a
                      mix of letters and numbers.
                    </Alert>

                    <PasswordInput
                      label="Current Password"
                      placeholder="Enter current password"
                      required
                      {...passwordForm.getInputProps("current_password")}
                    />

                    <PasswordInput
                      label="New Password"
                      placeholder="Enter new password"
                      required
                      {...passwordForm.getInputProps("new_password")}
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      required
                      {...passwordForm.getInputProps("confirm_password")}
                    />

                    <Button type="submit" mt="md">
                      Change Password
                    </Button>
                  </Stack>
                </form>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="users">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={3}>System Users</Title>
                  <Button leftSection={<IconPlus size={16} />} onClick={open}>
                    Add User
                  </Button>
                </Group>

                <Paper shadow="xs" p="md" withBorder>
                  <Stack>
                    {systemUsers.map((user) => (
                      <Group
                        key={user.id}
                        justify="space-between"
                        p="sm"
                        style={{ border: "1px solid #e9ecef", borderRadius: 8 }}
                      >
                        <div>
                          <Text fw={500}>{user.name}</Text>
                          <Text size="sm" c="dimmed">
                            {user.email}
                          </Text>
                          <Group gap="xs" mt="xs">
                            <Badge size="sm" color="blue">
                              {user.role}
                            </Badge>
                            <Badge
                              size="sm"
                              color={user.status === "active" ? "green" : "red"}
                            >
                              {user.status}
                            </Badge>
                          </Group>
                        </div>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEditUser(user)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              </Card>
            </Tabs.Panel>
          </div>
        </Tabs>
      </Paper>

      <Modal
        opened={opened}
        onClose={handleModalClose}
        title={editingUser ? "Edit User" : "Add User"}
        size="md"
      >
        <form onSubmit={userForm.onSubmit(handleUserSubmit)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Enter full name"
              required
              {...userForm.getInputProps("name")}
            />

            <TextInput
              label="Email"
              placeholder="Enter email address"
              required
              {...userForm.getInputProps("email")}
            />

            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              {...userForm.getInputProps("phone")}
            />

            <Select
              label="Role"
              placeholder="Select role"
              data={roleOptions}
              required
              {...userForm.getInputProps("role")}
            />

            {!editingUser && (
              <PasswordInput
                label="Password"
                placeholder="Enter password"
                required
                {...userForm.getInputProps("password")}
              />
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? "Update" : "Create"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
