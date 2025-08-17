-- Migration: Make password_hash optional for GitHub OAuth users
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

BEGIN TRANSACTION;

-- Create new table with correct schema
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- Now optional
  first_name TEXT NOT NULL,
  last_name TEXT,
  display_name TEXT,
  github_id TEXT,
  github_username TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'local',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME
);

-- Copy existing data
INSERT INTO users_new SELECT * FROM users;

-- Drop old table
DROP TABLE users;

-- Rename new table
ALTER TABLE users_new RENAME TO users;

COMMIT;