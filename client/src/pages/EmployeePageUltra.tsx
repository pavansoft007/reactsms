import React, { useState, useEffect } from "react";
import {
  Container,
  Group,
  Text,
  SimpleGrid,
  Stack,
  ActionIcon,
  Avatar,
} from "@mantine/core";
import {
  IconUsers,
  IconPlus,
  IconSearch,
  IconReportAnalytics,
  IconEye,
  IconEdit,
  IconTrash,
  IconBriefcase,
  IconPhone,
  IconMail,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react";
import {
  UltraCard,
  UltraButton,
  UltraInput,
  UltraSelect,
  UltraTable,
  UltraTableActions,
  UltraTableBadge,
  UltraModal,
  UltraTextarea,
} from "../components/ui";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employeeId: string;
  department: string;
  designation: string;
  salary?: number;
  joiningDate: string;
  status: "active" | "inactive" | "terminated";
  avatar?: string;
  address?: string;
  experience: number;
  branchId: number;
  branchName: string;
  createdAt: string;
}

interface Department {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

const EmployeePageUltra: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments] = useState<Department[]>([
    { id: 1, name: "Administration" },
    { id: 2, name: "Teaching" },
    { id: 3, name: "Support Staff" },
    { id: 4, name: "IT Department" },
  ]);
  const [branches] = useState<Branch[]>([
    { id: 1, name: "Main Campus" },
    { id: 2, name: "North Branch" },
    { id: 3, name: "South Branch" },
  ]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("");

  // Mock data for demonstration
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: 1,
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@school.edu",
        phone: "+1234567890",
        employeeId: "EMP001",
        department: "Teaching",
        designation: "Senior Teacher",
        salary: 75000,
        joiningDate: "2022-01-15",
        status: "active",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
        address: "123 Main Street, City",
        experience: 8,
        branchId: 1,
        branchName: "Main Campus",
        createdAt: "2022-01-15",
      },
      {
        id: 2,
        name: "John Smith",
        email: "john.smith@school.edu",
        phone: "+1234567891",
        employeeId: "EMP002",
        department: "Administration",
        designation: "Principal",
        salary: 120000,
        joiningDate: "2020-08-01",
        status: "active",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        address: "456 Oak Avenue, City",
        experience: 15,
        branchId: 1,
        branchName: "Main Campus",
        createdAt: "2020-08-01",
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@school.edu",
        phone: "+1234567892",
        employeeId: "EMP003",
        department: "Support Staff",
        designation: "Maintenance Head",
        salary: 45000,
        joiningDate: "2023-03-10",
        status: "active",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        address: "789 Pine Street, City",
        experience: 5,
        branchId: 2,
        branchName: "North Branch",
        createdAt: "2023-03-10",
      },
      {
        id: 4,
        name: "Emily Brown",
        email: "emily.brown@school.edu",
        phone: "+1234567893",
        employeeId: "EMP004",
        department: "IT Department",
        designation: "System Administrator",
        salary: 65000,
        joiningDate: "2021-11-20",
        status: "inactive",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        address: "321 Elm Road, City",
        experience: 6,
        branchId: 1,
        branchName: "Main Campus",
        createdAt: "2021-11-20",
      },
    ];

    setEmployees(mockEmployees);
  }, []);

  const handleEmployeeSubmit = (formData: any) => {
    if (selectedEmployee) {
      // Update existing employee
      setEmployees(
        employees.map((employee) =>
          employee.id === selectedEmployee.id
            ? { ...employee, ...formData, id: selectedEmployee.id }
            : employee
        )
      );
    } else {
      // Add new employee
      const newEmployee: Employee = {
        ...formData,
        id: Math.max(...employees.map((e) => e.id), 0) + 1,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsEmployeeModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(employees.filter((e) => e.id !== employeeId));
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      !filterDepartment || employee.department === filterDepartment;
    const matchesStatus = !filterStatus || employee.status === filterStatus;
    const matchesBranch =
      !filterBranch || employee.branchId.toString() === filterBranch;

    return matchesSearch && matchesDepartment && matchesStatus && matchesBranch;
  });

  const stats = [
    {
      title: "Total Employees",
      value: employees.length.toString(),
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Active Employees",
      value: employees.filter((e) => e.status === "active").length.toString(),
      icon: IconUserCheck,
      color: "green",
    },
    {
      title: "Departments",
      value: departments.length.toString(),
      icon: IconBriefcase,
      color: "purple",
    },
    {
      title: "Inactive Employees",
      value: employees.filter((e) => e.status === "inactive").length.toString(),
      icon: IconUserX,
      color: "red",
    },
  ];

  return (
    <Container size="xl" className="ultra-container">
      {/* Header */}
      <UltraCard className="ultra-header-card">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text className="ultra-title">Employee Management</Text>
            <Text className="ultra-subtitle">
              Manage staff, track performance, and handle HR operations
            </Text>
          </div>
          <Group>
            <UltraButton
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedEmployee(null);
                setIsEmployeeModalOpen(true);
              }}
            >
              Add Employee
            </UltraButton>
            <UltraButton
              variant="outline"
              leftSection={<IconReportAnalytics size={16} />}
            >
              HR Reports
            </UltraButton>
          </Group>
        </Group>
      </UltraCard>

      {/* Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} className="ultra-stats-grid">
        {stats.map((stat) => (
          <UltraCard key={stat.title} className="ultra-stat-card">
            <Group justify="space-between">
              <div>
                <Text className="ultra-stat-label">{stat.title}</Text>
                <Text className="ultra-stat-value">{stat.value}</Text>
              </div>
              <div
                className="ultra-stat-icon"
                style={{ color: `var(--mantine-color-${stat.color}-6)` }}
              >
                <stat.icon size={32} />
              </div>
            </Group>
          </UltraCard>
        ))}
      </SimpleGrid>

      {/* Filters and Search */}
      <UltraCard>
        <Stack gap="md">
          <Group gap="md">
            <UltraInput
              placeholder="Search employees..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <UltraSelect
              placeholder="Department"
              data={[
                { value: "", label: "All Departments" },
                ...departments.map((dept) => ({
                  value: dept.name,
                  label: dept.name,
                })),
              ]}
              value={filterDepartment}
              onChange={(value) => setFilterDepartment(value || "")}
            />
            <UltraSelect
              placeholder="Status"
              data={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "terminated", label: "Terminated" },
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value || "")}
            />
            <UltraSelect
              placeholder="Branch"
              data={[
                { value: "", label: "All Branches" },
                ...branches.map((branch) => ({
                  value: branch.id.toString(),
                  label: branch.name,
                })),
              ]}
              value={filterBranch}
              onChange={(value) => setFilterBranch(value || "")}
            />
          </Group>
        </Stack>
      </UltraCard>

      {/* Employees Table */}
      <UltraCard>
        <UltraTable variant="glass" hoverable>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <Group gap="sm">
                    <Avatar
                      src={employee.avatar}
                      alt={employee.name}
                      size="sm"
                      radius="xl"
                    >
                      {employee.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text fw={500}>{employee.name}</Text>
                      <Text size="xs" c="dimmed">
                        {employee.branchName}
                      </Text>
                    </div>
                  </Group>
                </td>
                <td>
                  <Text size="sm" fw={500}>
                    {employee.employeeId}
                  </Text>
                </td>
                <td>
                  <Text size="sm">{employee.department}</Text>
                </td>
                <td>
                  <Text size="sm">{employee.designation}</Text>
                </td>
                <td>
                  <div>
                    <Group gap={4}>
                      <IconPhone size={12} />
                      <Text size="xs">{employee.phone}</Text>
                    </Group>
                    <Group gap={4}>
                      <IconMail size={12} />
                      <Text size="xs">{employee.email}</Text>
                    </Group>
                  </div>
                </td>
                <td>
                  {(() => {
                    let variant: "success" | "warning" | "error" = "success";
                    if (employee.status === "inactive") variant = "warning";
                    else if (employee.status === "terminated")
                      variant = "error";

                    return (
                      <UltraTableBadge variant={variant}>
                        {employee.status}
                      </UltraTableBadge>
                    );
                  })()}
                </td>
                <td>
                  <Text size="sm" fw={500}>
                    {employee.salary
                      ? `$${employee.salary.toLocaleString()}`
                      : "N/A"}
                  </Text>
                </td>
                <td>
                  <UltraTableActions>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsEmployeeModalOpen(true);
                      }}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsEmployeeModalOpen(true);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </UltraTableActions>
                </td>
              </tr>
            ))}
          </tbody>
        </UltraTable>
      </UltraCard>

      {/* Employee Modal */}
      <UltraModal
        opened={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setSelectedEmployee(null);
        }}
        title={selectedEmployee ? "Edit Employee" : "Add New Employee"}
        size="lg"
      >
        <EmployeeForm
          employee={selectedEmployee}
          departments={departments}
          branches={branches}
          onSubmit={handleEmployeeSubmit}
          onCancel={() => {
            setIsEmployeeModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      </UltraModal>
    </Container>
  );
};

