import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
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
import Layout from "./components/Layout";
import RoleGroupPage from "./pages/RoleGroupPage";
import RolePermissionPage from "./pages/RolePermissionPage";
import SubjectPage from "./pages/SubjectPage";
import Mainmenu from "./pages/Mainmenu";

// Create custom theme
const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  colors: {
    brand: [
      "#e3f2fd",
      "#bbdefb",
      "#90caf9",
      "#64b5f6",
      "#42a5f5",
      "#2196f3",
      "#1e88e5",
      "#1976d2",
      "#1565c0",
      "#0d47a1",
    ],
  },
});

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("user_role");

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="top-right" />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              {isAuthenticated ? (
                <Route path="/" element={<Layout />}>
                  <Route index element={<Mainmenu />} />
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
                  <Route
                    path="settings/role-groups"
                    element={<RoleGroupPage />}
                  />
                  <Route
                    path="settings/role-permission"
                    element={<RolePermissionPage />}
                  />
                  {userRole === "1" && (
                    <Route path="branches" element={<BranchesPage />} />
                  )}
                  {/* Placeholder routes for other menu items - to be implemented */}
                  <Route
                    path="frontend/*"
                    element={<div>Frontend Management - Coming Soon</div>}
                  />
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
                  <Route
                    path="academic/classes"
                    element={<ClassPage />}
                  />
                  <Route
                    path="academic/subject"
                    element={<SubjectPage />}
                  />
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
                  <Route
                    path="message"
                    element={<div>Message - Coming Soon</div>}
                  />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
              />
            </Routes>
          </div>
        </Router>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
