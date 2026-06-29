ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

UPDATE users SET username = lower(split_part(email, '@', 1))
WHERE username IS NULL;

ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
