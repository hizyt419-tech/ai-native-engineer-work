"use client";

import { useState, useMemo } from "react";
import Calendar from "../components/Calendar";
import Board from "../components/Board";

export default function Home() {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const isToday = dateStr === todayStr;
    return `${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}${isToday ? " · 今天" : ""}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== 顶部 ===== */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-bold text-warm-800">📋 每日工作台</h1>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`text-sm px-4 py-2 rounded-full transition-all duration-200 font-medium ${
              showCalendar
                ? "bg-mustard text-white shadow-sm"
                : "bg-white text-warm-600 hover:bg-white/80 shadow-sm"
            }`}
          >
            📅 {formatDisplay(selectedDate)}
          </button>
        </div>
      </header>

      {/* ===== 日历（可折叠） ===== */}
      {showCalendar && (
        <div className="max-w-lg mx-auto w-full px-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Calendar
            selectedDate={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}

      {/* ===== 主体 ===== */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-2">
        <Board key={selectedDate} date={selectedDate} />
      </main>

      {/* ===== 回到今天 ===== */}
      {selectedDate !== todayStr && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-5 py-2.5 bg-mustard text-white rounded-full text-sm font-medium shadow-soft-lg hover:bg-mustard/90 transition-all active:scale-95"
          >
            📅 回到今天
          </button>
        </div>
      )}
    </div>
  );
}
