import { useState, useEffect } from "react";
import {
  Group,
  TextInput,
  Menu,
  ActionIcon,
  Avatar,
  Box,
  Text,
  Badge,
  Image,
  Title,
  Indicator,
} from "@mantine/core";
import {
  MdSearch,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdSettings,
  MdLightMode,
  MdDarkMode,
  MdLanguage,
  MdCalendarToday,
  MdExpandMore,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../api/academicYear";

interface TopBarProps {
  readonly schoolName?: string;
  readonly schoolLogo?: string;
}

export function TopBar({
  schoolName = "School Management System",
  schoolLogo,
}: TopBarProps) {
  const { theme, isDark, toggleColorScheme } = useTheme();
  const { academicYear, setAcademicYear, years, setYears } = useAcademicYear();
  const [searchValue, setSearchValue] = useState("");
  const [notifications] = useState(3);
  const [language, setLanguage] = useState("en");

  // Get user info
  const userName =
    localStorage.getItem("user_name") ??
    localStorage.getItem("username") ??
    "Admin User";
  const userEmail =
    localStorage.getItem("user_email") ??
    localStorage.getItem("email") ??
    "admin@school.com";
  const userRole = localStorage.getItem("user_role");

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Load academic years
  useEffect(() => {
    fetchAcademicYears().then(setYears);
  }, [setYears]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Language options
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
  ];

  return (
    <Box
      style={{
        height: "70px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1002,
        background: theme.glassmorphism.primary,
        backdropFilter: "blur(15px)",
        borderBottom: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadow,
      }}
    >
      {/* Left Section - School Branding */}
      <Group gap="md">
        {schoolLogo && (
          <Image
            src={schoolLogo}
            alt="School Logo"
            width={40}
            height={40}
            style={{ borderRadius: "8px" }}
          />
        )}
        <Box>
          <Title
            order={4}
            style={{
              color: theme.colors.primary,
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: 1.2,
            }}
          >
            {schoolName}
          </Title>
          <Text
            size="xs"
            style={{
              color: theme.colors.textSecondary,
              fontWeight: 400,
            }}
          >
            Management Portal
          </Text>
        </Box>
      </Group>

      {/* Center Section - Search */}
      <Box style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}>
        <TextInput
          placeholder="Search students, teachers, classes..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          leftSection={<MdSearch size={16} />}
          style={{
            "& .mantine-TextInput-input": {
              background: theme.glassmorphism.secondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
              color: theme.colors.textPrimary,
            },
          }}
        />
      </Box>

      {/* Right Section - Actions */}
      <Group gap="sm">
        {/* Academic Year Selector */}
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <ActionIcon
              size="lg"
              style={{
                background: theme.glassmorphism.secondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textPrimary,
                backdropFilter: "blur(10px)",
              }}
            >
              <MdCalendarToday size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: theme.glassmorphism.primary,
              backdropFilter: "blur(15px)",
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <Menu.Label>Academic Year</Menu.Label>
            {years.map((year) => (
              <Menu.Item
                key={year.id}
                onClick={() => setAcademicYear(year)}
                style={{
                  background:
                    academicYear?.id === year.id
                      ? theme.colors.primary
                      : "transparent",
                  color:
                    academicYear?.id === year.id
                      ? "#ffffff"
                      : theme.colors.textPrimary,
                }}
              >
                {" "}
                <Group justify="space-between">
                  <Text size="sm">{year.school_year}</Text>
                  {academicYear?.id === year.id && (
                    <Badge size="xs" color="white" variant="filled">
                      Current
                    </Badge>
                  )}
                </Group>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Language Selector */}
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <ActionIcon
              size="lg"
              style={{
                background: theme.glassmorphism.secondary,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textPrimary,
                backdropFilter: "blur(10px)",
              }}
            >
              <MdLanguage size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: theme.glassmorphism.primary,
              backdropFilter: "blur(15px)",
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <Menu.Label>Language</Menu.Label>
            {languages.map((lang) => (
              <Menu.Item
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                style={{
                  background:
                    language === lang.value
                      ? theme.colors.primary
                      : "transparent",
                  color:
                    language === lang.value
                      ? "#ffffff"
                      : theme.colors.textPrimary,
                }}
              >
                {lang.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Theme Toggle */}
        <ActionIcon
          onClick={toggleColorScheme}
          size="lg"
          style={{
            background: theme.glassmorphism.secondary,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
            backdropFilter: "blur(10px)",
          }}
        >
          {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
        </ActionIcon>

        {/* Notifications */}
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <Indicator
              inline
              label={notifications}
              size={16}
              disabled={notifications === 0}
              color="red"
            >
              <ActionIcon
                size="lg"
                style={{
                  background: theme.glassmorphism.secondary,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textPrimary,
                  backdropFilter: "blur(10px)",
                }}
              >
                <MdNotifications size={18} />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: theme.glassmorphism.primary,
              backdropFilter: "blur(15px)",
              border: `1px solid ${theme.colors.border}`,
              minWidth: "280px",
            }}
          >
            <Menu.Label>Notifications</Menu.Label>
            <Menu.Item>
              <Box>
                <Text size="sm" fw={500}>
                  New student enrollment
                </Text>{" "}
                <Text size="xs" c="dimmed">
                  2 minutes ago
                </Text>
              </Box>
            </Menu.Item>
            <Menu.Item>
              <Box>
                <Text size="sm" fw={500}>
                  Fee payment received
                </Text>{" "}
                <Text size="xs" c="dimmed">
                  1 hour ago
                </Text>
              </Box>
            </Menu.Item>
            <Menu.Item>
              <Box>
                <Text size="sm" fw={500}>
                  Exam results published
                </Text>{" "}
                <Text size="xs" c="dimmed">
                  3 hours ago
                </Text>
              </Box>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* User Profile Menu */}
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <Group
              gap="xs"
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "12px",
                border: `1px solid ${theme.colors.border}`,
                background: theme.glassmorphism.secondary,
                backdropFilter: "blur(10px)",
              }}
            >
              <Avatar size="sm" radius="xl" color="blue">
                {getInitials(userName)}
              </Avatar>
              <Box style={{ textAlign: "left", minWidth: 0 }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: theme.colors.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                  }}
                >
                  {userName}
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: theme.colors.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                  }}
                >
                  {userRole === "1" ? "Admin" : "User"}
                </Text>
              </Box>
              <MdExpandMore
                size={16}
                style={{ color: theme.colors.textSecondary }}
              />
            </Group>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: theme.glassmorphism.primary,
              backdropFilter: "blur(15px)",
              border: `1px solid ${theme.colors.border}`,
              minWidth: "200px",
            }}
          >
            <Menu.Label>
              <Group gap="xs">
                <Avatar size="xs" radius="xl" color="blue">
                  {getInitials(userName)}
                </Avatar>
                <Box>
                  <Text size="xs" fw={500}>
                    {userName}
                  </Text>{" "}
                  <Text size="xs" c="dimmed">
                    {userEmail}
                  </Text>
                </Box>
              </Group>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<MdPerson size={16} />}>
              My Profile
            </Menu.Item>
            <Menu.Item leftSection={<MdSettings size={16} />}>
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<MdLogout size={16} />}
              onClick={handleLogout}
              color="red"
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}

export default TopBar;
