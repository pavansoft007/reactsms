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
  Card,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { DateInput } from "@mantine/dates";
import {
  IconBook,
  IconEdit,
  IconTrash,
  IconPlus,
  IconEye,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";
import axios from "axios";
import { UltraLoader } from "../components/ui";

interface Exam {
  id: number;
  name: string;
  description?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  status: string;
  class_name?: string;
  subject_name?: string;
  created_at: string;
}

const ExamPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      total_marks: 100,
      status: "scheduled",
    },
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API call
      const mockExams: Exam[] = [
        {
          id: 1,
          name: "Mid Term Examination",
          description: "Mathematics mid-term exam",
          exam_date: "2024-03-15",
          start_time: "09:00",
          end_time: "12:00",
          total_marks: 100,
          status: "scheduled",
          class_name: "Class 10",
          subject_name: "Mathematics",
          created_at: "2024-01-15",
        },
        {
          id: 2,
          name: "Final Examination",
          description: "Science final exam",
          exam_date: "2024-04-20",
          start_time: "10:00",
          end_time: "13:00",
          total_marks: 150,
          status: "completed",
          class_name: "Class 9",
          subject_name: "Science",
          created_at: "2024-01-20",
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setExams(mockExams);
        setLoading(false);
      }, 1000);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch exams",
        color: "red",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // API call would go here
      notifications.show({
        title: "Success",
        message: editingExam
          ? "Exam updated successfully"
          : "Exam created successfully",
        color: "green",
      });
      close();
      form.reset();
      setEditingExam(null);
      fetchExams();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save exam",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    form.setValues({
      name: exam.name,
      description: exam.description || "",
      exam_date: exam.exam_date,
      start_time: exam.start_time,
      end_time: exam.end_time,
      total_marks: exam.total_marks,
      status: exam.status,
    });
    open();
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      // API call would go here
      notifications.show({
        title: "Success",
        message: "Exam deleted successfully",
        color: "green",
      });
      fetchExams();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete exam",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconBook size={28} style={{ marginRight: 8 }} />
            Exam Management
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Exam
          </Button>
        </Group>

        <div style={{ position: "relative" }}>
          {loading && (
            <UltraLoader
              fullscreen
              size="lg"
              message="Loading exams..."
              variant="detailed"
            />
          )}

          {/* Exam Cards Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
            {exams.map((exam) => (
              <Card key={exam.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Group>
                    <IconBook size={20} />
                    <Text fw={500}>{exam.name}</Text>
                  </Group>
                  <Badge
                    color={
                      exam.status === "completed"
                        ? "green"
                        : exam.status === "scheduled"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {exam.status}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="xs">
                  {exam.description}
                </Text>

                <Group gap="xs" mb="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">{exam.exam_date}</Text>
                </Group>

                <Group gap="xs" mb="xs">
                  <IconClock size={16} />
                  <Text size="sm">
                    {exam.start_time} - {exam.end_time}
                  </Text>
                </Group>

                <Text size="sm" mb="md">
                  <strong>Marks:</strong> {exam.total_marks}
                </Text>

                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => handleEdit(exam)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(exam.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {exams.length === 0 && !loading && (
            <Text ta="center" py="xl" c="dimmed">
              No exams found. Click "Add Exam" to create your first exam.
            </Text>
          )}
        </div>
      </Paper>

      {/* Add/Edit Exam Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
          setEditingExam(null);
        }}
        title={editingExam ? "Edit Exam" : "Add New Exam"}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Exam Name"
              placeholder="Enter exam name"
              required
              {...form.getInputProps("name")}
            />

            <Textarea
              label="Description"
              placeholder="Enter exam description"
              {...form.getInputProps("description")}
            />

            <DateInput
              label="Exam Date"
              placeholder="Select exam date"
              required
              {...form.getInputProps("exam_date")}
            />

            <Group grow>
              <TextInput
                label="Start Time"
                placeholder="09:00"
                required
                {...form.getInputProps("start_time")}
              />
              <TextInput
                label="End Time"
                placeholder="12:00"
                required
                {...form.getInputProps("end_time")}
              />
            </Group>

            <TextInput
              label="Total Marks"
              placeholder="100"
              type="number"
              required
              {...form.getInputProps("total_marks")}
            />

            <Select
              label="Status"
              placeholder="Select status"
              data={[
                { value: "scheduled", label: "Scheduled" },
                { value: "ongoing", label: "Ongoing" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              required
              {...form.getInputProps("status")}
            />

            <Group justify="flex-end">
              <Button type="submit" loading={loading}>
                {editingExam ? "Update" : "Create"} Exam
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default ExamPage;
