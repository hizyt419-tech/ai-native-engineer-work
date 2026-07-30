"use client";

import { useState, useEffect, useCallback } from "react";
import { SECTIONS } from "../types/board";
import type { BoardTask, NewTask, DailyBoard } from "../types/board";
import {
  getOrCreateBoard,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateBoard,
} from "../lib/boardDb";
import Section from "./Section";
import SummaryPanel from "./SummaryPanel";

interface BoardProps {
  date: string; // YYYY-MM-DD
}

export default function Board({ date }: BoardProps) {
  const [board, setBoard] = useState<DailyBoard | null>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载面板和任务
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const b = await getOrCreateBoard(date);
      setBoard(b);
      const t = await getTasks(b.id);
      setTasks(t);
    } catch (err) {
      console.error("加载面板失败:", err);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  // 添加任务
  const handleAdd = async (newTask: NewTask) => {
    if (!board) return;
    const task = await createTask({
      ...newTask,
      board_id: board.id,
    });
    setTasks((prev) => [...prev, task]);
  };

  // 切换完成
  const handleToggle = async (id: number, done: boolean) => {
    // 乐观更新
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: done } : t))
    );
    await updateTask(id, { is_done: done });
  };

  // 删除
  const handleDelete = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteTask(id);
  };

  // 更新时长
  const handleUpdateDuration = async (id: number, sec: number) => {
    // 不在这里频繁更新 state，由 Timer 自己管理显示
    // 批量同步到 supabase（debounced by Timer's tick）
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, duration_sec: sec } : t))
    );
  };

  // 保存时长到 supabase（在计时停止时调用）
  const syncDuration = useCallback(
    async (id: number, sec: number) => {
      await updateTask(id, { duration_sec: sec });
    },
    []
  );

  // 保存总结
  const handleSaveSummary = async (summary: string) => {
    if (!board) return;
    await updateBoard(board.id, { summary });
    setBoard((prev) => (prev ? { ...prev, summary } : null));
  };

  // 获取某板块的任务
  const getSectionTasks = (key: string) =>
    tasks.filter((t) => t.section === key);

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-2xl mb-2">⏳</p>
        <p className="text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 5 个固定板块 */}
      {SECTIONS.map((section) => (
        <Section
          key={section.key}
          sectionKey={section.key}
          tasks={getSectionTasks(section.key)}
          onAdd={handleAdd}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdateDuration={(id, sec) => {
            handleUpdateDuration(id, sec);
            // 每秒存储太频繁，改为在计时停止时存储
            // 这里用 debounce：每 5 秒存一次
            if (sec % 5 === 0) {
              syncDuration(id, sec);
            }
          }}
        />
      ))}

      {/* 今日总结 */}
      <SummaryPanel
        summary={board?.summary ?? null}
        onSave={handleSaveSummary}
      />
    </div>
  );
}
