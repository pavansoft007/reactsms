import { AppShell as MantineAppShell } from "@mantine/core";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <MantineAppShell
      navbar={{
        width: opened ? 280 : 0,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      header={{ height: 70 }}
      styles={{
        main: {
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
        },
        navbar: {
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "4px 0 24px -4px rgba(0, 0, 0, 0.1)",
        },
        header: {
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Sidebar opened={opened} setOpened={setOpened} />
      <Header opened={opened} setOpened={setOpened} />
      {children}
    </MantineAppShell>
  );
}
