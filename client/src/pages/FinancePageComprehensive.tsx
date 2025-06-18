import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Badge,
  ActionIcon,
  Menu,
  Button,
  Modal,
  Tabs,
  Paper,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  Table,
  ScrollArea,
  Notification,
  Loader,
  Center,
  RingProgress,
  ThemeIcon,
  Flex,
  Box,
  Divider,
} from "@mantine/core";
import {
  IconCurrencyRupee,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconEye,
  IconReceipt,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconX,
  IconFileInvoice,
  IconCreditCard,
  IconTrendingUp,
  IconUsers,
  IconCalendar,
  IconFilter,
  IconDownload,
  IconPrinter,
  IconMail,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import api from "../api/config";
import { UltraLoader } from "../components/ui";

// Import components
import FeeTypesManagement from "../components/FeeTypesManagement";
import FeeCollectionInterface from "../components/FeeCollectionInterface";
import InvoiceManagement from "../components/InvoiceManagement";
import FinancialReports from "../components/FinancialReports";

interface DashboardStats {
  totalCollected: number;
  monthlyCollected: number;
  pendingFees: number;
  overdueFees: number;
  totalStudents: number;
  activeFeesCount: number;
}

interface FeeType {
  id: number;
  name: string;
  description?: string;
  amount: number;
  frequency: "one-time" | "monthly" | "quarterly" | "annual";
  is_active: boolean;
  applicable_to: "all" | "class";
  class_id?: number;
  branch_id: number;
  created_at: string;
  branch?: {
    id: number;
    school_name: string;
  };
  class?: {
    id: number;
    name: string;
  };
}

interface Fee {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount: number;
  due_date: string;
  status: "pending" | "partial" | "paid" | "overdue";
  paid_amount: number;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  remarks?: string;
  academic_year?: string;
  term?: string;
  student?: {
    id: number;
    first_name: string;
    last_name: string;
    register_no: string;
    enrolledClass?: {
      id: number;
      name: string;
    };
  };
  feeType?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  register_no: string;
  class_id: number;
  section_id: number;
}

const FinancePageComprehensive = () => {
  const [activeTab, setActiveTab] = useState<string | null>("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [
    feeTypeModalOpened,
    { open: openFeeTypeModal, close: closeFeeTypeModal },
  ] = useDisclosure(false);
  const [
    feeAssignModalOpened,
    { open: openFeeAssignModal, close: closeFeeAssignModal },
  ] = useDisclosure(false);
  const [
    paymentModalOpened,
    { open: openPaymentModal, close: closePaymentModal },
  ] = useDisclosure(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  // Forms
  const feeTypeForm = useForm({
    initialValues: {
      name: "",
      description: "",
      amount: 0,
      frequency: "one-time",
      applicable_to: "all",
      class_id: null as number | null,
      is_active: true,
    },
  });

  const feeAssignForm = useForm({
    initialValues: {
      student_ids: [],
      fee_type_id: null,
      amount: 0,
      due_date: new Date(),
      academic_year: new Date().getFullYear().toString(),
      term: "Term 1",
    },
  });

  const paymentForm = useForm({
    initialValues: {
      amount_paid: 0,
      payment_method: "",
      transaction_id: "",
      remarks: "",
      discount: 0,
      fine: 0,
    },
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    class_id: "",
    fee_type_id: "",
    overdue_only: false,
  });

  // Load initial data
  useEffect(() => {
    loadDashboardStats();
    loadFeeTypes();
    loadFees();
    loadStudents();
    loadClasses();
  }, []);

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/finance/dashboard-stats");
      setDashboardStats(response.data.data);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load dashboard statistics",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load fee types
  const loadFeeTypes = async (page = 1, search = "") => {
    try {
      const response = await api.get("/api/finance/fee-types", {
        params: { page, limit: pagination.limit, search },
      });
      setFeeTypes(response.data.data.feeTypes);
      setPagination((prev) => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load fee types",
        color: "red",
      });
    }
  };

  // Load fees
  const loadFees = async (page = 1) => {
    try {
      const response = await api.get("/api/finance/fees", {
        params: { page, limit: pagination.limit, ...filters },
      });
      setFees(response.data.data.fees);
      setPagination((prev) => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load fees",
        color: "red",
      });
    }
  };

  // Load students
  const loadStudents = async () => {
    try {
      const response = await api.get("/api/students");
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  // Load classes
  const loadClasses = async () => {
    try {
      const response = await api.get("/api/classes");
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  // Handle fee type submission
  const handleFeeTypeSubmit = async (values: any) => {
    try {
      if (editingFeeType) {
        await api.put(`/api/finance/fee-types/${editingFeeType.id}`, values);
        notifications.show({
          title: "Success",
          message: "Fee type updated successfully",
          color: "green",
        });
      } else {
        await api.post("/api/finance/fee-types", values);
        notifications.show({
          title: "Success",
          message: "Fee type created successfully",
          color: "green",
        });
      }
      closeFeeTypeModal();
      loadFeeTypes();
      feeTypeForm.reset();
      setEditingFeeType(null);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to save fee type",
        color: "red",
      });
    }
  };

  // Handle fee assignment
  const handleFeeAssign = async (values: any) => {
    try {
      await api.post("/api/finance/fees", values);
      notifications.show({
        title: "Success",
        message: "Fees assigned successfully",
        color: "green",
      });
      closeFeeAssignModal();
      loadFees();
      feeAssignForm.reset();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to assign fees",
        color: "red",
      });
    }
  };

  // Handle payment collection
  const handlePaymentCollect = async (values: any) => {
    if (!selectedFee) return;

    try {
      await api.post(`/api/finance/fees/${selectedFee.id}/collect`, values);
      notifications.show({
        title: "Success",
        message: "Payment collected successfully",
        color: "green",
      });
      closePaymentModal();
      loadFees();
      loadDashboardStats();
      paymentForm.reset();
      setSelectedFee(null);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to collect payment",
        color: "red",
      });
    }
  };

  // Handle fee type deletion
  const handleFeeTypeDelete = (feeType: FeeType) => {
    modals.openConfirmModal({
      title: "Delete Fee Type",
      children: (
        <Text size="sm">
          Are you sure you want to delete this fee type? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await api.delete(`/api/finance/fee-types/${feeType.id}`);
          notifications.show({
            title: "Success",
            message: "Fee type deleted successfully",
            color: "green",
          });
          loadFeeTypes();
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message:
              error.response?.data?.message || "Failed to delete fee type",
            color: "red",
          });
        }
      },
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "green";
      case "partial":
        return "blue";
      case "overdue":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };
  // Dashboard statistics cards
  const renderDashboardStats = () => {
    if (!dashboardStats)
      return (
        <UltraLoader
          size="md"
          message="Loading financial dashboard..."
          variant="minimal"
        />
      );

    const stats = [
      {
        title: "Total Collected",
        value: `₹${dashboardStats.totalCollected.toLocaleString()}`,
        icon: IconCurrencyRupee,
        color: "green",
      },
      {
        title: "Monthly Collection",
        value: `₹${dashboardStats.monthlyCollected.toLocaleString()}`,
        icon: IconTrendingUp,
        color: "blue",
      },
      {
        title: "Pending Fees",
        value: `₹${dashboardStats.pendingFees.toLocaleString()}`,
        icon: IconClock,
        color: "yellow",
      },
      {
        title: "Overdue Fees",
        value: dashboardStats.overdueFees.toString(),
        icon: IconAlertTriangle,
        color: "red",
      },
      {
        title: "Total Students",
        value: dashboardStats.totalStudents.toString(),
        icon: IconUsers,
        color: "indigo",
      },
      {
        title: "Active Fees",
        value: dashboardStats.activeFeesCount.toString(),
        icon: IconFileInvoice,
        color: "teal",
      },
    ];

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {stats.map((stat) => (
          <Card key={stat.title} withBorder radius="md" p="xl">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
              </div>
              <ThemeIcon
                color={stat.color}
                variant="light"
                size={60}
                radius="md"
              >
                <stat.icon size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    );
  };

  // Fee types table
  const renderFeeTypesTable = () => (
    <Card withBorder radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Fee Types</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingFeeType(null);
            feeTypeForm.reset();
            openFeeTypeModal();
          }}
        >
          Add Fee Type
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Frequency</Table.Th>
              <Table.Th>Applicable To</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {feeTypes.map((feeType) => (
              <Table.Tr key={feeType.id}>
                <Table.Td>
                  <div>
                    <Text fw={500}>{feeType.name}</Text>
                    {feeType.description && (
                      <Text size="sm" c="dimmed">
                        {feeType.description}
                      </Text>
                    )}
                  </div>
                </Table.Td>
                <Table.Td>₹{feeType.amount.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Badge variant="light">
                    {feeType.frequency.replace("-", " ")}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {feeType.applicable_to === "class"
                    ? feeType.class?.name || "Specific Class"
                    : "All Students"}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={feeType.is_active ? "green" : "red"}
                    variant="light"
                  >
                    {feeType.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => {
                        setEditingFeeType(feeType);
                        feeTypeForm.setValues(feeType);
                        openFeeTypeModal();
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleFeeTypeDelete(feeType)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );

  // Fees management table
  const renderFeesTable = () => (
    <Card withBorder radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Fee Management</Title>
        <Group>
          <Button variant="light" leftSection={<IconFilter size={16} />}>
            Filters
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openFeeAssignModal}
          >
            Assign Fees
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Fee Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Paid</Table.Th>
              <Table.Th>Balance</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {fees.map((fee) => (
              <Table.Tr key={fee.id}>
                <Table.Td>
                  <div>
                    <Text fw={500}>
                      {fee.student?.first_name} {fee.student?.last_name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {fee.student?.register_no} •{" "}
                      {fee.student?.enrolledClass?.name}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>{fee.feeType?.name}</Table.Td>
                <Table.Td>₹{fee.amount.toLocaleString()}</Table.Td>
                <Table.Td>₹{fee.paid_amount.toLocaleString()}</Table.Td>
                <Table.Td>
                  ₹{(fee.amount - fee.paid_amount).toLocaleString()}
                </Table.Td>
                <Table.Td>
                  {new Date(fee.due_date).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(fee.status)} variant="light">
                    {fee.status.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {fee.status !== "paid" && (
                      <ActionIcon
                        variant="light"
                        color="green"
                        onClick={() => {
                          setSelectedFee(fee);
                          paymentForm.setValues({
                            amount_paid: fee.amount - fee.paid_amount,
                            payment_method: "cash",
                            transaction_id: "",
                            remarks: "",
                            discount: 0,
                            fine: 0,
                          });
                          openPaymentModal();
                        }}
                      >
                        <IconCreditCard size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon variant="light" color="blue">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="indigo">
                      <IconReceipt size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Finance Management</Title>
          <Text c="dimmed">
            Comprehensive fee collection and payment tracking
          </Text>
        </div>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab
            value="dashboard"
            leftSection={<IconTrendingUp size={16} />}
          >
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab
            value="fee-types"
            leftSection={<IconFileInvoice size={16} />}
          >
            Fee Types
          </Tabs.Tab>
          <Tabs.Tab value="fees" leftSection={<IconCurrencyRupee size={16} />}>
            Fee Management
          </Tabs.Tab>
          <Tabs.Tab
            value="collection"
            leftSection={<IconCreditCard size={16} />}
          >
            Collection
          </Tabs.Tab>
          <Tabs.Tab value="invoices" leftSection={<IconReceipt size={16} />}>
            Invoices
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconDownload size={16} />}>
            Reports
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dashboard" pt="xl">
          <Stack gap="xl">
            {renderDashboardStats()}

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <Card withBorder radius="md" p="xl">
                <Title order={4} mb="md">
                  Recent Collections
                </Title>
                <Text c="dimmed">Last 5 payments collected</Text>
                {/* Add recent collections table */}
              </Card>

              <Card withBorder radius="md" p="xl">
                <Title order={4} mb="md">
                  Overdue Payments
                </Title>
                <Text c="dimmed">Students with overdue fees</Text>
                {/* Add overdue payments list */}
              </Card>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>{" "}
        <Tabs.Panel value="fee-types" pt="xl">
          <FeeTypesManagement />
        </Tabs.Panel>
        <Tabs.Panel value="fees" pt="xl">
          {renderFeesTable()}
        </Tabs.Panel>
        <Tabs.Panel value="collection" pt="xl">
          <FeeCollectionInterface />
        </Tabs.Panel>
        <Tabs.Panel value="invoices" pt="xl">
          <InvoiceManagement />
        </Tabs.Panel>
        <Tabs.Panel value="reports" pt="xl">
          <FinancialReports />
        </Tabs.Panel>
      </Tabs>

      {/* Fee Type Modal */}
      <Modal
        opened={feeTypeModalOpened}
        onClose={closeFeeTypeModal}
        title={editingFeeType ? "Edit Fee Type" : "Add Fee Type"}
        size="md"
      >
        <form onSubmit={feeTypeForm.onSubmit(handleFeeTypeSubmit)}>
          <Stack>
            <TextInput
              label="Fee Type Name"
              placeholder="e.g., Tuition Fee"
              required
              {...feeTypeForm.getInputProps("name")}
            />

            <Textarea
              label="Description"
              placeholder="Optional description"
              {...feeTypeForm.getInputProps("description")}
            />

            <NumberInput
              label="Amount"
              placeholder="0"
              min={0}
              prefix="₹"
              required
              {...feeTypeForm.getInputProps("amount")}
            />

            <Select
              label="Frequency"
              data={[
                { value: "one-time", label: "One Time" },
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "annual", label: "Annual" },
              ]}
              {...feeTypeForm.getInputProps("frequency")}
            />

            <Select
              label="Applicable To"
              data={[
                { value: "all", label: "All Students" },
                { value: "class", label: "Specific Class" },
              ]}
              {...feeTypeForm.getInputProps("applicable_to")}
            />

            {feeTypeForm.values.applicable_to === "class" && (
              <Select
                label="Class"
                placeholder="Select class"
                data={classes.map((cls) => ({
                  value: cls.id.toString(),
                  label: cls.name,
                }))}
                {...feeTypeForm.getInputProps("class_id")}
              />
            )}

            <Group justify="flex-end">
              <Button type="submit">
                {editingFeeType ? "Update" : "Create"} Fee Type
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Fee Assignment Modal */}
      <Modal
        opened={feeAssignModalOpened}
        onClose={closeFeeAssignModal}
        title="Assign Fees to Students"
        size="lg"
      >
        <form onSubmit={feeAssignForm.onSubmit(handleFeeAssign)}>
          <Stack>
            <Select
              label="Fee Type"
              placeholder="Select fee type"
              required
              data={feeTypes.map((ft) => ({
                value: ft.id.toString(),
                label: `${ft.name} - ₹${ft.amount}`,
              }))}
              {...feeAssignForm.getInputProps("fee_type_id")}
            />

            <NumberInput
              label="Amount"
              placeholder="0"
              min={0}
              prefix="₹"
              required
              {...feeAssignForm.getInputProps("amount")}
            />

            <DatePickerInput
              label="Due Date"
              required
              {...feeAssignForm.getInputProps("due_date")}
            />

            <TextInput
              label="Academic Year"
              placeholder="2024-2025"
              {...feeAssignForm.getInputProps("academic_year")}
            />

            <Select
              label="Term"
              data={[
                { value: "Term 1", label: "Term 1" },
                { value: "Term 2", label: "Term 2" },
                { value: "Term 3", label: "Term 3" },
              ]}
              {...feeAssignForm.getInputProps("term")}
            />

            {/* Student selection would go here */}
            <Text size="sm" c="dimmed">
              Student selection interface would be implemented here
            </Text>

            <Group justify="flex-end">
              <Button type="submit">Assign Fees</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Payment Collection Modal */}
      <Modal
        opened={paymentModalOpened}
        onClose={closePaymentModal}
        title={`Collect Payment - ${selectedFee?.student?.first_name} ${selectedFee?.student?.last_name}`}
        size="md"
      >
        {selectedFee && (
          <form onSubmit={paymentForm.onSubmit(handlePaymentCollect)}>
            <Stack>
              <Paper withBorder p="md" bg="gray.0">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Fee Type:
                    </Text>
                    <Text size="sm">{selectedFee.feeType?.name}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Total Amount:
                    </Text>
                    <Text size="sm">
                      ₹{selectedFee.amount.toLocaleString()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Paid Amount:
                    </Text>
                    <Text size="sm">
                      ₹{selectedFee.paid_amount.toLocaleString()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500} c="red">
                      Balance:
                    </Text>
                    <Text size="sm" fw={700} c="red">
                      ₹
                      {(
                        selectedFee.amount - selectedFee.paid_amount
                      ).toLocaleString()}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              <NumberInput
                label="Payment Amount"
                placeholder="0"
                min={0}
                max={selectedFee.amount - selectedFee.paid_amount}
                prefix="₹"
                required
                {...paymentForm.getInputProps("amount_paid")}
              />

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                required
                data={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "upi", label: "UPI" },
                  { value: "cheque", label: "Cheque" },
                ]}
                {...paymentForm.getInputProps("payment_method")}
              />

              <TextInput
                label="Transaction ID"
                placeholder="Optional transaction reference"
                {...paymentForm.getInputProps("transaction_id")}
              />

              <Group grow>
                <NumberInput
                  label="Discount"
                  placeholder="0"
                  min={0}
                  prefix="₹"
                  {...paymentForm.getInputProps("discount")}
                />

                <NumberInput
                  label="Fine"
                  placeholder="0"
                  min={0}
                  prefix="₹"
                  {...paymentForm.getInputProps("fine")}
                />
              </Group>

              <Textarea
                label="Remarks"
                placeholder="Optional payment notes"
                {...paymentForm.getInputProps("remarks")}
              />

              <Group justify="flex-end">
                <Button type="submit" color="green">
                  Collect Payment
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Container>
  );
};

export default FinancePageComprehensive;
