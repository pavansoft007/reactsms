import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  Textarea,
  Group,
  ActionIcon,
  Badge,
  Select,
  Stack,
  Text,
  LoadingOverlay
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconCalendar } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  status: string;
  branch_id: number;
  created_at: string;
  updated_at: string;
}

interface Branch {
  id: number;
  name: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      event_date: new Date(),
      event_type: 'academic',
      status: 'active',
      branch_id: '',
    },
  });

  useEffect(() => {
    fetchEvents();
    fetchBranches();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch events',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...values,
        branch_id: parseInt(values.branch_id),
        event_date: values.event_date.toISOString().split('T')[0],
      };

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notifications.show({
          title: 'Success',
          message: 'Event updated successfully',
          color: 'green',
        });
      } else {
        await axios.post('/api/events', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notifications.show({
          title: 'Success',
          message: 'Event created successfully',
          color: 'green',
        });
      }

      form.reset();
      setEditingEvent(null);
      close();
      fetchEvents();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save event',
        color: 'red',
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.setValues({
      title: event.title,
      description: event.description || '',
      event_date: new Date(event.event_date),
      event_type: event.event_type,
      status: event.status,
      branch_id: event.branch_id.toString(),
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifications.show({
        title: 'Success',
        message: 'Event deleted successfully',
        color: 'green',
      });
      fetchEvents();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete event',
        color: 'red',
      });
    }
  };

  const handleModalClose = () => {
    form.reset();
    setEditingEvent(null);
    close();
  };

  const eventTypeOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconCalendar size={28} style={{ marginRight: 8 }} />
            Events Management
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Event
          </Button>
        </Group>

        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Branch</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {events.map((event) => (
                <Table.Tr key={event.id}>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{event.title}</Text>
                      {event.description && (
                        <Text size="sm" c="dimmed" truncate>
                          {event.description}
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>{new Date(event.event_date).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="blue">
                      {event.event_type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={
                        event.status === 'active' ? 'green' : 
                        event.status === 'completed' ? 'blue' : 'red'
                      }
                    >
                      {event.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {branches.find(b => b.id === event.branch_id)?.name || 'Unknown'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="subtle" 
                        color="blue"
                        onClick={() => handleEdit(event)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="subtle" 
                        color="red"
                        onClick={() => handleDelete(event.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {events.length === 0 && !loading && (
            <Text ta="center" py="xl" c="dimmed">
              No events found. Click "Add Event" to create your first event.
            </Text>
          )}
        </div>
      </Paper>

      <Modal
        opened={opened}
        onClose={handleModalClose}
        title={editingEvent ? "Edit Event" : "Add Event"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="Event title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Event description"
              rows={3}
              {...form.getInputProps('description')}
            />

            <DateInput
              label="Event Date"
              placeholder="Select date"
              required
              {...form.getInputProps('event_date')}
            />

            <Select
              label="Event Type"
              placeholder="Select event type"
              data={eventTypeOptions}
              required
              {...form.getInputProps('event_type')}
            />

            <Select
              label="Status"
              placeholder="Select status"
              data={statusOptions}
              required
              {...form.getInputProps('status')}
            />

            <Select
              label="Branch"
              placeholder="Select branch"
              data={branches.map(branch => ({
                value: branch.id.toString(),
                label: branch.name
              }))}
              required
              {...form.getInputProps('branch_id')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEvent ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default EventsPage;