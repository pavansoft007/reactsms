import { useNavigate } from "react-router-dom";
import {
  Container,
  SimpleGrid,
  Card,
  Text,
  Box,
  Stack,
  UnstyledButton,
  Title,
} from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconChalkboard,
  IconBook,
  IconPuzzle,
  IconUserCheck,
  IconClipboardCheck,
  IconCalendarEvent,
  IconCurrencyRupee,
  IconBooks,
  IconBrandWhatsapp,
  IconChartBar,
  IconAward,
} from "@tabler/icons-react";

// Modern menu items with Tabler icons
const menuItems = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    desc: "School performance dashboard",
    color: "#0ea5e9",
    bgColor: "rgba(14, 165, 233, 0.1)",
  },
  {
    name: "Student",
    url: "/students",
    icon: IconUsers,
    desc: "Manage student profiles, admissions, and records",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  {
    name: "Classes",
    url: "/classes",
    icon: IconChalkboard,
    desc: "Manage classes, sections, and assignments",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    name: "Subject",
    url: "/academic/subject",
    icon: IconBook,
    desc: "Manage subjects and curriculum",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    name: "Section",
    url: "/sections",
    icon: IconPuzzle,
    desc: "Organize classes into sections",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
  },
  {
    name: "Attendance",
    url: "/attendance",
    icon: IconUserCheck,
    desc: "Track student and staff attendance",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.1)",
  },
  {
    name: "Exam",
    url: "/exams",
    icon: IconClipboardCheck,
    desc: "Manage examinations and assessments",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    name: "Events",
    url: "/events",
    icon: IconCalendarEvent,
    desc: "Schedule and manage school events",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
  },
  {
    name: "Fees",
    url: "/fees",
    icon: IconCurrencyRupee,
    desc: "Manage fee collection and records",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  {
    name: "Library",
    url: "/library",
    icon: IconBooks,
    desc: "Manage library books and resources",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
  },
  {
    name: "WhatsApp",
    url: "/whatsapp",
    icon: IconBrandWhatsapp,
    desc: "Send messages and notifications",
    color: "#25d366",
    bgColor: "rgba(37, 211, 102, 0.1)",
  },
  {
    name: "Reports",
    url: "/reports",
    icon: IconChartBar,
    desc: "Generate and view reports",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    name: "Awards",
    url: "/award",
    icon: IconAward,
    desc: "Manage awards and recognitions",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
];

const Mainmenu = () => {
  const navigate = useNavigate();
  const userName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("username") ||
    "User";

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <Container size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Box
            style={{
              textAlign: "center",
              padding: "2rem",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />
            <Box style={{ position: "relative", zIndex: 1 }}>
              <Title
                order={1}
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                🎯 Main Menu
              </Title>
              <Text size="xl" style={{ opacity: 0.9 }}>
                Welcome, {userName}! Choose a module to get started with your
                school management tasks.
              </Text>
            </Box>
          </Box>

          {/* Menu Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl">
            {menuItems.map((item) => (
              <UnstyledButton
                key={item.name}
                onClick={() => navigate(item.url)}
                style={{ height: "100%" }}
              >
                <Card
                  radius="xl"
                  p="xl"
                  style={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  className="card-hover"
                >
                  <Stack gap="lg" align="center" style={{ height: "100%" }}>
                    <Box
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "20px",
                        background: item.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${item.color}30`,
                        boxShadow: `0 8px 25px -5px ${item.color}40`,
                      }}
                    >
                      <item.icon size={36} color={item.color} />
                    </Box>

                    <Stack gap="xs" align="center" style={{ flex: 1 }}>
                      <Text
                        size="lg"
                        style={{
                          fontWeight: 700,
                          color: "#1e293b",
                          textAlign: "center",
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          color: "#64748b",
                          textAlign: "center",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.desc}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Mainmenu;
