import React, { useState, useEffect } from "react";
import {
  Box,
  Group,
  Text,
  ActionIcon,
  Avatar,
  Menu,
  TextInput,
  Select,
  UnstyledButton,
  Indicator,
  Tooltip,
  Paper,
  Badge,
} from "@mantine/core";
import {
  MdSearch,
  MdNotifications,
  MdLanguage,
  MdLightMode,
  MdDarkMode,
  MdAccountCircle,
  MdLogout,
  MdSettings,
  MdKeyboardArrowDown,
  MdSchool,
  MdCalendarToday,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../api/academicYear";
import axios from "axios";

interface AcademicYear {
  value: string;
  label: string;
}

interface SchoolInfo {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface TopBarUltraProps {
  schoolName?: string;
  schoolLogo?: string;
}

const TopBarUltra: React.FC<TopBarUltraProps> = ({
  schoolName: propSchoolName,
  schoolLogo: propSchoolLogo,
}) => {
  const { isDark, toggleColorScheme } = useTheme();
  const { academicYear, setAcademicYear, years, setYears } = useAcademicYear();
  const [searchValue, setSearchValue] = useState("");
  const [language, setLanguage] = useState("en");
  const [notificationCount] = useState(3);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [isLoadingSchoolInfo, setIsLoadingSchoolInfo] = useState(true);
  const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(false);

  const userName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("username") ||
    "User";
  const userRole = localStorage.getItem("user_role") || "Student"; // Fetch school information and academic years from APIs
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        setIsLoadingSchoolInfo(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, using default school info");
          setIsLoadingSchoolInfo(false);
          return;
        }

        console.log("Fetching school info from /api/branches...");

        // Fetch school/branch information
        const branchResponse = await axios.get("/api/branches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Branch response:", branchResponse.data);

        if (
          branchResponse.data.success &&
          branchResponse.data.data &&
          branchResponse.data.data.length > 0
        ) {
          // Get the first branch or current user's branch
          const userBranchId = localStorage.getItem("user_branch_id");
          console.log("User branch ID:", userBranchId);

          const branch = userBranchId
            ? branchResponse.data.data.find(
                (b: any) => b.id.toString() === userBranchId
              )
            : branchResponse.data.data[0];

          console.log("Selected branch:", branch);

          if (branch) {
            // Determine the best logo to use
            let logoUrl = undefined;
            if (branch.logo_file) {
              logoUrl = `/api/branches/logo/${branch.logo_file}`;
            } else if (branch.text_logo) {
              logoUrl = `/api/branches/text-logo/${branch.text_logo}`;
            }

            const schoolData = {
              id: branch.id,
              name:
                branch.school_name ||
                branch.branch_name ||
                branch.name ||
                "School",
              logo: logoUrl,
              address: branch.address,
              phone: branch.phone,
              email: branch.email,
            };

            console.log("Setting school info:", schoolData);
            setSchoolInfo(schoolData);
          }        } else {
          console.warn("No branches found in response");
        }
      } catch (error) {
        console.error("Failed to fetch school info:", error);
        // Set fallback school info
        setSchoolInfo({
          id: 1,
          name: propSchoolName || "School Management System",
          logo: propSchoolLogo,
        });
      } finally {
        setIsLoadingSchoolInfo(false);
      }
    };    fetchSchoolInfo();
  }, [propSchoolName, propSchoolLogo]);

  // Load academic years using the same logic as TopBar.tsx
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setIsLoadingAcademicYears(true);
        console.log('Fetching academic years...');
        const academicYears = await fetchAcademicYears();
        console.log('Academic years fetched:', academicYears);
        setYears(academicYears);
        
        // Set the first year as default if no year is selected
        if (academicYears.length > 0 && !academicYear) {
          setAcademicYear(academicYears[0]);
        }
      } catch (error) {
        console.error('Failed to fetch academic years:', error);
        // Set fallback academic years if API fails
        const currentYear = new Date().getFullYear();
        const fallbackYears = [
          { id: 1, school_year: `${currentYear - 1}-${currentYear}` },
          { id: 2, school_year: `${currentYear}-${currentYear + 1}` },
          { id: 3, school_year: `${currentYear + 1}-${currentYear + 2}` },
        ];
        setYears(fallbackYears);
        setAcademicYear(fallbackYears[1]); // Set current year as default
      } finally {
        setIsLoadingAcademicYears(false);
      }
    };

    loadAcademicYears();
  }, [setYears, setAcademicYear, academicYear]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "hi", label: "हिंदी" },
  ]; // Use fetched school info with better fallback logic
  const displaySchoolName =
    schoolInfo?.name ||
    (!isLoadingSchoolInfo ? "School Management System" : "Loading...");
  const displaySchoolLogo = schoolInfo?.logo;

  // Debug logging
  console.log("TopBarUltra render:", {
    schoolInfo,
    isLoadingSchoolInfo,
    displaySchoolName,
    displaySchoolLogo,
  });

  return (
    <Paper
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        zIndex: 1002,
        background: `linear-gradient(135deg, 
          ${
            isDark ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)"
          } 0%, 
          ${
            isDark ? "rgba(30, 41, 59, 0.98)" : "rgba(248, 250, 252, 0.98)"
          } 100%)`,
        backdropFilter: "blur(32px)",
        borderBottom: `1px solid ${
          isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(226, 232, 240, 0.2)"
        }`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: `0 4px 20px ${
          isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"
        }`,
      }}
    >
      {/* Left Section - School Branding */}
      <Group gap="md" style={{ flex: 1 }}>
        {" "}
        <Group gap="sm">
          {" "}
          {displaySchoolLogo ? (
            <Avatar
              src={displaySchoolLogo}
              size={32}
              radius="md"
              onError={(e) => {
                // Hide the avatar and show fallback icon on error
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Box
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdSchool size={18} style={{ color: "#ffffff" }} />
            </Box>
          )}{" "}
          <Text
            size="md"
            fw={600}
            style={{
              color: isDark ? "#f9fafb" : "#1f2937",
              fontSize: "16px",
              letterSpacing: "0.3px",
            }}
          >
            {displaySchoolName}
          </Text>
        </Group>
        {/* Search Bar - Ultra Modern */}
        <Box style={{ flex: 1, maxWidth: "400px", marginLeft: "24px" }}>
          <TextInput
            placeholder="Search students, classes, or modules..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            leftSection={
              <MdSearch
                size={16}
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              />
            }
            style={{
              "& .mantine-TextInput-input": {
                background: isDark
                  ? "rgba(55, 65, 81, 0.8)"
                  : "rgba(248, 250, 252, 0.8)",
                border: `1px solid ${
                  isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
                }`,
                borderRadius: "12px",
                padding: "8px 12px 8px 36px",
                fontSize: "14px",
                transition: "all 0.2s ease",
                backdropFilter: "blur(8px)",
              },
              "& .mantine-TextInput-input:focus": {
                borderColor: "#0ea5e9",
                boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
                background: isDark
                  ? "rgba(55, 65, 81, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
              },
            }}
          />
        </Box>
      </Group>

      {/* Right Section - Controls */}
      <Group gap="md">
        {" "}        {/* Academic Year Selector */}
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <Tooltip label="Academic Year" withArrow>
              <ActionIcon
                size="md"
                style={{
                  background: isDark
                    ? "rgba(55, 65, 81, 0.8)"
                    : "rgba(248, 250, 252, 0.8)",
                  border: `1px solid ${
                    isDark
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(226, 232, 240, 0.5)"
                  }`,
                  borderRadius: "10px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
                loading={isLoadingAcademicYears}
              >
                <MdCalendarToday size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: isDark
                ? "rgba(31, 41, 55, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${
                isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
              }`,
              borderRadius: "12px",
            }}
          >
            <Menu.Label>
              {academicYear ? `Academic Year: ${academicYear.school_year}` : 'Select Academic Year'}
            </Menu.Label>
            {isLoadingAcademicYears ? (
              <Menu.Item disabled>
                <Text size="sm" color="dimmed">Loading...</Text>
              </Menu.Item>
            ) : years.length === 0 ? (
              <Menu.Item disabled>
                <Text size="sm" color="dimmed">No academic years available</Text>
              </Menu.Item>
            ) : (
              years.map((year) => (
                <Menu.Item
                  key={year.id}
                  onClick={() => setAcademicYear(year)}
                  style={{
                    background:
                      academicYear?.id === year.id
                        ? "#0ea5e9"
                        : "transparent",
                    color:
                      academicYear?.id === year.id
                        ? "#ffffff"
                        : isDark ? "#e5e7eb" : "#374151",
                  }}
                >
                  <Group justify="space-between">
                    <Text size="sm">{year.school_year}</Text>
                    {academicYear?.id === year.id && (
                      <Badge size="xs" color="white" variant="filled">
                        Current
                      </Badge>
                    )}
                  </Group>
                </Menu.Item>
              ))
            )}
          </Menu.Dropdown>
        </Menu>
        {/* Language Selector */}
        <Menu shadow="lg" position="bottom-end" offset={8}>
          <Menu.Target>
            <Tooltip label="Language" withArrow>
              <ActionIcon
                variant="subtle"
                size="md"
                style={{
                  background: isDark
                    ? "rgba(55, 65, 81, 0.8)"
                    : "rgba(248, 250, 252, 0.8)",
                  border: `1px solid ${
                    isDark
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(226, 232, 240, 0.5)"
                  }`,
                  borderRadius: "10px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
              >
                <MdLanguage size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: isDark
                ? "rgba(31, 41, 55, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${
                isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
              }`,
              borderRadius: "12px",
            }}
          >
            {" "}
            {languages.map((lang) => {
              let textColor;
              if (language === lang.value) {
                textColor = "#0ea5e9";
              } else {
                textColor = isDark ? "#e5e7eb" : "#374151";
              }
              return (
                <Menu.Item
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  style={{
                    fontSize: "14px",
                    background:
                      language === lang.value ? "#0ea5e920" : "transparent",
                    color: textColor,
                  }}
                >
                  {lang.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
        {/* Theme Toggle */}
        <Tooltip label={isDark ? "Light Mode" : "Dark Mode"} withArrow>
          <ActionIcon
            onClick={toggleColorScheme}
            variant="subtle"
            size="md"
            style={{
              background: isDark
                ? "rgba(55, 65, 81, 0.8)"
                : "rgba(248, 250, 252, 0.8)",
              border: `1px solid ${
                isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
              }`,
              borderRadius: "10px",
              color: isDark ? "#fbbf24" : "#f59e0b",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}
          >
            {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </ActionIcon>
        </Tooltip>
        {/* Notifications */}
        <Tooltip label="Notifications" withArrow>
          <Indicator
            inline
            label={notificationCount > 0 ? notificationCount : null}
            size={16}
            color="red"
            offset={4}
            style={{ zIndex: 1 }}
          >
            <ActionIcon
              variant="subtle"
              size="md"
              style={{
                background: isDark
                  ? "rgba(55, 65, 81, 0.8)"
                  : "rgba(248, 250, 252, 0.8)",
                border: `1px solid ${
                  isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
                }`,
                borderRadius: "10px",
                color: isDark ? "#e5e7eb" : "#374151",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
              }}
            >
              <MdNotifications size={18} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
        {/* User Profile Menu */}
        <Menu shadow="lg" position="bottom-end" offset={8}>
          <Menu.Target>
            <UnstyledButton
              style={{
                padding: "6px 12px",
                borderRadius: "12px",
                background: isDark
                  ? "rgba(55, 65, 81, 0.8)"
                  : "rgba(248, 250, 252, 0.8)",
                border: `1px solid ${
                  isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
                }`,
                backdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
              }}
            >
              <Group gap="sm">
                <Avatar
                  size={28}
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  }}
                >
                  <MdAccountCircle size={16} />
                </Avatar>
                <Box style={{ minWidth: 0 }}>
                  {" "}
                  <Text
                    size="sm"
                    fw={600}
                    style={{
                      color: isDark ? "#f9fafb" : "#1f2937",
                      lineHeight: 1.2,
                      fontSize: "13px",
                    }}
                    truncate
                  >
                    {userName}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: isDark ? "#9ca3af" : "#6b7280",
                      lineHeight: 1.2,
                      fontSize: "11px",
                    }}
                    truncate
                  >
                    {userRole}
                  </Text>
                </Box>
                <MdKeyboardArrowDown
                  size={14}
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown
            style={{
              background: isDark
                ? "rgba(31, 41, 55, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${
                isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.5)"
              }`,
              borderRadius: "12px",
              minWidth: "200px",
            }}
          >
            <Menu.Item
              leftSection={<MdAccountCircle size={16} />}
              style={{
                fontSize: "14px",
                color: isDark ? "#e5e7eb" : "#374151",
              }}
            >
              Profile Settings
            </Menu.Item>
            <Menu.Item
              leftSection={<MdSettings size={16} />}
              style={{
                fontSize: "14px",
                color: isDark ? "#e5e7eb" : "#374151",
              }}
            >
              Preferences
            </Menu.Item>
            <Menu.Divider
              style={{
                borderColor: isDark
                  ? "rgba(75, 85, 99, 0.3)"
                  : "rgba(226, 232, 240, 0.5)",
              }}
            />
            <Menu.Item
              leftSection={<MdLogout size={16} />}
              onClick={handleLogout}
              style={{
                fontSize: "14px",
                color: "#ef4444",
              }}
            >
              Sign Out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
};

export default TopBarUltra;
