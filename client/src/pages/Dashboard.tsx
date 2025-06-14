import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Text,
  Group,
  Stack,
  Card,
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Progress,
  Badge,
  ActionIcon,
  Skeleton,
  Container,
  Title,
  Table,
} from '@mantine/core';
import {
  IconUsers,
  IconSchool,
  IconCurrencyRupee,
  IconBooks,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendarEvent,
  IconClipboardList,
  IconEye,
  IconChevronRight,
} from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  totalBooks?: number;
  monthlyRevenue?: number;
  pendingFees?: number;
  totalBranches?: number;
  totalRevenue?: number;
  type: 'master_admin' | 'branch_admin';
}

interface RecentActivity {
  recentStudents: any[];
  recentPayments: any[];
  upcomingExams: any[];
  upcomingEvents: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem('user_role');
  const userName = localStorage.getItem('user_name') || 'User';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, activityRes, monthlyRes, classRes] = await Promise.all([
        axios.get('/api/dashboard/stats', { headers }),
        axios.get('/api/dashboard/recent-activities', { headers }),
        axios.get('/api/dashboard/monthly-stats', { headers }),
        axios.get('/api/dashboard/class-stats', { headers }),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setMonthlyData(monthlyRes.data);
      setClassStats(classRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, change }: any) => (
    <Card withBorder radius="md" p="xl">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {change && (
            <Group gap={5} mt={5}>
              {change > 0 ? (
                <IconTrendingUp size={14} color="green" />
              ) : (
                <IconTrendingDown size={14} color="red" />
              )}
              <Text size="xs" c={change > 0 ? 'green' : 'red'}>
                {Math.abs(change)}%
              </Text>
            </Group>
          )}
        </div>
        <ThemeIcon color={color} size={60} radius="md">
          {React.createElement(icon, { size: 24 })}
        </ThemeIcon>
      </Group>
    </Card>
  );

  const pieData = classStats.map((cls, index) => ({
    name: cls.className,
    value: cls.studentCount,
    fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5],
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
    <Container size="xl">
      <Stack gap="lg">
        {/* Welcome Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Welcome back, {userName}!</Title>
            <Text c="dimmed">Here's what's happening in your school today.</Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {stats?.type === 'master_admin' ? 'Master Admin' : 'Branch Admin'}
          </Badge>
        </Group>

        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          {stats?.type === 'master_admin' ? (
            <>
              <StatCard
                title="Total Branches"
                value={stats.totalBranches}
                icon={IconSchool}
                color="blue"
                change={5}
              />
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={IconUsers}
                color="green"
                change={8}
              />
              <StatCard
                title="Total Teachers"
                value={stats.totalTeachers}
                icon={IconSchool}
                color="orange"
                change={3}
              />
              <StatCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
                icon={IconCurrencyRupee}
                color="red"
                change={12}
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Students"
                value={stats?.totalStudents}
                icon={IconUsers}
                color="blue"
                change={5}
              />
              <StatCard
                title="Total Teachers"
                value={stats?.totalTeachers}
                icon={IconSchool}
                color="green"
                change={8}
              />
              <StatCard
                title="Total Classes"
                value={stats?.totalClasses}
                icon={IconClipboardList}
                color="orange"
                change={0}
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${stats?.monthlyRevenue?.toLocaleString() || 0}`}
                icon={IconCurrencyRupee}
                color="red"
                change={12}
              />
            </>
          )}
        </SimpleGrid>

        {/* Charts Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="md" p="lg" h={400}>
              <Group justify="space-between" mb="md">
                <Text fw={600}>Monthly Statistics</Text>
                <Badge variant="light">This Year</Badge>
              </Group>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="studentsAdmitted" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="feesCollected" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="lg" h={400}>
              <Text fw={600} mb="md">Students by Class</Text>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recent Activity */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Recent Students</Text>
                <ActionIcon variant="light" size="sm">
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
              <Stack gap="xs">
                {recentActivity?.recentStudents.slice(0, 5).map((student, index) => (
                  <Group key={index} justify="space-between" p="xs" style={{ borderRadius: 8, backgroundColor: '#f8f9fa' }}>
                    <Group>
                      <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                        <IconUsers size={16} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>{student.user?.name}</Text>
                        <Text size="xs" c="dimmed">{student.class?.name}</Text>
                      </div>
                    </Group>
                    <IconChevronRight size={16} />
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="md" p="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Upcoming Events</Text>
                <ActionIcon variant="light" size="sm">
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
              <Stack gap="xs">
                {recentActivity?.upcomingEvents.slice(0, 5).map((event, index) => (
                  <Group key={index} justify="space-between" p="xs" style={{ borderRadius: 8, backgroundColor: '#f8f9fa' }}>
                    <Group>
                      <ThemeIcon size={32} radius="xl" color="green" variant="light">
                        <IconCalendarEvent size={16} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>{event.title}</Text>
                        <Text size="xs" c="dimmed">{new Date(event.event_date).toLocaleDateString()}</Text>
                      </div>
                    </Group>
                    <IconChevronRight size={16} />
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Card withBorder radius="md" p="lg">
          <Text fw={600} mb="md">Quick Actions</Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }}>
              <Group>
                <ThemeIcon size={40} radius="md" color="blue">
                  <IconUsers size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>Add Student</Text>
                  <Text size="xs" c="dimmed">Register new student</Text>
                </div>
              </Group>
            </Card>
            <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }}>
              <Group>
                <ThemeIcon size={40} radius="md" color="green">
                  <IconCurrencyRupee size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>Collect Fee</Text>
                  <Text size="xs" c="dimmed">Record payment</Text>
                </div>
              </Group>
            </Card>
            <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }}>
              <Group>
                <ThemeIcon size={40} radius="md" color="orange">
                  <IconClipboardList size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>Add Exam</Text>
                  <Text size="xs" c="dimmed">Schedule examination</Text>
                </div>
              </Group>
            </Card>
            <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }}>
              <Group>
                <ThemeIcon size={40} radius="md" color="red">
                  <IconCalendarEvent size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>Create Event</Text>
                  <Text size="xs" c="dimmed">Add new event</Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>
        </Card>
      </Stack>
    </Container>
  );
};

export default Dashboard;
