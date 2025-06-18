import {  useState, useEffect, useCallback , Fragment } from 'react';
import {
  Container,
  Paper,
  Title,
  Table,
  Checkbox,
  Text,
  Group,
  Button,
  Select,
  Badge,
  Box,
  Collapse,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconShield,
  IconDeviceFloppy,
  IconChevronDown,
  IconChevronRight,
  IconSelectAll,
} from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import api from "../api/config";
import { UltraLoader } from "../components/ui";

// Define all features that can have permissions grouped by category
const PERMISSION_CATEGORIES = {
  Dashboard: [
    "Monthly Income Vs Expense Pie Chart",
    "Annual Student Fees Summary Chart",
    "Employee Count Widget",
    "Student Count Widget",
    "Parent Count Widget",
    "Teacher Count Widget",
    "Student Quantity Pie Chart",
  ],
  "Student Management": [
    "Student",
    "Multiple Import",
    "Student Category",
    "Student Id Card",
    "Disable Authentication",
  ],
  Academic: [
    "Class",
    "Section",
    "Subject",
    "Exam",
    "Homework",
    "Class Schedule",
    "Teacher Schedule",
  ],
  "Employee Management": [
    "Employee",
    "Department",
    "Designation",
    "Payroll",
    "Award",
  ],
  "Parent Management": ["Parent"],
  "Fee Management": [
    "Fees Type",
    "Fees Group",
    "Fee Collection",
    "Fine Setup",
    "Fees Report",
  ],
  Library: ["Book", "Book Category", "Book Issue/Return"],
  Transport: ["Route", "Vehicle", "Assign Vehicle", "Student Transport"],
  Hostel: ["Hostel", "Room Type", "Hostel Room"],
  Attendance: ["Student Attendance", "Employee Attendance"],
  Examination: ["Exam Term", "Exam Hall", "Exam Setup", "Marks Register"],
  Settings: [
    "Global Settings",
    "School Settings",
    "Session",
    "Role",
    "Permission",
    "Backup",
  ],
};

