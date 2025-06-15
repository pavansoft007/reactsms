import React from 'react';
import { Container, Title, Text, Card, Button, Group } from '@mantine/core';
import { IconCurrencyRupee, IconPlus } from '@tabler/icons-react';
import { useAcademicYear } from '../context/AcademicYearContext';

const FeesPage: React.FC = () => {
  const { academicYear } = useAcademicYear();

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Fees Management</Title>
          <Text c="dimmed">Manage fee collection and payment tracking</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>
          Add Fee Record
        </Button>
      </Group>

      <Card withBorder radius="md" p="xl">
        <Group justify="center" gap="md">
          <IconCurrencyRupee size={48} color="gray" />
          <div style={{ textAlign: 'center' }}>
            <Title order={3} c="dimmed">Fees Management</Title>
            <Text c="dimmed">This page is under development</Text>
            <Text size="sm" c="dimmed" mt="md">
              Features coming soon:
              <br />• Fee structure setup
              <br />• Payment collection
              <br />• Due payment tracking
              <br />• Payment history and receipts
              <br />• WhatsApp fee reminders
            </Text>
          </div>
        </Group>
      </Card>

      {/* Example: use academicYear.id in your API requests */}
      {/* axios.get(`/api/fees?session_id=${academicYear?.id}`) */}
    </Container>
  );
};

export default FeesPage;