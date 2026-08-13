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
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setCalendarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部：标题 + 右上角日历按钮 */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-warm-800">📋 每日工作台</h1>
              <p className="text-sm text-warm-400 mt-0.5">{formatDisplay(selectedDate)}</p>
            </div>
            <button
              onClick={() => setCalendarOpen(true)}
              aria-label="打开日历"
              title="选择日期"
              className="mt-0.5 w-10 h-10 rounded-full bg-white border border-warm-border-light shadow-soft flex items-center justify-center text-lg hover:text-mustard hover:border-mustard/40 transition-all active:scale-95"
            >
              📅
            </button>
          </div>
        </div>
      </header>

      {/* 主体：只保留 todo */}
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

      {/* 日历弹层：点击右上角按钮打开 */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/25 sm:p-6"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-soft-lg p-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 mb-3 px-1">
              <div>
                <p className="text-[10px] tracking-[0.18em] text-warm-400">选择日期</p>
                <h2 className="text-base font-bold text-warm-800">📅 日历</h2>
              </div>
              <button
                onClick={() => setCalendarOpen(false)}
                aria-label="关闭日历"
                className="text-warm-400 hover:text-warm-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <BigCalendar
              selectedDate={selectedDate}
              onSelect={handleSelectDate}
              markedDates={markedDates}
            />
            <p className="text-center text-[11px] text-warm-400/70 mt-3">
              选好日期自动回到当日待办 · 有小圆点的日期表示有记录
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