interface Permission {
  id: number;
  feature: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

const RolePermissionsPage = () => {
  const [searchParams] = useSearchParams();
  const roleIdFromUrl = searchParams.get("roleId");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(roleIdFromUrl || "");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Dashboard",
  ]);
  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (roleIdFromUrl && roles.length > 0) {
      // Auto-select role if it exists in the roles list
      const roleExists = roles.find(
        (role) => role.id.toString() === roleIdFromUrl
      );
      if (roleExists) {
        setSelectedRole(roleIdFromUrl);
      }
    }
  }, [roleIdFromUrl, roles]);
  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log("Fetching roles from:", "/api/roles");
      const response = await api.get("/api/roles");
      console.log("Roles response:", response.data);
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch roles",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchRolePermissions = useCallback(async (roleId: string) => {
    try {
      setLoading(true);

      // Get all unique permission names from categories
      const allFeatureNames = Object.values(PERMISSION_CATEGORIES).flat();

      // Initialize permissions for all features
      const initialPermissions: Permission[] = allFeatureNames.map(
        (feature, index) => ({
          id: index + 1,
          feature: feature,
          view: false,
          add: false,
          edit: false,
          delete: false,
        })
      ); // Try to fetch existing permissions from backend
      try {
        console.log("Fetching permissions for role:", roleId);
        const response = await api.get(`/api/roles/${roleId}/permissions`);
        console.log("Permissions response:", response.data);
        const existingPermissions = response.data.data || [];

        // Merge existing permissions with all features
        const mergedPermissions = initialPermissions.map((perm) => {
          const existing = existingPermissions.find(
            (ep: any) => ep.feature === perm.feature
          );
          return existing ? { ...perm, ...existing } : perm;
        });

        setPermissions(mergedPermissions);
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        // If no existing permissions, use initial permissions
        setPermissions(initialPermissions);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch role permissions",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole, fetchRolePermissions]);
  const handlePermissionChange = (
    featureName: string,
    permissionType: keyof Omit<Permission, "id" | "feature">
  ) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.feature === featureName
          ? { ...perm, [permissionType]: !perm[permissionType] }
          : perm
      )
    );
  };

  const handleCategorySelectAll = (
    category: string,
    permissionType: keyof Omit<Permission, "id" | "feature">
  ) => {
    const features =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const allSelected = features.every((feature) => {
      const permission = getPermissionForFeature(feature);
      return permission?.[permissionType] || false;
    });

    setPermissions((prev) =>
      prev.map((perm) => {
        if (features.includes(perm.feature)) {
          return { ...perm, [permissionType]: !allSelected };
        }
        return perm;
      })
    );
  };

  const isCategoryPermissionSelected = (
    category: string,
    permissionType: keyof Omit<Permission, "id" | "feature">
  ): boolean => {
    const features =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    return features.every((feature) => {
      const permission = getPermissionForFeature(feature);
      return permission?.[permissionType] || false;
    });
  };
  const isCategoryPermissionIndeterminate = (
    category: string,
    permissionType: keyof Omit<Permission, "id" | "feature">
  ): boolean => {
    const features =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const selectedCount = features.filter((feature) => {
      const permission = getPermissionForFeature(feature);
      return permission?.[permissionType] || false;
    }).length;

    return selectedCount > 0 && selectedCount < features.length;
  };

  const handleGlobalSelectAll = (
    permissionType: keyof Omit<Permission, "id" | "feature">
  ) => {
    const allSelected = permissions.every((perm) => perm[permissionType]);

    setPermissions((prev) =>
      prev.map((perm) => ({
        ...perm,
        [permissionType]: !allSelected,
      }))
    );
  };

  const isGlobalPermissionSelected = (
    permissionType: keyof Omit<Permission, "id" | "feature">
  ): boolean => {
    return permissions.every((perm) => perm[permissionType]);
  };

  const isGlobalPermissionIndeterminate = (
    permissionType: keyof Omit<Permission, "id" | "feature">
  ): boolean => {
    const selectedCount = permissions.filter(
      (perm) => perm[permissionType]
    ).length;
    return selectedCount > 0 && selectedCount < permissions.length;
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      notifications.show({
        title: "Error",
        message: "Please select a role first",
        color: "red",
      });
      return;
    }

    try {
      setSaving(true);
      await api.post(`/api/roles/${selectedRole}/permissions`, {
        permissions: permissions,
      });

      notifications.show({
        title: "Success",
        message: "Role permissions updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save permissions",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getPermissionForFeature = (
    featureName: string
  ): Permission | undefined => {
    return permissions.find((p) => p.feature === featureName);
  };

  const selectedRoleName =
    roles.find((role) => role.id.toString() === selectedRole)?.name || "";

  return (
    <Container size="xl" py="md">
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {" "}
        <div style={{ position: "relative" }}>
          {loading && (
            <UltraLoader
              fullscreen
              size="lg"
              message="Loading role permissions..."
              variant="detailed"
            />
          )}

          <Group justify="space-between" mb="lg">
            <Group gap="sm">
              <IconShield size={24} color="#667eea" />
              <Title
                order={3}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontWeight: 600,
                }}
              >
                Role Permission For: {selectedRoleName || "Select Role"}
              </Title>
            </Group>

            <Group gap="sm">
              <Select
                placeholder="Select Role"
                data={roles.map((role) => ({
                  value: role.id.toString(),
                  label: role.name,
                }))}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value || "")}
                style={{ minWidth: 200 }}
                styles={{
                  input: {
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#333",
                  },
                }}
              />{" "}
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSavePermissions}
                loading={saving}
                disabled={!selectedRole}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none",
                }}
              >
                Save Permissions
              </Button>
            </Group>
          </Group>

          {selectedRole && (
            <Box>
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr
                      style={{ background: "rgba(102, 126, 234, 0.1)" }}
                    >
                      <Table.Th style={{ width: "40%" }}>Feature</Table.Th>
                      <Table.Th style={{ textAlign: "center", width: "15%" }}>
                        <Badge color="blue" variant="light">
                          View
                        </Badge>
                      </Table.Th>
                      <Table.Th style={{ textAlign: "center", width: "15%" }}>
                        <Badge color="green" variant="light">
                          Add
                        </Badge>
                      </Table.Th>
                      <Table.Th style={{ textAlign: "center", width: "15%" }}>
                        <Badge color="orange" variant="light">
                          Edit
                        </Badge>
                      </Table.Th>
                      <Table.Th style={{ textAlign: "center", width: "15%" }}>
                        <Badge color="red" variant="light">
                          Delete
                        </Badge>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>{" "}
                  <Table.Tbody>
                    {" "}
                    {/* Global Select All Row */}
                    <Table.Tr
                      style={{
                        background: "rgba(102, 126, 234, 0.1)",
                        fontWeight: "bold",
                      }}
                    >
                      <Table.Td style={{ width: "40%" }}>
                        <Group gap="xs">
                          <IconSelectAll size={16} color="#667eea" />
                          <Text fw={700} size="sm" c="blue">
                            Select All Permissions
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", width: "15%" }}>
                        <Tooltip label="Select/Deselect all View permissions">
                          <Checkbox
                            checked={isGlobalPermissionSelected("view")}
                            indeterminate={isGlobalPermissionIndeterminate(
                              "view"
                            )}
                            onChange={() => handleGlobalSelectAll("view")}
                            color="blue"
                            size="md"
                          />
                        </Tooltip>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", width: "15%" }}>
                        <Tooltip label="Select/Deselect all Add permissions">
                          <Checkbox
                            checked={isGlobalPermissionSelected("add")}
                            indeterminate={isGlobalPermissionIndeterminate(
                              "add"
                            )}
                            onChange={() => handleGlobalSelectAll("add")}
                            color="green"
                            size="md"
                          />
                        </Tooltip>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", width: "15%" }}>
                        <Tooltip label="Select/Deselect all Edit permissions">
                          <Checkbox
                            checked={isGlobalPermissionSelected("edit")}
                            indeterminate={isGlobalPermissionIndeterminate(
                              "edit"
                            )}
                            onChange={() => handleGlobalSelectAll("edit")}
                            color="orange"
                            size="md"
                          />
                        </Tooltip>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", width: "15%" }}>
                        <Tooltip label="Select/Deselect all Delete permissions">
                          <Checkbox
                            checked={isGlobalPermissionSelected("delete")}
                            indeterminate={isGlobalPermissionIndeterminate(
                              "delete"
                            )}
                            onChange={() => handleGlobalSelectAll("delete")}
                            color="red"
                            size="md"
                          />
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                    {/* Separator Row */}
                    <Table.Tr>
                      <Table.Td
                        colSpan={5}
                        style={{
                          height: "8px",
                          background: "rgba(0,0,0,0.02)",
                        }}
                      />
                    </Table.Tr>
                    {Object.entries(PERMISSION_CATEGORIES).map(
                      ([category, features]) => (
                        <Fragment key={category}>
                          <Table.Tr
                            style={{ background: "rgba(102, 126, 234, 0.05)" }}
                          >
                            <Table.Td style={{ width: "40%" }}>
                              <Group
                                gap="xs"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleCategory(category)}
                              >
                                <ActionIcon variant="subtle" size="sm">
                                  {expandedCategories.includes(category) ? (
                                    <IconChevronDown size={16} />
                                  ) : (
                                    <IconChevronRight size={16} />
                                  )}
                                </ActionIcon>
                                <Text fw={600} size="sm" c="blue">
                                  {category}
                                </Text>
                                <Badge size="xs" variant="outline" color="blue">
                                  {features.length} features
                                </Badge>
                              </Group>{" "}
                            </Table.Td>
                            <Table.Td
                              style={{ textAlign: "center", width: "15%" }}
                            >
                              <Tooltip
                                label={`Select/Deselect all View permissions for ${category}`}
                              >
                                <Checkbox
                                  checked={isCategoryPermissionSelected(
                                    category,
                                    "view"
                                  )}
                                  indeterminate={isCategoryPermissionIndeterminate(
                                    category,
                                    "view"
                                  )}
                                  onChange={() =>
                                    handleCategorySelectAll(category, "view")
                                  }
                                  color="blue"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Table.Td>
                            <Table.Td
                              style={{ textAlign: "center", width: "15%" }}
                            >
                              <Tooltip
                                label={`Select/Deselect all Add permissions for ${category}`}
                              >
                                <Checkbox
                                  checked={isCategoryPermissionSelected(
                                    category,
                                    "add"
                                  )}
                                  indeterminate={isCategoryPermissionIndeterminate(
                                    category,
                                    "add"
                                  )}
                                  onChange={() =>
                                    handleCategorySelectAll(category, "add")
                                  }
                                  color="green"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Table.Td>
                            <Table.Td
                              style={{ textAlign: "center", width: "15%" }}
                            >
                              <Tooltip
                                label={`Select/Deselect all Edit permissions for ${category}`}
                              >
                                <Checkbox
                                  checked={isCategoryPermissionSelected(
                                    category,
                                    "edit"
                                  )}
                                  indeterminate={isCategoryPermissionIndeterminate(
                                    category,
                                    "edit"
                                  )}
                                  onChange={() =>
                                    handleCategorySelectAll(category, "edit")
                                  }
                                  color="orange"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Table.Td>
                            <Table.Td
                              style={{ textAlign: "center", width: "15%" }}
                            >
                              <Tooltip
                                label={`Select/Deselect all Delete permissions for ${category}`}
                              >
                                <Checkbox
                                  checked={isCategoryPermissionSelected(
                                    category,
                                    "delete"
                                  )}
                                  indeterminate={isCategoryPermissionIndeterminate(
                                    category,
                                    "delete"
                                  )}
                                  onChange={() =>
                                    handleCategorySelectAll(category, "delete")
                                  }
                                  color="red"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Tooltip>
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td colSpan={5} p={0}>
                              <Collapse
                                in={expandedCategories.includes(category)}
                              >
                                <Table>
                                  <Table.Tbody>
                                    {features.map((feature) => {
                                      const permission =
                                        getPermissionForFeature(feature);
                                      return (
                                        <Table.Tr key={feature}>
                                          <Table.Td
                                            style={{
                                              width: "40%",
                                              paddingLeft: "2rem",
                                            }}
                                          >
                                            <Group gap="sm">
                                              <IconChevronRight
                                                size={14}
                                                color="#ccc"
                                              />
                                              <Text size="sm">{feature}</Text>
                                            </Group>
                                          </Table.Td>
                                          <Table.Td
                                            style={{
                                              textAlign: "center",
                                              width: "15%",
                                            }}
                                          >
                                            <Checkbox
                                              checked={
                                                permission?.view || false
                                              }
                                              onChange={() =>
                                                handlePermissionChange(
                                                  feature,
                                                  "view"
                                                )
                                              }
                                              color="blue"
                                              size="sm"
                                            />
                                          </Table.Td>
                                          <Table.Td
                                            style={{
                                              textAlign: "center",
                                              width: "15%",
                                            }}
                                          >
                                            <Checkbox
                                              checked={permission?.add || false}
                                              onChange={() =>
                                                handlePermissionChange(
                                                  feature,
                                                  "add"
                                                )
                                              }
                                              color="green"
                                              size="sm"
                                            />
                                          </Table.Td>
                                          <Table.Td
                                            style={{
                                              textAlign: "center",
                                              width: "15%",
                                            }}
                                          >
                                            <Checkbox
                                              checked={
                                                permission?.edit || false
                                              }
                                              onChange={() =>
                                                handlePermissionChange(
                                                  feature,
                                                  "edit"
                                                )
                                              }
                                              color="orange"
                                              size="sm"
                                            />
                                          </Table.Td>
                                          <Table.Td
                                            style={{
                                              textAlign: "center",
                                              width: "15%",
                                            }}
                                          >
                                            <Checkbox
                                              checked={
                                                permission?.delete || false
                                              }
                                              onChange={() =>
                                                handlePermissionChange(
                                                  feature,
                                                  "delete"
                                                )
                                              }
                                              color="red"
                                              size="sm"
                                            />
                                          </Table.Td>
                                        </Table.Tr>
                                      );
                                    })}
                                  </Table.Tbody>
                                </Table>
                              </Collapse>
                            </Table.Td>
                          </Table.Tr>
                        </Fragment>
                      )
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Box>
          )}

          {!selectedRole && (
            <Box
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                border: "2px dashed rgba(102, 126, 234, 0.2)",
              }}
            >
              <IconShield
                size={48}
                color="#ccc"
                style={{ marginBottom: "1rem" }}
              />
              <Text c="dimmed" size="lg" fw={500}>
                Please select a role to manage permissions
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                Choose a role from the dropdown above to view and edit its
                permissions
              </Text>
            </Box>
          )}
        </div>
      </Paper>
    </Container>
  );
};

export default RolePermissionsPage;
