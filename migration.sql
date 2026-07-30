-- 每日工作台 - 数据库迁移 v2
-- 在 Supabase SQL Editor 中运行: https://supabase.com/dashboard/project/jeyetxtnoucrvgyzuwxw/sql/new

-- 1. 每日面板表
CREATE TABLE IF NOT EXISTS daily_boards (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 任务表
CREATE TABLE IF NOT EXISTS board_tasks (
  id BIGSERIAL PRIMARY KEY,
  board_id BIGINT NOT NULL REFERENCES daily_boards(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('work', 'parttime', 'exercise', 'entertainment', 'adhoc')),
  title TEXT NOT NULL,
  is_timed BOOLEAN DEFAULT false,
  duration_sec INTEGER DEFAULT 0,
  hourly_rate INTEGER,
  is_done BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_board_tasks_board_id ON board_tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_daily_boards_date ON daily_boards(date);
