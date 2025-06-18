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
  TextInput,
  NumberInput,
  Textarea,
  Select,
  ActionIcon,
  ScrollArea,
  Pagination,
  Container,
  Paper,
  Flex,
  Box
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconSearch
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import api from '../api/config';

interface FeeType {
  id: number;
  name: string;
  fee_code: string;
  description: string;
  branch_id: number;
  system: boolean;
  created_at: string;
}

const FeeTypesManagement = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      fee_code: '',
      description: '',
      system: false
    },
    validate: {
      name: (value) => (!value ? 'Fee type name is required' : null),
      fee_code: (value) => (!value ? 'Fee code is required' : null)
    }
  });

  const editForm = useForm({
    initialValues: {
      name: '',
      fee_code: '',
      description: '',
      system: false
    }
  });

  useEffect(() => {
    loadFeeTypes();
  }, [currentPage, searchTerm]);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/fee-types', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setFeeTypes(response.data.data.feeTypes || []);
        setTotalPages(Math.ceil(response.data.data.total / 10));
      }
    } catch (error) {
      console.error('Error loading fee types:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load fee types',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const response = await api.post('/api/fee-types', values);
      
      if (response.data.success) {
        notifications.show({
          title: 'Success',
          message: 'Fee type created successfully',
          color: 'green'
        });
        form.reset();
        closeModal();
        loadFeeTypes();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create fee type',
        color: 'red'
      });
    }
  };

  const handleEdit = async (values: typeof editForm.values) => {
    if (!selectedFeeType) return;

    try {
      const response = await api.put(`/api/fee-types/${selectedFeeType.id}`, values);
      
      if (response.data.success) {
        notifications.show({
          title: 'Success',
          message: 'Fee type updated successfully',
          color: 'green'
        });
        closeEditModal();
        loadFeeTypes();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update fee type',
        color: 'red'
      });
    }
  };

  const handleDelete = (feeType: FeeType) => {
    modals.openConfirmModal({
      title: 'Delete Fee Type',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{feeType.name}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await api.delete(`/api/fee-types/${feeType.id}`);
          notifications.show({
            title: 'Success',
            message: 'Fee type deleted successfully',
            color: 'green'
          });
          loadFeeTypes();
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete fee type',
            color: 'red'
          });
        }
      }
    });
  };

  const openEditModalWithData = (feeType: FeeType) => {
    setSelectedFeeType(feeType);
    editForm.setValues({
      name: feeType.name,
      fee_code: feeType.fee_code,
      description: feeType.description,
      system: feeType.system
    });
    openEditModal();
  };

  return (
    <Container size="xl">
      <Card withBorder radius="md">
        <Card.Section withBorder inheritPadding py="md">
          <Group justify="space-between">
            <Title order={3}>Fee Types Management</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openModal}
            >
              Add Fee Type
            </Button>
          </Group>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Group mb="md">
            <TextInput
              placeholder="Search fee types..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
          </Group>

          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Fee Code</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Created Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {feeTypes.map((feeType) => (
                  <Table.Tr key={feeType.id}>
                    <Table.Td>
                      <Text fw={500}>{feeType.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {feeType.fee_code}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {feeType.description || 'No description'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={feeType.system ? 'orange' : 'green'}
                      >
                        {feeType.system ? 'System' : 'Custom'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {new Date(feeType.created_at).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => openEditModalWithData(feeType)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(feeType)}
                          disabled={feeType.system}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="gray"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {totalPages > 1 && (
            <Flex justify="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
              />
            </Flex>
          )}
        </Card.Section>
      </Card>

      {/* Add Fee Type Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Add New Fee Type"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Fee Type Name"
              placeholder="e.g., Tuition Fee"
              required
              {...form.getInputProps('name')}
            />
            
            <TextInput
              label="Fee Code"
              placeholder="e.g., TF001"
              required
              {...form.getInputProps('fee_code')}
            />
            
            <Textarea
              label="Description"
              placeholder="Description of the fee type"
              {...form.getInputProps('description')}
            />
            
            <Group justify="flex-end">
              <Button variant="light" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                Create Fee Type
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Fee Type Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Fee Type"
        size="md"
      >
        <form onSubmit={editForm.onSubmit(handleEdit)}>
          <Stack>
            <TextInput
              label="Fee Type Name"
              placeholder="e.g., Tuition Fee"
              required
              {...editForm.getInputProps('name')}
            />
            
            <TextInput
              label="Fee Code"
              placeholder="e.g., TF001"
              required
              {...editForm.getInputProps('fee_code')}
            />
            
            <Textarea
              label="Description"
              placeholder="Description of the fee type"
              {...editForm.getInputProps('description')}
            />
            
            <Group justify="flex-end">
              <Button variant="light" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit">
                Update Fee Type
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default FeeTypesManagement;
