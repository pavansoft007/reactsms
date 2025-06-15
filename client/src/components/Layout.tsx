import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
  Text,
  Burger,
  Group,
  ActionIcon,
  Menu,
  Avatar,
  UnstyledButton,
  Box,
  NavLink,
  Stack,
  Badge,
  Indicator,
} from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconSchool,
  IconBookmark,
  IconReportAnalytics,
  IconSettings,
  IconBuilding,
  IconLogout,
  IconBell,
  IconUser,
  IconChevronRight,
  IconGlobe,
  IconEdit,
  IconIdBadge,
  IconCertificate,
  IconHome,
  IconVideo,
  IconCloudUpload,
  IconBook,
  IconMail,
  IconCalculator,
  IconCreditCard,
  IconChartBar,
  IconNotebook,
  IconSpeakerphone,
  IconBrandWhatsapp,
  IconBriefcase,
} from "@tabler/icons-react";

interface SubNavItem {
  label: string;
  path: string;
  subItems?: SubNavItem[];
}

interface NavItem {
  label: string;
  icon: React.FC<any>;
  path: string;
  roles?: string[];
  badge?: string;
  subItems?: SubNavItem[];
}

const Layout: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem("user_role");
  const userName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("username") ||
    "User";
  const schoolName =
    localStorage.getItem("school_name") || "School Management System";

  // Enhanced navigation items based on PHP sidebar structure
  const navigationItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: IconDashboard,
      path: "/dashboard",
      roles: ["1", "2", "3", "4"],
    },
    {
      label: "Branches",
      icon: IconBuilding,
      path: "/branches",
      roles: ["1"], // Super admin only
    },
    {
      label: "Frontend",
      icon: IconGlobe,
      path: "/frontend",
      roles: ["1"],
      subItems: [
        { label: "Frontend Settings", path: "/frontend/settings" },
        { label: "Menu Management", path: "/frontend/menu" },
        { label: "Page Sections", path: "/frontend/sections" },
        { label: "Manage Pages", path: "/frontend/pages" },
        { label: "Slider", path: "/frontend/slider" },
        { label: "Features", path: "/frontend/features" },
        { label: "Testimonials", path: "/frontend/testimonials" },
        { label: "Services", path: "/frontend/services" },
        { label: "Gallery Category", path: "/frontend/gallery-category" },
        { label: "Gallery", path: "/frontend/gallery" },
        { label: "FAQ", path: "/frontend/faq" },
      ],
    },
    {
      label: "Admission",
      icon: IconEdit,
      path: "/admission",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Create Admission", path: "/admission/create" },
        { label: "Online Admission", path: "/admission/online" },
        { label: "Multiple Import", path: "/admission/import" },
        { label: "Category", path: "/admission/category" },
      ],
    },
    {
      label: "Student Details",
      icon: IconUsers,
      path: "/students",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Student List", path: "/students/list" },
        { label: "Login Deactivate", path: "/students/deactivate" },
      ],
    },
    {
      label: "Parents",
      icon: IconUser,
      path: "/parents",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Parents List", path: "/parents/list" },
        { label: "Add Parent", path: "/parents/add" },
        { label: "Login Deactivate", path: "/parents/deactivate" },
      ],
    },
    {
      label: "Employee",
      icon: IconUsers,
      path: "/employee",
      roles: ["1", "2"],
      subItems: [
        { label: "Employee List", path: "/employee/list" },
        { label: "Add Department", path: "/employee/department" },
        { label: "Add Designation", path: "/employee/designation" },
        { label: "Add Employee", path: "/employee/add" },
        { label: "Login Deactivate", path: "/employee/deactivate" },
      ],
    },
    {
      label: "Card Management",
      icon: IconIdBadge,
      path: "/cards",
      roles: ["1", "2"],
      subItems: [
        { label: "ID Card Template", path: "/cards/id-template" },
        { label: "Student ID Card", path: "/cards/student-id" },
        { label: "Employee ID Card", path: "/cards/employee-id" },
        { label: "Admit Card Template", path: "/cards/admit-template" },
        { label: "Generate Admit Card", path: "/cards/generate-admit" },
      ],
    },
    {
      label: "Certificate",
      icon: IconCertificate,
      path: "/certificate",
      roles: ["1", "2"],
      subItems: [
        { label: "Certificate Template", path: "/certificate/template" },
        { label: "Generate Student Certificate", path: "/certificate/student" },
        {
          label: "Generate Employee Certificate",
          path: "/certificate/employee",
        },
      ],
    },
    {
      label: "HRM",
      icon: IconBriefcase,
      path: "/hrm",
      roles: ["1", "2"],
      subItems: [
        {
          label: "Payroll",
          path: "/hrm/payroll",
          subItems: [
            { label: "Salary Template", path: "/hrm/payroll/template" },
            { label: "Salary Assign", path: "/hrm/payroll/assign" },
            { label: "Salary Payment", path: "/hrm/payroll/payment" },
          ],
        },
        {
          label: "Advance Salary",
          path: "/hrm/advance-salary",
          subItems: [
            { label: "My Application", path: "/hrm/advance-salary/request" },
            { label: "Manage Application", path: "/hrm/advance-salary/manage" },
          ],
        },
        {
          label: "Leave",
          path: "/hrm/leave",
          subItems: [
            { label: "Category", path: "/hrm/leave/category" },
            { label: "My Application", path: "/hrm/leave/request" },
            { label: "Manage Application", path: "/hrm/leave/manage" },
          ],
        },
        { label: "Award", path: "/hrm/award" },
      ],
    },
    {
      label: "Academic",
      icon: IconHome,
      path: "/academic",
      roles: ["1", "2", "3"],
      subItems: [
        {
          label: "Class & Section",
          path: "/academic/classes",
          subItems: [
            { label: "Control Classes", path: "/academic/classes" },
            { label: "Assign Class Teacher", path: "/academic/class-teacher" },
          ],
        },
        {
          label: "Subject",
          path: "/academic/subject",
          subItems: [
            { label: "Subject", path: "/academic/subject" },
            { label: "Class Assign", path: "/academic/subject-assign" },
          ],
        },
        { label: "Class Schedule", path: "/academic/class-schedule" },
        { label: "Teacher Schedule", path: "/academic/teacher-schedule" },
        { label: "Promotion", path: "/academic/promotion" },
      ],
    },
    {
      label: "Live Class Rooms",
      icon: IconVideo,
      path: "/live-class",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Live Class Rooms", path: "/live-class/rooms" },
        { label: "Live Class Reports", path: "/live-class/reports" },
      ],
    },
    {
      label: "Attachments Book",
      icon: IconCloudUpload,
      path: "/attachments",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Upload Content", path: "/attachments/upload" },
        { label: "Attachment Type", path: "/attachments/type" },
      ],
    },
    {
      label: "Homework",
      icon: IconBookmark,
      path: "/homework",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Homework", path: "/homework/list" },
        { label: "Evaluation Report", path: "/homework/evaluation" },
      ],
    },
    {
      label: "Exam Master",
      icon: IconBook,
      path: "/exam",
      roles: ["1", "2", "3"],
      subItems: [
        {
          label: "Exam",
          path: "/exam/setup",
          subItems: [
            { label: "Exam Term", path: "/exam/term" },
            { label: "Exam Hall", path: "/exam/hall" },
            { label: "Distribution", path: "/exam/distribution" },
            { label: "Exam Setup", path: "/exam/setup" },
          ],
        },
        {
          label: "Exam Schedule",
          path: "/exam/schedule",
          subItems: [
            { label: "Schedule", path: "/exam/schedule" },
            { label: "Add Schedule", path: "/exam/add-schedule" },
          ],
        },
        {
          label: "Marks",
          path: "/exam/marks",
          subItems: [
            { label: "Mark Entries", path: "/exam/marks" },
            { label: "Grades Range", path: "/exam/grades" },
          ],
        },
      ],
    },
    {
      label: "Online Exam",
      icon: IconSchool,
      path: "/online-exam",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Online Exam", path: "/online-exam/list" },
        { label: "Question Bank", path: "/online-exam/questions" },
        { label: "Question Group", path: "/online-exam/groups" },
        { label: "Exam Result", path: "/online-exam/results" },
      ],
    },
    {
      label: "Supervision",
      icon: IconBuilding,
      path: "/supervision",
      roles: ["1", "2"],
      subItems: [
        {
          label: "Hostel",
          path: "/supervision/hostel",
          subItems: [
            { label: "Hostel Master", path: "/supervision/hostel/master" },
            { label: "Hostel Room", path: "/supervision/hostel/room" },
            { label: "Category", path: "/supervision/hostel/category" },
            {
              label: "Allocation Report",
              path: "/supervision/hostel/allocation",
            },
          ],
        },
        {
          label: "Transport",
          path: "/supervision/transport",
          subItems: [
            { label: "Route Master", path: "/supervision/transport/route" },
            { label: "Vehicle Master", path: "/supervision/transport/vehicle" },
            { label: "Stoppage", path: "/supervision/transport/stoppage" },
            { label: "Assign Vehicle", path: "/supervision/transport/assign" },
            {
              label: "Allocation Report",
              path: "/supervision/transport/allocation",
            },
          ],
        },
      ],
    },
    {
      label: "Attendance",
      icon: IconChartBar,
      path: "/attendance",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Student", path: "/attendance/student" },
        { label: "Employee", path: "/attendance/employee" },
        { label: "Exam", path: "/attendance/exam" },
      ],
    },
    {
      label: "Library",
      icon: IconNotebook,
      path: "/library",
      roles: ["1", "2", "3"],
      subItems: [
        { label: "Books", path: "/library/books" },
        { label: "Books Category", path: "/library/category" },
        { label: "My Issued Book", path: "/library/issued" },
        { label: "Book Issue/Return", path: "/library/manage" },
      ],
    },
    {
      label: "Events",
      icon: IconSpeakerphone,
      path: "/events",
      roles: ["1", "2", "3", "4"],
      subItems: [
        { label: "Event Type", path: "/events/types" },
        { label: "Events", path: "/events/list" },
      ],
    },
    {
      label: "Bulk SMS & WhatsApp",
      icon: IconBrandWhatsapp,
      path: "/whatsapp",
      roles: ["1", "2", "3"],
      badge: "New",
      subItems: [
        { label: "Send SMS/Email/WhatsApp", path: "/whatsapp/send" },
        { label: "SMS/Email/WhatsApp Report", path: "/whatsapp/reports" },
        { label: "SMS Template", path: "/whatsapp/sms-template" },
        { label: "Email Template", path: "/whatsapp/email-template" },
        { label: "WhatsApp Template", path: "/whatsapp/template" },
      ],
    },
    {
      label: "Student Accounting",
      icon: IconCalculator,
      path: "/fees",
      roles: ["1", "2", "4"],
      subItems: [
        { label: "Fees Type", path: "/fees/type" },
        { label: "Fees Group", path: "/fees/group" },
        { label: "Fine Setup", path: "/fees/fine" },
        { label: "Fees Allocation", path: "/fees/allocation" },
        { label: "Payments History", path: "/fees/payments" },
        { label: "Due Fees Invoice", path: "/fees/due" },
        { label: "Fees Reminder", path: "/fees/reminder" },
      ],
    },
    {
      label: "Office Accounting",
      icon: IconCreditCard,
      path: "/accounting",
      roles: ["1", "2"],
      subItems: [
        { label: "Account", path: "/accounting/account" },
        { label: "New Deposit", path: "/accounting/deposit" },
        { label: "New Expense", path: "/accounting/expense" },
        { label: "All Transactions", path: "/accounting/transactions" },
        { label: "Voucher Head", path: "/accounting/voucher" },
      ],
    },
    {
      label: "Message",
      icon: IconMail,
      path: "/message",
      roles: ["1", "2", "3", "4"],
    },
    {
      label: "Reports",
      icon: IconReportAnalytics,
      path: "/reports",
      roles: ["1", "2", "3", "4"],
      subItems: [
        {
          label: "Fees Reports",
          path: "/reports/fees",
          subItems: [
            { label: "Fees Report", path: "/reports/fees/report" },
            { label: "Receipts Report", path: "/reports/fees/receipts" },
            { label: "Due Fees Report", path: "/reports/fees/due" },
            { label: "Fine Report", path: "/reports/fees/fine" },
          ],
        },
        {
          label: "Financial Reports",
          path: "/reports/financial",
          subItems: [
            {
              label: "Account Statement",
              path: "/reports/financial/statement",
            },
            { label: "Income Reports", path: "/reports/financial/income" },
            { label: "Expense Reports", path: "/reports/financial/expense" },
            {
              label: "Transitions Reports",
              path: "/reports/financial/transitions",
            },
            { label: "Balance Sheet", path: "/reports/financial/balance" },
            {
              label: "Income vs Expense",
              path: "/reports/financial/income-expense",
            },
          ],
        },
        {
          label: "Attendance Reports",
          path: "/reports/attendance",
          subItems: [
            { label: "Student Reports", path: "/reports/attendance/student" },
            { label: "Employee Reports", path: "/reports/attendance/employee" },
            { label: "Exam Reports", path: "/reports/attendance/exam" },
          ],
        },
        {
          label: "HRM",
          path: "/reports/hrm",
          subItems: [
            { label: "Payroll Summary", path: "/reports/hrm/payroll" },
            { label: "Leave Reports", path: "/reports/hrm/leave" },
          ],
        },
        {
          label: "Examination",
          path: "/reports/examination",
          subItems: [
            { label: "Report Card", path: "/reports/examination/report-card" },
            {
              label: "Tabulation Sheet",
              path: "/reports/examination/tabulation",
            },
          ],
        },
      ],
    },
    {
      label: "Settings",
      icon: IconSettings,
      path: "/settings",
      roles: ["1"],
      subItems: [
        { label: "Global Settings", path: "/settings/global" },
        { label: "School Settings", path: "/settings/school" },
        { label: "Create User", path: "/settings/create-user" },
        { label: "Role Permission", path: "/settings/roles" },
        { label: "Role Groups", path: "/settings/role-groups" },
        { label: "Session Settings", path: "/settings/session" },
        { label: "Translations", path: "/settings/translations" },
        { label: "Cron Job", path: "/settings/cron" },
        { label: "System Student Field", path: "/settings/student-field" },
        { label: "Custom Field", path: "/settings/custom-field" },
        { label: "Backup", path: "/settings/backup" },
        { label: "System Update", path: "/settings/update" },
      ],
    },
  ];

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || "")
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpened(false);
  };

  return (
    <AppShell
      navbar={{
        width: { base: 80, md: 300 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              mr="xl"
              hiddenFrom="sm"
            />
            <Text fw={600} size="xl" c="blue">
              {schoolName}
            </Text>
          </Group>

          <Group>
            <ActionIcon variant="light" size="lg">
              <Indicator color="red" size={6}>
                <IconBell size={20} />
              </Indicator>
            </ActionIcon>

            <Menu width={260} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={7}>
                    <Avatar size={32} radius="xl" color="blue">
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {userName}
                      </Text>
                    </Box>
                    <IconChevronRight size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />}>
                  Account Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                  color="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 70px)" }}
      >
        <Stack gap="xs">
          {filteredNavItems.map((item) => (
            <Box key={item.path}>
              <NavLink
                label={item.label}
                leftSection={<item.icon size={20} />}
                rightSection={
                  item.badge ? (
                    <Badge size="xs" variant="filled" color="red">
                      {item.badge}
                    </Badge>
                  ) : item.subItems ? (
                    <IconChevronRight size={16} />
                  ) : null
                }
                active={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                variant="filled"
                childrenOffset={28}
              >
                {item.subItems && (
                  <Stack gap="xs" mt="xs">
                    {item.subItems.map((subItem) => (
                      <Box key={subItem.path}>
                        <NavLink
                          label={subItem.label}
                          leftSection={<IconChevronRight size={16} />}
                          rightSection={
                            subItem.subItems ? (
                              <IconChevronRight size={14} />
                            ) : null
                          }
                          active={location.pathname === subItem.path}
                          onClick={() => handleNavigation(subItem.path)}
                          variant="light"
                          childrenOffset={20}
                        >
                          {subItem.subItems && (
                            <Stack gap="xs" mt="xs">
                              {subItem.subItems.map((nestedItem) => (
                                <NavLink
                                  key={nestedItem.path}
                                  label={nestedItem.label}
                                  leftSection={<IconChevronRight size={14} />}
                                  active={location.pathname === nestedItem.path}
                                  onClick={() =>
                                    handleNavigation(nestedItem.path)
                                  }
                                  variant="subtle"
                                />
                              ))}
                            </Stack>
                          )}
                        </NavLink>
                      </Box>
                    ))}
                  </Stack>
                )}
              </NavLink>
            </Box>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
