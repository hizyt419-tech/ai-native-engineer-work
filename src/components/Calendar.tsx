"use client";

import { useMemo } from "react";

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function Calendar({ selectedDate, onSelect, onClose }: CalendarProps) {
  const [year, month] = useMemo(() => {
    const d = new Date(selectedDate);
    return [d.getFullYear(), d.getMonth()]; // month 0-indexed
  }, [selectedDate]);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // 计算当月日历网格
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 当月第一天是周几
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number; date: string; isCurrentMonth: boolean }[] = [];

    // 上月填充
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

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    // 下月填充（凑满 6 行）
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
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    // 如果选中日超出新月范围，跳到该月最后一天
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const day = Math.min(d.getDate(), lastDay);
    onSelect(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const day = Math.min(d.getDate(), lastDay);
    onSelect(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  const goToToday = () => {
    onSelect(today);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-lg">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="px-2 py-1 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          ◀
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {year}年 {month + 1}月
          </span>
          <button
            onClick={goToToday}
            className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-200 transition-colors"
          >
            今天
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="px-2 py-1 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          ▶
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1"
          >
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
              onClick={() => {
                onSelect(cell.date);
                onClose();
              }}
              className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all m-0.5
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : isToday
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-semibold"
                    : cell.isCurrentMonth
                    ? "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
