import React, { useState } from "react";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Select,
  Alert,
  Group,
  Box,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import axios from "axios";

const UserCreatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    role: "2", // Default to admin role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roleOptions = [
    { value: "1", label: "Super Admin" },
    { value: "2", label: "Admin" },
    { value: "3", label: "Teacher" },
    { value: "4", label: "Accountant" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/users",
        {
          name: formData.name,
          username: formData.username,
          email: formData.email || null,
          mobile_no: formData.mobile_no || null,
          password: formData.password,
          role: formData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("User created successfully!");

      // Reset form
      setFormData({
        name: "",
        username: "",
        email: "",
        mobile_no: "",
        password: "",
        confirmPassword: "",
        role: "2",
      });

      console.log("User created:", response.data);
    } catch (err: any) {
      console.error("Error creating user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create user. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Box
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <Paper
          radius="xl"
          p="xl"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Stack gap="lg">
            <Title
              order={2}
              ta="center"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Create New User
            </Title>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                icon={<IconCheck size={16} />}
                color="green"
                variant="light"
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Full Name"
                    placeholder="Enter full name"
                    leftSection={<IconUser size={16} />}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    style={{
                      "& .mantine-TextInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />

                  <TextInput
                    label="Username"
                    placeholder="Enter username"
                    leftSection={<IconUser size={16} />}
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    required
                    style={{
                      "& .mantine-TextInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />
                </Group>

                <Group grow>
                  <TextInput
                    label="Email"
                    placeholder="Enter email (optional)"
                    type="email"
                    leftSection={<IconMail size={16} />}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    style={{
                      "& .mantine-TextInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />

                  <TextInput
                    label="Mobile Number"
                    placeholder="Enter mobile number (optional)"
                    leftSection={<IconPhone size={16} />}
                    value={formData.mobile_no}
                    onChange={(e) =>
                      handleInputChange("mobile_no", e.target.value)
                    }
                    style={{
                      "& .mantine-TextInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />
                </Group>

                <Select
                  label="Role"
                  placeholder="Select user role"
                  data={roleOptions}
                  value={formData.role}
                  onChange={(value) => handleInputChange("role", value || "2")}
                  required
                  style={{
                    "& .mantine-Select-input": {
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: "12px",
                      "&:focus": {
                        borderColor: "#667eea",
                        boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                      },
                    },
                  }}
                />

                <Group grow>
                  <PasswordInput
                    label="Password"
                    placeholder="Enter password"
                    leftSection={<IconLock size={16} />}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    style={{
                      "& .mantine-PasswordInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm password"
                    leftSection={<IconLock size={16} />}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                    style={{
                      "& .mantine-PasswordInput-input": {
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        "&:focus": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
                        },
                      },
                    }}
                  />
                </Group>

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 600,
                    marginTop: "1rem",
                  }}
                >
                  Create User
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserCreatePage;
