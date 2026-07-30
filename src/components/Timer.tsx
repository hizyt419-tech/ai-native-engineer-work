"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TimerProps {
  initialSeconds: number;
  onTick: (totalSeconds: number) => void;
  compact?: boolean;
}

export default function Timer({ initialSeconds, onTick, compact }: TimerProps) {
  const [elapsed, setElapsed] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setElapsed(initialSeconds); }, [initialSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => { const next = prev + 1; onTick(next); return next; });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onTick]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  const stop = useCallback(() => setRunning(false), []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <span className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
      <span className={`font-mono tabular-nums font-medium ${
        running ? "text-sage" : "text-warm-400"
      }`}>
        {formatTime(elapsed)}
      </span>
      {/* 播放/暂停 —— 芥末黄圆钮 */}
      <button
        onClick={toggle}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
          running
            ? "bg-rose-e text-warm-600 hover:bg-rose-e/70"
            : "bg-mustard text-white hover:bg-mustard/80 shadow-sm"
        }`}
      >
        {running ? "⏸" : "▶"}
      </button>
      {/* 停止 */}
      {running && (
        <button
          onClick={stop}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-warm-border-light text-warm-600 hover:bg-warm-border transition-colors"
        >
          ⏹
        </button>
      )}
    </span>
  );
}
