# Role and Permission System Demo

## Quick Start Guide

Follow these steps to test the complete role and permission management system:

### Prerequisites

1. Backend server running on port 8080
2. Frontend running on port 3000/3001/3002
3. Database connected and tables created
4. Logged in as Master Admin (role "1")

### Step 1: Create Roles

1. Navigate to **Settings → Role Permission**
2. Click on the role dropdown (should show existing roles)
3. Create new roles if needed via the Roles page

**Sample Roles to Test**:

- Super Admin (ID: 1) - Master admin
- Branch Admin (ID: 2) - Branch-level admin
- Teacher (ID: 3) - Academic staff
- Accountant (ID: 4) - Financial staff
- Student (ID: 5) - Limited access

### Step 2: Assign Permissions

1. **For Branch Admin Role**:

   - Select "Branch Admin" from dropdown
   - Enable permissions:
     - Dashboard: All widgets (View only)
     - Student Management: View, Add, Edit students
     - Academic: View, Add, Edit classes/subjects
     - Employee Management: View employees
     - Fee Management: View, Add, Edit fees
     - Reports: View all reports

2. **For Teacher Role**:

   - Select "Teacher" from dropdown
   - Enable permissions:
     - Dashboard: Student/Teacher widgets (View only)
     - Student Management: View, Edit students
     - Academic: View, Add, Edit homework/exams
     - Attendance: View, Add, Edit student attendance
     - Library: View, Add book issues

3. **For Accountant Role**:

   - Select "Accountant" from dropdown
   - Enable permissions:
     - Dashboard: Financial widgets (View only)
     - Fee Management: All permissions (View, Add, Edit, Delete)
     - Office Accounting: All permissions
     - Reports: Financial reports (View)

4. **For Student Role**:
   - Select "Student" from dropdown
   - Enable permissions:
     - Dashboard: Student widgets (View only)
     - Academic: View homework/exam results
     - Library: View personal issued books
     - Attendance: View personal attendance

### Step 3: Create Role Groups

1. Navigate to **Settings → Role Groups**
2. Create role groups:

   **Admin Staff Group**:

   - Name: "Admin Staff"
   - Description: "Administrative personnel"
   - Roles: Super Admin, Branch Admin

   **Academic Staff Group**:

   - Name: "Academic Staff"
   - Description: "Teaching and academic personnel"
   - Roles: Teacher, Branch Admin

   **Finance Staff Group**:

   - Name: "Finance Staff"
   - Description: "Financial and accounting personnel"
   - Roles: Accountant, Branch Admin

   **Student Group**:

   - Name: "Student Access"
   - Description: "Student portal access"
   - Roles: Student

### Step 4: Create Branches with Role Groups

1. Navigate to **Branches**
2. Create test branches:

   **Main Campus**:

   - Name: "Main Campus"
   - Address: "123 Education Street"
   - Role Group: "Admin Staff Group"
   - Admin Credentials: Create admin user

   **Secondary Campus**:

   - Name: "Secondary Campus"
   - Address: "456 Learning Avenue"
   - Role Group: "Academic Staff Group"
   - Admin Credentials: Create admin user

### Step 5: Test Permission System

1. **Permission Display Test**:

   - Go back to Role Permission page
   - Select different roles and verify permissions are saved correctly
   - Check that permissions display in organized categories
   - Verify collapsible categories work

2. **Access Control Test**:
   - Log out and log in as different users
   - Verify sidebar navigation shows appropriate items based on role
   - Test that role/permission management is only visible to Master Admin

## Expected Results

### Permission Categories Display

The Role Permission page should show:

- ✅ Dashboard (7 features)
- ✅ Student Management (5 features)
- ✅ Academic (7 features)
- ✅ Employee Management (5 features)
- ✅ Parent Management (1 feature)
- ✅ Fee Management (5 features)
- ✅ Library (3 features)
- ✅ Transport (4 features)
- ✅ Hostel (3 features)
- ✅ Attendance (2 features)
- ✅ Examination (4 features)
- ✅ Settings (6 features)

### UI Features Working

- ✅ Role dropdown populated with available roles
- ✅ Permission checkboxes functional (View/Add/Edit/Delete)
- ✅ Category sections collapsible/expandable
- ✅ Save button updates permissions in database
- ✅ Loading states and success/error notifications
- ✅ Modern glassmorphic design elements

### Navigation Access Control

- ✅ Master Admin sees "Role Permission" and "Role Groups" in Settings
- ✅ Other roles do not see permission management options
- ✅ Branch admin creation works with role group filtering

## Troubleshooting

### If Permissions Don't Save

1. Check browser console for API errors
2. Verify backend server is running
3. Check database connection
4. Ensure staff_privileges table exists

### If Roles Don't Load

1. Check roles table has data
2. Verify API endpoint `/api/roles` returns data
3. Check browser network tab for request errors

### If UI Doesn't Display Correctly

1. Verify all Mantine components are imported
2. Check for console errors
3. Ensure Tabler icons are available

### Database Verification

Run these SQL queries to verify data:

```sql
-- Check roles
SELECT * FROM roles;

-- Check permissions
SELECT * FROM permission;

-- Check role permissions
SELECT r.name as role_name, p.name as permission_name,
       sp.is_view, sp.is_add, sp.is_edit, sp.is_delete
FROM staff_privileges sp
JOIN roles r ON sp.role_id = r.id
JOIN permission p ON sp.permission_id = p.id
ORDER BY r.name, p.name;

-- Check role groups
SELECT * FROM role_groups;

-- Check role group assignments
SELECT rg.name as group_name, r.name as role_name
FROM role_group_roles rgr
JOIN role_groups rg ON rgr.role_group_id = rg.id
JOIN roles r ON rgr.role_id = r.id;
```

## Success Criteria

The system is working correctly if:

1. ✅ Master Admin can create and manage roles
2. ✅ Permissions can be assigned granularly per role per feature
3. ✅ Role groups can be created with multiple roles
4. ✅ Branches can be assigned role groups
5. ✅ Branch admins see filtered role options
6. ✅ Navigation respects role-based access control
7. ✅ UI is responsive and user-friendly
8. ✅ Data persists correctly in database

## Next Steps

After confirming the basic system works:

1. Add more specific permission checking in individual pages
2. Implement permission middleware in backend routes
3. Add audit logging for permission changes
4. Create user management pages with role assignment
5. Test multi-branch scenario with different admins

This completes the role and permission management system implementation matching the provided screenshot and requirements!
