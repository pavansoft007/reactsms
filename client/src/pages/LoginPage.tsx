import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Alert,
  Stack,
  Group,
  Text,
  Box,
  Anchor,
  Divider,
  BackgroundImage,
  Center,
} from "@mantine/core";
import {
  IconMail,
  IconLock,
  IconSchool,
  IconShield,
} from "@tabler/icons-react";
import api from "../api/config";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("🔐 Attempting login with backend database...");
      const res = await api.post("/api/auth/login", { email, password });

      console.log("Login response:", res.data); // Debug log

      // Store authentication data with multiple fallbacks
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user_role", res.data.role || "");
      localStorage.setItem("user_id", res.data.user_id || res.data.id || "");

      // Handle username with multiple possible fields
      const username =
        res.data.username || res.data.name || res.data.user_name || "User";
      localStorage.setItem("user_name", username);
      localStorage.setItem("username", username); // Backup field

      // Handle email
      const userEmail = res.data.email || res.data.user_email || email || "";
      localStorage.setItem("user_email", userEmail);
      localStorage.setItem("email", userEmail); // Backup field

      localStorage.setItem("school_name", "School Management System");

      console.log("✅ Login successful, redirecting to main menu...");
      window.location.href = "/mainmenu";
    } catch (err: any) {
      console.error("❌ Login failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);

      // Additional error info for debugging
      if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please ensure the backend is running on port 8080."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size={480}>
        <Paper
          radius="xl"
          p={40}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack align="center" spacing="xl">
            {/* Logo and Title */}
            <Group spacing="md">
              <Box
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.4)",
                }}
              >
                <IconSchool size={30} color="white" />
              </Box>
              <Stack spacing={0}>
                <Title
                  order={2}
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                  }}
                >
                  EduManage Pro
                </Title>
                <Text size="sm" color="dimmed" style={{ fontWeight: 500 }}>
                  Smart School Management System
                </Text>
              </Stack>
            </Group>

            <Text
              size="lg"
              color="dimmed"
              ta="center"
              style={{ fontWeight: 500 }}
            >
              Welcome back! Please sign in to your account
            </Text>

            {error && (
              <Alert
                color="red"
                radius="md"
                style={{
                  width: "100%",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              <Stack spacing="lg">
                <TextInput
                  label="Email Address"
                  placeholder="Enter your email"
                  leftSection={<IconMail size={18} />}
                  size="md"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  styles={{
                    label: { fontWeight: 600, marginBottom: 8 },
                    input: {
                      height: 48,
                      borderRadius: 12,
                      border: "2px solid #e5e7eb",
                      fontSize: 16,
                      "&:focus": {
                        borderColor: "#0ea5e9",
                        boxShadow: "0 0 0 4px rgba(14, 165, 233, 0.1)",
                      },
                    },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={<IconLock size={18} />}
                  size="md"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  styles={{
                    label: { fontWeight: 600, marginBottom: 8 },
                    input: {
                      height: 48,
                      borderRadius: 12,
                      border: "2px solid #e5e7eb",
                      fontSize: 16,
                      "&:focus": {
                        borderColor: "#0ea5e9",
                        boxShadow: "0 0 0 4px rgba(14, 165, 233, 0.1)",
                      },
                    },
                  }}
                />

                <Group justify="space-between" mt="sm">
                  <Text size="sm">
                    <input type="checkbox" style={{ marginRight: 8 }} />
                    Remember me
                  </Text>
                  <Anchor
                    size="sm"
                    href="#"
                    style={{ color: "#0ea5e9", fontWeight: 500 }}
                  >
                    Forgot password?
                  </Anchor>
                </Group>

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    border: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 35px -5px rgba(14, 165, 233, 0.5)",
                    },
                  }}
                >
                  <Group spacing="sm">
                    <IconShield size={18} />
                    Sign In Securely
                  </Group>
                </Button>
              </Stack>
            </form>

            <Divider
              label="Secure Authentication"
              labelPosition="center"
              style={{ width: "100%", color: "#9ca3af" }}
            />

            <Group spacing="xs" style={{ color: "#6b7280", fontSize: 14 }}>
              <Text size="sm">Don't have an account?</Text>
              <Anchor
                size="sm"
                href="#"
                style={{ color: "#0ea5e9", fontWeight: 600 }}
              >
                Contact Administrator
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
