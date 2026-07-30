"use client";

import { useState, useMemo } from "react";
import Calendar from "../components/Calendar";
import Board from "../components/Board";

export default function Home() {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const isToday = dateStr === todayStr;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}${isToday ? " · 今天" : ""}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== 顶部导航 ===== */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-800 dark:text-white">
            📋 每日工作台
          </h1>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              showCalendar
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            📅 {formatDisplay(selectedDate)}
          </button>
        </div>
      </header>

      {/* ===== 日历面板（可折叠） ===== */}
      {showCalendar && (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="max-w-lg mx-auto p-4">
            <Calendar
              selectedDate={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setShowCalendar(false);
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}

      {/* ===== 主内容区 ===== */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        <Board key={selectedDate} date={selectedDate} />
      </main>

      {/* ===== 底部浮动：快速回到今天 ===== */}
      {selectedDate !== todayStr && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors"
          >
            📅 回到今天
          </button>
        </div>
      )}
    </div>
  );
}
