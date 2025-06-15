import { ScrollArea, useMantineTheme, Group, Text } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconUsers,
  IconChalkboard,
  IconBook,
  IconCalendarEvent,
  IconCash,
  IconReportAnalytics,
  IconSettings,
  IconEdit,
} from '@tabler/icons-react';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: IconLayoutDashboard, to: '/' },
  { label: 'Students', icon: IconUsers, to: '/students' },
  { label: 'Teachers', icon: IconChalkboard, to: '/teachers' },
  { label: 'Classes', icon: IconBook, to: '/classes' },
  { label: 'Attendance', icon: IconCalendarEvent, to: '/attendance' },
  { label: 'Fees', icon: IconCash, to: '/fees' },
  { label: 'Reports', icon: IconReportAnalytics, to: '/reports' },
  { label: 'Settings', icon: IconSettings, to: '/settings' },
  {
    label: 'Admission',
    icon: IconEdit,
    to: '/admission',
    children: [
      { label: 'Create Admission', to: '/admission/create' },
      // Add more admission-related links here if needed
    ],
  },
];

export function Sidebar({ opened }: { opened: boolean }) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const location = useLocation();

  if (!opened) return null;

  return (
    <div
      style={{
        width: 250,
        height: '100vh',
        background: colorScheme === 'dark' ? theme.colors.dark[7] : '#fff',
        borderRight: `1px solid ${theme.colors.gray[2]}`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScrollArea style={{ flex: 1 }}>
        {navItems.map((item) => {
          if (item.children) {
            const active = location.pathname.startsWith(item.to);
            return (
              <div key={item.label}>
                <Group style={{ padding: '10px 20px', fontWeight: active ? 600 : 400 }}>
                  <item.icon size={20} />
                  <Text size="md">{item.label}</Text>
                </Group>
                <div style={{ marginLeft: 32 }}>
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.to}
                      style={{
                        textDecoration: 'none',
                        color: location.pathname === child.to ? theme.colors.blue[7] : theme.colors.gray[7],
                      }}
                    >
                      <Group style={{ padding: '6px 0', fontWeight: location.pathname === child.to ? 600 : 400 }}>
                        <Text size="sm">{child.label}</Text>
                      </Group>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                textDecoration: 'none',
                color: active ? theme.colors.blue[7] : theme.colors.gray[7],
              }}
            >
              <Group
                spacing={12}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  margin: '4px 8px',
                  background: active
                    ? colorScheme === 'dark'
                      ? theme.colors.dark[5]
                      : theme.colors.blue[0]
                    : 'transparent',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <item.icon size={20} />
                <Text size="md">{item.label}</Text>
              </Group>
            </Link>
          );
        })}
      </ScrollArea>
    </div>
  );
}
