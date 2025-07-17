-- Create the password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);

-- Add an index for faster lookup by token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens (token);

-- Add an index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);
