-- Princess Palace — personal bot schema (Supabase / Postgres)
-- From final ERD: 6 entities, all 1:N, UUID PKs, FKs on the many side.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sparkles INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS morning_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  want TEXT NOT NULL DEFAULT '',
  how TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT 'sparkly',
  sealed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS board_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL DEFAULT '',
  done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 5),
  board_id UUID NOT NULL REFERENCES morning_boards (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (board_id, position)
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  kind TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS habit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  habit_key TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, habit_key)
);

CREATE INDEX IF NOT EXISTS idx_morning_boards_user ON morning_boards (user_id);
CREATE INDEX IF NOT EXISTS idx_board_todos_board ON board_todos (board_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user ON diary_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user ON mood_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_checks_user ON habit_checks (user_id);
