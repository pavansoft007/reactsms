import React, { useState, useEffect, useCallback } from "react";
import { Badge, Avatar, Group, Text, ActionIcon, Menu } from "@mantine/core";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconUsers,
  IconPhone,
  IconMail,
  IconBook,
} from "@tabler/icons-react";
import { UltraListPage } from "../components/ui/UltraListPage";
import { notifications } from "@mantine/notifications";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employeeId: string;
  department: string;
  subjects: string[];
  qualification: string;
  experience: number;
  status: "active" | "inactive" | "on-leave";
  joiningDate: string;
  salary?: number;
  photo?: string;
}

const TeachersListPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadTeachers = useCallback(async () => {
    setLoading(true);

    // Mock data - replace with actual API calls
    const mockTeachers: Teacher[] = [
      {
        id: 1,
        name: "Dr. Sarah Williams",
        email: "sarah.williams@school.edu",
        phone: "+1-555-0201",
        employeeId: "EMP001",
        department: "Mathematics",
        subjects: ["Algebra", "Calculus", "Statistics"],
        qualification: "Ph.D in Mathematics",
        experience: 15,
        status: "active",
        joiningDate: "2019-08-15T00:00:00Z",
        salary: 75000,
        photo: "/api/placeholder/40/40",
      },
      {
        id: 2,
        name: "Prof. Michael Chen",
        email: "michael.chen@school.edu",
        phone: "+1-555-0202",
        employeeId: "EMP002",
        department: "Science",
        subjects: ["Physics", "Chemistry"],
        qualification: "M.Sc in Physics",
        experience: 12,
        status: "active",
        joiningDate: "2020-01-10T00:00:00Z",
        salary: 68000,
        photo: "/api/placeholder/40/40",
      },
      {
        id: 3,
        name: "Ms. Emily Davis",
        email: "emily.davis@school.edu",
        phone: "+1-555-0203",
        employeeId: "EMP003",
        department: "English",
        subjects: ["Literature", "Grammar", "Creative Writing"],
        qualification: "M.A in English Literature",
        experience: 8,
        status: "on-leave",
        joiningDate: "2021-03-22T00:00:00Z",
        salary: 55000,
        photo: "/api/placeholder/40/40",
      },
      {
        id: 4,
        name: "Mr. James Rodriguez",
        email: "james.rodriguez@school.edu",
        phone: "+1-555-0204",
        employeeId: "EMP004",
        department: "History",
        subjects: ["World History", "Geography"],
        qualification: "M.A in History",
        experience: 10,
        status: "active",
        joiningDate: "2020-09-01T00:00:00Z",
        salary: 62000,
        photo: "/api/placeholder/40/40",
      },
      {
        id: 5,
        name: "Dr. Lisa Thompson",
        email: "lisa.thompson@school.edu",
        phone: "+1-555-0205",
        employeeId: "EMP005",
        department: "Computer Science",
        subjects: ["Programming", "Database", "Web Development"],
        qualification: "Ph.D in Computer Science",
        experience: 18,
        status: "inactive",
        joiningDate: "2018-06-15T00:00:00Z",
        salary: 85000,
        photo: "/api/placeholder/40/40",
      },
    ];

    // Simulate API call
    setTimeout(() => {
      let filteredTeachers = [...mockTeachers];

      // Apply search filter
      if (searchQuery) {
        filteredTeachers = filteredTeachers.filter(
          (teacher) =>
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.employeeId
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            teacher.department
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            teacher.subjects.some((subject) =>
              subject.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
      }

      // Apply filters
      if (filters.status && filters.status !== "all") {
        filteredTeachers = filteredTeachers.filter(
          (t) => t.status === filters.status
        );
      }

      if (filters.department && filters.department !== "all") {
        filteredTeachers = filteredTeachers.filter(
          (t) => t.department === filters.department
        );
      }

      if (filters.experience && filters.experience !== "all") {
        switch (filters.experience) {
          case "junior":
            filteredTeachers = filteredTeachers.filter((t) => t.experience < 5);
            break;
          case "mid":
            filteredTeachers = filteredTeachers.filter(
              (t) => t.experience >= 5 && t.experience < 10
            );
            break;
          case "senior":
            filteredTeachers = filteredTeachers.filter(
              (t) => t.experience >= 10
            );
            break;
        }
      }

      setTeachers(filteredTeachers);
      setLoading(false);
    }, 500);
  }, [searchQuery, filters]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers, currentPage, pageSize]);

  const handleCreateTeacher = () => {
    notifications.show({
      title: "Add Teacher",
      message: "Opening teacher registration form...",
      color: "blue",
    });
  };

  const handleEditTeacher = (teacher: Teacher) => {
    notifications.show({
      title: "Edit Teacher",
      message: `Editing ${teacher.name}...`,
      color: "blue",
    });
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    notifications.show({
      title: "Delete Teacher",
      message: `Deleting ${teacher.name}...`,
      color: "red",
    });
  };

  const handleViewTeacher = (teacher: Teacher) => {
    notifications.show({
      title: "View Teacher",
      message: `Opening ${teacher.name} profile...`,
      color: "green",
    });
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    notifications.show({
      title: "Bulk Delete",
      message: `Deleting ${selectedIds.length} teachers...`,
      color: "red",
    });
  };

  const handleExport = (format: string) => {
    notifications.show({
      title: "Export",
      message: `Exporting teachers as ${format.toUpperCase()}...`,
      color: "blue",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "green",
      inactive: "gray",
      "on-leave": "yellow",
    };
    return (
      <Badge
        color={colors[status as keyof typeof colors]}
        variant={status === "active" ? "filled" : "light"}
        tt="capitalize"
      >
        {status === "on-leave" ? "On Leave" : status}
      </Badge>
    );
  };

  const getExperienceBadge = (experience: number) => {
    if (experience < 5) {
      return (
        <Badge color="blue" variant="light">
          Junior ({experience}y)
        </Badge>
      );
    } else if (experience < 10) {
      return (
        <Badge color="orange" variant="light">
          Mid-level ({experience}y)
        </Badge>
      );
    } else {
      return (
        <Badge color="purple" variant="light">
          Senior ({experience}y)
        </Badge>
      );
    }
  };

  const columns = [
    {
      key: "teacher",
      label: "Teacher",
      sortable: true,
      render: (value: any, row: Teacher) => (
        <Group gap="sm">
          <Avatar
            src={row.photo}
            alt={row.name}
            size="md"
            radius="md"
            style={{ border: "1px solid #e0e0e0" }}
          >
            {!row.photo &&
              row.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
          </Avatar>
          <div>
            <Text fw={500} size="sm" lineClamp={1}>
              {row.name}
            </Text>
            <Text size="xs" c="dimmed">
              {row.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: "employeeDetails",
      label: "Employee Details",
      sortable: true,
      render: (value: any, row: Teacher) => (
        <div>
          <Text size="sm" fw={500}>
            {row.employeeId}
          </Text>
          <Text size="xs" c="dimmed">
            {row.department}
          </Text>
        </div>
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (value: any, row: Teacher) => (
        <div>
          <Group gap="xs" mb={2}>
            <IconBook size={12} />
            <Text size="xs" fw={500}>
              {row.subjects.length} subject{row.subjects.length > 1 ? "s" : ""}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {row.subjects.join(", ")}
          </Text>
        </div>
      ),
    },
    {
      key: "qualification",
      label: "Qualification",
      render: (value: string, row: Teacher) => (
        <div>
          <Text size="sm" fw={500} lineClamp={1}>
            {value}
          </Text>
          {getExperienceBadge(row.experience)}
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (value: any, row: Teacher) => (
        <div>
          {row.phone && (
            <Group gap="xs" mb={2}>
              <IconPhone size={12} />
              <Text size="xs">{row.phone}</Text>
            </Group>
          )}
          <Group gap="xs">
            <IconMail size={12} />
            <Text size="xs" lineClamp={1}>
              {row.email}
            </Text>
          </Group>
        </div>
      ),
    },
    {
      key: "joiningDate",
      label: "Joining Date",
      sortable: true,
      render: (value: string) => <Text size="sm">{formatDate(value)}</Text>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      align: "center" as const,
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "On Leave", value: "on-leave" },
      ],
    },
    {
      key: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { label: "All Departments", value: "all" },
        { label: "Mathematics", value: "Mathematics" },
        { label: "Science", value: "Science" },
        { label: "English", value: "English" },
        { label: "History", value: "History" },
        { label: "Computer Science", value: "Computer Science" },
      ],
    },
    {
      key: "experience",
      label: "Experience Level",
      type: "select" as const,
      options: [
        { label: "All Levels", value: "all" },
        { label: "Junior (< 5 years)", value: "junior" },
        { label: "Mid-level (5-10 years)", value: "mid" },
        { label: "Senior (10+ years)", value: "senior" },
      ],
    },
  ];

  return (
    <UltraListPage
      title="Teachers"
      data={teachers}
      columns={columns}
      loading={loading}
      searchable
      filterable
      exportable
      selectable
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Teachers", href: "/teachers" },
        { label: "List" },
      ]}
      pagination={{
        page: currentPage,
        pageSize: pageSize,
        total: teachers.length * 4, // Mock total for demonstration
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
      actions={{
        create: {
          label: "New Teacher",
          onClick: handleCreateTeacher,
        },
        bulk: [
          {
            label: "Delete Selected",
            icon: <IconTrash size={16} />,
            onClick: handleBulkDelete,
            color: "red",
          },
        ],
        row: [
          {
            label: "View",
            icon: <IconEye size={16} />,
            onClick: handleViewTeacher,
          },
          {
            label: "Edit",
            icon: <IconEdit size={16} />,
            onClick: handleEditTeacher,
          },
          {
            label: "Delete",
            icon: <IconTrash size={16} />,
            onClick: handleDeleteTeacher,
            color: "red",
          },
        ],
      }}
      filters={filterOptions}
      onSearch={(query) => setSearchQuery(query)}
      onFilter={(filterValues) => setFilters(filterValues)}
      onSort={(column, direction) => {
        console.log("Sort:", column, direction);
        // Implement sorting logic
      }}
      onExport={handleExport}
      onRefresh={loadTeachers}
      emptyState={{
        title: "No teachers found",
        description: "Get started by adding your first teacher.",
        icon: <IconUsers size={48} stroke={1.5} color="#9ca3af" />,
        action: {
          label: "Add Teacher",
          onClick: handleCreateTeacher,
        },
      }}
      renderRowActions={(row: Teacher) => (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={16} />}
              onClick={() => handleViewTeacher(row)}
            >
              View Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={() => handleEditTeacher(row)}
            >
              Edit Teacher
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => handleDeleteTeacher(row)}
            >
              Delete Teacher
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    />
  );
};

export default TeachersListPage;
