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
  Stack,
  Text,
  Select,
  Avatar,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconUsers,
  IconEdit,
  IconTrash,
  IconPlus,
  IconPhone,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import axios from "axios";
import { UltraLoader } from "../components/ui";

interface Parent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  occupation?: string;
  status: string;
  children_count?: number;
  created_at: string;
}

const ParentsPage = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      occupation: "",
      status: "active",
    },
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Mock data - replace with actual API call
      setParents([
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1-555-123-4567",
          address: "123 Main St, City",
          occupation: "Engineer",
          status: "active",
          children_count: 2,
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1-555-987-6543",
          address: "456 Oak Ave, City",
          occupation: "Teacher",
          status: "active",
          children_count: 1,
          created_at: "2024-02-01",
        },
      ]);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch parents",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const token = localStorage.getItem("token");

      if (editingParent) {
        await axios.put(`/api/parents/${editingParent.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notifications.show({
          title: "Success",
          message: "Parent updated successfully",
          color: "green",
        });
      } else {
        await axios.post("/api/parents", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notifications.show({
          title: "Success",
          message: "Parent created successfully",
          color: "green",
        });
      }

      form.reset();
      setEditingParent(null);
      close();
      fetchParents();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to save parent",
        color: "red",
      });
    }
  };

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);
    form.setValues({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      status: parent.status,
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this parent? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/parents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notifications.show({
        title: "Success",
        message: "Parent deleted successfully",
        color: "green",
      });
      fetchParents();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete parent",
        color: "red",
      });
    }
  };

  const handleModalClose = () => {
    form.reset();
    setEditingParent(null);
    close();
  };

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconUsers size={28} style={{ marginRight: 8 }} />
            Parents Management
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Parent
          </Button>
        </Group>{" "}
        <div style={{ position: "relative" }}>
          {loading && (
            <UltraLoader
              fullscreen
              size="lg"
              message="Loading parents..."
              variant="detailed"
            />
          )}

          {/* Parent Cards Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
            {parents.map((parent) => (
              <Card key={parent.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <Avatar color="blue" radius="xl">
                      <IconUser size={20} />
                    </Avatar>
                    <div>
                      <Text fw={500}>{parent.name}</Text>
                      <Text size="sm" c="dimmed">
                        {parent.occupation}
                      </Text>
                    </div>
                  </Group>
                  <Badge color={parent.status === "active" ? "green" : "red"}>
                    {parent.status}
                  </Badge>
                </Group>

                <Stack gap="xs" mb="md">
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text size="sm">{parent.email}</Text>
                  </Group>
                  {parent.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} />
                      <Text size="sm">{parent.phone}</Text>
                    </Group>
                  )}
                  <Text size="sm" c="dimmed">
                    Children: {parent.children_count || 0}
                  </Text>
                </Stack>

                <Group justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(parent)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(parent.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {/* Parent Table */}
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3} mb="md">
              Parent Details
            </Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Occupation</Table.Th>
                  <Table.Th>Children</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parents.map((parent) => (
                  <Table.Tr key={parent.id}>
                    <Table.Td>
                      <Group>
                        <Avatar size="sm" color="blue">
                          <IconUser size={16} />
                        </Avatar>
                        <Text fw={500}>{parent.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{parent.email}</Table.Td>
                    <Table.Td>{parent.phone || "N/A"}</Table.Td>
                    <Table.Td>{parent.occupation || "N/A"}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {parent.children_count || 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={parent.status === "active" ? "green" : "red"}
                      >
                        {parent.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(parent)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(parent.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {parents.length === 0 && !loading && (
              <Text ta="center" py="xl" c="dimmed">
                No parents found. Click "Add Parent" to create your first parent
                record.
              </Text>
            )}
          </Paper>
        </div>
      </Paper>

      <Modal
        opened={opened}
        onClose={handleModalClose}
        title={editingParent ? "Edit Parent" : "Add Parent"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Enter parent's full name"
              required
              {...form.getInputProps("name")}
            />

            <TextInput
              label="Email"
              placeholder="Enter email address"
              required
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              {...form.getInputProps("phone")}
            />

            <Textarea
              label="Address"
              placeholder="Enter address"
              rows={3}
              {...form.getInputProps("address")}
            />

            <TextInput
              label="Occupation"
              placeholder="Enter occupation"
              {...form.getInputProps("occupation")}
            />

            <Select
              label="Status"
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              {...form.getInputProps("status")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingParent ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default ParentsPage;
