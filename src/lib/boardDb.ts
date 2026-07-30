import { getSupabase } from "./supabaseClient";
import type { DailyBoard, BoardTask, NewTask } from "../types/board";

// ======================== 面板 ========================

export async function getOrCreateBoard(date: string): Promise<DailyBoard> {
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
}

export async function updateBoard(
  id: number,
  updates: Partial<Pick<DailyBoard, "summary">>
) {
  const s = getSupabase();
  const { error } = await s.from("daily_boards").update(updates).eq("id", id);
  if (error) throw error;
}

// ======================== 任务 ========================

export async function getTasks(boardId: number): Promise<BoardTask[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from("board_tasks")
    .select("*")
    .eq("board_id", boardId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as BoardTask[];
}

export async function createTask(task: NewTask): Promise<BoardTask> {
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
}

export async function updateTask(
  id: number,
  updates: Partial<
    Pick<BoardTask, "title" | "is_done" | "duration_sec" | "hourly_rate" | "is_timed">
  >
) {
  const s = getSupabase();
  const { error } = await s.from("board_tasks").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id: number) {
  const s = getSupabase();
  const { error } = await s.from("board_tasks").delete().eq("id", id);
  if (error) throw error;
}
