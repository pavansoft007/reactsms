-- Migration to add 'branch_id' column to login_credential table
-- Run this SQL script in your database

ALTER TABLE login_credential 
ADD COLUMN branch_id INT NULL 
AFTER role;

-- Add foreign key constraint (optional, but recommended)
ALTER TABLE login_credential 
ADD CONSTRAINT fk_login_credential_branch_id 
FOREIGN KEY (branch_id) REFERENCES branches(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify the changes
SELECT id, user_id, username, name, role, branch_id FROM login_credential LIMIT 10;
