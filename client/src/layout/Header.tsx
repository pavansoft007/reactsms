import { Group, Burger, Text, ActionIcon, Menu, Avatar, useMantineTheme } from '@mantine/core';
import { IconBell, IconUser, IconLogout } from '@tabler/icons-react';

export function Header({ opened, setOpened }: { opened: boolean; setOpened: (o: boolean) => void }) {
  const theme = useMantineTheme();
  return (
    <div
      style={{
        height: 60,
        width: '100%',
        boxShadow: theme.shadows.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#fff',
        zIndex: 200,
      }}
    >
      <Group>
        <Burger opened={opened} onClick={() => setOpened(!opened)} size="sm" mr="xl" />
        <Text style={{ fontWeight: 700, fontSize: 22, color: theme.colors.blue[7], display: 'flex', alignItems: 'center' }}>
          <img src="/logo192.png" alt="School Logo" style={{ height: 32, marginRight: 8, verticalAlign: 'middle' }} />
          School Management
        </Text>
      </Group>
      <Group>
        <ActionIcon variant="subtle" size="lg">
          <IconBell size={22} />
        </ActionIcon>
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }}>
              <IconUser size={20} />
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconUser size={16} />
                Profile
              </div>
            </Menu.Item>
            <Menu.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconLogout size={16} />
                Logout
              </div>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </div>
  );
}
