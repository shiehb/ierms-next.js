-- Add is_active column to the users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set existing users to active if the column was just added
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
