import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Group,
  Text,
  Button,
  Badge,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Modal,
  Table,
  ActionIcon,
  Pagination,
  Notification,
  Alert,
  ThemeIcon,
  Progress,
  Tabs,
} from '@mantine/core';
import {
  IconBrandWhatsapp,
  IconSend,
  IconUsers,
  IconCalendarEvent,
  IconGift,
  IconCurrencyRupee,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconRefresh,
  IconPlus,
  IconEye,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

interface Student {
  id: number;
  user: {
    name: string;
    phone?: string;
  };
  father_phone?: string;
  mother_phone?: string;
  guardian_phone?: string;
  class: {
    name: string;
  };
}

interface WhatsAppLog {
  id: number;
  phone_number: string;
  message: string;
  message_type: string;
  status: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
  student?: {
    user: {
      name: string;
    };
  };
}

const WhatsAppPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('send');

  const form = useForm({
    initialValues: {
      messageType: 'general',
      title: '',
      message: '',
      studentIds: [] as string[],
      amount: '',
      dueDate: '',
      holidayName: '',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    checkConnectionStatus();
    fetchStudents();
    fetchLogs();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectionStatus(response.data.connected);
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchLogs = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/whatsapp/logs?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleSendMessage = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload: any = {};

      switch (values.messageType) {
        case 'fee_reminder':
          endpoint = '/api/whatsapp/send-fee-reminder';
          payload = {
            studentId: values.studentIds[0],
            amount: parseFloat(values.amount),
            dueDate: values.dueDate,
          };
          break;
        case 'holiday_notification':
          endpoint = '/api/whatsapp/send-holiday-notification';
          payload = {
            studentIds: values.studentIds.map((id: string) => parseInt(id)),
            holidayName: values.holidayName,
            startDate: values.startDate,
            endDate: values.endDate,
          };
          break;
        case 'birthday_wish':
          endpoint = '/api/whatsapp/send-birthday-wishes';
          payload = {
            studentId: values.studentIds[0],
          };
          break;
        default:
          endpoint = '/api/whatsapp/send-notification';
          payload = {
            studentIds: values.studentIds.map((id: string) => parseInt(id)),
            title: values.title,
            message: values.message,
          };
      }

      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success || response.data.results) {
        notifications.show({
          title: 'Success',
          message: 'Message sent successfully!',
          color: 'green',
          icon: <IconCheck />,
        });
        form.reset();
        setModalOpened(false);
        fetchLogs();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = students.map(student => ({
    value: student.id.toString(),
    label: `${student.user.name} - ${student.class.name}`,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'green';
      case 'failed': return 'red';
      default: return 'yellow';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'fee_reminder': return <IconCurrencyRupee size={16} />;
      case 'holiday_notification': return <IconCalendarEvent size={16} />;
      case 'birthday_wish': return <IconGift size={16} />;
      case 'attendance_alert': return <IconAlertCircle size={16} />;
      default: return <IconSend size={16} />;
    }
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>WhatsApp Notifications</Title>
            <Text c="dimmed">Send notifications to students and parents via WhatsApp</Text>
          </div>
          <Group>
            <Badge 
              color={connectionStatus ? 'green' : 'red'} 
              variant="filled"
              leftSection={<IconBrandWhatsapp size={12} />}
            >
              {connectionStatus ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={checkConnectionStatus}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Connection Status Alert */}
        {!connectionStatus && (
          <Alert
            color="red"
            title="WhatsApp Not Connected"
            icon={<IconAlertCircle />}
          >
            WhatsApp is not connected. Please scan the QR code to connect WhatsApp Web.
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'send')}>
          <Tabs.List>
            <Tabs.Tab value="send" leftSection={<IconSend size={16} />}>
              Send Messages
            </Tabs.Tab>
            <Tabs.Tab value="logs" leftSection={<IconEye size={16} />}>
              Message Logs
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="send" pt="lg">
            {/* Quick Actions */}
            <Grid>
              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => {
                  form.setValues({ messageType: 'fee_reminder' });
                  setModalOpened(true);
                }}>
                  <Group>
                    <ThemeIcon size={40} radius="md" color="blue">
                      <IconCurrencyRupee size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Fee Reminder</Text>
                      <Text size="xs" c="dimmed">Send fee payment reminders</Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => {
                  form.setValues({ messageType: 'holiday_notification' });
                  setModalOpened(true);
                }}>
                  <Group>
                    <ThemeIcon size={40} radius="md" color="green">
                      <IconCalendarEvent size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Holiday Notice</Text>
                      <Text size="xs" c="dimmed">Send holiday announcements</Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => {
                  form.setValues({ messageType: 'birthday_wish' });
                  setModalOpened(true);
                }}>
                  <Group>
                    <ThemeIcon size={40} radius="md" color="orange">
                      <IconGift size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Birthday Wishes</Text>
                      <Text size="xs" c="dimmed">Send birthday greetings</Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => {
                  form.setValues({ messageType: 'general' });
                  setModalOpened(true);
                }}>
                  <Group>
                    <ThemeIcon size={40} radius="md" color="violet">
                      <IconSend size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>Custom Message</Text>
                      <Text size="xs" c="dimmed">Send custom notifications</Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="logs" pt="lg">
            {/* Message Logs */}
            <Card withBorder radius="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Sent At</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {log.student?.user.name || 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{log.phone_number}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {getMessageTypeIcon(log.message_type)}
                          <Text size="sm" tt="capitalize">
                            {log.message_type.replace('_', ' ')}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(log.status)} variant="filled">
                          {log.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon variant="light" size="sm">
                          <IconEye size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              
              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    value={currentPage}
                    onChange={fetchLogs}
                    total={totalPages}
                  />
                </Group>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>

        {/* Send Message Modal */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Send WhatsApp Message"
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSendMessage)}>
            <Stack gap="md">
              <Select
                label="Message Type"
                placeholder="Select message type"
                data={[
                  { value: 'general', label: 'General Notification' },
                  { value: 'fee_reminder', label: 'Fee Reminder' },
                  { value: 'holiday_notification', label: 'Holiday Notification' },
                  { value: 'birthday_wish', label: 'Birthday Wishes' },
                ]}
                {...form.getInputProps('messageType')}
                required
              />

              <MultiSelect
                label="Select Students"
                placeholder="Choose students to send message"
                data={studentOptions}
                searchable
                {...form.getInputProps('studentIds')}
                required
              />

              {form.values.messageType === 'general' && (
                <>
                  <TextInput
                    label="Title"
                    placeholder="Enter message title"
                    {...form.getInputProps('title')}
                    required
                  />
                  <Textarea
                    label="Message"
                    placeholder="Enter your message"
                    minRows={3}
                    {...form.getInputProps('message')}
                    required
                  />
                </>
              )}

              {form.values.messageType === 'fee_reminder' && (
                <>
                  <TextInput
                    label="Amount"
                    placeholder="Enter fee amount"
                    type="number"
                    {...form.getInputProps('amount')}
                    required
                  />
                  <TextInput
                    label="Due Date"
                    placeholder="Enter due date"
                    type="date"
                    {...form.getInputProps('dueDate')}
                    required
                  />
                </>
              )}

              {form.values.messageType === 'holiday_notification' && (
                <>
                  <TextInput
                    label="Holiday Name"
                    placeholder="Enter holiday name"
                    {...form.getInputProps('holidayName')}
                    required
                  />
                  <TextInput
                    label="Start Date"
                    placeholder="Enter start date"
                    type="date"
                    {...form.getInputProps('startDate')}
                    required
                  />
                  <TextInput
                    label="End Date"
                    placeholder="Enter end date"
                    type="date"
                    {...form.getInputProps('endDate')}
                    required
                  />
                </>
              )}

              <Group justify="flex-end">
                <Button variant="light" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  leftSection={<IconSend size={16} />}
                  disabled={!connectionStatus}
                >
                  Send Message
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default WhatsAppPage;