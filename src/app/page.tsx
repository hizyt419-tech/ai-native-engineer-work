"use client";

import { useState, useMemo, useEffect } from "react";
import BigCalendar from "../components/BigCalendar";
import Board from "../components/Board";
import { getDatesWithRecords } from "../lib/boardDb";
import { localGetDatesWithRecords } from "../lib/localStore";

export default function Home() {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());

  // 加载有记录的日期（用于日历打点）
  useEffect(() => {
    const load = async () => {
      try {
        const dates = await getDatesWithRecords();
        setMarkedDates(new Set(dates));
      } catch {
        const dates = await localGetDatesWithRecords();
        setMarkedDates(new Set(dates));
      }
    };
    load();
  }, [selectedDate]); // 日期切换时刷新打点

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const isToday = dateStr === todayStr;
    return `${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}${isToday ? " · 今天" : ""}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-warm-800">📋 每日工作台</h1>
          <p className="text-sm text-warm-400 mt-0.5">{formatDisplay(selectedDate)}</p>
        </div>
      </header>

      {/* 日历 - 常驻 */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-2">
        <BigCalendar
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          markedDates={markedDates}
        />
      </div>

      {/* 主体 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-2">
        <Board key={selectedDate} date={selectedDate} />
      </main>

      {/* 回到今天 */}
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
