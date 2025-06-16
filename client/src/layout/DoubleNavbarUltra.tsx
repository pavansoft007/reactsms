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
  MdChevronLeft,
  MdChevronRight,
  MdBusiness,
  MdHotel,
  MdWork,
} from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import TopBarUltra from "./TopBarUltra";

// Main navigation categories with modern colors matching menu cards
const mainCategories = [
  {
    icon: MdDashboard,
    label: "Dashboard",
    to: "/",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
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
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
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
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    links: [
      { label: "Classes", to: "/classes" },
      { label: "Sections", to: "/sections" },
      { label: "Subjects", to: "/academic/subject" },
      { label: "Exams", to: "/exams" },
      { label: "Enrollments", to: "/enrollments" },
      { label: "Attendance", to: "/attendance" },
      { label: "Timetable", to: "/timetable" },
      { label: "Assignments", to: "/assignments" },
    ],
  },
  {
    icon: MdEventAvailable,
    label: "Activities",
    to: "/events",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    links: [
      { label: "Events", to: "/events" },
      { label: "Library Management", to: "/library" },
      { label: "WhatsApp Integration", to: "/whatsapp" },
      { label: "Transport", to: "/transport" },
      { label: "Certificates", to: "/certificates" },
      { label: "Awards & Recognition", to: "/awards" },
      { label: "Student Activities", to: "/student-activities" },
      { label: "Extracurricular", to: "/extracurricular" },
    ],
  },
  {
    icon: MdAttachMoney,
    label: "Finance",
    to: "/fees",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    links: [
      { label: "Fees", to: "/fees" },
      { label: "Fee Types", to: "/fee-types" },
      { label: "Fee Collection", to: "/fee-collection" },
      { label: "Accounting", to: "/accounting" },
      { label: "Reports", to: "/reports" },
      { label: "Invoices", to: "/invoices" },
      { label: "Payments", to: "/payments" },
    ],
  },
  {
    icon: MdWork,
    label: "HRMS",
    to: "/hrms",
    color: "#9333ea",
    gradient: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)",
    links: [
      { label: "Employee Management", to: "/hrms/employees" },
      { label: "Payroll", to: "/hrms/payroll" },
      { label: "Leave Management", to: "/hrms/leave" },
      { label: "Attendance", to: "/hrms/attendance" },
      { label: "Performance", to: "/hrms/performance" },
      { label: "Recruitment", to: "/hrms/recruitment" },
      { label: "Training", to: "/hrms/training" },
      { label: "Employee Records", to: "/hrms/records" },
    ],
  },
  {
    icon: MdHotel,
    label: "Hostel",
    to: "/hostel",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    links: [
      { label: "Hostel Management", to: "/hostel/management" },
      { label: "Room Allocation", to: "/hostel/rooms" },
      { label: "Student Check-in", to: "/hostel/checkin" },
      { label: "Mess Management", to: "/hostel/mess" },
      { label: "Hostel Fees", to: "/hostel/fees" },
      { label: "Maintenance", to: "/hostel/maintenance" },
      { label: "Visitor Management", to: "/hostel/visitors" },
      { label: "Hostel Reports", to: "/hostel/reports" },
    ],
  },
  {
    icon: MdBusiness,
    label: "Administration",
    to: "/administration",
    masterAdminOnly: true,
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    links: [
      { label: "User Roles", to: "/administration/roles" },
      { label: "Role Groups", to: "/administration/role-groups" },
      { label: "Permissions", to: "/administration/permissions" },
      { label: "User Management", to: "/administration/users" },
      { label: "Branch Management", to: "/administration/branches" },
      { label: "System Settings", to: "/administration/system" },
      { label: "Security Settings", to: "/administration/security" },
      { label: "Audit Logs", to: "/administration/audit" },
    ],
  },
  {
    icon: MdSettings,
    label: "Settings",
    to: "/settings",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    links: [
      { label: "General Settings", to: "/settings" },
      { label: "Academic Year", to: "/settings/academic-year" },
      { label: "Branches", to: "/branches" },
      { label: "School Configuration", to: "/settings/school" },
      { label: "Role Management", to: "/settings/role-management" },
      { label: "User Management", to: "/settings/user-management" },
      { label: "Create User", to: "/settings/create-user" },
      { label: "System Settings", to: "/settings/system" },
      { label: "Backup & Restore", to: "/settings/backup" },
      { label: "Email Configuration", to: "/settings/email" },
      { label: "SMS Configuration", to: "/settings/sms" },
      { label: "Payment Gateway", to: "/settings/payment" },
    ],
  },
];

