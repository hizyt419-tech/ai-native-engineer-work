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
    <div className="card p-5">
      <h2 className="font-semibold text-warm-800 mb-3 flex items-center gap-2 text-base">
        📝 今日总结
      </h2>

      {/* 引导问题 */}
      <div className="mb-3 space-y-1.5">
        {DEFAULT_SUMMARY_PROMPTS.map((q, i) => (
          <p
            key={i}
            className="text-xs text-warm-400 pl-3 border-l-2 border-mustard-light leading-relaxed"
          >
            {q}
          </p>
        ))}
      </div>

      <textarea
        className="w-full p-3 border border-warm-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard/30 focus:border-mustard bg-cream/50 text-warm-800 resize-none text-sm placeholder:text-warm-400/60"
        rows={4}
        placeholder="根据上面的问题，写下今天的总结..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-sage font-medium">
          {saved ? "✅ 已保存" : ""}
        </span>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="px-5 py-2 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 disabled:opacity-30 transition-all duration-200 shadow-sm hover:shadow-soft active:scale-95"
        >
          保存总结
        </button>
      </div>
    </div>
  );
}
