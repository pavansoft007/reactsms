import React, { useState } from "react";
import { Container, Paper, Title, Tabs, Text, Group, Box } from "@mantine/core";
import {
  IconShield,
  IconUsers,
  IconKey,
  IconUserCog,
} from "@tabler/icons-react";

// Import content components
import RolesContent from "../components/roles/RolesContent";
import RolePermissionsContent from "../components/roles/RolePermissionsContent";
import RoleGroupsContent from "../components/roles/RoleGroupsContent";

const RoleManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>();

  const handleViewPermissions = (roleId: number) => {
    setSelectedRoleId(roleId);
    setActiveTab("permissions");
  };

  return (
    <Container size="xl" py="md">
      <Paper
        shadow="sm"
        p="md"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "12px",
        }}
      >
        <div style={{ position: "relative" }}>
          <Group justify="space-between" mb="lg">
            <div>
              <Title
                order={2}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Role Management System
              </Title>
              <Text c="dimmed" size="sm" mt="xs">
                Manage roles, permissions, and role groups in one centralized
                location
              </Text>
            </div>
            <IconUserCog size={32} color="#667eea" />
          </Group>

          <Tabs
            value={activeTab}
            onChange={(value) => {
              setActiveTab(value || "roles");
              // Clear selected role when switching tabs
              if (value !== "permissions") {
                setSelectedRoleId(undefined);
              }
            }}
            variant="pills"
            radius="md"
          >
            <Tabs.List mb="md">
              <Tabs.Tab value="roles" leftSection={<IconShield size={16} />}>
                Roles
              </Tabs.Tab>
              <Tabs.Tab value="permissions" leftSection={<IconKey size={16} />}>
                Role Permissions
              </Tabs.Tab>
              <Tabs.Tab value="groups" leftSection={<IconUsers size={16} />}>
                Role Groups
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="roles">
              <Box>
                <RolesContent onViewPermissions={handleViewPermissions} />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="permissions">
              <Box>
                <RolePermissionsContent preSelectedRoleId={selectedRoleId} />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="groups">
              <Box>
                <RoleGroupsContent />
              </Box>
            </Tabs.Panel>
          </Tabs>
        </div>
      </Paper>
    </Container>
  );
};

export default RoleManagementPage;
