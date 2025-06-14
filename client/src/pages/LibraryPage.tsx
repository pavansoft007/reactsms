import React from 'react';
import { Container, Title, Text, Card, Button, Group } from '@mantine/core';
import { IconBooks, IconPlus } from '@tabler/icons-react';

const LibraryPage: React.FC = () => {
  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Library Management</Title>
          <Text c="dimmed">Manage books, issues, and library operations</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>
          Add Book
        </Button>
      </Group>

      <Card withBorder radius="md" p="xl">
        <Group justify="center" gap="md">
          <IconBooks size={48} color="gray" />
          <div style={{ textAlign: 'center' }}>
            <Title order={3} c="dimmed">Library Management</Title>
            <Text c="dimmed">This page is under development</Text>
            <Text size="sm" c="dimmed" mt="md">
              Features coming soon:
              <br />• Book catalog management
              <br />• Book issue and return
              <br />• Student library cards
              <br />• Fine management
              <br />• Library reports
            </Text>
          </div>
        </Group>
      </Card>
    </Container>
  );
};

export default LibraryPage;