// 统一的学习笔记类型定义

export type NoteCategory = "general" | "inspiration" | "english";

// 存储在 title 字段中的 JSON 元数据
export interface NoteMetadata {
  category: NoteCategory;
  is_favorite: boolean;
  source?: string; // web_search, manual, speech
  source_url?: string; // 原始链接
}

export interface LearningNote {
  id: number;
  created_at: string;
  content: string;
  type: "text" | "image" | "speech";
  title: string | null;   // JSON 元数据存储在这里
  name: string | null;
}

// 解析 title 字段获取元数据
export function parseMetadata(note: LearningNote): NoteMetadata {
  try {
    if (note.title) {
      return JSON.parse(note.title);
    }
  } catch { /* ignore */ }
  return { category: "general", is_favorite: false };
}

// 将元数据编码到 title 字段
export function encodeMetadata(meta: NoteMetadata): string {
  return JSON.stringify(meta);
}

// 搜索结果
export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}
