import { Container, Title, Text, Card, Button, Group } from "@mantine/core";
import { IconUsers, IconPlus } from "@tabler/icons-react";

const TeachersPage = () => {
  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Teachers Management</Title>
          <Text c="dimmed">Manage teacher profiles and assignments</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Add Teacher</Button>
      </Group>

      <Card withBorder radius="md" p="xl">
        <Group justify="center" gap="md">
          <IconUsers size={48} color="gray" />
          <div style={{ textAlign: "center" }}>
            <Title order={3} c="dimmed">
              Teachers Management
            </Title>
            <Text c="dimmed">This page is under development</Text>
            <Text size="sm" c="dimmed" mt="md">
              Features coming soon:
              <br />• Teacher registration and profiles
              <br />• Subject assignments
              <br />• Attendance tracking
              <br />• Performance reports
            </Text>
          </div>
        </Group>
      </Card>
    </Container>
  );
};

export default TeachersPage;
