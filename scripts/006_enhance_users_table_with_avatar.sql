-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for better performance on avatar queries
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);

-- Update the updated_at column to current timestamp when avatar_url changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