interface DoubleNavbarUltraProps {
  children: React.ReactNode;
}

const DoubleNavbarUltra: React.FC<DoubleNavbarUltraProps> = ({ children }) => {
  const { theme, isDark } = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Ultra-compact dimensions
  const leftBarWidth = "50px";
  const rightPanelWidth = "200px";

  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    const currentCategory = mainCategories.find(
      (cat) =>
        location.pathname === cat.to ||
        cat.links.some((link) => link.to === location.pathname)
    );
    return currentCategory ? currentCategory.label : null;
  });

  const [rightPanelOpened, setRightPanelOpened] = useState(!isMobile);

  const userRole = localStorage.getItem("user_role");
  const filteredCategories = mainCategories.filter(
    (category) => !category.masterAdminOnly || userRole === "master_admin"
  );

  const handleCategoryClick = (categoryLabel: string) => {
    if (activeCategory === categoryLabel) {
      setRightPanelOpened(!rightPanelOpened);
    } else {
      setActiveCategory(categoryLabel);
      setRightPanelOpened(true);
    }
  };

  // Calculate main content margin
  let contentMarginLeft: string;
  if (rightPanelOpened) {
    contentMarginLeft = isMobile ? "0" : "250px"; // 50px + 200px
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
      {" "}
      {/* Top Bar */}
      <TopBarUltra />
      {/* Left Icon Bar - Ultra Compact */}
      <Paper
        style={{
          width: leftBarWidth,
          background: `linear-gradient(145deg, 
            ${
              isDark ? "rgba(26, 27, 35, 0.95)" : "rgba(255, 255, 255, 0.95)"
            } 0%, 
            ${
              isDark ? "rgba(45, 55, 72, 0.95)" : "rgba(248, 250, 252, 0.95)"
            } 100%)`,
          backdropFilter: "blur(24px)",
          border: `1px solid ${
            isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(226, 232, 240, 0.3)"
          }`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: "60px",
          bottom: 0,
          zIndex: 1001,
          boxShadow: `0 20px 40px ${
            isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"
          }`,
          borderRadius: 0,
        }}
      >
        {/* Navigation Icons */}
        <Box style={{ flex: 1, padding: "12px 6px" }}>
          <Stack gap="xs">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isActive =
                location.pathname === category.to ||
                category.links.some((link) => link.to === location.pathname);
              const isSelected = activeCategory === category.label;

              return (
                <Tooltip
                  key={category.label}
                  label={category.label}
                  position="right"
                  withArrow
                  style={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f9fafb" : "#1f2937",
                    border: `1px solid ${
                      isDark
                        ? "rgba(75, 85, 99, 0.2)"
                        : "rgba(226, 232, 240, 0.8)"
                    }`,
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  <UnstyledButton
                    onClick={() => handleCategoryClick(category.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background:
                        isActive || isSelected
                          ? category.gradient
                          : "transparent",
                      color:
                        isActive || isSelected ? "#ffffff" : category.color,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform:
                        isActive || isSelected ? "scale(1.1)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive && !isSelected) {
                        e.currentTarget.style.background = `${category.color}15`;
                        e.currentTarget.style.color = category.color;
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !isSelected) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = category.color;
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <Icon size={20} style={{ zIndex: 1 }} />
                    {(isActive || isSelected) && (
                      <Box
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: category.gradient,
                          opacity: 0.9,
                          borderRadius: "12px",
                        }}
                      />
                    )}
                  </UnstyledButton>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>

        {/* Collapse Toggle */}
        <Box style={{ padding: "8px" }}>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => setRightPanelOpened(!rightPanelOpened)}
            style={{
              color: isDark ? "#9ca3af" : "#6b7280",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
            }}
          >
            {rightPanelOpened ? (
              <MdChevronLeft size={16} />
            ) : (
              <MdChevronRight size={16} />
            )}
          </ActionIcon>
        </Box>
      </Paper>
      {/* Right Navigation Panel - Ultra Modern */}
      <Transition
        mounted={rightPanelOpened}
        transition="slide-right"
        duration={300}
        timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {(styles) => (
          <Paper
            style={{
              ...styles,
              width: rightPanelWidth,
              background: `linear-gradient(145deg, 
                ${
                  isDark
                    ? "rgba(26, 27, 35, 0.98)"
                    : "rgba(255, 255, 255, 0.98)"
                } 0%, 
                ${
                  isDark
                    ? "rgba(45, 55, 72, 0.98)"
                    : "rgba(248, 250, 252, 0.98)"
                } 100%)`,
              backdropFilter: "blur(32px)",
              border: `1px solid ${
                isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(226, 232, 240, 0.2)"
              }`,
              borderLeft: "none",
              position: "fixed",
              left: leftBarWidth,
              top: "60px",
              bottom: 0,
              zIndex: 1000,
              overflowY: "auto",
              boxShadow: `0 20px 40px ${
                isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"
              }`,
              borderRadius: 0,
            }}
          >
            {activeCategory && (
              <Box style={{ padding: "16px 12px" }}>
                {(() => {
                  const category = filteredCategories.find(
                    (cat) => cat.label === activeCategory
                  );
                  if (!category) return null;

                  return (
                    <>
                      {/* Category Header */}
                      <Group gap="xs" style={{ marginBottom: "16px" }}>
                        <Box
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: category.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 8px 20px ${category.color}25`,
                          }}
                        >
                          <category.icon
                            size={18}
                            style={{ color: "#ffffff" }}
                          />
                        </Box>
                        <Title
                          order={6}
                          style={{
                            color: isDark ? "#f9fafb" : "#1f2937",
                            fontSize: "14px",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                          }}
                        >
                          {category.label}
                        </Title>
                      </Group>

                      {/* Navigation Links */}
                      <Stack gap="xs">
                        {category.links.map((link) => {
                          const isLinkActive = location.pathname === link.to;
                          return (
                            <UnstyledButton
                              key={link.to}
                              component={Link}
                              to={link.to}
                              style={{
                                display: "block",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                background: isLinkActive
                                  ? `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`
                                  : "transparent",
                                border: isLinkActive
                                  ? `1px solid ${category.color}30`
                                  : `1px solid transparent`,
                                transition:
                                  "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              onMouseEnter={(e) => {
                                if (!isLinkActive) {
                                  e.currentTarget.style.background = `${category.color}08`;
                                  e.currentTarget.style.transform =
                                    "translateX(4px)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isLinkActive) {
                                  e.currentTarget.style.background =
                                    "transparent";
                                  e.currentTarget.style.transform =
                                    "translateX(0)";
                                }
                              }}
                            >
                              <Text
                                size="sm"
                                style={{
                                  color: isLinkActive
                                    ? category.color
                                    : isDark
                                    ? "#e5e7eb"
                                    : "#374151",
                                  fontWeight: isLinkActive ? 600 : 500,
                                  fontSize: "13px",
                                  zIndex: 1,
                                  position: "relative",
                                }}
                              >
                                {link.label}
                              </Text>
                              {isLinkActive && (
                                <Box
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "3px",
                                    height: "60%",
                                    background: category.gradient,
                                    borderRadius: "0 3px 3px 0",
                                  }}
                                />
                              )}
                            </UnstyledButton>
                          );
                        })}
                      </Stack>
                    </>
                  );
                })()}
              </Box>
            )}
          </Paper>
        )}
      </Transition>
      {/* Main Content Area */}
      <Box
        style={{
          marginLeft: contentMarginLeft,
          marginTop: "60px",
          flex: 1,
          padding: isMobile ? "16px" : "24px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "calc(100vh - 60px)",
          overflowY: "auto",
        }}
      >
        {children}
      </Box>
      {/* Mobile Overlay */}
      {isMobile && rightPanelOpened && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setRightPanelOpened(false)}
        />
      )}
    </Box>
  );
};

export default DoubleNavbarUltra;
