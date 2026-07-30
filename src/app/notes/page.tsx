"use client";

import { useState } from "react";

interface QuickNote {
  id: number;
  content: string;
  type: "note" | "link" | "idea";
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [input, setInput] = useState("");
  const [noteType, setNoteType] = useState<"note" | "link" | "idea">("note");

  const typeConfig = {
    note: { label: "笔记", icon: "📝", color: "bg-mustard-bg" },
    link: { label: "链接", icon: "🔗", color: "bg-sky-bg" },
    idea: { label: "灵感", icon: "💡", color: "bg-lilac-bg" },
  };

  const addNote = () => {
    if (!input.trim()) return;
    setNotes((prev) => [
      {
        id: Date.now(),
        content: input.trim(),
        type: noteType,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        {/* 输入区 */}
        <div className="card p-4 mb-4">
          <h1 className="text-lg font-bold text-warm-800 flex items-center gap-2 mb-3">
            📝 快速笔记
          </h1>

          {/* 类型切换 */}
          <div className="flex gap-2 mb-3">
            {(Object.entries(typeConfig) as [typeof noteType, typeof typeConfig["note"]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setNoteType(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    noteType === key
                      ? `${cfg.color} text-warm-800 shadow-sm`
                      : "text-warm-400 hover:text-warm-600"
                  }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              )
            )}
          </div>

          <textarea
            className="w-full p-3 border border-warm-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard/20 focus:border-mustard bg-cream/50 text-warm-800 resize-none text-sm placeholder:text-warm-400/50"
            rows={3}
            placeholder={
              noteType === "link" ? "粘贴链接..." :
              noteType === "idea" ? "记录一闪而过的想法..." :
              "写点什么..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); }
            }}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={addNote}
              disabled={!input.trim()}
              className="px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 disabled:opacity-30 transition-all duration-200 shadow-sm active:scale-95"
            >
              保存
            </button>
          </div>
        </div>

        {/* 笔记列表 */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-warm-400 text-sm">还没有笔记</p>
            <p className="text-warm-400/50 text-xs mt-1">记录灵感、收藏链接、随手记</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="card p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{typeConfig[note.type].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-warm-800 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                    <p className="text-xs text-warm-400 mt-1">
                      {new Date(note.created_at).toLocaleTimeString("zh-CN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
