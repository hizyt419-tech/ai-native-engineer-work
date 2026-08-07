"use client";

import { useState, useEffect, useCallback } from "react";
import { SECTIONS } from "../types/board";
import type { BoardTask, NewTask, DailyBoard } from "../types/board";
import { getOrCreateBoard, getTasks, createTask, updateTask, deleteTask, updateBoard } from "../lib/boardDb";
import Section from "./Section";
import SummaryPanel from "./SummaryPanel";

interface BoardProps {
  date: string;
}

export default function Board({ date }: BoardProps) {
  const [board, setBoard] = useState<DailyBoard | null>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await getOrCreateBoard(date);
      setBoard(b);
      const t = await getTasks(b.id);
      setTasks(t);
    } catch (err) {
      console.error("加载面板失败:", err);
      setError(err instanceof Error ? err.message : "无法连接到数据库，请检查网络后重试");
    }
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (newTask: NewTask) => {
    if (!board) return;
    const task = await createTask({ ...newTask, board_id: board.id });
    setTasks((prev) => [...prev, task]);
  };

  const handleToggle = async (id: number, done: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_done: done } : t)));
    await updateTask(id, { is_done: done });
  };

  const handleDelete = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteTask(id);
  };

  const handleUpdateDuration = async (id: number, sec: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, duration_sec: sec } : t)));
    if (sec % 5 === 0) {
      await updateTask(id, { duration_sec: sec });
    }
  };

  const handleSaveSummary = async (summary: string) => {
    if (!board) return;
    await updateBoard(board.id, { summary });
    setBoard((prev) => (prev ? { ...prev, summary } : null));
  };

  const getSectionTasks = (key: string) => tasks.filter((t) => t.section === key);

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="text-3xl animate-bounce inline-block">⏳</span>
        <p className="text-sm text-warm-400 mt-3">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="text-3xl inline-block">😵</span>
        <p className="text-sm text-warm-600 mt-3 font-medium">加载失败</p>
        <p className="text-xs text-warm-400 mt-1 max-w-xs mx-auto">{error}</p>
        <button
          onClick={load}
          className="mt-4 px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 transition-all shadow-sm active:scale-95"
        >
          🔄 重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => (
        <Section
          key={section.key}
          sectionKey={section.key}
          tasks={getSectionTasks(section.key)}
          onAdd={handleAdd}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdateDuration={handleUpdateDuration}
        />
      ))}
      <SummaryPanel summary={board?.summary ?? null} onSave={handleSaveSummary} />
    </div>
  );
}
