import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Alert,
} from "@mantine/core";
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

      // Store authentication data
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user_role", res.data.role);
      localStorage.setItem("user_name", res.data.name);
      localStorage.setItem("user_email", res.data.email || "");
      localStorage.setItem("school_name", "School Management System");

      console.log("✅ Login successful, redirecting to dashboard...");
      window.location.href = "/dashboard";
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
    <Container size={420} my={40}>
      <Title style={{ textAlign: "center" }} mb={20}>
        Multi-School Management Login
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb={10}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextInput
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb={10}
          />
          <PasswordInput
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb={20}
          />
          <Button type="submit" fullWidth loading={loading}>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
