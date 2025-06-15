import React, { useState, useEffect } from "react";
import {
  Grid,
  Text,
  Group,
  Stack,
  Card,
  SimpleGrid,
  Badge,
  ActionIcon,
  Skeleton,
  Container,
  Title,
  Box,
} from "@mantine/core";
import {
  IconUsers,
  IconSchool,
  IconCurrencyRupee,
  IconCalendarEvent,
  IconClipboardList,
  IconEye,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalBooks?: number;
  monthlyRevenue?: number;
  pendingFees?: number;
  totalBranches?: number;
  totalRevenue?: number;
  type: "master_admin" | "branch_admin";
}

interface RecentActivity {
  recentStudents: any[];
  recentPayments: any[];
  upcomingExams: any[];
  upcomingEvents: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(
    null
  );
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("username") ||
    "User";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, activityRes, monthlyRes, classRes] = await Promise.all([
        axios.get("/api/dashboard/stats", { headers }),
        axios.get("/api/dashboard/recent-activities", { headers }),
        axios.get("/api/dashboard/monthly-stats", { headers }),
        axios.get("/api/dashboard/class-stats", { headers }),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setMonthlyData(monthlyRes.data);
      setClassStats(classRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  const StatCard = ({ title, value, icon, color, change }: any) => (
    <Card
      radius="xl"
      p="xl"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      className="card-hover"
    >
      <Group justify="space-between" mb="md">
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${color}30`,
          }}
        >
          {React.createElement(icon, { size: 24, color })}
        </Box>
        {change && (
          <Badge
            size="sm"
            style={{
              background:
                change > 0
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color: change > 0 ? "#22c55e" : "#ef4444",
              border: `1px solid ${change > 0 ? "#22c55e30" : "#ef444430"}`,
            }}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </Badge>
        )}
      </Group>
      <Stack gap="xs">
        <Text
          size="xs"
          tt="uppercase"
          style={{
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Text>
        <Text
          size="xl"
          style={{
            fontWeight: 700,
            fontSize: "2rem",
            lineHeight: 1.2,
            color: "#1e293b",
          }}
        >
          {value}
        </Text>
      </Stack>
    </Card>
  );

  const pieData = classStats.map((cls, index) => ({
    name: cls.className,
    value: cls.studentCount,
    fill: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"][index % 5],
  }));

  if (loading) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <Skeleton height={50} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={120} />
            ))}
          </SimpleGrid>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Skeleton height={300} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Skeleton height={300} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    );
  }
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Welcome Header */}
        <Box
          style={{
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
          <Box
            style={{
              position: "absolute",
              bottom: "-30%",
              left: "-10%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          />
          <Group
            justify="space-between"
            style={{ position: "relative", zIndex: 1 }}
          >
            <Box>
              <Title
                order={1}
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Welcome back, {userName}! 👋
              </Title>
              <Text size="lg" style={{ opacity: 0.9 }}>
                Here's what's happening in your school today. Let's make
                education better together.
              </Text>
            </Box>
            <Badge
              size="xl"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {stats?.type === "master_admin"
                ? "🔐 Master Admin"
                : "🏫 Branch Admin"}
            </Badge>
          </Group>
        </Box>{" "}
        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          {stats?.type === "master_admin" ? (
            <>
              <StatCard
                title="Total Branches"
                value={stats.totalBranches}
                icon={IconSchool}
                color="#0ea5e9"
                change={5}
              />
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={IconUsers}
                color="#22c55e"
                change={8}
              />
              <StatCard
                title="Total Teachers"
                value={stats.totalTeachers}
                icon={IconSchool}
                color="#f59e0b"
                change={3}
              />
              <StatCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
                icon={IconCurrencyRupee}
                color="#ef4444"
                change={12}
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Students"
                value={stats?.totalStudents}
                icon={IconUsers}
                color="#0ea5e9"
                change={5}
              />
              <StatCard
                title="Total Teachers"
                value={stats?.totalTeachers}
                icon={IconSchool}
                color="#22c55e"
                change={8}
              />
              <StatCard
                title="Total Classes"
                value={stats?.totalClasses}
                icon={IconClipboardList}
                color="#f59e0b"
                change={0}
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${stats?.monthlyRevenue?.toLocaleString() || 0}`}
                icon={IconCurrencyRupee}
                color="#ef4444"
                change={12}
              />
            </>
          )}
        </SimpleGrid>{" "}
        {/* Charts Section */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card
              radius="xl"
              p="xl"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                height: 450,
              }}
            >
              <Group justify="space-between" mb="xl">
                <Box>
                  <Text
                    size="lg"
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    📈 Monthly Performance
                  </Text>
                  <Text size="sm" style={{ color: "#64748b" }}>
                    Track your school's growth over time
                  </Text>
                </Box>
                <Badge
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    color: "white",
                    border: "none",
                  }}
                >
                  2024 Analytics
                </Badge>
              </Group>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="monthName"
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px -4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="studentsAdmitted"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#0ea5e9", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="feesCollected"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              radius="xl"
              p="xl"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                height: 450,
              }}
            >
              <Box mb="xl">
                <Text
                  size="lg"
                  style={{
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: "0.25rem",
                  }}
                >
                  🎯 Class Distribution
                </Text>
                <Text size="sm" style={{ color: "#64748b" }}>
                  Students across different classes
                </Text>
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px -4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
        </Grid>{" "}
        {/* Recent Activity */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              radius="xl"
              p="xl"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Group justify="space-between" mb="xl">
                <Box>
                  <Text
                    size="lg"
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    👥 Recent Students
                  </Text>
                  <Text size="sm" style={{ color: "#64748b" }}>
                    Latest student registrations
                  </Text>
                </Box>
                <ActionIcon
                  variant="light"
                  size="lg"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(14, 165, 233, 0.1)",
                    color: "#0ea5e9",
                  }}
                >
                  <IconEye size={18} />
                </ActionIcon>
              </Group>
              <Stack gap="sm">
                {recentActivity?.recentStudents
                  .slice(0, 5)
                  .map((student, index) => (
                    <Box
                      key={index}
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        background: "rgba(148, 163, 184, 0.05)",
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      <Group justify="space-between">
                        <Group gap="md">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #0ea5e9, #0284c7)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconUsers size={18} color="white" />
                          </Box>
                          <Box>
                            <Text
                              size="sm"
                              style={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {student.user?.name}
                            </Text>
                            <Text size="xs" style={{ color: "#64748b" }}>
                              {student.class?.name}
                            </Text>
                          </Box>
                        </Group>
                        <IconChevronRight
                          size={16}
                          style={{ color: "#94a3b8" }}
                        />
                      </Group>
                    </Box>
                  ))}
              </Stack>
            </Card>
          </Grid.Col>{" "}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              radius="xl"
              p="xl"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Group justify="space-between" mb="xl">
                <Box>
                  <Text
                    size="lg"
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    📅 Upcoming Events
                  </Text>
                  <Text size="sm" style={{ color: "#64748b" }}>
                    Don't miss these important dates
                  </Text>
                </Box>
                <ActionIcon
                  variant="light"
                  size="lg"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                  }}
                >
                  <IconEye size={18} />
                </ActionIcon>
              </Group>
              <Stack gap="sm">
                {recentActivity?.upcomingEvents
                  .slice(0, 5)
                  .map((event, index) => (
                    <Box
                      key={index}
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        background: "rgba(148, 163, 184, 0.05)",
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      <Group justify="space-between">
                        <Group gap="md">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #22c55e, #16a34a)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconCalendarEvent size={18} color="white" />
                          </Box>
                          <Box>
                            <Text
                              size="sm"
                              style={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {event.title}
                            </Text>
                            <Text size="xs" style={{ color: "#64748b" }}>
                              {new Date(event.event_date).toLocaleDateString()}
                            </Text>
                          </Box>
                        </Group>
                        <IconChevronRight
                          size={16}
                          style={{ color: "#94a3b8" }}
                        />
                      </Group>
                    </Box>
                  ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>{" "}
        {/* Quick Actions */}
        <Card
          radius="xl"
          p="xl"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box mb="xl">
            <Text
              size="lg"
              style={{
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.25rem",
              }}
            >
              ⚡ Quick Actions
            </Text>
            <Text size="sm" style={{ color: "#64748b" }}>
              Common tasks to get things done faster
            </Text>
          </Box>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            <Box
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))",
                border: "1px solid rgba(14, 165, 233, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              className="card-hover"
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px -4px rgba(14, 165, 233, 0.4)",
                  }}
                >
                  <IconUsers size={24} color="white" />
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="sm" style={{ fontWeight: 600, color: "#1e293b" }}>
                    Add Student
                  </Text>
                  <Text size="xs" style={{ color: "#64748b" }}>
                    Register new student
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              className="card-hover"
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px -4px rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <IconCurrencyRupee size={24} color="white" />
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="sm" style={{ fontWeight: 600, color: "#1e293b" }}>
                    Collect Fee
                  </Text>
                  <Text size="xs" style={{ color: "#64748b" }}>
                    Record payment
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              className="card-hover"
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px -4px rgba(245, 158, 11, 0.4)",
                  }}
                >
                  <IconClipboardList size={24} color="white" />
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="sm" style={{ fontWeight: 600, color: "#1e293b" }}>
                    Add Exam
                  </Text>
                  <Text size="xs" style={{ color: "#64748b" }}>
                    Schedule examination
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              className="card-hover"
            >
              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 20px -4px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  <IconCalendarEvent size={24} color="white" />
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="sm" style={{ fontWeight: 600, color: "#1e293b" }}>
                    Create Event
                  </Text>
                  <Text size="xs" style={{ color: "#64748b" }}>
                    Add new event
                  </Text>
                </Box>
              </Stack>
            </Box>
          </SimpleGrid>
        </Card>
      </Stack>
    </Container>
  );
};

export default Dashboard;
