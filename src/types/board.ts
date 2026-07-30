// ======================== 板块配置 ========================

export const SECTIONS = [
  { key: "work" as const, label: "🧑‍💻 上班", icon: "🧑‍💻", timed: false },
  { key: "parttime" as const, label: "💼 兼职", icon: "💼", timed: true },
  { key: "exercise" as const, label: "🏃 运动", icon: "🏃", timed: false },
  { key: "entertainment" as const, label: "📺 娱乐", icon: "📺", timed: false },
  { key: "adhoc" as const, label: "📌 临时事件", icon: "📌", timed: null }, // null = 可选计时
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export function getSectionConfig(key: SectionKey) {
  return SECTIONS.find((s) => s.key === key)!;
}

// ======================== 核心类型 ========================

export interface DailyBoard {
  id: number;
  date: string; // YYYY-MM-DD
  summary: string | null;
  created_at: string;
}

export interface BoardTask {
  id: number;
  board_id: number;
  section: SectionKey;
  title: string;
  is_timed: boolean;
  duration_sec: number;
  hourly_rate: number | null;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

// 新任务（创建时用）
export interface NewTask {
  board_id: number;
  section: SectionKey;
  title: string;
  is_timed: boolean;
  hourly_rate?: number | null;
}

// ======================== 默认引导问题 ========================

export const DEFAULT_SUMMARY_PROMPTS = [
  "今天最有成就感的一件事是什么？",
  "今天遇到了什么困难？明天怎么解决？",
  "今天学到的新东西是什么？",
];
