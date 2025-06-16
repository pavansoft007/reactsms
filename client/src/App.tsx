import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import "./App.css";

// Import pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ClassPage from "./pages/ClassPage";
import SectionPage from "./pages/SectionPage";
import EnrollPage from "./pages/EnrollPage";
import ExamPage from "./pages/ExamPage";
import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";
import FeesPage from "./pages/FeesPage";
import LibraryPage from "./pages/LibraryPage";
import EventsPage from "./pages/EventsPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import BranchesPage from "./pages/BranchesPage";
import ParentsPage from "./pages/ParentsPage";
import EmployeePage from "./pages/EmployeePage";
import RoleGroupPage from "./pages/RoleGroupPage";
import RolePermissionsPage from "./pages/RolePermissionsPage";
import RolesPage from "./pages/RolesPage";
import RoleGroupsPage from "./pages/RoleGroupsPage";
import RoleManagementPage from "./pages/RoleManagementPage";
import SubjectPage from "./pages/SubjectPage";
import Mainmenu from "./pages/Mainmenu";
import DoubleNavbarUltra from "./layout/DoubleNavbarUltra";
import { theme } from "./theme";
import AdmissionCreate from "./pages/AdmissionCreate";
import UserCreatePage from "./pages/UserCreatePage";
import StudentCategoryPage from "./pages/StudentCategoryPage";
import ProductsPageExample from "./pages/ProductsPageExample";
import StudentsListPage from "./pages/StudentsListPage";
import TeachersListPage from "./pages/TeachersListPage";
import ListingPagesDemo from "./pages/ListingPagesDemo";
import { AcademicYearProvider } from "./context/AcademicYearContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function MantineThemeWrapper({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { colorScheme } = useTheme();

  const mantineTheme = {
    ...theme,
    colorScheme,
  };

  return <MantineProvider theme={mantineTheme}>{children}</MantineProvider>;
}

function App() {
  return (
    <ThemeProvider>
      <AcademicYearProvider>
        <MantineThemeWrapper>
          <ModalsProvider>
            <Notifications position="top-right" />
            <Router>
              <AppContent />
            </Router>
          </ModalsProvider>
        </MantineThemeWrapper>
      </AcademicYearProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("user_role");
  const location = useLocation();

  // Don't show AppShell layout on login page
  const showLayout = location.pathname !== "/login";

  const content = (
    <div className="App">
      <Routes>
        {" "}
        <Route path="/login" element={<LoginPage />} />
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Mainmenu />} />
            <Route path="mainmenu" element={<Mainmenu />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students/*" element={<StudentsPage />} />
            <Route path="parents/*" element={<ParentsPage />} />
            <Route path="employee/*" element={<EmployeePage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="classes" element={<ClassPage />} />
            <Route path="sections" element={<SectionPage />} />
            <Route path="enrollments" element={<EnrollPage />} />
            <Route path="exams" element={<ExamPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="whatsapp" element={<WhatsAppPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Unified Role Management Page */}
            <Route
              path="settings/role-management"
              element={<RoleManagementPage />}
            />
            {/* Legacy individual role pages for backward compatibility */}
            <Route path="settings/role-groups" element={<RoleGroupPage />} />
            <Route
              path="settings/role-permission"
              element={<RolePermissionsPage />}
            />
            <Route path="settings/create-user" element={<UserCreatePage />} />
            {userRole === "1" && (
              <Route path="branches" element={<BranchesPage />} />
            )}
            {/* Placeholder routes for other menu items - to be implemented */}
            <Route
              path="frontend/*"
              element={<div>Frontend Management - Coming Soon</div>}
            />{" "}
            <Route path="admission/create" element={<AdmissionCreate />} />
            <Route
              path="admission/*"
              element={<div>Admission Management - Coming Soon</div>}
            />
            <Route
              path="cards/*"
              element={<div>Card Management - Coming Soon</div>}
            />
            <Route
              path="certificate/*"
              element={<div>Certificate Management - Coming Soon</div>}
            />
            <Route path="hrm/*" element={<div>HRM - Coming Soon</div>} />
            <Route path="academic/classes" element={<ClassPage />} />
            <Route path="academic/subject" element={<SubjectPage />} />
            <Route
              path="academic/*"
              element={<div>Academic - Coming Soon</div>}
            />
            <Route
              path="live-class/*"
              element={<div>Live Class - Coming Soon</div>}
            />
            <Route
              path="attachments/*"
              element={<div>Attachments - Coming Soon</div>}
            />
            <Route
              path="homework/*"
              element={<div>Homework - Coming Soon</div>}
            />
            <Route
              path="exam/*"
              element={<div>Exam Master - Coming Soon</div>}
            />
            <Route
              path="online-exam/*"
              element={<div>Online Exam - Coming Soon</div>}
            />
            <Route
              path="supervision/*"
              element={<div>Supervision - Coming Soon</div>}
            />
            <Route
              path="attendance/*"
              element={<div>Attendance - Coming Soon</div>}
            />
            <Route
              path="accounting/*"
              element={<div>Office Accounting - Coming Soon</div>}
            />
            <Route path="message" element={<div>Message - Coming Soon</div>} />
            <Route path="admission/create" element={<AdmissionCreate />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="role-groups" element={<RoleGroupsPage />} />
            <Route path="products" element={<ProductsPageExample />} />
            <Route path="students-list" element={<StudentsListPage />} />
            <Route path="teachers-list" element={<TeachersListPage />} />
            <Route path="listing-demo" element={<ListingPagesDemo />} />
            <Route path="student-category" element={<StudentCategoryPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
      </Routes>
    </div>
  );
  // Conditionally wrap with DoubleNavbar
  return showLayout ? (
    <DoubleNavbarUltra>{content}</DoubleNavbarUltra>
  ) : (
    content
  );
}

export default App;
