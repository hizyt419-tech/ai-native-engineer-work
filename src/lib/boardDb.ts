import { getSupabase } from "./supabaseClient";
import type { DailyBoard, BoardTask, NewTask } from "../types/board";
import {
  localGetOrCreateBoard,
  localUpdateBoard,
  localGetTasks,
  localCreateTask,
  localUpdateTask,
  localDeleteTask,
  localGetDatesWithRecords,
} from "./localStore";

// Supabase 调用包装器：失败时自动降级到 localStorage
// 上层组件无需感知存储后端

let useLocal = false;

async function trySupabase<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (useLocal) return fallback();
  try {
    return await fn();
  } catch (err) {
    console.warn("Supabase 不可用，切换到本地存储:", err);
    useLocal = true;
    return fallback();
  }
}

// ======================== 面板 ========================

export async function getOrCreateBoard(date: string): Promise<DailyBoard> {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { data: existing } = await s
        .from("daily_boards")
        .select("*")
        .eq("date", date)
        .single();
      if (existing) return existing as DailyBoard;
      const { data: created, error } = await s
        .from("daily_boards")
        .insert([{ date }])
        .select()
        .single();
      if (error) throw error;
      return created as DailyBoard;
    },
    () => localGetOrCreateBoard(date)
  );
}

export async function updateBoard(id: number, updates: Partial<Pick<DailyBoard, "summary">>) {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { error } = await s.from("daily_boards").update(updates).eq("id", id);
      if (error) throw error;
    },
    () => localUpdateBoard(id, updates)
  );
}

// ======================== 任务 ========================

export async function getTasks(boardId: number): Promise<BoardTask[]> {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { data, error } = await s
        .from("board_tasks")
        .select("*")
        .eq("board_id", boardId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as BoardTask[];
    },
    () => localGetTasks(boardId)
  );
}

export async function createTask(task: NewTask): Promise<BoardTask> {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { data: last } = await s
        .from("board_tasks")
        .select("sort_order")
        .eq("board_id", task.board_id)
        .eq("section", task.section)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();
      const nextOrder = last ? (last as any).sort_order + 1 : 0;
      const { data, error } = await s
        .from("board_tasks")
        .insert([{ ...task, sort_order: nextOrder }])
        .select()
        .single();
      if (error) throw error;
      return data as BoardTask;
    },
    () => localCreateTask(task)
  );
}

export async function updateTask(
  id: number,
  updates: Partial<Pick<BoardTask, "title" | "is_done" | "duration_sec" | "hourly_rate" | "is_timed">>
) {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { error } = await s.from("board_tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    () => localUpdateTask(id, updates)
  );
}

export async function deleteTask(id: number) {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { error } = await s.from("board_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    () => localDeleteTask(id)
  );
}

// ======================== 日历打点 ========================

export async function getDatesWithRecords(): Promise<string[]> {
  return trySupabase(
    async () => {
      const s = getSupabase();
      const { data, error } = await s
        .from("daily_boards")
        .select("date");
      if (error) throw error;
      return (data || []).map((d: any) => d.date);
    },
    () => localGetDatesWithRecords()
  );
}
