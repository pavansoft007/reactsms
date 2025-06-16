import React, { useState, useEffect } from "react";
import {
  Grid,
  Text,
  Group,
  Stack,
  SimpleGrid,
  Skeleton,
  Container,
  Title,
  Box,
} from "@mantine/core";
import {
  MdPeople,
  MdSchool,
  MdAttachMoney,
  MdCalendarToday,
  MdAssignment,
  MdVisibility,
  MdTrendingUp,
  MdTrendingDown,
  MdBook,
  MdEvent,
  MdPayment,
} from "react-icons/md";
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
import { useTheme } from "../context/ThemeContext";
import { UltraCard, UltraButton, UltraTableBadge } from "../components/ui";
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
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
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

  const StatCard = ({ title, value, icon: Icon, color, change, trend }: any) => (
    <UltraCard variant="glassmorphic" hover>
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Text size="sm" c={theme.text.muted} fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} c={theme.text.primary}>
            {loading ? <Skeleton height={24} width={60} /> : value || 0}
          </Text>
          {change && (
            <Group gap="xs" align="center">
              {trend === 'up' ? (
                <MdTrendingUp size={16} color={theme.colors.success} />
              ) : (
                <MdTrendingDown size={16} color={theme.colors.error} />
              )}
              <Text 
                size="xs" 
                c={trend === 'up' ? theme.colors.success : theme.colors.error}
                fw={500}
              >
                {change}
              </Text>
            </Group>
          )}
        </Stack>
        <Box
          style={{
            padding: "12px",
            borderRadius: "12px",
            background: `${color}22`,
          }}
        >
          <Icon size={24} color={color} />
        </Box>
      </Group>
    </UltraCard>
  );

  const chartColors = [
    theme.colors.primary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
    theme.colors.info,
    theme.colors.accent,
  ];

  return (
    <Box style={{ background: theme.bg.surface, minHeight: "100vh" }}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <UltraCard variant="gradient" style={{ padding: "32px" }}>
            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Title order={1} c="white" fw={700}>
                  Welcome back, {userName}!
                </Title>
                <Text size="lg" c="rgba(255,255,255,0.9)">
                  Here's what's happening in your school today
                </Text>
              </Stack>
              <Box
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <MdSchool size={32} color="white" />
              </Box>
            </Group>
          </UltraCard>

          {/* Stats Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <StatCard
              title="Total Students"
              value={stats?.totalStudents}
              icon={MdPeople}
              color={theme.colors.primary}
              change="+12%"
              trend="up"
            />
            <StatCard
              title="Total Teachers"
              value={stats?.totalTeachers}
              icon={MdSchool}
              color={theme.colors.success}
              change="+5%"
              trend="up"
            />
            <StatCard
              title="Total Classes"
              value={stats?.totalClasses}
              icon={MdBook}
              color={theme.colors.warning}
              change="+2%"
              trend="up"
            />
            <StatCard
              title="Monthly Revenue"
              value={stats?.monthlyRevenue ? `₹${stats.monthlyRevenue.toLocaleString()}` : "₹0"}
              icon={MdAttachMoney}
              color={theme.colors.accent}
              change="+8%"
              trend="up"
            />
          </SimpleGrid>

          {/* Charts Section */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <UltraCard variant="glassmorphic" style={{ padding: "24px", height: "400px" }}>
                <Title order={3} mb="lg" c={theme.text.primary}>
                  Monthly Enrollment Trends
                </Title>
                {loading ? (
                  <Skeleton height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                      <XAxis dataKey="month" stroke={theme.text.muted} />
                      <YAxis stroke={theme.text.muted} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.bg.elevated,
                          border: `1px solid ${theme.border}`,
                          borderRadius: "12px",
                          color: theme.text.primary,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke={theme.colors.primary}
                        strokeWidth={3}
                        dot={{ fill: theme.colors.primary, strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </UltraCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <UltraCard variant="glassmorphic" style={{ padding: "24px", height: "400px" }}>
                <Title order={3} mb="lg" c={theme.text.primary}>
                  Class Distribution
                </Title>
                {loading ? (
                  <Skeleton height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={classStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="students"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {classStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.bg.elevated,
                          border: `1px solid ${theme.border}`,
                          borderRadius: "12px",
                          color: theme.text.primary,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </UltraCard>
            </Grid.Col>
          </Grid>

          {/* Recent Activity Section */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
                <Group justify="space-between" mb="lg">
                  <Title order={3} c={theme.text.primary}>
                    Recent Students
                  </Title>
                  <UltraButton variant="ghost" size="sm">
                    <Group gap="xs">
                      View All
                      <MdVisibility size={16} />
                    </Group>
                  </UltraButton>
                </Group>
                <Stack gap="md">
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <Skeleton key={index} height={60} />
                    ))
                  ) : (
                    recentActivity?.recentStudents?.slice(0, 5).map((student, index) => (
                      <Group key={index} justify="space-between" p="md" style={{
                        borderRadius: "12px",
                        background: theme.glassmorphism.hover,
                        border: `1px solid ${theme.border}`,
                      }}>
                        <Group>
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: theme.gradient.primary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text size="sm" fw={600} c="white">
                              {student.name?.charAt(0)?.toUpperCase()}
                            </Text>
                          </Box>
                          <Stack gap={2}>
                            <Text fw={500} c={theme.text.primary}>
                              {student.name}
                            </Text>
                            <Text size="sm" c={theme.text.muted}>
                              {student.class} - {student.admission_no}
                            </Text>
                          </Stack>
                        </Group>
                        <UltraTableBadge variant="success">New</UltraTableBadge>
                      </Group>
                    ))
                  )}
                </Stack>
              </UltraCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 6 }}>
              <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
                <Group justify="space-between" mb="lg">
                  <Title order={3} c={theme.text.primary}>
                    Upcoming Events
                  </Title>
                  <UltraButton variant="ghost" size="sm">
                    <Group gap="xs">
                      View All
                      <MdEvent size={16} />
                    </Group>
                  </UltraButton>
                </Group>
                <Stack gap="md">
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <Skeleton key={index} height={60} />
                    ))
                  ) : (
                    recentActivity?.upcomingEvents?.slice(0, 5).map((event, index) => (
                      <Group key={index} justify="space-between" p="md" style={{
                        borderRadius: "12px",
                        background: theme.glassmorphism.hover,
                        border: `1px solid ${theme.border}`,
                      }}>
                        <Group>
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "12px",
                              background: theme.colors.warning + "22",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <MdCalendarToday size={20} color={theme.colors.warning} />
                          </Box>
                          <Stack gap={2}>
                            <Text fw={500} c={theme.text.primary}>
                              {event.title}
                            </Text>
                            <Text size="sm" c={theme.text.muted}>
                              {event.date}
                            </Text>
                          </Stack>
                        </Group>
                        <UltraTableBadge variant="warning">Upcoming</UltraTableBadge>
                      </Group>
                    ))
                  )}
                </Stack>
              </UltraCard>
            </Grid.Col>
          </Grid>

          {/* Quick Actions */}
          <UltraCard variant="glassmorphic" style={{ padding: "24px" }}>
            <Title order={3} mb="lg" c={theme.text.primary}>
              Quick Actions
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="lg">
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdPeople size={24} />
                  <Text size="sm">Add Student</Text>
                </Stack>
              </UltraButton>
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdSchool size={24} />
                  <Text size="sm">Add Teacher</Text>
                </Stack>
              </UltraButton>
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdBook size={24} />
                  <Text size="sm">Add Class</Text>
                </Stack>
              </UltraButton>
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdPayment size={24} />
                  <Text size="sm">Fees</Text>
                </Stack>
              </UltraButton>
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdAssignment size={24} />
                  <Text size="sm">Exams</Text>
                </Stack>
              </UltraButton>
              <UltraButton variant="outline" size="lg" style={{ height: "80px" }}>
                <Stack gap="xs" align="center">
                  <MdEvent size={24} />
                  <Text size="sm">Events</Text>
                </Stack>
              </UltraButton>
            </SimpleGrid>
          </UltraCard>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
