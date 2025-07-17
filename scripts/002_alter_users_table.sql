-- This script alters the existing 'users' table to add new columns.
-- It should only be run AFTER '001_create_users_table.sql' has been successfully executed.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_level VARCHAR(50) DEFAULT 'viewer', -- Default user level
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create a function to update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
