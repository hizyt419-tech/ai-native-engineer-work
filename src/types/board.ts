// ======================== 板块配置 ========================

export const SECTIONS = [
  { key: "parttime" as const, label: "💼 兼职", icon: "💼", timed: true },
  { key: "exercise" as const, label: "🏃 运动", icon: "🏃", timed: false },
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

// ======================== 每日引导问题题库 ========================

export const SUMMARY_QUESTION_POOL = [
  "今天最有成就感的一件事是什么？",
  "今天遇到了什么困难？明天怎么解决？",
  "今天学到的新东西是什么？",
  "今天有什么让你开心的瞬间？",
  "今天哪件事可以做得更好？",
  "今天和昨天比，有什么进步？",
  "今天帮助了谁？或者谁帮助了你？",
  "今天有什么新的想法或灵感？",
  "今天花了最多时间在什么事情上？值得吗？",
  "今天有什么事情让你感到焦虑？为什么？",
  "如果今天能重来一次，你会改变什么？",
  "今天你对自己满意吗？为什么？",
  "今天有表达感谢吗？对谁？",
  "今天的工作/学习效率怎么样？",
  "今天有没有拖延？原因是什么？",
  "今天有照顾好自己吗？（睡眠、饮食、情绪）",
  "今天有什么事情让你坚持下去？",
  "今天有做让自己放松的事情吗？",
  "今天的注意力集中了吗？什么时候最容易分心？",
  "明天最重要的一件事是什么？",
  "今天有什么意外收获？",
];

// 根据日期确定性选取问题（同一天永远同样的问题，不同天不同问题）
export function getDailyQuestions(date: string, count: number = 3): string[] {
  const d = new Date(date + "T00:00:00");
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const pool = SUMMARY_QUESTION_POOL;
  const result: string[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count && i < pool.length; i++) {
    const idx = (dayOfYear * 7 + i * 13) % pool.length;
    // 如果冲突，线性探测下一个
    let probe = idx;
    while (used.has(probe)) {
      probe = (probe + 1) % pool.length;
    }
    used.add(probe);
    result.push(pool[probe]);
  }

  return result;
}
