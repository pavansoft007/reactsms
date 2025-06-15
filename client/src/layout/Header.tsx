import {
  Group,
  Burger,
  Text,
  ActionIcon,
  Menu,
  Avatar,
  Box,
  UnstyledButton,
  Indicator,
} from "@mantine/core";
import {
  IconBell,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconSun,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../api/academicYear";

export function Header({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (o: boolean) => void;
}) {
  const [notifications] = useState(3);
  const userName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("username") ||
    "Admin User";
  const userEmail =
    localStorage.getItem("user_email") ||
    localStorage.getItem("email") ||
    "admin@school.com";

  const { academicYear, setAcademicYear, years, setYears } = useAcademicYear();

  useEffect(() => {
    fetchAcademicYears().then(setYears);
  }, [setYears]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Box
      style={{
        height: 70,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
      }}
    >
      <Group gap="md">
        <Burger
          opened={opened}
          onClick={() => setOpened(!opened)}
          size="sm"
          style={{
            color: "#64748b",
          }}
        />

        <Box style={{ display: opened ? "none" : "block" }}>
          <Group gap="sm">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px -2px rgba(14, 165, 233, 0.3)",
              }}
            >
              <Text
                size="sm"
                style={{
                  color: "white",
                  fontWeight: 700,
                }}
              >
                EM
              </Text>
            </Box>
            <Box>
              <Text
                size="lg"
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                EduManage Pro
              </Text>
            </Box>
          </Group>
        </Box>
      </Group>

      <Group gap="md">
        {/* Academic Year Dropdown */}
        <select
          value={academicYear?.id || ""}
          onChange={e => {
            const selected = years.find(y => y.id === Number(e.target.value));
            if (selected) setAcademicYear(selected);
          }}
          className="form-control"
          style={{ width: 200 }}
        >
          <option value="">Select Academic Year</option>
          {years.map(year => (
            <option key={year.id} value={year.id}>
              {year.school_year}
            </option>
          ))}
        </select>

        {/* Search Bar - Hidden on mobile */}
        <Box
          style={{
            display: window.innerWidth > 768 ? "block" : "none",
            background: "rgba(148, 163, 184, 0.1)",
            borderRadius: "12px",
            padding: "8px 16px",
            minWidth: 200,
          }}
        >
          <Text size="sm" color="dimmed">
            Search...
          </Text>
        </Box>

        {/* Notifications */}
        <Indicator
          inline
          label={notifications}
          size={16}
          color="red"
          style={{ display: notifications > 0 ? "block" : "none" }}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            style={{
              borderRadius: "12px",
              color: "#64748b",
            }}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>

        {/* Theme Toggle */}
        <ActionIcon
          variant="subtle"
          size="lg"
          style={{
            borderRadius: "12px",
            color: "#64748b",
          }}
        >
          <IconSun size={20} />
        </ActionIcon>

        {/* User Menu */}
        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <UnstyledButton
              style={{
                padding: "8px 12px",
                borderRadius: "12px",
                background: "rgba(148, 163, 184, 0.05)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              <Group gap="sm">
                <Avatar
                  radius="lg"
                  size="md"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    color: "white",
                  }}
                >
                  <IconUser size={18} />
                </Avatar>
                <Box
                  style={{
                    display: window.innerWidth > 640 ? "block" : "none",
                  }}
                >
                  <Text size="sm" style={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {userName}
                  </Text>
                  <Text size="xs" color="dimmed" style={{ lineHeight: 1.2 }}>
                    {userEmail}
                  </Text>
                </Box>
                <IconChevronDown size={14} style={{ color: "#64748b" }} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              boxShadow: "0 10px 40px -4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Menu.Label style={{ fontWeight: 600, color: "#374151" }}>
              Account
            </Menu.Label>

            <Menu.Item
              leftSection={<IconUser size={16} />}
              style={{
                borderRadius: "8px",
                margin: "4px",
              }}
            >
              <Box>
                <Text size="sm" style={{ fontWeight: 500 }}>
                  Profile
                </Text>
                <Text size="xs" color="dimmed">
                  Manage your account
                </Text>
              </Box>
            </Menu.Item>

            <Menu.Item
              leftSection={<IconSettings size={16} />}
              style={{
                borderRadius: "8px",
                margin: "4px",
              }}
            >
              <Box>
                <Text size="sm" style={{ fontWeight: 500 }}>
                  Settings
                </Text>
                <Text size="xs" color="dimmed">
                  App preferences
                </Text>
              </Box>
            </Menu.Item>

            <Menu.Divider style={{ margin: "8px 4px" }} />

            <Menu.Item
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              style={{
                borderRadius: "8px",
                margin: "4px",
                color: "#ef4444",
              }}
            >
              <Box>
                <Text size="sm" style={{ fontWeight: 500 }}>
                  Sign out
                </Text>
                <Text size="xs" style={{ opacity: 0.7 }}>
                  End your session
                </Text>
              </Box>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
