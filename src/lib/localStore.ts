// ======================== localStorage 离线兜底 ========================
// 当 Supabase 不可用时，自动降级到本地存储
// 接口与 boardDb.ts 保持一致，上层组件无需感知

import type { DailyBoard, BoardTask, NewTask } from "../types/board";

const KEYS = {
  boards: "wb_boards",
  tasks: "wb_tasks",
  idCounter: "wb_id_counter",
  recordDates: "wb_record_dates",
} as const;

function nextId(): number {
  const raw = localStorage.getItem(KEYS.idCounter);
  const id = (parseInt(raw || "0", 10) || 0) + 1;
  localStorage.setItem(KEYS.idCounter, String(id));
  return id;
}

function getBoards(): DailyBoard[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.boards) || "[]");
  } catch {
    return [];
  }
}

function setBoards(boards: DailyBoard[]) {
  localStorage.setItem(KEYS.boards, JSON.stringify(boards));
}

function getTasks(): BoardTask[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.tasks) || "[]");
  } catch {
    return [];
  }
}

function setTasks(tasks: BoardTask[]) {
  localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
}

function markDate(date: string) {
  const raw = localStorage.getItem(KEYS.recordDates);
  const dates: string[] = raw ? JSON.parse(raw) : [];
  if (!dates.includes(date)) {
    dates.push(date);
    localStorage.setItem(KEYS.recordDates, JSON.stringify(dates));
  }
}

// ======================== 面板 ========================

export async function localGetOrCreateBoard(date: string): Promise<DailyBoard> {
  const boards = getBoards();
  const existing = boards.find((b) => b.date === date);
  if (existing) return existing;

  const board: DailyBoard = {
    id: nextId(),
    date,
    summary: null,
    created_at: new Date().toISOString(),
  };
  setBoards([...boards, board]);
  markDate(date);
  return board;
}

export async function localUpdateBoard(id: number, updates: Partial<Pick<DailyBoard, "summary">>) {
  const boards = getBoards();
  setBoards(boards.map((b) => (b.id === id ? { ...b, ...updates } : b)));
}

// ======================== 任务 ========================

export async function localGetTasks(boardId: number): Promise<BoardTask[]> {
  return getTasks().filter((t) => t.board_id === boardId);
}

export async function localCreateTask(task: NewTask): Promise<BoardTask> {
  const allTasks = getTasks();
  const sectionTasks = allTasks.filter(
    (t) => t.board_id === task.board_id && t.section === task.section
  );
  const nextOrder = sectionTasks.length;

  const newTask: BoardTask = {
    id: nextId(),
    board_id: task.board_id,
    section: task.section,
    title: task.title,
    is_timed: task.is_timed,
    duration_sec: 0,
    hourly_rate: task.hourly_rate ?? null,
    is_done: false,
    sort_order: nextOrder,
    created_at: new Date().toISOString(),
  };
  setTasks([...allTasks, newTask]);
  return newTask;
}

export async function localUpdateTask(
  id: number,
  updates: Partial<Pick<BoardTask, "title" | "is_done" | "duration_sec" | "hourly_rate" | "is_timed">>
) {
  const allTasks = getTasks();
  setTasks(allTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

export async function localDeleteTask(id: number) {
  setTasks(getTasks().filter((t) => t.id !== id));
}

// ======================== 日历打点 ========================

export async function localGetDatesWithRecords(): Promise<string[]> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.recordDates) || "[]");
  } catch {
    return [];
  }
}

// ======================== 每日总结 ========================

export interface SummaryEntry {
  question: string;
  answer: string;
}

export async function localGetSummary(date: string): Promise<SummaryEntry[]> {
  try {
    const raw = localStorage.getItem(`wb_summary_${date}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function localSaveSummary(date: string, entries: SummaryEntry[]) {
  localStorage.setItem(`wb_summary_${date}`, JSON.stringify(entries));
  markDate(date);
}
