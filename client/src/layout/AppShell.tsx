import { AppShell as MantineAppShell, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  return (
    <MantineAppShell
      navbarOffsetBreakpoint="sm"
      hiddenBreakpoint="sm"
      navbar={<Sidebar opened={opened} />}
      header={<Header opened={opened} setOpened={setOpened} />}
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          minHeight: '100vh',
        },
      }}
    >
      {children}
    </MantineAppShell>
  );
}
