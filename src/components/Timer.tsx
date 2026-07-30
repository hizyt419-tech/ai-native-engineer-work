"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TimerProps {
  initialSeconds: number;
  onTick: (totalSeconds: number) => void;
  compact?: boolean; // 紧凑模式，用于任务行内
}

export default function Timer({ initialSeconds, onTick, compact }: TimerProps) {
  const [elapsed, setElapsed] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 同步外部初始值
  useEffect(() => {
    setElapsed(initialSeconds);
  }, [initialSeconds]);

  // 计时逻辑
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          onTick(next);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onTick]);

  const toggle = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <span className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
      <span
        className={`font-mono tabular-nums ${
          running ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {formatTime(elapsed)}
      </span>
      <button
        onClick={toggle}
        className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
          running
            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200"
            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
        }`}
      >
        {running ? "⏸" : "▶"}
      </button>
      {running && (
        <button
          onClick={stop}
          className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors"
        >
          ⏹
        </button>
      )}
    </span>
  );
}
