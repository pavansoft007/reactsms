import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import {
  IconReportAnalytics,
  IconPlus,
  IconSearch,
  IconDownload,
  IconCalendar,
  IconUsers,
  IconSchool,
  IconCoin,
  IconTrendingUp,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraModal,
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";

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

interface Report {
  id: number;
  title: string;
  description: string;
  type: "financial" | "academic" | "attendance" | "performance";
  generated_at: string;
  generated_by: string;
  file_path?: string;
  parameters?: any;
}

const ReportsPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const { academicYear } = useAcademicYear();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Form state for generating new reports
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "academic",
    date_from: "",
    date_to: "",
    class_id: "",
    include_charts: true,
    format: "pdf",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [reportsResponse, dashboardResponse] = await Promise.all([
          api.get("/reports"),
          api.get("/dashboard/stats"),
        ]);

        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.data || []);
        }

        if (dashboardResponse.data.success) {
          setReportData(dashboardResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch reports data",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/reports/generate", {
        ...formData,
        session_id: academicYear?.id,
      });

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Report generated successfully",
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        // Refresh reports
        const reportsResponse = await api.get("/reports");
        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to generate report",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const response = await api.get(`/reports/${report.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: "Success",
        message: "Report downloaded successfully",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to download report",
        color: "red",
      });
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    setLoading(true);
    try {
      const response = await api.delete(`/reports/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Report deleted successfully",
          color: "green",
        });
        // Refresh reports
        const reportsResponse = await api.get("/reports");
        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.data || []);
        }
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete report",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "academic",
      date_from: "",
      date_to: "",
      class_id: "",
      include_charts: true,
      format: "pdf",
    });
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter reports based on search and filters
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial":
        return "green";
      case "academic":
        return "blue";
      case "attendance":
        return "orange";
      case "performance":
        return "purple";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Container size="xl" className="ultra-container">
      {/* Header */}
      <UltraCard className="mb-6">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title
              order={2}
              className="ultra-gradient-text"
              style={{ fontSize: "2rem", fontWeight: 700 }}
            >
              Reports & Analytics
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Generate and manage school reports, analytics, and insights
            </Text>
            {academicYear && (
              <Badge variant="light" color="blue" mt="sm">
                Academic Year: {academicYear.school_year}
              </Badge>
            )}
          </div>
          <UltraButton
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
            size="lg"
            className="pulse-button"
          >
            Generate Report
          </UltraButton>
        </Group>
      </UltraCard>

      {/* Stats Overview */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <UltraCard className="text-center">
            <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
              <IconUsers size={32} />
            </div>
            <Text size="2xl" fw={700} className="ultra-gradient-text">
              {reportData.totalStudents}
            </Text>
            <Text c="dimmed" size="sm">
              Total Students
            </Text>
          </UltraCard>

          <UltraCard className="text-center">
            <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
              <IconSchool size={32} />
            </div>
            <Text size="2xl" fw={700} className="ultra-gradient-text">
              {reportData.totalTeachers}
            </Text>
            <Text c="dimmed" size="sm">
              Teachers
            </Text>
          </UltraCard>

          <UltraCard className="text-center">
            <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
              <IconSchool size={32} />
            </div>
            <Text size="2xl" fw={700} className="ultra-gradient-text">
              {reportData.totalClasses}
            </Text>
            <Text c="dimmed" size="sm">
              Classes
            </Text>
          </UltraCard>

          <UltraCard className="text-center">
            <div className="ultra-stat-icon bg-purple-500/20 text-purple-400 mb-4">
              <IconCoin size={32} />
            </div>
            <Text size="2xl" fw={700} className="ultra-gradient-text">
              {formatCurrency(reportData.totalRevenue)}
            </Text>
            <Text c="dimmed" size="sm">
              Revenue
            </Text>
          </UltraCard>
        </div>
      )}

      {/* Quick Report Actions */}
      <UltraCard className="mb-6">
        <Text size="lg" fw={600} mb="md">
          Quick Reports
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <UltraButton variant="outline" size="lg">
            <Stack align="center" gap="xs">
              <IconUsers size={24} />
              <Text size="sm">Student Report</Text>
            </Stack>
          </UltraButton>
          <UltraButton variant="outline" size="lg">
            <Stack align="center" gap="xs">
              <IconCoin size={24} />
              <Text size="sm">Fee Collection</Text>
            </Stack>
          </UltraButton>
          <UltraButton variant="outline" size="lg">
            <Stack align="center" gap="xs">
              <IconCalendar size={24} />
              <Text size="sm">Attendance Report</Text>
            </Stack>
          </UltraButton>
          <UltraButton variant="outline" size="lg">
            <Stack align="center" gap="xs">
              <IconTrendingUp size={24} />
              <Text size="sm">Performance Analytics</Text>
            </Stack>
          </UltraButton>
        </SimpleGrid>
      </UltraCard>

      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search reports..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Report Type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
            data={[
              { value: "all", label: "All Types" },
              { value: "financial", label: "Financial" },
              { value: "academic", label: "Academic" },
              { value: "attendance", label: "Attendance" },
              { value: "performance", label: "Performance" },
            ]}
            style={{ minWidth: 150 }}
          />
          <UltraSelect
            placeholder="Date Range"
            value={dateFilter}
            onChange={(value) => setDateFilter(value || "all")}
            data={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "year", label: "This Year" },
            ]}
            style={{ minWidth: 120 }}
          />
        </Group>
      </UltraCard>

      {/* Reports Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Type</th>
                <th>Generated By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <Stack gap={2}>
                      <Text fw={500} c={theme.text.primary}>
                        {report.title}
                      </Text>
                      <Text size="sm" c={theme.text.muted}>
                        {report.description}
                      </Text>
                    </Stack>
                  </td>
                  <td>
                    <Badge
                      variant="light"
                      color={getTypeColor(report.type)}
                      size="sm"
                    >
                      {report.type}
                    </Badge>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {report.generated_by}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {new Date(report.generated_at).toLocaleDateString()}
                    </Text>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <IconDownload size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <IconReportAnalytics size={16} />
                      </UltraButton>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>

      {/* Generate Report Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate New Report"
        size="lg"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="space-y-4">
            <UltraInput
              label="Report Title"
              placeholder="Enter report title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <UltraInput
              label="Description"
              placeholder="Enter report description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <UltraSelect
              label="Report Type"
              value={formData.type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value || "academic" }))
              }
              data={[
                { value: "academic", label: "Academic Report" },
                { value: "financial", label: "Financial Report" },
                { value: "attendance", label: "Attendance Report" },
                { value: "performance", label: "Performance Report" },
              ]}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UltraInput
                label="From Date"
                type="date"
                value={formData.date_from}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date_from: e.target.value,
                  }))
                }
                required
              />
              <UltraInput
                label="To Date"
                type="date"
                value={formData.date_to}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date_to: e.target.value }))
                }
                required
              />
            </div>

            <UltraSelect
              label="Output Format"
              value={formData.format}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, format: value || "pdf" }))
              }
              data={[
                { value: "pdf", label: "PDF Document" },
                { value: "excel", label: "Excel Spreadsheet" },
                { value: "csv", label: "CSV File" },
              ]}
              required
            />
          </div>

          <Group justify="flex-end" mt="xl">
            <UltraButton
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </UltraButton>
            <UltraButton
              variant="primary"
              loading={loading}
              leftSection={<IconReportAnalytics size={16} />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default ReportsPageUltra;
