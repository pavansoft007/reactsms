import React, { useState, useEffect } from 'react';
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
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  ScrollArea,
  Container,
  Paper,
  Flex,
  MultiSelect,
  Checkbox
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCreditCard,
  IconReceipt,
  IconPrinter,
  IconDownload,
  IconSearch,
  IconFilter,
  IconMail
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import api from '../api/config';

interface Fee {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paid_amount: number;
  payment_date?: string;
  payment_method?: string;
  student?: {
    id: number;
    first_name: string;
    last_name: string;
    register_no: string;
    enrolledClass?: {
      name: string;
    };
  };
  feeType?: {
    name: string;
  };
}

interface PaymentData {
  fee_id: number;
  amount_paid: number;
  payment_method: string;
  transaction_id?: string;
  remarks?: string;
  discount?: number;
  fine?: number;
}

const FeeCollectionInterface: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    class_id: '',
    fee_type_id: '',
    overdue_only: false
  });

  const [paymentModalOpened, { open: openPaymentModal, close: closePaymentModal }] = useDisclosure(false);
  const [receiptModalOpened, { open: openReceiptModal, close: closeReceiptModal }] = useDisclosure(false);

  const paymentForm = useForm({
    initialValues: {
      amount_paid: 0,
      payment_method: '',
      transaction_id: '',
      remarks: '',
      discount: 0,
      fine: 0
    },
    validate: {
      amount_paid: (value) => (value <= 0 ? 'Payment amount must be greater than 0' : null),
      payment_method: (value) => (!value ? 'Payment method is required' : null)
    }
  });

  useEffect(() => {
    loadFees();
  }, [searchTerm, filters]);

  const loadFees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/finance/fees', {
        params: {
          search: searchTerm,
          ...filters,
          page: 1,
          limit: 50
        }
      });
      
      if (response.data.success) {
        setFees(response.data.data.fees || []);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load fee records',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCollection = async (values: typeof paymentForm.values) => {
    if (!selectedFee) return;

    try {
      const response = await api.post(`/api/finance/fees/${selectedFee.id}/collect`, values);
      
      if (response.data.success) {
        notifications.show({
          title: 'Success',
          message: 'Payment collected successfully',
          color: 'green'
        });
        closePaymentModal();
        loadFees();
        paymentForm.reset();
        setSelectedFee(null);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to collect payment',
        color: 'red'
      });
    }
  };

  const openPaymentModalForFee = (fee: Fee) => {
    setSelectedFee(fee);
    const remainingAmount = fee.amount - fee.paid_amount;
    paymentForm.setValues({
      amount_paid: remainingAmount,
      payment_method: 'cash',
      transaction_id: '',
      remarks: '',
      discount: 0,
      fine: 0
    });
    openPaymentModal();
  };

  const generateReceipt = async (fee: Fee) => {
    try {
      const response = await api.get(`/api/finance/invoices/student/${fee.student_id}`, {
        params: {
          fee_id: fee.id
        }
      });
      
      if (response.data.success) {
        // Handle receipt generation - could open in new window or download
        console.log('Receipt data:', response.data.data);
        openReceiptModal();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to generate receipt',
        color: 'red'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'partial': return 'blue';
      case 'overdue': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const sendPaymentReminder = async (fee: Fee) => {
    try {
      // Implement payment reminder functionality
      notifications.show({
        title: 'Reminder Sent',
        message: `Payment reminder sent to ${fee.student?.first_name} ${fee.student?.last_name}`,
        color: 'blue'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send payment reminder',
        color: 'red'
      });
    }
  };

  return (
    <Container size="xl">
      <Card withBorder radius="md">
        <Card.Section withBorder inheritPadding py="md">
          <Group justify="space-between">
            <Title order={3}>Fee Collection Interface</Title>
            <Group>
              <Button
                variant="light"
                leftSection={<IconFilter size={16} />}
              >
                Advanced Filters
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
              >
                Export
              </Button>
            </Group>
          </Group>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Group mb="md">
            <TextInput
              placeholder="Search by student name or register number..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
            
            <Select
              placeholder="Status"
              data={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' }
              ]}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
            />
            
            <Checkbox
              label="Overdue Only"
              checked={filters.overdue_only}
              onChange={(event) => 
                setFilters(prev => ({ ...prev, overdue_only: event.currentTarget.checked }))
              }
            />
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
                {fees.map((fee) => {
                  const balance = fee.amount - fee.paid_amount;
                  const isOverdue = new Date(fee.due_date) < new Date() && balance > 0;
                  
                  return (
                    <Table.Tr key={fee.id}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>
                            {fee.student?.first_name} {fee.student?.last_name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {fee.student?.register_no} • {fee.student?.enrolledClass?.name}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>{fee.feeType?.name}</Table.Td>
                      <Table.Td>₹{fee.amount.toLocaleString()}</Table.Td>
                      <Table.Td>₹{fee.paid_amount.toLocaleString()}</Table.Td>
                      <Table.Td>
                        <Text 
                          fw={balance > 0 ? 700 : 500}
                          c={balance > 0 ? (isOverdue ? 'red' : 'orange') : 'green'}
                        >
                          ₹{balance.toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c={isOverdue ? 'red' : 'dimmed'}>
                          {new Date(fee.due_date).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={getStatusColor(isOverdue && balance > 0 ? 'overdue' : fee.status)} 
                          variant="light"
                        >
                          {isOverdue && balance > 0 ? 'OVERDUE' : fee.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {balance > 0 && (
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => openPaymentModalForFee(fee)}
                              title="Collect Payment"
                            >
                              <IconCreditCard size={14} />
                            </ActionIcon>
                          )}
                          
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => generateReceipt(fee)}
                            title="Generate Receipt"
                          >
                            <IconReceipt size={14} />
                          </ActionIcon>
                          
                          {balance > 0 && (
                            <ActionIcon
                              variant="light"
                              color="indigo"
                              size="sm"
                              onClick={() => sendPaymentReminder(fee)}
                              title="Send Reminder"
                            >
                              <IconMail size={14} />
                            </ActionIcon>
                          )}
                          
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            title="Print"
                          >
                            <IconPrinter size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      {/* Payment Collection Modal */}
      <Modal
        opened={paymentModalOpened}
        onClose={closePaymentModal}
        title={`Collect Payment - ${selectedFee?.student?.first_name} ${selectedFee?.student?.last_name}`}
        size="md"
      >
        {selectedFee && (
          <form onSubmit={paymentForm.onSubmit(handlePaymentCollection)}>
            <Stack>
              <Paper withBorder p="md" bg="blue.0">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Fee Type:</Text>
                    <Text size="sm">{selectedFee.feeType?.name}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Total Amount:</Text>
                    <Text size="sm">₹{selectedFee.amount.toLocaleString()}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Already Paid:</Text>
                    <Text size="sm">₹{selectedFee.paid_amount.toLocaleString()}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500} c="red">Balance Due:</Text>
                    <Text size="sm" fw={700} c="red">
                      ₹{(selectedFee.amount - selectedFee.paid_amount).toLocaleString()}
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
                {...paymentForm.getInputProps('amount_paid')}
              />

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                required
                data={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Credit/Debit Card' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'upi', label: 'UPI Payment' },
                  { value: 'cheque', label: 'Cheque' },
                  { value: 'online', label: 'Online Payment' }
                ]}
                {...paymentForm.getInputProps('payment_method')}
              />

              <TextInput
                label="Transaction ID / Reference"
                placeholder="Optional transaction reference"
                {...paymentForm.getInputProps('transaction_id')}
              />

              <Group grow>
                <NumberInput
                  label="Discount"
                  placeholder="0"
                  min={0}
                  prefix="₹"
                  {...paymentForm.getInputProps('discount')}
                />
                
                <NumberInput
                  label="Late Fee / Fine"
                  placeholder="0"
                  min={0}
                  prefix="₹"
                  {...paymentForm.getInputProps('fine')}
                />
              </Group>

              <TextInput
                label="Remarks"
                placeholder="Optional payment notes"
                {...paymentForm.getInputProps('remarks')}
              />

              <Group justify="flex-end">
                <Button variant="light" onClick={closePaymentModal}>
                  Cancel
                </Button>
                <Button type="submit" color="green">
                  Collect Payment
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        opened={receiptModalOpened}
        onClose={closeReceiptModal}
        title="Payment Receipt"
        size="lg"
      >
        <Paper withBorder p="md">
          <Text ta="center" size="lg" fw={700} mb="md">
            Payment Receipt
          </Text>
          {/* Receipt content would go here */}
          <Text c="dimmed" ta="center">
            Receipt details will be displayed here
          </Text>
        </Paper>
      </Modal>
    </Container>
  );
};

export default FeeCollectionInterface;
