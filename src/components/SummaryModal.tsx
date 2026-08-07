"use client";

import { useState, useEffect } from "react";
import type { BoardTask } from "../types/board";
import { getDailyQuestions } from "../types/board";
import { localGetSummary, localSaveSummary } from "../lib/localStore";
import type { SummaryEntry } from "../lib/localStore";

interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  completedTasks: BoardTask[];
}

export default function SummaryModal({ open, onClose, date, completedTasks }: SummaryModalProps) {
  const questions = getDailyQuestions(date, 3);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 弹窗打开时加载已有答案
  useEffect(() => {
    if (open) {
      setSaved(false);
      localGetSummary(date).then((entries) => {
        if (entries.length > 0) {
          setAnswers(entries.map((e) => e.answer));
        } else {
          setAnswers(questions.map(() => ""));
        }
      });
    }
  }, [open, date, questions]);

  const handleSave = async () => {
    setSaving(true);
    const entries: SummaryEntry[] = questions.map((q, i) => ({
      question: q,
      answer: answers[i] || "",
    }));
    await localSaveSummary(date, entries);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-warm-800/30 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-cream rounded-t-2xl sm:rounded-2xl shadow-soft-lg animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur-md rounded-t-2xl px-5 py-4 border-b border-warm-border-light flex items-center justify-between">
          <h2 className="text-lg font-bold text-warm-800">📝 今日总结</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-border-light transition-colors text-warm-400"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* 今日完成的任务 */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-warm-600 mb-2">✅ 今日完成</h3>
              <div className="space-y-1">
                {completedTasks.map((t) => (
                  <div key={t.id} className="text-sm text-warm-500 line-through opacity-60 pl-2 border-l-2 border-sage">
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 引导问题 */}
          <div>
            <h3 className="text-sm font-semibold text-warm-600 mb-3">🤔 今日反思</h3>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i}>
                  <p className="text-sm text-warm-700 mb-1.5 font-medium">{q}</p>
                  <textarea
                    className="w-full p-3 border border-warm-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard/30 focus:border-mustard bg-white text-warm-800 resize-none text-sm placeholder:text-warm-400/50"
                    rows={3}
                    placeholder="写下你的想法..."
                    value={answers[i]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <span className="text-xs text-sage font-medium">
              {saved ? "✅ 已保存" : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || answers.every((a) => !a.trim())}
              className="px-6 py-2.5 bg-mustard text-white rounded-full text-sm font-medium hover:bg-mustard/90 disabled:opacity-30 transition-all duration-200 shadow-sm active:scale-95"
            >
              {saving ? "保存中..." : "💾 保存总结"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
