import {  useState, useEffect , ReactNode } from 'react';
import {
  Box,
  Title,
  Tooltip,
  UnstyledButton,
  Text,
  ActionIcon,
  Group,
  Stack,
  Badge,
  Transition,
  Paper,
} from "@mantine/core";
import { useLocation, Link } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdEventAvailable,
  MdAttachMoney,
  MdSettings,
  MdPersonAdd,
  MdChevronLeft,
  MdChevronRight,
  MdCircle,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import TopBar from "./TopBar";

// Main navigation categories with icons and sub-links
const mainCategories = [
  {
    icon: MdDashboard,
    label: "Dashboard",
    to: "/",
    links: [
      { label: "Overview", to: "/" },
      { label: "Main Menu", to: "/mainmenu" },
      { label: "Analytics", to: "/analytics" },
    ],
  },
  {
    icon: MdPeople,
    label: "People",
    to: "/students",
    links: [
      { label: "Students", to: "/students" },
      { label: "Teachers", to: "/teachers" },
      { label: "Parents", to: "/parents" },
      { label: "Employee", to: "/employee" },
    ],
  },
  {
    icon: MdSchool,
    label: "Academic",
    to: "/classes",
    links: [
      { label: "Classes", to: "/classes" },
      { label: "Sections", to: "/sections" },
      { label: "Subjects", to: "/academic/subject" },
      { label: "Exams", to: "/exams" },
      { label: "Enrollments", to: "/enrollments" },
    ],
  },
  {
    icon: MdEventAvailable,
    label: "Activities",
    to: "/events",
    links: [
      { label: "Events", to: "/events" },
      { label: "Library", to: "/library" },
      { label: "WhatsApp", to: "/whatsapp" },
    ],
  },
  {
    icon: MdAttachMoney,
    label: "Finance",
    to: "/fees",
    links: [
      { label: "Fees", to: "/fees" },
      { label: "Accounting", to: "/accounting" },
      { label: "Reports", to: "/reports" },
    ],
  },
  {
    icon: MdPersonAdd,
    label: "Admin",
    to: "/role-management",
    masterAdminOnly: true,
    links: [
      { label: "Role Management", to: "/role-management" },
      { label: "User Management", to: "/settings/create-user" },
      { label: "Branches", to: "/branches" },
    ],
  },
  {
    icon: MdSettings,
    label: "Settings",
    to: "/settings",
    links: [
      { label: "General", to: "/settings" },
      { label: "Profile", to: "/profile" },
      { label: "System", to: "/system" },
    ],
  },
];

interface DoubleNavbarProps {
  readonly children: ReactNode;
}

