"use client";

import { useState } from "react";
import type { BoardTask, SectionKey, NewTask } from "../types/board";
import { getSectionConfig } from "../types/board";
import TaskItem from "./TaskItem";

interface SectionProps {
  sectionKey: SectionKey;
  tasks: BoardTask[];
  onAdd: (task: NewTask) => void;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
  onUpdateDuration: (id: number, sec: number) => void;
}

export default function Section({
  sectionKey, tasks, onAdd, onToggle, onDelete, onUpdateDuration,
}: SectionProps) {
  const config = getSectionConfig(sectionKey);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [asTimed, setAsTimed] = useState(config.timed === true);
  const [rate, setRate] = useState("");
  const [showRate, setShowRate] = useState(false);

  const canChooseTimed = config.timed === null;

  const handleSubmit = () => {
    if (!input.trim()) return;
    onAdd({
      board_id: tasks[0]?.board_id ?? 0,
      section: sectionKey,
      title: input.trim(),
      is_timed: asTimed,
      hourly_rate: asTimed && rate ? parseInt(rate) : null,
    });
    setInput(""); setShowInput(false);
    setAsTimed(config.timed === true);
    setRate(""); setShowRate(false);
  };

  const totalEarnings = tasks.reduce((sum, t) => {
    if (t.hourly_rate && t.duration_sec > 0) return sum + (t.hourly_rate / 3600) * t.duration_sec;
    return sum;
  }, 0);
  const totalDuration = tasks.reduce((sum, t) => sum + t.duration_sec, 0);
  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h${m}m`;
    return `${m}m`;
  };

  return (
    <div className="card p-4">
      {/* 板块标题 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-warm-600 flex items-center gap-1.5">
          {config.icon} {config.label}
        </h3>
        <div className="flex items-center gap-2 text-xs text-warm-400">
          {totalDuration > 0 && <span>⏱ {formatDuration(totalDuration)}</span>}
          {totalEarnings > 0 && (
            <span className="text-mustard font-semibold bg-mustard-bg px-2 py-0.5 rounded-full">
              ¥{totalEarnings.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      {tasks.length > 0 && (
        <div className="mb-1">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdateDuration={onUpdateDuration}
            />
          ))}
        </div>
      )}

      {tasks.length === 0 && !showInput && (
        <p className="text-xs text-warm-400/50 py-2 italic">今天还没有记录</p>
      )}

      {/* 添加新任务 */}
      {showInput ? (
        <div className="space-y-2 pt-3 border-t border-warm-border-light">
          <input
            autoFocus
            className="w-full p-2.5 border border-warm-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard/20 focus:border-mustard bg-cream/50 text-warm-800 text-sm placeholder:text-warm-400/50"
            placeholder={`添加${config.label}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") setShowInput(false); }}
          />

          <div className="flex items-center gap-3 flex-wrap">
            {canChooseTimed && (
              <label className="flex items-center gap-1.5 text-xs text-warm-500 cursor-pointer">
                <input type="checkbox" checked={asTimed} onChange={(e) => { setAsTimed(e.target.checked); if (e.target.checked) setShowRate(true); else setShowRate(false); }} className="rounded accent-mustard" />
                计时
              </label>
            )}
            {asTimed && (
              !showRate ? (
                <button onClick={() => setShowRate(true)} className="text-xs text-mustard hover:underline font-medium">+ 设置时薪</button>
              ) : (
                <label className="flex items-center gap-1 text-xs text-warm-500">
                  ¥ <input autoFocus className="w-16 p-1.5 border border-warm-border-light rounded-xl bg-cream/50 text-warm-800 text-xs focus:outline-none focus:ring-1 focus:ring-mustard/30" type="number" placeholder="时薪" value={rate} onChange={(e) => setRate(e.target.value)} /> /h
                </label>
              )
            )}
            <div className="flex-1" />
            <button onClick={() => setShowInput(false)} className="text-xs text-warm-400 hover:text-warm-600">取消</button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="px-4 py-1.5 bg-mustard text-white rounded-full text-xs font-medium hover:bg-mustard/90 disabled:opacity-30 transition-all duration-200 shadow-sm active:scale-95"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full text-left text-xs text-warm-400 hover:text-mustard py-2 transition-colors font-medium"
        >
          + 添加
        </button>
      )}
    </div>
  );
}
