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
  task,
  onToggle,
  onDelete,
  onUpdateDuration,
}: TaskItemProps) {
  const handleTick = useCallback(
    (sec: number) => {
      onUpdateDuration(task.id, sec);
    },
    [task.id, onUpdateDuration]
  );

  // 计算金额
  const earnings =
    task.hourly_rate && task.duration_sec > 0
      ? ((task.hourly_rate / 3600) * task.duration_sec).toFixed(0)
      : null;

  return (
    <div
      className={`group flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
        task.is_done ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.is_done)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.is_done
            ? "bg-blue-500 border-blue-500 text-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400"
        }`}
      >
        {task.is_done && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* 标题 */}
      <span
        className={`flex-1 text-sm ${
          task.is_done
            ? "line-through text-zinc-400 dark:text-zinc-500"
            : "text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {task.title}
      </span>

      {/* 计时器 */}
      {task.is_timed && (
        <Timer
          initialSeconds={task.duration_sec}
          onTick={handleTick}
          compact
        />
      )}

      {/* 金额 */}
      {earnings && (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium tabular-nums">
          ¥{earnings}
        </span>
      )}

      {/* 删除 */}
      <button
        onClick={() => onDelete(task.id)}
        className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