export function DoubleNavbar({ children }: DoubleNavbarProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [rightPanelOpened, setRightPanelOpened] = useState(!isMobile);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Get user role for filtering
  const userRole = localStorage.getItem("user_role");
  const isMasterAdmin = userRole === "1" || parseInt(userRole ?? "0") === 1;

  // Filter categories based on user role
  const filteredCategories = mainCategories.filter((category) => {
    if (category.masterAdminOnly && !isMasterAdmin) {
      return false;
    }
    return true;
  });

  // Find active category based on current location
  const currentCategory =
    filteredCategories.find((category) =>
      category.links.some((link) => link.to === location.pathname)
    ) ||
    filteredCategories.find((category) => category.to === location.pathname);

  const toggleRightPanel = () => setRightPanelOpened(!rightPanelOpened);

  // Calculate panel width
  let panelWidth: string;
  if (rightPanelOpened) {
    panelWidth = isMobile ? "100%" : "280px";
  } else {
    panelWidth = "0";
  }

  // Calculate main content margin
  let contentMarginLeft: string;
  if (rightPanelOpened) {
    contentMarginLeft = isMobile ? "0" : "360px";
  } else {
    contentMarginLeft = "80px";
  }

  return (
    <Box
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <TopBar schoolName="My School Name" />

      {/* Left Icon Bar - Always visible */}
      <Box
        style={{
          width: "80px",
          background: theme.glassmorphism.primary,
          backdropFilter: "blur(20px)",
          borderRight: `1px solid ${theme.colors.border}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: "70px", // Below top bar
          bottom: 0,
          zIndex: 1001,
        }}
      >
        {/* Logo/Brand Area */}
        <Box
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <Title
            order={3}
            style={{
              color: theme.colors.primary,
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            SMS
          </Title>
        </Box>

        {/* Navigation Icons */}
        <Box style={{ flex: 1, padding: "16px 8px" }}>
          <Stack gap="xs">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isActive =
                location.pathname === category.to ||
                category.links.some((link) => link.to === location.pathname);

              return (
                <Tooltip
                  key={category.to}
                  label={category.label}
                  position="right"
                  withArrow
                >
                  <UnstyledButton
                    onClick={() => {
                      setActiveCategory(category.label);
                      if (!rightPanelOpened) {
                        setRightPanelOpened(true);
                      }
                    }}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        isActive || activeCategory === category.label
                          ? theme.colors.primary
                          : "transparent",
                      color:
                        isActive || activeCategory === category.label
                          ? "#ffffff"
                          : theme.colors.textPrimary,
                      border: `1px solid ${
                        isActive || activeCategory === category.label
                          ? theme.colors.primary
                          : "transparent"
                      }`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon size={24} />
                  </UnstyledButton>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Right Navigation Panel - Collapsible */}
      <Box
        style={{
          width: panelWidth,
          background: theme.glassmorphism.secondary,
          backdropFilter: "blur(15px)",
          borderRight: rightPanelOpened
            ? `1px solid ${theme.colors.border}`
            : "none",
          transition: "all 0.3s ease",
          overflow: "hidden",
          position: "fixed",
          left: "80px",
          top: "70px", // Below top bar
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {rightPanelOpened && (
          <>
            {/* Panel Header */}
            <Box
              style={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <Group>
                <Text
                  size="lg"
                  fw={600}
                  style={{ color: theme.colors.textPrimary }}
                >
                  {activeCategory ?? currentCategory?.label ?? "Navigation"}
                </Text>
              </Group>
              <ActionIcon
                onClick={toggleRightPanel}
                size="sm"
                style={{
                  background: "transparent",
                  color: theme.colors.textSecondary,
                }}
              >
                <MdChevronLeft size={20} />
              </ActionIcon>
            </Box>

            {/* Navigation Links */}
            <Box style={{ padding: "20px", flex: 1, overflow: "auto" }}>
              {(activeCategory
                ? filteredCategories.find((c) => c.label === activeCategory)
                : currentCategory
              )?.links.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <UnstyledButton
                    key={link.to}
                    component={Link}
                    to={link.to}
                    onClick={() => {
                      if (isMobile) {
                        setRightPanelOpened(false);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                      background: isActive
                        ? theme.colors.primary
                        : "transparent",
                      color: isActive ? "#ffffff" : theme.colors.textPrimary,
                      border: `1px solid ${
                        isActive ? theme.colors.primary : "transparent"
                      }`,
                      transition: "all 0.3s ease",
                      textAlign: "left",
                    }}
                  >
                    <Text
                      size="sm"
                      style={{
                        color: "inherit",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {link.label}
                    </Text>
                  </UnstyledButton>
                );
              })}
            </Box>
          </>
        )}
      </Box>

      {/* Collapse/Expand Toggle - Only when panel is closed */}
      {!rightPanelOpened && (
        <ActionIcon
          onClick={toggleRightPanel}
          size="lg"
          style={{
            position: "fixed",
            left: "90px",
            top: "90px", // Adjust for top bar
            zIndex: 1002,
            background: theme.glassmorphism.primary,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
          }}
        >
          <MdChevronRight size={20} />
        </ActionIcon>
      )}

      {/* Main Content Area */}
      <Box
        style={{
          flex: 1,
          marginLeft: contentMarginLeft,
          marginTop: "70px", // Account for top bar
          padding: "20px",
          background: theme.gradient.primary,
          minHeight: "calc(100vh - 70px)",
          height: "calc(100vh - 70px)",
          overflow: "auto",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </Box>

      {/* Mobile Overlay */}
      {isMobile && rightPanelOpened && (
        <Box
          onClick={() => setRightPanelOpened(false)}
          style={{
            position: "fixed",
            top: "70px", // Below top bar
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}
    </Box>
  );
}

export default DoubleNavbar;
