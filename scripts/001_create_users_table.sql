-- This script creates the initial 'users' table.
-- It must be run BEFORE any scripts that alter this table.
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Enable Row Level Security (RLS) for the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
