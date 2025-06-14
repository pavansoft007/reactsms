import React, { useState, useEffect } from 'react';
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
  Stack,
  Text,
  LoadingOverlay,
  Select,
  Avatar,
  Card,
  SimpleGrid,
  NumberInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import { 
  IconUsers, 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconPhone,
  IconMail,
  IconUser,
  IconBriefcase,
  IconCalendar
} from '@tabler/icons-react';
import axios from 'axios';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id: string;
  department: string;
  designation: string;
  salary?: number;
  joining_date: string;
  status: string;
  address?: string;
  created_at: string;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      employee_id: '',
      department: '',
      designation: '',
      salary: '',
      joining_date: null as Date | null,
      status: 'active',
      address: '',
    },
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Mock data - replace with actual API call
      setEmployees([
        { 
          id: 1, 
          name: 'Dr. Robert Smith', 
          email: 'robert.smith@school.edu', 
          phone: '+1-555-123-4567',
          employee_id: 'EMP001',
          department: 'Academic',
          designation: 'Principal',
          salary: 75000,
          joining_date: '2023-01-15',
          status: 'active',
          address: '123 Education Ave',
          created_at: '2023-01-15'
        },
        { 
          id: 2, 
          name: 'Prof. Maria Garcia', 
          email: 'maria.garcia@school.edu', 
          phone: '+1-555-987-6543',
          employee_id: 'EMP002',
          department: 'Academic',
          designation: 'Mathematics Teacher',
          salary: 55000,
          joining_date: '2023-02-01',
          status: 'active',
          address: '456 Teaching St',
          created_at: '2023-02-01'
        },
      ]);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch employees',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Mock data - replace with actual API call
      setDepartments([
        { id: 1, name: 'Academic' },
        { id: 2, name: 'Administration' },
        { id: 3, name: 'Support Staff' },
        { id: 4, name: 'Finance' },
      ]);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      // Mock data - replace with actual API call
      setDesignations([
        { id: 1, name: 'Principal' },
        { id: 2, name: 'Vice Principal' },
        { id: 3, name: 'Mathematics Teacher' },
        { id: 4, name: 'Science Teacher' },
        { id: 5, name: 'English Teacher' },
        { id: 6, name: 'Librarian' },
        { id: 7, name: 'Administrative Assistant' },
        { id: 8, name: 'Accountant' },
      ]);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingEmployee) {
        await axios.put(`/api/employees/${editingEmployee.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notifications.show({
          title: 'Success',
          message: 'Employee updated successfully',
          color: 'green',
        });
      } else {
        await axios.post('/api/employees', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notifications.show({
          title: 'Success',
          message: 'Employee created successfully',
          color: 'green',
        });
      }

      form.reset();
      setEditingEmployee(null);
      close();
      fetchEmployees();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save employee',
        color: 'red',
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setValues({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      employee_id: employee.employee_id,
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary?.toString() || '',
      joining_date: new Date(employee.joining_date),
      status: employee.status,
      address: employee.address || '',
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifications.show({
        title: 'Success',
        message: 'Employee deleted successfully',
        color: 'green',
      });
      fetchEmployees();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete employee',
        color: 'red',
      });
    }
  };

  const handleModalClose = () => {
    form.reset();
    setEditingEmployee(null);
    close();
  };

  const departmentOptions = departments.map(dept => ({ value: dept.name, label: dept.name }));
  const designationOptions = designations.map(desig => ({ value: desig.name, label: desig.name }));

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconUsers size={28} style={{ marginRight: 8 }} />
            Employee Management
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Employee
          </Button>
        </Group>

        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />

          {/* Employee Cards Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
            {employees.map((employee) => (
              <Card key={employee.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Avatar color="blue" radius="xl">
                      <IconUser size={20} />
                    </Avatar>
                    <div>
                      <Text fw={500}>{employee.name}</Text>
                      <Text size="sm" c="dimmed">{employee.designation}</Text>
                    </div>
                  </Group>
                  <Badge color={employee.status === 'active' ? 'green' : 'red'}>
                    {employee.status}
                  </Badge>
                </Group>

                <Stack gap="xs" mb="md">
                  <Group gap="xs">
                    <IconBriefcase size={16} />
                    <Text size="sm">{employee.employee_id}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text size="sm">{employee.email}</Text>
                  </Group>
                  {employee.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} />
                      <Text size="sm">{employee.phone}</Text>
                    </Group>
                  )}
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm">{employee.department}</Text>
                  </Group>
                  {employee.salary && (
                    <Text size="sm" fw={500} c="green">
                      Salary: ${employee.salary.toLocaleString()}
                    </Text>
                  )}
                </Stack>

                <Group justify="flex-end">
                  <ActionIcon 
                    variant="subtle" 
                    color="blue"
                    onClick={() => handleEdit(employee)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="subtle" 
                    color="red"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {/* Employee Table */}
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">Employee Details</Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Employee</Table.Th>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Department</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Salary</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {employees.map((employee) => (
                  <Table.Tr key={employee.id}>
                    <Table.Td>
                      <Group>
                        <Avatar size="sm" color="blue">
                          <IconUser size={16} />
                        </Avatar>
                        <div>
                          <Text fw={500}>{employee.name}</Text>
                          <Text size="xs" c="dimmed">{employee.email}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {employee.employee_id}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{employee.department}</Table.Td>
                    <Table.Td>{employee.designation}</Table.Td>
                    <Table.Td>
                      <div>
                        {employee.phone && (
                          <Text size="sm">{employee.phone}</Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      {employee.salary ? (
                        <Text fw={500} c="green">
                          ${employee.salary.toLocaleString()}
                        </Text>
                      ) : (
                        'N/A'
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={employee.status === 'active' ? 'green' : 'red'}>
                        {employee.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon 
                          variant="subtle" 
                          color="blue"
                          onClick={() => handleEdit(employee)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="subtle" 
                          color="red"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {employees.length === 0 && !loading && (
              <Text ta="center" py="xl" c="dimmed">
                No employees found. Click "Add Employee" to create your first employee record.
              </Text>
            )}
          </Paper>
        </div>
      </Paper>

      <Modal
        opened={opened}
        onClose={handleModalClose}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group grow>
              <TextInput
                label="Full Name"
                placeholder="Enter employee's full name"
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Employee ID"
                placeholder="Enter employee ID"
                required
                {...form.getInputProps('employee_id')}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Email"
                placeholder="Enter email address"
                required
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Phone"
                placeholder="Enter phone number"
                {...form.getInputProps('phone')}
              />
            </Group>

            <Group grow>
              <Select
                label="Department"
                placeholder="Select department"
                data={departmentOptions}
                required
                {...form.getInputProps('department')}
              />
              <Select
                label="Designation"
                placeholder="Select designation"
                data={designationOptions}
                required
                {...form.getInputProps('designation')}
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Salary"
                placeholder="Enter salary"
                min={0}
                {...form.getInputProps('salary')}
              />
              <DateInput
                label="Joining Date"
                placeholder="Select joining date"
                {...form.getInputProps('joining_date')}
              />
            </Group>

            <Textarea
              label="Address"
              placeholder="Enter address"
              rows={3}
              {...form.getInputProps('address')}
            />

            <Select
              label="Status"
              data={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              {...form.getInputProps('status')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default EmployeePage;