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
  sectionKey,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onUpdateDuration,
}: SectionProps) {
  const config = getSectionConfig(sectionKey);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [asTimed, setAsTimed] = useState(config.timed === true);
  const [rate, setRate] = useState("");
  const [showRate, setShowRate] = useState(false);

  // 该板块是否支持可选计时
  const canChooseTimed = config.timed === null;

  const handleSubmit = () => {
    if (!input.trim()) return;

    onAdd({
      board_id: tasks[0]?.board_id ?? 0, // 由父组件填充
      section: sectionKey,
      title: input.trim(),
      is_timed: asTimed,
      hourly_rate: asTimed && rate ? parseInt(rate) : null,
    });

    setInput("");
    setShowInput(false);
    setAsTimed(config.timed === true);
    setRate("");
    setShowRate(false);
  };

  // 计算总金额
  const totalEarnings = tasks.reduce((sum, t) => {
    if (t.hourly_rate && t.duration_sec > 0) {
      return sum + (t.hourly_rate / 3600) * t.duration_sec;
    }
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 shadow-sm">
      {/* 板块标题 + 统计 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
          {config.icon} {config.label}
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          {totalDuration > 0 && (
            <span>⏱ {formatDuration(totalDuration)}</span>
          )}
          {totalEarnings > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              ¥{totalEarnings.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      {tasks.length > 0 && (
        <div className="mb-2">
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
        <p className="text-xs text-zinc-300 dark:text-zinc-600 py-2">今天还没有记录</p>
      )}

      {/* 添加新任务 */}
      {showInput ? (
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <input
            autoFocus
            className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white text-sm"
            placeholder={`添加${config.label}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setShowInput(false);
            }}
          />

          {/* 可选计时 & 时薪 */}
          <div className="flex items-center gap-3 flex-wrap">
            {canChooseTimed && (
              <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={asTimed}
                  onChange={(e) => {
                    setAsTimed(e.target.checked);
                    if (e.target.checked) setShowRate(true);
                    else setShowRate(false);
                  }}
                  className="rounded"
                />
                计时
              </label>
            )}

            {asTimed && (
              <>
                {!showRate ? (
                  <button
                    onClick={() => setShowRate(true)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    + 设置时薪
                  </button>
                ) : (
                  <label className="flex items-center gap-1 text-xs text-zinc-500">
                    ¥
                    <input
                      autoFocus
                      className="w-16 p-1 border border-zinc-300 dark:border-zinc-700 rounded dark:bg-zinc-800 dark:text-white text-xs"
                      type="number"
                      placeholder="时薪"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                    /h
                  </label>
                )}
              </>
            )}

            <div className="flex-1" />

            <button
              onClick={() => setShowInput(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full text-left text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 py-1 transition-colors"
        >
          + 添加
        </button>
      )}
    </div>
  );
}
