import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Title,
  Button,
  Table,
  Group,
  Modal,
  TextInput,
  MultiSelect,
  Stack,
  ActionIcon,
  LoadingOverlay,
  Select,
  Checkbox,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import api from "../api/config";

interface RoleGroup {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

interface Role {
  id: number;
  name: string;
  prefix?: string;
  is_system?: boolean;
}

interface ModulePermission {
  id: number;
  name: string;
  permissions: Array<{
    id: number;
    name: string;
    show_view: boolean;
    show_add: boolean;
    show_edit: boolean;
    show_delete: boolean;
    is_view: boolean;
    is_add: boolean;
    is_edit: boolean;
    is_delete: boolean;
  }>;
}

const RolePermissionPage: React.FC = () => {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<RoleGroup | null>(null);
  const [groupRoles, setGroupRoles] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<RoleGroup | null>(null);
  const [permissionRole, setPermissionRole] = useState<string | null>(null);
  const [modules, setModules] = useState<ModulePermission[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permSaving, setPermSaving] = useState(false);

  useEffect(() => {
    fetchRoleGroups();
    fetchRoles();
  }, []);

  const fetchRoleGroups = async () => {
    setLoading(true);
    const res = await api.get("/api/role-groups");
    setRoleGroups(res.data.data || res.data);
    setLoading(false);
  };

  const fetchRoles = async () => {
    const res = await api.get("/api/roles");
    setRoles(res.data.data || res.data);
  };

  const fetchRolePermissions = async (roleId: string) => {
    setPermLoading(true);
    const res = await api.get(`/api/roles/${roleId}/permissions`);
    setModules(res.data.data || res.data);
    setPermLoading(false);
  };

  useEffect(() => {
    if (permissionRole) fetchRolePermissions(permissionRole);
  }, [permissionRole]);

  const handleEditGroup = (group: RoleGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setModalOpen(true);
  };

  const handleDeleteGroup = async (group: RoleGroup) => {
    await api.delete(`/api/role-groups/${group.id}`);
    fetchRoleGroups();
  };

  const handleSaveGroup = async () => {
    if (editingGroup) {
      await api.put(`/api/role-groups/${editingGroup.id}`, { name: groupName });
    } else {
      await api.post("/api/role-groups", { name: groupName });
    }
    setModalOpen(false);
    setGroupName("");
    setEditingGroup(null);
    fetchRoleGroups();
  };

  const handleGroupRoles = async (group: RoleGroup) => {
    setSelectedGroup(group);
    const res = await api.get(`/api/role-groups/${group.id}/roles`);
    setGroupRoles(res.data.map((r: Role) => r.id));
  };

  const handleSaveGroupRoles = async () => {
    if (selectedGroup) {
      await api.post(`/api/role-groups/${selectedGroup.id}/roles`, {
        role_ids: groupRoles,
      });
      setSelectedGroup(null);
      setGroupRoles([]);
    }
  };

  const handlePermCheck = (
    modIdx: number,
    permIdx: number,
    type: string,
    checked: boolean
  ) => {
    setModules((prev) => {
      const updated = [...prev];
      const perm = { ...updated[modIdx].permissions[permIdx] };
      perm[`is_${type}`] = checked;
      updated[modIdx].permissions[permIdx] = perm;
      return updated;
    });
  };

  const handlePermSelectAll = (type: string, checked: boolean) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((perm) =>
          perm[`show_${type}`] ? { ...perm, [`is_${type}`]: checked } : perm
        ),
      }))
    );
  };

  const handlePermSave = async () => {
    setPermSaving(true);
    await api.post(`/api/roles/${permissionRole}/permissions`, { modules });
    setPermSaving(false);
  };

  return (
    <Container size="lg">
      <Title order={2} mb="md">
        Role Groups & Permissions
      </Title>
      <Paper shadow="xs" p="md" mb="md">
        <Group position="apart">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Add Role Group
          </Button>
        </Group>
        <Table mt="md">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {roleGroups.map((group) => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>
                  <Group>
                    <ActionIcon onClick={() => handleEditGroup(group)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDeleteGroup(group)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </td>
                <td>
                  <Button size="xs" onClick={() => handleGroupRoles(group)}>
                    Manage Roles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <LoadingOverlay visible={loading} />
      </Paper>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? "Edit Role Group" : "Add Role Group"}
      >
        <TextInput
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.currentTarget.value)}
        />
        <Group mt="md" position="right">
          <Button onClick={handleSaveGroup}>
            {editingGroup ? "Update" : "Create"}
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title="Assign Roles to Group"
      >
        <MultiSelect
          label="Roles"
          data={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
          value={groupRoles.map(String)}
          onChange={(vals) => setGroupRoles(vals.map(Number))}
        />
        <Group mt="md" position="right">
          <Button onClick={handleSaveGroupRoles}>Save</Button>
        </Group>
      </Modal>
      <Paper shadow="xs" p="md" mb="md">
        <Title order={4} mb="sm">
          Role Permission Matrix
        </Title>
        <Group mb="md">
          <Select
            label="Select Role"
            data={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
            value={permissionRole}
            onChange={setPermissionRole}
            placeholder="Choose a role"
            style={{ minWidth: 220 }}
          />
        </Group>
        <LoadingOverlay visible={permLoading} />
        {permissionRole && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePermSave();
            }}
          >
            <Table striped withColumnBorders>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>
                    <Checkbox
                      label="View"
                      onChange={(e) =>
                        handlePermSelectAll("view", e.currentTarget.checked)
                      }
                    />
                  </th>
                  <th>
                    <Checkbox
                      label="Add"
                      onChange={(e) =>
                        handlePermSelectAll("add", e.currentTarget.checked)
                      }
                    />
                  </th>
                  <th>
                    <Checkbox
                      label="Edit"
                      onChange={(e) =>
                        handlePermSelectAll("edit", e.currentTarget.checked)
                      }
                    />
                  </th>
                  <th>
                    <Checkbox
                      label="Delete"
                      onChange={(e) =>
                        handlePermSelectAll("delete", e.currentTarget.checked)
                      }
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, mIdx) => (
                  <React.Fragment key={mod.id}>
                    <tr>
                      <th colSpan={5}>{mod.name}</th>
                    </tr>
                    {mod.permissions.map((perm, pIdx) => (
                      <tr key={perm.id}>
                        <td>{perm.name}</td>
                        <td>
                          {perm.show_view && (
                            <Checkbox
                              checked={perm.is_view}
                              onChange={(e) =>
                                handlePermCheck(
                                  mIdx,
                                  pIdx,
                                  "view",
                                  e.currentTarget.checked
                                )
                              }
                            />
                          )}
                        </td>
                        <td>
                          {perm.show_add && (
                            <Checkbox
                              checked={perm.is_add}
                              onChange={(e) =>
                                handlePermCheck(
                                  mIdx,
                                  pIdx,
                                  "add",
                                  e.currentTarget.checked
                                )
                              }
                            />
                          )}
                        </td>
                        <td>
                          {perm.show_edit && (
                            <Checkbox
                              checked={perm.is_edit}
                              onChange={(e) =>
                                handlePermCheck(
                                  mIdx,
                                  pIdx,
                                  "edit",
                                  e.currentTarget.checked
                                )
                              }
                            />
                          )}
                        </td>
                        <td>
                          {perm.show_delete && (
                            <Checkbox
                              checked={perm.is_delete}
                              onChange={(e) =>
                                handlePermCheck(
                                  mIdx,
                                  pIdx,
                                  "delete",
                                  e.currentTarget.checked
                                )
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
            <Group mt="md" position="right">
              <Button
                type="submit"
                loading={permSaving}
                disabled={permLoading || permSaving}
              >
                Save Permissions
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default RolePermissionPage;
