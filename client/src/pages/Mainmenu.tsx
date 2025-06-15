import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Mainmenu.css';

// Add all menu modules from PHP mainmenu_web_simple.php
const menuItems = [
  // Academic
    {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'fas fa-tachometer-alt',
    desc: 'School performance dashboard',
  },
  {
    name: 'Student',
    url: '/students',
    icon: 'fas fa-user-graduate',
    desc: 'Manage student profiles, admissions, and records',
  },
  {
    name: 'Classes',
    url: '/classes',
    icon: 'fas fa-chalkboard',
    desc: 'Manage classes, sections, and assignments',
  },
  {
    name: 'Subject',
    url: '/subjects',
    icon: 'fas fa-book',
    desc: 'Manage subjects and curriculum',
  },
  {
    name: 'Section',
    url: '/sections',
    icon: 'fas fa-puzzle-piece',
    desc: 'Organize classes into sections',
  },
  {
    name: 'Syllabus',
    url: '/syllabus',
    icon: 'fas fa-list-alt',
    desc: 'Manage course syllabi and content',
  },
  // Student Activities
  {
    name: 'Attendance',
    url: '/attendance',
    icon: 'fas fa-check-double',
    desc: 'Track student and staff attendance',
  },
  {
    name: 'Exam',
    url: '/exams',
    icon: 'fas fa-diagnoses',
    desc: 'Manage exams, schedules, and halls',
  },
  {
    name: 'Mark',
    url: '/marks',
    icon: 'fas fa-poll',
    desc: 'Record and manage student marks',
  },
  {
    name: 'Homework',
    url: '/homework',
    icon: 'fas fa-tasks',
    desc: 'Assign and track homework',
  },
  {
    name: 'Promotion',
    url: '/promotion',
    icon: 'fas fa-arrow-circle-up',
    desc: 'Manage student promotions',
  },
  // Finance
  {
    name: 'Fees',
    url: '/fees',
    icon: 'fas fa-money-bill-wave',
    desc: 'Manage student fees and payments',
  },
  {
    name: 'Expense',
    url: '/expense',
    icon: 'fas fa-minus-circle',
    desc: 'Track and manage expenses',
  },
  {
    name: 'Income',
    url: '/income',
    icon: 'fas fa-plus-circle',
    desc: 'Record and manage income',
  },
  {
    name: 'Accounting',
    url: '/accounting',
    icon: 'fas fa-calculator',
    desc: 'Financial accounting and reports',
  },
  // Resources
  {
    name: 'Library',
    url: '/library',
    icon: 'fas fa-book-reader',
    desc: 'Manage library books and resources',
  },
  {
    name: 'Inventory',
    url: '/inventory',
    icon: 'fas fa-boxes',
    desc: 'Track school inventory and assets',
  },
  {
    name: 'Hostel',
    url: '/hostel',
    icon: 'fas fa-hotel',
    desc: 'Manage student hostels and rooms',
  },
  {
    name: 'Transport',
    url: '/transport',
    icon: 'fas fa-bus',
    desc: 'Manage school transportation',
  },
  // Communication
  {
    name: 'Event',
    url: '/events',
    icon: 'fas fa-calendar-alt',
    desc: 'Manage school events and activities',
  },
  {
    name: 'Communication',
    url: '/communication',
    icon: 'fas fa-comments',
    desc: 'School-wide communication tools',
  },
  {
    name: 'Send SMS/Email',
    url: '/sendsmsmail',
    icon: 'fas fa-envelope',
    desc: 'Send SMS and email notifications',
  },
  // Administration
  {
    name: 'Settings',
    url: '/settings',
    icon: 'fas fa-cogs',
    desc: 'System settings and configuration',
  },
  {
    name: 'Reports',
    url: '/reports',
    icon: 'fas fa-chart-bar',
    desc: 'Generate and view reports',
  },

  {
    name: 'Leave',
    url: '/leave',
    icon: 'fas fa-sign-out-alt',
    desc: 'Manage staff and student leaves',
  },
  {
    name: 'Award',
    url: '/award',
    icon: 'fas fa-trophy',
    desc: 'Manage awards and recognitions',
  },
];

const Mainmenu = () => {
  const navigate = useNavigate();

  return (
    <div className="mainmenu-container">
      <header className="mainmenu-header">
        <h1>Main Menu</h1>
        <p>Welcome! Select a module to continue.</p>
      </header>
      <div className="mainmenu-grid">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="mainmenu-card"
            onClick={() => navigate(item.url)}
            tabIndex={0}
            role="button"
            aria-label={item.name}
            onKeyPress={(e) => {
              if (e.key === 'Enter') navigate(item.url);
            }}
          >
            <i className={item.icon + ' mainmenu-icon'}></i>
            <div className="mainmenu-title">{item.name}</div>
            <div className="mainmenu-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mainmenu;
