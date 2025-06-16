import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Avatar,
  Stack,
} from "@mantine/core";
import {
  IconCurrencyRupee,
  IconPlus,
  IconSearch,
  IconEdit,
  IconReceipt,
  IconFileText,
  IconCreditCard,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
  UltraModal,
} from "../components/ui";
import api from "../api/config";
import { useTheme } from "../context/ThemeContext";
import { useAcademicYear } from "../context/AcademicYearContext";

interface Fee {
  id: number;
  student_name: string;
  student_id: number;
  class_name: string;
  amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  payment_date?: string;
  status: "paid" | "pending" | "overdue" | "partial";
  fee_type: string;
  receipt_number?: string;
  session_id: number;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  class_name: string;
}

interface FeeType {
  id: number;
  name: string;
  amount: number;
}

const FeesPageUltra: React.FC = () => {
  const { theme } = useTheme();
  const { academicYear } = useAcademicYear();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    fee_type: "",
    amount: "",
    due_date: "",
    payment_date: "",
    paid_amount: "",
    status: "pending",
  });

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = academicYear?.id ? `?session_id=${academicYear.id}` : "";
      const response = await api.get(`/fees${params}`);
      if (response.data.success) {
        setFees(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch fees",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await api.get("/fee-types");
      if (response.data.success) {
        setFeeTypes(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fee types:", error);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      if (academicYear) {
        await fetchFees();
      }
      await fetchStudents();
      await fetchFeeTypes();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingFee ? `/fees/${editingFee.id}` : "/fees";
      const method = editingFee ? "put" : "post";

      const response = await api[method](url, {
        ...formData,
        session_id: academicYear?.id,
      });

      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: `Fee record ${
            editingFee ? "updated" : "created"
          } successfully`,
          color: "green",
        });
        setModalOpen(false);
        resetForm();
        fetchFees();
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Operation failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setFormData({
      student_id: fee.student_id.toString(),
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      due_date: fee.due_date,
      payment_date: fee.payment_date || "",
      paid_amount: fee.paid_amount.toString(),
      status: fee.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this fee record?"))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/fees/${id}`);
      if (response.data.success) {
        notifications.show({
          title: "Success",
          message: "Fee record deleted successfully",
          color: "green",
        });
        fetchFees();
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete fee record",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      fee_type: "",
      amount: "",
      due_date: "",
      payment_date: "",
      paid_amount: "",
      status: "pending",
    });
    setEditingFee(null);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  // Filter fees based on search and filters
  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesClass =
      classFilter === "all" || fee.class_name === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  // Calculate stats
  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidAmount = fees.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const pendingAmount = fees.reduce((sum, fee) => sum + fee.pending_amount, 0);
  const overdueCount = fees.filter((fee) => fee.status === "overdue").length;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
        return "error";
      case "partial":
        return "info";
      default:
        return "default";
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
              Fees Management
            </Title>
            <Text c="dimmed" size="lg" mt="xs">
              Manage fee collection, payment tracking, and receipts
            </Text>{" "}
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
            Add Fee Record
          </UltraButton>
        </Group>
      </UltraCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-blue-500/20 text-blue-400 mb-4">
            <IconCurrencyRupee size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {formatCurrency(totalAmount)}
          </Text>
          <Text c="dimmed" size="sm">
            Total Fees
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-green-500/20 text-green-400 mb-4">
            <IconCreditCard size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {formatCurrency(paidAmount)}
          </Text>
          <Text c="dimmed" size="sm">
            Collected
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-orange-500/20 text-orange-400 mb-4">
            <IconFileText size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {formatCurrency(pendingAmount)}
          </Text>
          <Text c="dimmed" size="sm">
            Pending
          </Text>
        </UltraCard>

        <UltraCard className="text-center">
          <div className="ultra-stat-icon bg-red-500/20 text-red-400 mb-4">
            <IconReceipt size={32} />
          </div>
          <Text size="2xl" fw={700} className="ultra-gradient-text">
            {overdueCount}
          </Text>
          <Text c="dimmed" size="sm">
            Overdue
          </Text>
        </UltraCard>
      </div>

      {/* Filters */}
      <UltraCard className="mb-6">
        <Group gap="md">
          <UltraInput
            placeholder="Search fees..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <UltraSelect
            placeholder="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: "All Status" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "overdue", label: "Overdue" },
              { value: "partial", label: "Partial" },
            ]}
            style={{ minWidth: 150 }}
          />
          <UltraSelect
            placeholder="Class"
            value={classFilter}
            onChange={(value) => setClassFilter(value || "all")}
            data={[
              { value: "all", label: "All Classes" },
              ...Array.from(new Set(fees.map((fee) => fee.class_name))).map(
                (className) => ({
                  value: className,
                  label: className,
                })
              ),
            ]}
            style={{ minWidth: 200 }}
          />
        </Group>
      </UltraCard>

      {/* Fees Table */}
      <UltraCard>
        {loading ? (
          <Center h={200}>
            <Loader size="lg" />
          </Center>
        ) : (
          <UltraTable variant="glass" hoverable>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr key={fee.id}>
                  <td>
                    <Group gap="sm">
                      <Avatar
                        radius="xl"
                        size="md"
                        style={{
                          border: `2px solid ${theme.colors.primary}22`,
                        }}
                      >
                        {fee.student_name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={500} c={theme.text.primary}>
                          {fee.student_name}
                        </Text>
                        <Text size="sm" c={theme.text.muted}>
                          ID: {fee.student_id}
                        </Text>
                      </Stack>
                    </Group>
                  </td>
                  <td>
                    <Text fw={500} c={theme.text.primary}>
                      {fee.class_name}
                    </Text>
                  </td>
                  <td>
                    <Badge variant="light" color="blue" size="sm">
                      {fee.fee_type}
                    </Badge>
                  </td>
                  <td>
                    <Text fw={500} c={theme.text.primary}>
                      {formatCurrency(fee.amount)}
                    </Text>
                  </td>
                  <td>
                    <Text fw={500} c="green" size="sm">
                      {formatCurrency(fee.paid_amount)}
                    </Text>
                  </td>
                  <td>
                    <Text fw={500} c="orange" size="sm">
                      {formatCurrency(fee.pending_amount)}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm" c={theme.text.primary}>
                      {new Date(fee.due_date).toLocaleDateString()}
                    </Text>
                  </td>
                  <td>
                    <UltraTableBadge variant={getStatusVariant(fee.status)}>
                      {fee.status}
                    </UltraTableBadge>
                  </td>
                  <td>
                    <UltraTableActions>
                      <UltraButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(fee)}
                      >
                        <IconEdit size={16} />
                      </UltraButton>
                      <UltraButton variant="ghost" size="sm">
                        <IconReceipt size={16} />
                      </UltraButton>
                      <UltraButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(fee.id)}
                      >
                        <IconCurrencyRupee size={16} />
                      </UltraButton>
                    </UltraTableActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </UltraTable>
        )}
      </UltraCard>

      {/* Add/Edit Modal */}
      <UltraModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFee ? "Edit Fee Record" : "Add New Fee Record"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UltraSelect
              label="Student"
              placeholder="Select student"
              value={formData.student_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, student_id: value || "" }))
              }
              data={students.map((student) => ({
                value: student.id.toString(),
                label: `${student.name} (${student.admission_no})`,
              }))}
              required
            />
            <UltraSelect
              label="Fee Type"
              placeholder="Select fee type"
              value={formData.fee_type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, fee_type: value || "" }))
              }
              data={feeTypes.map((type) => ({
                value: type.name,
                label: `${type.name} - ${formatCurrency(type.amount)}`,
              }))}
              required
            />
            <UltraInput
              label="Amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, due_date: e.target.value }))
              }
              required
            />
            <UltraInput
              label="Paid Amount"
              type="number"
              placeholder="Enter paid amount"
              value={formData.paid_amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paid_amount: e.target.value,
                }))
              }
            />
            <UltraInput
              label="Payment Date"
              type="date"
              value={formData.payment_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
            />
            <UltraSelect
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value || "pending" }))
              }
              data={[
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "partial", label: "Partial" },
                { value: "overdue", label: "Overdue" },
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
              leftSection={
                editingFee ? <IconEdit size={16} /> : <IconPlus size={16} />
              }
              onClick={handleSubmit}
            >
              {editingFee ? "Update Fee Record" : "Add Fee Record"}
            </UltraButton>
          </Group>
        </form>
      </UltraModal>
    </Container>
  );
};

export default FeesPageUltra;
