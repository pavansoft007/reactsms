import {  useState, useEffect , ReactNode } from 'react';
import {
  Container,
  Paper,
  Title,
  Button,
  Group,
  Select,
  Grid,
  Card,
  Text,
  Stack,
  Table,
  Badge,
  SimpleGrid,
  RingProgress,
  Center,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconReportAnalytics,
  IconUsers,
  IconSchool,
  IconCoin,
  IconTrendingUp,
  IconDownload,
  IconCalendar,
  IconBook,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
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
import { UltraLoader } from "../components/ui";

interface ReportData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  monthlyEnrollments: Array<{ month: string; count: number }>;
  feeCollection: Array<{ month: string; amount: number }>;
  studentsByClass: Array<{ class_name: string; count: number }>;
  recentTransactions: Array<{
    id: number;
    student_name: string;
    amount: number;
    payment_date: string;
    status: string;
  }>;
}

interface Branch {
  id: number;
  name: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(),
  ]);

  useEffect(() => {
    fetchBranches();
    fetchReportData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedBranch, dateRange]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(response.data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock data for demonstration - replace with actual API calls
      const mockData: ReportData = {
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 45,
        totalRevenue: 125000,
        monthlyEnrollments: [
          { month: "Jan", count: 45 },
          { month: "Feb", count: 52 },
          { month: "Mar", count: 38 },
          { month: "Apr", count: 61 },
          { month: "May", count: 47 },
          { month: "Jun", count: 55 },
        ],
        feeCollection: [
          { month: "Jan", amount: 18500 },
          { month: "Feb", amount: 22000 },
          { month: "Mar", amount: 19500 },
          { month: "Apr", amount: 25000 },
          { month: "May", amount: 21000 },
          { month: "Jun", amount: 23500 },
        ],
        studentsByClass: [
          { class_name: "Class 1", count: 120 },
          { class_name: "Class 2", count: 115 },
          { class_name: "Class 3", count: 108 },
          { class_name: "Class 4", count: 95 },
          { class_name: "Class 5", count: 102 },
        ],
        recentTransactions: [
          {
            id: 1,
            student_name: "John Doe",
            amount: 1500,
            payment_date: "2024-01-15",
            status: "paid",
          },
          {
            id: 2,
            student_name: "Jane Smith",
            amount: 1200,
            payment_date: "2024-01-14",
            status: "paid",
          },
          {
            id: 3,
            student_name: "Bob Johnson",
            amount: 1800,
            payment_date: "2024-01-13",
            status: "pending",
          },
        ],
      };

      setReportData(mockData);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch report data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    notifications.show({
      title: "Export Started",
      message: "Report export will be ready shortly",
      color: "blue",
    });
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
  }) => (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="sm" fw={500} tt="uppercase">
            {title}
          </Text>
          <Text fw={700} size="xl">
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
        </div>
        <ThemeIcon color={color} size="xl" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
  if (!reportData) {
    return (
      <Container size="xl" py="md">
        <UltraLoader
          fullscreen
          size="lg"
          message="Loading reports and analytics..."
          variant="detailed"
        />
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconReportAnalytics size={28} style={{ marginRight: 8 }} />
            Reports & Analytics
          </Title>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </Group>
        {/* Filters */}
        <Paper shadow="xs" p="md" mb="md" withBorder>
          <Group justify="space-between">
            <Select
              label="Branch"
              placeholder="Select branch"
              data={[
                { value: "all", label: "All Branches" },
                ...branches.map((branch) => ({
                  value: branch.id.toString(),
                  label: branch.name,
                })),
              ]}
              value={selectedBranch}
              onChange={(value) => setSelectedBranch(value || "all")}
              style={{ minWidth: 200 }}
            />
            <DatePickerInput
              type="range"
              label="Date Range"
              placeholder="Select date range"
              value={dateRange}
              onChange={(value) =>
                setDateRange(value as unknown as [Date | null, Date | null])
              }
              style={{ minWidth: 250 }}
            />
          </Group>
        </Paper>{" "}
        <div style={{ position: "relative" }}>
          {loading && (
            <UltraLoader
              fullscreen
              size="lg"
              message="Updating report data..."
              variant="detailed"
            />
          )}

          {/* Summary Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
            <StatCard
              title="Total Students"
              value={reportData.totalStudents}
              icon={<IconUsers size={20} />}
              color="blue"
            />
            <StatCard
              title="Total Teachers"
              value={reportData.totalTeachers}
              icon={<IconSchool size={20} />}
              color="green"
            />
            <StatCard
              title="Total Classes"
              value={reportData.totalClasses}
              icon={<IconBook size={20} />}
              color="orange"
            />
            <StatCard
              title="Total Revenue"
              value={`$${reportData.totalRevenue.toLocaleString()}`}
              icon={<IconCoin size={20} />}
              color="red"
            />
          </SimpleGrid>

          {/* Charts */}
          <Grid mb="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={3} mb="md">
                  Monthly Enrollments
                </Title>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyEnrollments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#228be6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={3} mb="md">
                  Students by Class
                </Title>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.studentsByClass}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ class_name, count }) =>
                        `${class_name}: ${count}`
                      }
                    >
                      {reportData.studentsByClass.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Fee Collection Chart */}
          <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
            <Title order={3} mb="md">
              Monthly Fee Collection
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.feeCollection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#40c057" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Transactions */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              Recent Fee Payments
            </Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student Name</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Payment Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reportData.recentTransactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>{transaction.student_name}</Table.Td>
                    <Table.Td>${transaction.amount.toLocaleString()}</Table.Td>
                    <Table.Td>
                      {new Date(transaction.payment_date).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          transaction.status === "paid" ? "green" : "orange"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </div>
      </Paper>
    </Container>
  );
};

export default ReportsPage;
