import { useState } from "react";
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
  readonly children: React.ReactNode;
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

  // Reduced widths for more space and better UX
  const leftBarWidth = "60px"; // Reduced from 80px
  const rightPanelWidth = "220px"; // Reduced from 280px

  // Calculate panel width
  let panelWidth: string;
  if (rightPanelOpened) {
    panelWidth = isMobile ? "100%" : rightPanelWidth;
  } else {
    panelWidth = "0";
  }

  // Calculate main content margin
  let contentMarginLeft: string;
  if (rightPanelOpened) {
    contentMarginLeft = isMobile ? "0" : "280px"; // 60px + 220px
  } else {
    contentMarginLeft = leftBarWidth;
  }

  return (
    <Box
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: theme.gradient.primary,
      }}
    >
      {/* Top Bar */}
      <TopBar
        schoolName="Excellence Academy"
        schoolLogo="/api/placeholder/40/40"
      />

      {/* Left Icon Bar - Always visible */}
      <Paper
        style={{
          width: leftBarWidth,
          background: `linear-gradient(145deg, 
            ${theme.colors.primary}12 0%, 
            ${theme.colors.primary}06 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.colors.primary}20`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: "70px",
          bottom: 0,
          zIndex: 1001,
          boxShadow: `0 8px 32px ${theme.colors.primary}15`,
          borderRadius: 0,
        }}
      >
        {/* Navigation Icons */}
        <Box style={{ flex: 1, padding: "16px 8px" }}>
          <Stack gap="md">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isActive =
                location.pathname === category.to ||
                category.links.some((link) => link.to === location.pathname);
              const isSelected = activeCategory === category.label;

              return (
                <Tooltip
                  key={category.to}
                  label={category.label}
                  position="right"
                  withArrow
                  offset={12}
                  styles={{
                    tooltip: {
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: `0 8px 25px ${theme.colors.primary}40`,
                    },
                  }}
                >
                  <Box style={{ position: "relative" }}>
                    <UnstyledButton
                      onClick={() => {
                        setActiveCategory(category.label);
                        if (!rightPanelOpened) {
                          setRightPanelOpened(true);
                        }
                      }}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          isActive || isSelected
                            ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`
                            : "transparent",
                        color:
                          isActive || isSelected
                            ? "#ffffff"
                            : theme.colors.textSecondary,
                        border: `1px solid ${
                          isActive || isSelected
                            ? theme.colors.primary
                            : "transparent"
                        }`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform:
                          isActive || isSelected ? "scale(1.1)" : "scale(1)",
                        boxShadow:
                          isActive || isSelected
                            ? `0 8px 25px ${theme.colors.primary}50`
                            : "none",
                        "&:hover": {
                          transform: "scale(1.05)",
                          background:
                            isActive || isSelected
                              ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`
                              : `${theme.colors.primary}15`,
                        },
                      }}
                    >
                      <Icon size={18} />
                    </UnstyledButton>

                    {/* Active indicator dot */}
                    {isActive && (
                      <Box
                        style={{
                          position: "absolute",
                          right: "-2px",
                          top: "2px",
                          width: "8px",
                          height: "8px",
                          background: theme.colors.primary,
                          borderRadius: "50%",
                          border: "2px solid #ffffff",
                          boxShadow: `0 2px 8px ${theme.colors.primary}50`,
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Right Navigation Panel - Collapsible */}
      <Transition
        mounted={rightPanelOpened}
        transition="slide-right"
        duration={400}
        timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {(styles) => (
          <Paper
            style={{
              ...styles,
              width: rightPanelWidth,
              background: `linear-gradient(145deg, 
                rgba(255, 255, 255, ${theme.isDark ? "0.08" : "0.95"}) 0%, 
                rgba(255, 255, 255, ${theme.isDark ? "0.04" : "0.85"}) 100%)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${theme.colors.primary}20`,
              overflow: "hidden",
              position: "fixed",
              left: leftBarWidth,
              top: "70px",
              bottom: 0,
              zIndex: 1000,
              boxShadow: `0 8px 32px ${theme.colors.primary}15`,
              borderRadius: 0,
            }}
          >
            {/* Panel Header */}
            <Box
              style={{
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                borderBottom: `1px solid ${theme.colors.primary}20`,
                background: `linear-gradient(90deg, 
                  ${theme.colors.primary}10 0%, 
                  transparent 100%)`,
              }}
            >
              <Group gap="sm">
                <Box
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${theme.colors.primary}30`,
                  }}
                >
                  {currentCategory && (
                    <currentCategory.icon size={16} color="#ffffff" />
                  )}
                </Box>
                <Box>
                  <Text
                    size="sm"
                    fw={700}
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: "13px",
                    }}
                  >
                    {activeCategory ?? currentCategory?.label ?? "Navigation"}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: "10px",
                    }}
                  >
                    {(activeCategory
                      ? filteredCategories.find(
                          (c) => c.label === activeCategory
                        )
                      : currentCategory
                    )?.links.length ?? 0}{" "}
                    options
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                onClick={toggleRightPanel}
                size="sm"
                variant="subtle"
                style={{
                  color: theme.colors.textSecondary,
                  borderRadius: "8px",
                  "&:hover": {
                    background: `${theme.colors.primary}20`,
                  },
                }}
              >
                <MdChevronLeft size={16} />
              </ActionIcon>
            </Box>

            {/* Navigation Links */}
            <Box style={{ padding: "16px", flex: 1, overflow: "auto" }}>
              <Stack gap="xs">
                {(activeCategory
                  ? filteredCategories.find((c) => c.label === activeCategory)
                  : currentCategory
                )?.links.map((link, index) => {
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
                        padding: "10px 14px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`
                          : "transparent",
                        color: isActive ? "#ffffff" : theme.colors.textPrimary,
                        border: `1px solid ${
                          isActive ? theme.colors.primary : "transparent"
                        }`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isActive
                          ? "translateX(6px)"
                          : "translateX(0)",
                        boxShadow: isActive
                          ? `0 4px 15px ${theme.colors.primary}40`
                          : "none",
                        "&:hover": {
                          transform: "translateX(3px)",
                          background: isActive
                            ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`
                            : `${theme.colors.primary}10`,
                          boxShadow: `0 2px 8px ${theme.colors.primary}20`,
                        },
                      }}
                    >
                      <Group gap="sm">
                        <Box
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: isActive
                              ? "#ffffff"
                              : theme.colors.primary,
                            opacity: isActive ? 1 : 0.6,
                          }}
                        />
                        <Text
                          size="sm"
                          style={{
                            color: "inherit",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "12px",
                          }}
                        >
                          {link.label}
                        </Text>
                      </Group>

                      {isActive && (
                        <Badge
                          size="xs"
                          variant="light"
                          color="white"
                          style={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "#ffffff",
                            border: "none",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Badge>
                      )}
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Box>
          </Paper>
        )}
      </Transition>

      {/* Floating Expand Button - Only when panel is closed */}
      {!rightPanelOpened && (
        <ActionIcon
          onClick={toggleRightPanel}
          size="lg"
          style={{
            position: "fixed",
            left: "70px",
            top: "90px",
            zIndex: 1002,
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}DD 100%)`,
            border: `1px solid ${theme.colors.primary}60`,
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: `0 8px 25px ${theme.colors.primary}50`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "scale(1.15) rotate(5deg)",
              boxShadow: `0 12px 35px ${theme.colors.primary}60`,
            },
          }}
        >
          <MdChevronRight size={18} />
        </ActionIcon>
      )}

      {/* Main Content Area */}
      <Box
        style={{
          flex: 1,
          marginLeft: contentMarginLeft,
          marginTop: "70px",
          padding: "24px",
          background: theme.gradient.primary,
          minHeight: "calc(100vh - 70px)",
          height: "calc(100vh - 70px)",
          overflow: "auto",
          transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
            top: "70px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            zIndex: 999,
            backdropFilter: "blur(4px)",
          }}
        />
      )}
    </Box>
  );
}

export default DoubleNavbar;
