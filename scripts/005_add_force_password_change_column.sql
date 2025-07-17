-- Add force_password_change column to the users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Set existing non-admin users to force password change if they were created with a default password
-- This is a heuristic; in a real system, you might have a more specific way to identify default passwords.
-- For simplicity, we'll assume any non-admin user created before this script might need a forced change.
-- Admins are typically created via the setup form and already have a non-default password.
UPDATE users
SET force_password_change = TRUE
WHERE user_level != 'admin' AND password_hash IS NOT NULL;
