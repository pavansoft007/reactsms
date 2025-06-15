import {
  ScrollArea,
  Group,
  Text,
  Box,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconChalkboard,
  IconBook,
  IconCalendarEvent,
  IconCash,
  IconReportAnalytics,
  IconSettings,
  IconEdit,
  IconChevronRight,
  IconSchool,
} from "@tabler/icons-react";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: IconLayoutDashboard, to: "/", color: "#0ea5e9" },
  { label: "Students", icon: IconUsers, to: "/students", color: "#22c55e" },
  {
    label: "Teachers",
    icon: IconChalkboard,
    to: "/teachers",
    color: "#f59e0b",
  },
  { label: "Classes", icon: IconBook, to: "/classes", color: "#8b5cf6" },
  {
    label: "Attendance",
    icon: IconCalendarEvent,
    to: "/attendance",
    color: "#ef4444",
  },
  { label: "Fees", icon: IconCash, to: "/fees", color: "#06b6d4" },
  {
    label: "Reports",
    icon: IconReportAnalytics,
    to: "/reports",
    color: "#84cc16",
  },
  { label: "Settings", icon: IconSettings, to: "/settings", color: "#6b7280" },
  {
    label: "Admission",
    icon: IconEdit,
    to: "/admission",
    color: "#ec4899",
    children: [
      { label: "Create Admission", to: "/admission/create" },
      // Add more admission-related links here if needed
    ],
  },
];

interface SidebarProps {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

export function Sidebar({ opened, setOpened }: SidebarProps) {
  const location = useLocation();
  const [openedCollapse, setOpenedCollapse] = useState<string | null>(null);

  if (!opened) return null;

  const handleCollapseToggle = (label: string) => {
    setOpenedCollapse(openedCollapse === label ? null : label);
  };

  return (
    <Box
      style={{
        height: "100vh",
        width: 280,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        paddingTop: 70, // Account for header height
      }}
    >
      {/* Logo Section */}
      <Box
        p="xl"
        style={{ borderBottom: "1px solid rgba(226, 232, 240, 0.8)" }}
      >
        <Group gap="md">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px -4px rgba(14, 165, 233, 0.3)",
            }}
          >
            <IconSchool size={24} color="white" />
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
            <Text size="xs" color="dimmed" style={{ fontWeight: 500 }}>
              School Management
            </Text>
          </Box>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} p="md">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openedCollapse === item.label;
            const hasActiveChild = item.children.some(
              (child) => location.pathname === child.to
            );

            return (
              <Box key={item.label} mb="xs">
                <UnstyledButton
                  onClick={() => handleCollapseToggle(item.label)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    color: hasActiveChild ? item.color : "#64748b",
                    background: hasActiveChild
                      ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                      : "transparent",
                    border: hasActiveChild
                      ? `1px solid ${item.color}30`
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
                    fontWeight: hasActiveChild ? 600 : 500,
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <item.icon size={20} />
                      <Text size="sm">{item.label}</Text>
                    </Group>
                    <IconChevronRight
                      size={16}
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </Group>
                </UnstyledButton>

                <Collapse in={isOpen}>
                  <Box ml="md" mt="xs">
                    {item.children.map((child) => {
                      const isActive = location.pathname === child.to;
                      return (
                        <Link
                          key={child.label}
                          to={child.to}
                          style={{ textDecoration: "none" }}
                        >
                          <UnstyledButton
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              color: isActive ? item.color : "#64748b",
                              background: isActive
                                ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                                : "transparent",
                              border: isActive
                                ? `1px solid ${item.color}30`
                                : "1px solid transparent",
                              transition: "all 0.2s ease",
                              fontWeight: isActive ? 600 : 500,
                            }}
                          >
                            <Text size="sm">{child.label}</Text>
                          </UnstyledButton>
                        </Link>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          }

          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.label}
              to={item.to}
              style={{ textDecoration: "none" }}
            >
              <UnstyledButton
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "6px",
                  color: isActive ? item.color : "#64748b",
                  background: isActive
                    ? `linear-gradient(135deg, ${item.color}15, ${item.color}08)`
                    : "transparent",
                  border: isActive
                    ? `1px solid ${item.color}30`
                    : "1px solid transparent",
                  transition: "all 0.2s ease",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                <Group gap="sm">
                  <item.icon size={20} />
                  <Text size="sm">{item.label}</Text>
                </Group>
              </UnstyledButton>
            </Link>
          );
        })}
      </ScrollArea>
    </Box>
  );
}
