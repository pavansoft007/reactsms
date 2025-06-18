import { useState } from 'react';
import {
  Container,
  Alert,
  Stack,
  Group,
  Text,
  Box,
  Anchor,
  Divider,
  Title,
} from "@mantine/core";
import { MdEmail, MdLock, MdSchool, MdSecurity } from "react-icons/md";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraPassword,
  UltraLoader,
} from "../components/ui";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Add a race condition with timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              "Login request timed out. Please check your connection and try again."
            )
          ),
        30000
      ); // 30 second timeout
    });

    try {
      console.log("🔐 Attempting login with backend database...");

      // Race between login request and timeout
      const res: any = await Promise.race([
        api.post("/api/auth/login", { email, password }),
        timeoutPromise,
      ]);

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

      localStorage.setItem("school_name", "Pathasala Pro");

      console.log("✅ Login successful, redirecting to main menu...");
      window.location.href = "/mainmenu";
    } catch (err: any) {
      console.error("❌ Login failed:", err);

      let errorMessage = "Login failed. Please check your credentials.";

      if (err.message?.includes("timed out")) {
        errorMessage =
          "Login request timed out. Please check your internet connection and try again.";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage =
          "Cannot connect to server. Please ensure the backend is running on port 8080.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.gradient.hero,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <Box
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: theme.gradient.accent,
          opacity: 0.1,
          filter: "blur(40px)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: theme.gradient.success,
          opacity: 0.1,
          filter: "blur(30px)",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      <Container size={480}>
        <UltraCard variant="glassmorphic" style={{ padding: "40px" }}>
          <Stack align="center" gap="xl">
            {/* Logo and Title */}
            <Group gap="md">
              <Box
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: theme.gradient.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 10px 25px -5px ${theme.colors.accent}66`,
                }}
              >
                <MdSchool size={30} color="white" />
              </Box>
              <Stack gap={0}>
                {" "}
                <Title
                  order={2}
                  style={{
                    background: theme.gradient.accent,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                  }}
                >
                  Pathasala Pro
                </Title>
                <Text
                  size="sm"
                  c={theme.text.muted}
                  style={{ fontWeight: 500 }}
                >
                  Smart School Management System
                </Text>
              </Stack>
            </Group>
            <Text
              size="lg"
              c={theme.text.secondary}
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
                  background: theme.glassmorphism.hover,
                  border: `1px solid ${theme.colors.error}`,
                  backdropFilter: "blur(12px)",
                }}
              >
                {error}
              </Alert>
            )}
            <form
              onSubmit={handleLogin}
              style={{ width: "100%", position: "relative" }}
            >
              {loading && (
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `${theme.bg.primary}dd`,
                    backdropFilter: "blur(4px)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <UltraLoader
                    size="md"
                    message="Signing you in..."
                    variant="detailed"
                  />
                </Box>
              )}
              <Stack gap="lg">
                <UltraInput
                  label="Email Address"
                  placeholder="Enter your email"
                  leftSection={<MdEmail size={18} />}
                  size="md"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="glass"
                  glow
                />
                <UltraPassword
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={<MdLock size={18} />}
                  size="md"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="glass"
                  glow
                />
                <Group justify="space-between" mt="sm">
                  <Text size="sm" c={theme.text.secondary}>
                    <input
                      type="checkbox"
                      style={{
                        marginRight: 8,
                        accentColor: theme.colors.primary,
                      }}
                    />
                    Remember me
                  </Text>
                  <Anchor
                    size="sm"
                    href="#"
                    style={{
                      color: theme.colors.accent,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </Anchor>
                </Group>{" "}
                <UltraButton
                  size="lg"
                  loading={loading}
                  variant="gradient"
                  glow
                  style={{ marginTop: "16px" }}
                  type="submit"
                >
                  <Group gap="sm">
                    <MdSecurity size={18} />
                    Sign In Securely
                  </Group>
                </UltraButton>
              </Stack>
            </form>{" "}
            <Divider
              label="Secure Authentication"
              labelPosition="center"
              style={
                {
                  width: "100%",
                  color: theme.text.muted,
                  "--divider-color": theme.border,
                } as any
              }
              styles={{
                label: { color: theme.text.muted },
              }}
            />
            <Group
              gap="xs"
              style={{ color: theme.text.secondary, fontSize: 14 }}
            >
              <Text size="sm">Don't have an account?</Text>
              <Anchor
                size="sm"
                href="#"
                style={{
                  color: theme.colors.accent,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Contact Administrator
              </Anchor>
            </Group>
          </Stack>
        </UltraCard>
      </Container>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoginPage;
