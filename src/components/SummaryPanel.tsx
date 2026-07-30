"use client";

import { useState } from "react";
import { DEFAULT_SUMMARY_PROMPTS } from "../types/board";

interface SummaryPanelProps {
  summary: string | null;
  onSave: (summary: string) => void;
}

export default function SummaryPanel({ summary, onSave }: SummaryPanelProps) {
  const [text, setText] = useState(summary || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
      <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
        📝 今日总结
      </h2>

      {/* 引导问题 */}
      <div className="mb-3 space-y-1">
        {DEFAULT_SUMMARY_PROMPTS.map((q, i) => (
          <p
            key={i}
            className="text-xs text-zinc-400 dark:text-zinc-500 pl-1 border-l-2 border-blue-300 dark:border-blue-700"
          >
            {q}
          </p>
        ))}
      </div>

      {/* 输入区 */}
      <textarea
        className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white resize-none text-sm"
        rows={4}
        placeholder="根据上面的问题，写下今天的总结..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* 保存按钮 */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-zinc-400">
          {saved ? "✅ 已保存" : ""}
        </span>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          保存总结
        </button>
      </div>
    </div>
  );
}
