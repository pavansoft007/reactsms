# Role and Permission Management System Guide

## Overview

This document describes the complete role and permission management system implemented for the React SMS application. The system allows Master Admin to create roles, assign permissions to roles, group roles into role groups, and assign role groups to branches.

## System Architecture

### Database Structure

1. **roles** - Contains role definitions
2. **permission** - Contains available permissions/features
3. **staff_privileges** - Junction table linking roles to permissions with CRUD permissions
4. **role_groups** - Groups of roles
5. **role_group_roles** - Junction table linking role groups to roles
6. **branches** - School branches with assigned role groups

### API Endpoints

#### Role Management

- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

#### Permission Management

- `GET /api/roles/:id/permissions` - Get role permissions
- `POST /api/roles/:id/permissions` - Save role permissions

#### Role Groups

- `GET /api/role-groups` - Get all role groups
- `POST /api/role-groups` - Create role group
- `PUT /api/role-groups/:id` - Update role group
- `DELETE /api/role-groups/:id` - Delete role group

#### Branches

- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch with role group assignment

## UI Components

### 1. RolePermissionsPage.tsx

**Location**: `client/src/pages/RolePermissionsPage.tsx`

**Features**:

- Select role from dropdown
- View permissions organized by categories (Dashboard, Student Management, Academic, etc.)
- Collapsible category sections
- Checkboxes for View/Add/Edit/Delete permissions per feature
- Save permissions to backend
- Modern glassmorphic design

**Permission Categories**:

- Dashboard (widgets and charts)
- Student Management
- Academic (classes, subjects, exams)
- Employee Management
- Parent Management
- Fee Management
- Library
- Transport
- Hostel
- Attendance
- Examination
- Settings

### 2. RolesPage.tsx

**Location**: `client/src/pages/RolesPage.tsx`

**Features**:

- Create, edit, delete roles
- View all roles in table format
- System role protection (cannot delete system roles)
- Form validation

### 3. RoleGroupsPage.tsx

**Location**: `client/src/pages/RoleGroupsPage.tsx`

**Features**:

- Create role groups
- Assign multiple roles to groups
- Edit and delete role groups
- Multi-select role assignment

### 4. BranchesPage.tsx

**Location**: `client/src/pages/BranchesPage.tsx`

**Features**:

- Create branches
- Assign role groups to branches
- Create admin credentials for branch
- Dynamic role dropdown based on branch's role group

## Navigation and Access Control

### Sidebar Navigation

**Location**: `client/src/components/Layout.tsx`

The Settings menu contains role and permission management items:

- Role Permission (accessible only to Master Admin - role "1")
- Role Groups (accessible only to Master Admin - role "1")

### Access Control Logic

```typescript
const userRole = localStorage.getItem("user_role");
// Only Master Admin (role "1") can access role/permission management
const filteredNavItems = navigationItems.filter(
  (item) => !item.roles || item.roles.includes(userRole || "")
);
```

## Implementation Workflow

### 1. Master Admin Creates Roles

1. Navigate to Settings → Role Permission
2. Create new roles (e.g., "Branch Admin", "Teacher", "Student", "Accountant")
3. Each role gets stored in the `roles` table

### 2. Assign Permissions to Roles

1. Select a role from the dropdown
2. Enable/disable permissions for each feature category
3. Permissions are stored in `staff_privileges` table linking role_id to permission_id

### 3. Create Role Groups

1. Navigate to Settings → Role Groups
2. Create logical groups (e.g., "School Staff", "Academic Staff", "Admin Staff")
3. Assign multiple roles to each group
4. Groups are stored in `role_groups` with roles linked via `role_group_roles`

### 4. Assign Role Groups to Branches

1. Navigate to Branches
2. Create new branch
3. Select appropriate role group for the branch
4. System creates admin credentials with roles from the assigned group

### 5. Branch Admin Management

1. Branch admins can only assign roles that are part of their branch's role group
2. User creation shows filtered roles based on branch assignment
3. Role-based access control throughout the application

## Key Features

### Permission System

- **Granular Control**: Each feature has View/Add/Edit/Delete permissions
- **Category Organization**: Permissions grouped by functional areas
- **Visual Interface**: Modern UI with collapsible sections and color-coded checkboxes

### Role Hierarchy

- **Master Admin**: Full system access, role/permission management
- **Branch Admin**: Limited to their branch's role group
- **Feature-specific**: Teachers, Students, Accountants with appropriate permissions

### Data Integrity

- **System Role Protection**: Prevents deletion of critical system roles
- **Validation**: Input validation on all forms
- **Error Handling**: Comprehensive error handling and user feedback

## Security Considerations

1. **Authentication**: JWT-based authentication
2. **Authorization**: Role-based access control at API level
3. **Input Validation**: Server-side validation for all inputs
4. **System Protection**: System roles cannot be deleted

## Testing and Usage

### Testing the System

1. Start backend server: `cd server && npm start`
2. Start frontend: `cd client && npm run dev`
3. Login as Master Admin (role "1")
4. Navigate to Settings → Role Permission
5. Create and test role permissions

### Sample Roles to Create

1. **Super Admin** - Full access to all features
2. **Branch Admin** - Branch-specific management
3. **Teacher** - Academic features, student management
4. **Accountant** - Fee management, financial reports
5. **Student** - Limited read access to personal data
6. **Parent** - Access to child's information

## Future Enhancements

1. **Permission Inheritance**: Role groups inherit permissions from parent groups
2. **Time-based Permissions**: Temporary permission assignments
3. **Audit Logging**: Track permission changes and usage
4. **Advanced Filtering**: Search and filter permissions
5. **Bulk Operations**: Assign permissions to multiple roles simultaneously

## Troubleshooting

### Common Issues

1. **Permission not working**: Check if user's role has the required permission in `staff_privileges`
2. **Role not showing**: Verify role is assigned to user's branch role group
3. **Access denied**: Confirm user role matches required roles in navigation

### Debug Information

The system includes debug components that show current user role and permissions for troubleshooting.

---

This role and permission management system provides a comprehensive solution for managing user access in a multi-branch school management system, ensuring appropriate access control while maintaining flexibility for different organizational structures.
