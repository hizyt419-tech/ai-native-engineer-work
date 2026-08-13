// ======================== 笔记持久化（localStorage） ========================
// 新闻页存入的句子/AI 解读也会写到这里，笔记页统一读取

export interface QuickNote {
  id: number;
  content: string;
  type: "note" | "link" | "idea";
  sourceUrl?: string;
  keyword?: string;
  explanation?: string;
  created_at: string;
}

const KEY = "wb_notes";

function load(): QuickNote[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as QuickNote[];
  } catch {
    return [];
  }
}

function save(notes: QuickNote[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    // localStorage 不可用时静默失败，不影响页面
  }
}

export function getNotes(): QuickNote[] {
  return load();
}

export function addNote(note: Omit<QuickNote, "id" | "created_at">): QuickNote {
  const created: QuickNote = {
    ...note,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };
  save([created, ...load()]);
  return created;
}

export function deleteNote(id: number) {
  save(load().filter((n) => n.id !== id));
}
