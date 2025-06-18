import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Table,
  Badge,
  Group,
  Text,
  Button,
  Modal,
  Stack,
  Select,
  ActionIcon,
  ScrollArea,
  Container,
  Paper,
  Divider,
  Flex,
  Box,
  ThemeIcon
} from '@mantine/core';
import {
  IconFileInvoice,
  IconPrinter,
  IconDownload,
  IconMail,
  IconEye,
  IconReceipt,
  IconCurrencyRupee,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import api from '../api/config';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  register_no: string;
  enrolledClass?: {
    name: string;
  };
}

interface FeeInvoice {
  student: {
    id: number;
    name: string;
    register_no: string;
    class: string;
  };
  fees: Array<{
    id: number;
    fee_type: string;
    amount: number;
    paid_amount: number;
    balance: number;
    due_date: string;
    status: string;
  }>;
  summary: {
    total_amount: number;
    total_paid: number;
    total_balance: number;
    generated_at: string;
  };
}

const InvoiceManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [invoice, setInvoice] = useState<FeeInvoice | null>(null);
  const [loading, setLoading] = useState(false);

  const [invoiceModalOpened, { open: openInvoiceModal, close: closeInvoiceModal }] = useDisclosure(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get('/api/students');
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const generateInvoice = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/finance/invoices/student/${studentId}`);
      
      if (response.data.success) {
        setInvoice(response.data.data);
        openInvoiceModal();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to generate invoice',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    // Implement PDF download functionality
    notifications.show({
      title: 'Download',
      message: 'Invoice download started',
      color: 'blue'
    });
  };

  const emailInvoice = () => {
    // Implement email functionality
    notifications.show({
      title: 'Email Sent',
      message: 'Invoice has been sent to student email',
      color: 'green'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'green';
      case 'partial': return 'blue';
      case 'overdue': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl">
      <Card withBorder radius="md">
        <Card.Section withBorder inheritPadding py="md">
          <Group justify="space-between">
            <Title order={3}>Invoice Management</Title>
            <Group>
              <Select
                placeholder="Select a student"
                data={students.map(student => ({
                  value: student.id.toString(),
                  label: `${student.first_name} ${student.last_name} (${student.register_no})`
                }))}
                value={selectedStudent}
                onChange={(value) => setSelectedStudent(value || '')}
                searchable
                clearable
                style={{ minWidth: 300 }}
              />
              <Button
                leftSection={<IconFileInvoice size={16} />}
                onClick={() => selectedStudent && generateInvoice(selectedStudent)}
                disabled={!selectedStudent || loading}
                loading={loading}
              >
                Generate Invoice
              </Button>
            </Group>
          </Group>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Text c="dimmed" ta="center" py="xl">
            Select a student to generate their fee invoice
          </Text>
        </Card.Section>
      </Card>

      {/* Invoice Modal */}
      <Modal
        opened={invoiceModalOpened}
        onClose={closeInvoiceModal}
        title="Fee Invoice"
        size="xl"
        fullScreen
      >
        {invoice && (
          <div id="invoice-content">
            {/* Invoice Header */}
            <Paper withBorder p="xl" mb="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <ThemeIcon size={60} radius="md" variant="light" color="blue">
                    <IconFileInvoice size={30} />
                  </ThemeIcon>
                </div>
                
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <Title order={2} c="blue">School Management System</Title>
                  <Text size="lg" fw={500}>Fee Invoice</Text>
                  <Text size="sm" c="dimmed">
                    Generated on: {new Date(invoice.summary.generated_at).toLocaleDateString()}
                  </Text>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <Text size="sm" c="dimmed">Invoice #</Text>
                  <Text size="lg" fw={700}>INV-{invoice.student.id.toString().padStart(6, '0')}</Text>
                </div>
              </Group>
            </Paper>

            {/* Student Information */}
            <Paper withBorder p="md" mb="md">
              <Title order={4} mb="sm">
                <Group>
                  <IconUser size={20} />
                  Student Information
                </Group>
              </Title>
              <Group>
                <div>
                  <Text size="sm" c="dimmed">Student Name:</Text>
                  <Text fw={500}>{invoice.student.name}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Register No:</Text>
                  <Text fw={500}>{invoice.student.register_no}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Class:</Text>
                  <Text fw={500}>{invoice.student.class}</Text>
                </div>
              </Group>
            </Paper>

            {/* Fee Details */}
            <Paper withBorder p="md" mb="md">
              <Title order={4} mb="sm">
                <Group>
                  <IconCurrencyRupee size={20} />
                  Fee Details
                </Group>
              </Title>
              
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fee Type</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Paid</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    <Table.Th>Due Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {invoice.fees.map((fee) => (
                    <Table.Tr key={fee.id}>
                      <Table.Td>{fee.fee_type}</Table.Td>
                      <Table.Td>₹{fee.amount.toLocaleString()}</Table.Td>
                      <Table.Td>₹{fee.paid_amount.toLocaleString()}</Table.Td>
                      <Table.Td>
                        <Text fw={fee.balance > 0 ? 700 : 500} c={fee.balance > 0 ? 'red' : 'green'}>
                          ₹{fee.balance.toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group>
                          <IconCalendar size={16} />
                          {new Date(fee.due_date).toLocaleDateString()}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(fee.status)} variant="light">
                          {fee.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>

            {/* Invoice Summary */}
            <Paper withBorder p="md" mb="md">
              <Group justify="space-between">
                <Title order={4}>Invoice Summary</Title>
                <Box>
                  <Group justify="space-between" style={{ minWidth: 300 }}>
                    <Text>Total Amount:</Text>
                    <Text fw={600}>₹{invoice.summary.total_amount.toLocaleString()}</Text>
                  </Group>
                  <Group justify="space-between" style={{ minWidth: 300 }}>
                    <Text>Total Paid:</Text>
                    <Text fw={600} c="green">₹{invoice.summary.total_paid.toLocaleString()}</Text>
                  </Group>
                  <Divider my="xs" />
                  <Group justify="space-between" style={{ minWidth: 300 }}>
                    <Text fw={700} size="lg">Outstanding Balance:</Text>
                    <Text fw={700} size="lg" c={invoice.summary.total_balance > 0 ? 'red' : 'green'}>
                      ₹{invoice.summary.total_balance.toLocaleString()}
                    </Text>
                  </Group>
                </Box>
              </Group>
            </Paper>

            {/* Payment Instructions */}
            <Paper withBorder p="md" bg="blue.0">
              <Title order={5} mb="sm">Payment Instructions</Title>
              <Text size="sm">
                • Payments can be made at the school office during working hours<br />
                • Online payments are accepted through our portal<br />
                • Please mention the student's register number with all payments<br />
                • For any queries, contact the accounts department
              </Text>
            </Paper>

            {/* Action Buttons */}
            <Group justify="center" mt="xl">
              <Button
                leftSection={<IconPrinter size={16} />}
                onClick={printInvoice}
                variant="light"
              >
                Print Invoice
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={downloadInvoice}
                variant="light"
              >
                Download PDF
              </Button>
              <Button
                leftSection={<IconMail size={16} />}
                onClick={emailInvoice}
                variant="light"
              >
                Email Invoice
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default InvoiceManagement;
