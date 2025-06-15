import {
  Table,
  Badge,
  ActionIcon,
  Group,
  TextInput,
  Pagination,
  Tooltip,
  Card,
  Tabs,
} from '@mantine/core';
import { IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

const studentsData = [
  { roll: '001', name: 'Alice Johnson', class: '10A', status: 'Active' },
  { roll: '002', name: 'Bob Smith', class: '10B', status: 'Inactive' },
  { roll: '003', name: 'Charlie Lee', class: '9A', status: 'Active' },
  { roll: '004', name: 'Diana Prince', class: '8C', status: 'Active' },
];

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = studentsData.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll.includes(search) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group position="apart" mb="md">
        <TextInput
          placeholder="Search students..."
          icon={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 300 }}
        />
      </Group>
      <Table highlightOnHover verticalSpacing="sm" fontSize="md">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((student) => (
            <tr key={student.roll}>
              <td>{student.roll}</td>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>
                <Badge color={student.status === 'Active' ? 'green' : 'red'} variant="light">
                  {student.status}
                </Badge>
              </td>
              <td>
                <Group spacing={4}>
                  <Tooltip label="Edit">
                    <ActionIcon color="blue" variant="light">
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon color="red" variant="light">
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Group position="right" mt="md">
        <Pagination total={2} page={page} onChange={setPage} />
      </Group>
    </Card>
  );
}