// Employee Form Component
const EmployeeForm: React.FC<{
  employee?: Employee | null;
  departments: Department[];
  branches: Branch[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ employee, departments, branches, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    employeeId: employee?.employeeId || "",
    department: employee?.department || "",
    designation: employee?.designation || "",
    salary: employee?.salary || 0,
    joiningDate: employee?.joiningDate || "",
    status: employee?.status || "active",
    address: employee?.address || "",
    experience: employee?.experience || 0,
    branchId: employee?.branchId || 1,
    branchName: employee?.branchName || branches[0]?.name || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find((b) => b.id.toString() === branchId);
    setFormData({
      ...formData,
      branchId: parseInt(branchId),
      branchName: branch?.name || "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Group grow>
          <UltraInput
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <UltraInput
            label="Employee ID"
            placeholder="Enter employee ID"
            value={formData.employeeId}
            onChange={(e) =>
              setFormData({ ...formData, employeeId: e.target.value })
            }
            required
          />
        </Group>

        <Group grow>
          <UltraInput
            label="Email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <UltraInput
            label="Phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </Group>

        <Group grow>
          <UltraSelect
            label="Department"
            placeholder="Select department"
            data={departments.map((dept) => ({
              value: dept.name,
              label: dept.name,
            }))}
            value={formData.department}
            onChange={(value) =>
              setFormData({ ...formData, department: value || "" })
            }
            required
          />

          <UltraInput
            label="Designation"
            placeholder="Enter designation"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
            required
          />
        </Group>

        <Group grow>
          <UltraInput
            label="Salary"
            type="number"
            placeholder="Enter salary"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: parseInt(e.target.value) })
            }
          />

          <UltraInput
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) =>
              setFormData({ ...formData, joiningDate: e.target.value })
            }
            required
          />
        </Group>

        <Group grow>
          <UltraSelect
            label="Status"
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "terminated", label: "Terminated" },
            ]}
            value={formData.status}
            onChange={(value) =>
              setFormData({
                ...formData,
                status: (value as Employee["status"]) || "active",
              })
            }
            required
          />

          <UltraSelect
            label="Branch"
            placeholder="Select branch"
            data={branches.map((branch) => ({
              value: branch.id.toString(),
              label: branch.name,
            }))}
            value={formData.branchId.toString()}
            onChange={(value) => handleBranchChange(value || "1")}
            required
          />
        </Group>

        <UltraTextarea
          label="Address"
          placeholder="Enter address"
          rows={3}
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

        <Group justify="flex-end" mt="md">
          <UltraButton variant="outline" onClick={onCancel}>
            Cancel
          </UltraButton>
          <UltraButton type="submit">
            {employee ? "Update Employee" : "Add Employee"}
          </UltraButton>
        </Group>
      </Stack>
    </form>
  );
};

export default EmployeePageUltra;
