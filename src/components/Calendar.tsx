"use client";

import { useMemo } from "react";

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function Calendar({ selectedDate, onSelect, onClose }: CalendarProps) {
  const [year, month] = useMemo(() => {
    const d = new Date(selectedDate);
    return [d.getFullYear(), d.getMonth()];
  }, [selectedDate]);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day: number; date: string; isCurrentMonth: boolean }[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      cells.push({
        day: d,
        date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      cells.push({
        day: d,
        date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const goToPrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    const day = Math.min(d.getDate(), lastDay);
    onSelect(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    const day = Math.min(d.getDate(), lastDay);
    onSelect(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  const goToToday = () => onSelect(today);

  return (
    <div className="card p-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="px-3 py-1.5 text-sm text-warm-600 hover:bg-warm-border-light rounded-xl transition-colors"
        >
          ◀
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-warm-800 text-base">
            {year}年 {month + 1}月
          </span>
          <button
            onClick={goToToday}
            className="text-xs px-3 py-1 rounded-full bg-mustard-bg text-mustard hover:bg-mustard-light/30 transition-colors font-medium"
          >
            今天
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1.5 text-sm text-warm-600 hover:bg-warm-border-light rounded-xl transition-colors"
        >
          ▶
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-warm-400 py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7">
        {days.map((cell, i) => {
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === today;
          return (
            <button
              key={i}
              onClick={() => { onSelect(cell.date); onClose(); }}
              className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all m-0.5
                ${isSelected
                  ? "bg-mustard text-white font-bold shadow-soft scale-105"
                  : isToday
                  ? "bg-mustard-bg text-mustard font-semibold"
                  : cell.isCurrentMonth
                  ? "text-warm-800 hover:bg-warm-border-light"
                  : "text-warm-400/50"}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
