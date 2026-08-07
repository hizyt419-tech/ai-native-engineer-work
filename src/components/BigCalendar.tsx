"use client";

import { useMemo } from "react";

interface BigCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  markedDates: Set<string>;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function BigCalendar({ selectedDate, onSelect, markedDates }: BigCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [year, month] = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return [d.getFullYear(), d.getMonth()];
  }, [selectedDate]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
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

    // 下月填充
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

  const goMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onSelect(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  };

  const goToday = () => onSelect(today);

  // 按周分组（7列）
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="card p-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => goMonth(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-border-light transition-colors text-sm"
        >
          ◀
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-warm-800 text-base">
            {year}年 {month + 1}月
          </span>
          <button
            onClick={goToday}
            className="text-xs px-3 py-1 rounded-full bg-mustard-bg text-mustard hover:bg-mustard-light/30 transition-colors font-medium"
          >
            今天
          </button>
        </div>
        <button
          onClick={() => goMonth(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-border-light transition-colors text-sm"
        >
          ▶
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs py-1 font-medium ${
              i === 0 || i === 6 ? "text-warm-400/60" : "text-warm-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, ci) => {
              const isSelected = cell.date === selectedDate;
              const isToday = cell.date === today;
              const hasRecord = markedDates.has(cell.date);

              return (
                <button
                  key={ci}
                  onClick={() => onSelect(cell.date)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-sm
                    ${isSelected
                      ? "bg-mustard text-white font-bold shadow-sm"
                      : isToday
                      ? "bg-mustard-bg text-mustard font-semibold"
                      : cell.isCurrentMonth
                      ? "text-warm-800 hover:bg-warm-border-light"
                      : "text-warm-400/40 hover:bg-warm-border-light/50"
                    }`}
                >
                  <span>{cell.day}</span>
                  {/* 记录圆点 */}
                  {hasRecord && !isSelected && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        isToday ? "bg-mustard" : "bg-mustard-light"
                      }`}
                    />
                  )}
                  {hasRecord && isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
