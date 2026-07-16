-- 学习笔记应用 - 数据库迁移
-- 在 Supabase SQL Editor 中运行: https://supabase.com/dashboard/project/jeyetxtnoucrvgyzuwxw/sql/new

-- 给 notes 表添加分类字段
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 给 notes 表添加收藏字段
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 给 notes 表添加来源字段
ALTER TABLE notes ADD COLUMN IF NOT EXISTS source TEXT;

-- 创建索引加速分类和收藏查询
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);
