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
  Paper,
  Divider,
} from "@mantine/core";
import {
  MdSearch,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdSettings,
  MdLightMode,
  MdDarkMode,
  MdCalendarToday,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../api/academicYear";

interface TopBarProps {
  readonly schoolName?: string;
  readonly schoolLogo?: string;
}

export function TopBar({
  schoolName = "Excellence Academy",
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
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "ar", label: "العربية", flag: "🇸🇦" },
  ];

  const currentLanguage = languages.find((lang) => lang.value === language);

  return (
    <Paper
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
        background: `linear-gradient(135deg, 
          ${theme.colors.primary}10 0%, 
          ${theme.colors.primary}05 50%,
          transparent 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${theme.colors.primary}20`,
        borderRadius: 0,
        boxShadow: `0 4px 20px ${theme.colors.primary}15`,
      }}
    >
      {/* Left Section - School Branding */}
      <Group gap="lg">
        <Group gap="md">
          {schoolLogo ? (
            <Image
              src={schoolLogo}
              alt="School Logo"
              width={45}
              height={45}
              style={{
                borderRadius: "12px",
                border: `2px solid ${theme.colors.primary}30`,
                boxShadow: `0 4px 12px ${theme.colors.primary}20`,
              }}
            />
          ) : (
            <Box
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${theme.colors.primary}30`,
              }}
            >
              <Text c="white" fw={700} size="lg">
                {schoolName.charAt(0)}
              </Text>
            </Box>
          )}
          <Box>
            <Title
              order={4}
              style={{
                color: theme.colors.textPrimary,
                fontWeight: 700,
                fontSize: "18px",
                lineHeight: 1.2,
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}80 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {schoolName}
            </Title>
            <Text
              size="xs"
              style={{
                color: theme.colors.textSecondary,
                fontWeight: 500,
                fontSize: "11px",
              }}
            >
              Smart Education Platform
            </Text>
          </Box>
        </Group>
      </Group>

      {/* Center Section - Enhanced Search */}
      <Box style={{ flex: 1, maxWidth: "420px", margin: "0 32px" }}>
        <TextInput
          placeholder="Search anything... students, teachers, classes"
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          leftSection={
            <MdSearch size={18} style={{ color: theme.colors.primary }} />
          }
          styles={{
            input: {
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.7"}) 100%)`,
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: "14px",
              backdropFilter: "blur(10px)",
              color: theme.colors.textPrimary,
              fontSize: "13px",
              padding: "0 16px",
              height: "44px",
              "&:focus": {
                borderColor: theme.colors.primary,
                boxShadow: `0 0 0 2px ${theme.colors.primary}20`,
              },
              "&::placeholder": {
                color: theme.colors.textSecondary,
              },
            },
          }}
        />
      </Box>

      {/* Right Section - Enhanced Actions */}
      <Group gap="sm">
        {/* Academic Year Selector */}
        <Menu position="bottom-end" withArrow offset={8}>
          <Menu.Target>
            <ActionIcon
              size="lg"
              variant="subtle"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.7"}) 100%)`,
                border: `1px solid ${theme.colors.primary}30`,
                color: theme.colors.primary,
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                width: "44px",
                height: "44px",
                "&:hover": {
                  background: `${theme.colors.primary}15`,
                  transform: "scale(1.05)",
                },
              }}
            >
              <MdCalendarToday size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.1" : "0.95"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.05" : "0.85"}) 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: "12px",
              boxShadow: `0 8px 32px ${theme.colors.primary}20`,
            }}
          >
            <Menu.Label
              style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
            >
              Academic Year
            </Menu.Label>
            <Divider style={{ borderColor: `${theme.colors.primary}20` }} />
            {years.map((year) => (
              <Menu.Item
                key={year.id}
                onClick={() => setAcademicYear(year)}
                style={{
                  background:
                    academicYear?.id === year.id
                      ? `${theme.colors.primary}15`
                      : "transparent",
                  color: theme.colors.textPrimary,
                  borderRadius: "8px",
                  margin: "4px",
                  "&:hover": {
                    background: `${theme.colors.primary}20`,
                  },
                }}
              >
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {year.school_year}
                  </Text>
                  {academicYear?.id === year.id && (
                    <Badge
                      size="xs"
                      variant="gradient"
                      gradient={{
                        from: theme.colors.primary,
                        to: `${theme.colors.primary}CC`,
                      }}
                    >
                      Active
                    </Badge>
                  )}
                </Group>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Language Selector */}
        <Menu position="bottom-end" withArrow offset={8}>
          <Menu.Target>
            <ActionIcon
              size="lg"
              variant="subtle"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.7"}) 100%)`,
                border: `1px solid ${theme.colors.primary}30`,
                color: theme.colors.primary,
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                width: "44px",
                height: "44px",
                "&:hover": {
                  background: `${theme.colors.primary}15`,
                  transform: "scale(1.05)",
                },
              }}
            >
              <Text size="md">{currentLanguage?.flag}</Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.1" : "0.95"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.05" : "0.85"}) 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: "12px",
              boxShadow: `0 8px 32px ${theme.colors.primary}20`,
            }}
          >
            <Menu.Label
              style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
            >
              Language
            </Menu.Label>
            <Divider style={{ borderColor: `${theme.colors.primary}20` }} />
            {languages.map((lang) => (
              <Menu.Item
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                style={{
                  background:
                    language === lang.value
                      ? `${theme.colors.primary}15`
                      : "transparent",
                  color: theme.colors.textPrimary,
                  borderRadius: "8px",
                  margin: "4px",
                }}
              >
                <Group gap="sm">
                  <Text size="md">{lang.flag}</Text>
                  <Text size="sm" fw={500}>
                    {lang.label}
                  </Text>
                </Group>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Theme Toggle */}
        <ActionIcon
          onClick={toggleColorScheme}
          size="lg"
          variant="subtle"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
              rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.7"}) 100%)`,
            border: `1px solid ${theme.colors.primary}30`,
            color: theme.colors.primary,
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            width: "44px",
            height: "44px",
            transition: "all 0.3s ease",
            "&:hover": {
              background: `${theme.colors.primary}15`,
              transform: "scale(1.05) rotate(15deg)",
            },
          }}
        >
          {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
        </ActionIcon>

        {/* Notifications */}
        <Menu position="bottom-end" withArrow offset={8}>
          <Menu.Target>
            <Indicator
              inline
              label={notifications}
              size={18}
              disabled={notifications === 0}
              color={theme.colors.primary}
              styles={{
                indicator: {
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                  border: "2px solid #ffffff",
                  fontSize: "10px",
                  fontWeight: 700,
                },
              }}
            >
              <ActionIcon
                size="lg"
                variant="subtle"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
                    rgba(255, 255, 255, ${
                      theme.isDark ? "0.04" : "0.7"
                    }) 100%)`,
                  border: `1px solid ${theme.colors.primary}30`,
                  color: theme.colors.primary,
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  width: "44px",
                  height: "44px",
                  "&:hover": {
                    background: `${theme.colors.primary}15`,
                    transform: "scale(1.05)",
                  },
                }}
              >
                <MdNotifications size={18} />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.1" : "0.95"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.05" : "0.85"}) 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: "12px",
              boxShadow: `0 8px 32px ${theme.colors.primary}20`,
              minWidth: "300px",
            }}
          >
            <Menu.Label
              style={{ color: theme.colors.textPrimary, fontWeight: 600 }}
            >
              Recent Notifications
            </Menu.Label>
            <Divider style={{ borderColor: `${theme.colors.primary}20` }} />
            <Menu.Item style={{ background: "transparent", padding: "12px" }}>
              <Box>
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: theme.colors.textPrimary }}
                >
                  New student enrollment
                </Text>
                <Text size="xs" c="dimmed">
                  2 minutes ago
                </Text>
              </Box>
            </Menu.Item>
            <Menu.Item style={{ background: "transparent", padding: "12px" }}>
              <Box>
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: theme.colors.textPrimary }}
                >
                  Fee payment received
                </Text>
                <Text size="xs" c="dimmed">
                  1 hour ago
                </Text>
              </Box>
            </Menu.Item>
            <Menu.Item style={{ background: "transparent", padding: "12px" }}>
              <Box>
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: theme.colors.textPrimary }}
                >
                  Exam results published
                </Text>
                <Text size="xs" c="dimmed">
                  3 hours ago
                </Text>
              </Box>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* Enhanced User Profile Menu */}
        <Menu position="bottom-end" withArrow offset={8}>
          <Menu.Target>
            <Paper
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "14px",
                border: `1px solid ${theme.colors.primary}30`,
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.9"}) 0%, 
                  rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.7"}) 100%)`,
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: `0 4px 20px ${theme.colors.primary}20`,
                },
              }}
            >
              <Group gap="sm">
                <Avatar
                  size="sm"
                  radius="xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                    border: `2px solid ${theme.colors.primary}30`,
                  }}
                >
                  {getInitials(userName)}
                </Avatar>
                <Box style={{ textAlign: "left", minWidth: 0 }}>
                  <Text
                    size="sm"
                    fw={600}
                    style={{
                      color: theme.colors.textPrimary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100px",
                      fontSize: "12px",
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
                      maxWidth: "100px",
                      fontSize: "10px",
                    }}
                  >
                    {userRole === "1" ? "Administrator" : "User"}
                  </Text>
                </Box>
                <MdKeyboardArrowDown
                  size={16}
                  style={{ color: theme.colors.textSecondary }}
                />
              </Group>
            </Paper>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.1" : "0.95"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.05" : "0.85"}) 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: "12px",
              boxShadow: `0 8px 32px ${theme.colors.primary}20`,
              minWidth: "220px",
            }}
          >
            <Menu.Label>
              <Group gap="sm">
                <Avatar
                  size="xs"
                  radius="xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                  }}
                >
                  {getInitials(userName)}
                </Avatar>
                <Box>
                  <Text
                    size="xs"
                    fw={600}
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {userName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {userEmail}
                  </Text>
                </Box>
              </Group>
            </Menu.Label>
            <Divider style={{ borderColor: `${theme.colors.primary}20` }} />
            <Menu.Item
              leftSection={<MdPerson size={16} />}
              style={{
                color: theme.colors.textPrimary,
                borderRadius: "8px",
                margin: "4px",
              }}
            >
              My Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<MdSettings size={16} />}
              style={{
                color: theme.colors.textPrimary,
                borderRadius: "8px",
                margin: "4px",
              }}
            >
              Settings
            </Menu.Item>
            <Divider style={{ borderColor: `${theme.colors.primary}20` }} />
            <Menu.Item
              leftSection={<MdLogout size={16} />}
              onClick={handleLogout}
              style={{
                color: "#ef4444",
                borderRadius: "8px",
                margin: "4px",
                "&:hover": {
                  background: "#ef444415",
                },
              }}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
}

export default TopBar;
