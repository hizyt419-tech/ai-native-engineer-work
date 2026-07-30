"use client";

import type { BoardTask } from "../types/board";
import Timer from "./Timer";
import { useCallback } from "react";

interface TaskItemProps {
  task: BoardTask;
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
  onUpdateDuration: (id: number, sec: number) => void;
}

export default function TaskItem({
  task, onToggle, onDelete, onUpdateDuration,
}: TaskItemProps) {
  const handleTick = useCallback(
    (sec: number) => onUpdateDuration(task.id, sec),
    [task.id, onUpdateDuration]
  );

  const earnings =
    task.hourly_rate && task.duration_sec > 0
      ? ((task.hourly_rate / 3600) * task.duration_sec).toFixed(0)
      : null;

  return (
    <div
      className={`group flex items-center gap-2.5 py-2.5 px-2 -mx-2 rounded-xl transition-all duration-150 hover:bg-cream/80 ${
        task.is_done ? "opacity-40" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.is_done)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.is_done
            ? "bg-mustard border-mustard text-white"
            : "border-warm-border hover:border-mustard"
        }`}
      >
        {task.is_done && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 标题 */}
      <span className={`flex-1 text-sm ${
        task.is_done
          ? "line-through text-warm-400/60"
          : "text-warm-800"
      }`}>
        {task.title}
      </span>

      {/* 计时器 */}
      {task.is_timed && (
        <Timer initialSeconds={task.duration_sec} onTick={handleTick} compact />
      )}

      {/* 金额 */}
      {earnings && (
        <span className="text-xs text-amber font-medium tabular-nums bg-amber-bg px-2 py-0.5 rounded-full">
          ¥{earnings}
        </span>
      )}

      {/* 删除 */}
      <button
        onClick={() => onDelete(task.id)}
        className="text-warm-400/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 text-xs w-5 h-5 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
}
