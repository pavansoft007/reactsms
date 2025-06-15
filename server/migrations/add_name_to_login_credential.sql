-- Migration to add 'name' column to login_credential table
-- Run this SQL script in your database

ALTER TABLE login_credential 
ADD COLUMN name VARCHAR(255) NULL 
AFTER username;

-- Update existing records to populate the name field from users table
-- (This assumes there's a relationship between login_credential.user_id and users.id)
UPDATE login_credential lc
LEFT JOIN users u ON lc.user_id = u.id
SET lc.name = u.name
WHERE lc.name IS NULL AND u.name IS NOT NULL;

-- If you don't have a users table or the relationship, you can set default names
-- UPDATE login_credential SET name = username WHERE name IS NULL;

-- Verify the changes
SELECT id, user_id, username, name, role FROM login_credential LIMIT 10;
