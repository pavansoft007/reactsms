-- Performance optimization indexes for role permission system

-- Index for staff_privileges table
CREATE INDEX idx_staff_privileges_role_id ON staff_privileges(role_id);
CREATE INDEX idx_staff_privileges_permission_id ON staff_privileges(permission_id);
CREATE INDEX idx_staff_privileges_role_permission ON staff_privileges(role_id, permission_id);

-- Index for permission table
CREATE INDEX idx_permission_name ON permission(name);
CREATE INDEX idx_permission_module_id ON permission(module_id);

-- Index for roles table
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_system ON roles(is_system);

-- Composite indexes for common queries
CREATE INDEX idx_staff_privileges_permissions ON staff_privileges(role_id, is_view, is_add, is_edit, is_delete);
