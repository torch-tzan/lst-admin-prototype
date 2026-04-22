import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  value: string;
  onChange: (v: string) => void;
  /** Set of date strings (YYYY-MM-DD) that should be disabled (no availability) */
  disabledDates?: Set<string>;
  /** If provided, only dates in this set are enabled (besides past-date rule) */
  availableDates?: Set<string>;
}

const MiniCalendar = ({
  value,
  onChange,
  disabledDates,
  availableDates,
}: MiniCalendarProps) => {
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const weeks = ["日", "月", "火", "水", "木", "金", "土"];

  const isDateDisabled = (dateStr: string) => {
    if (dateStr < todayStr) return true;
    if (disabledDates?.has(dateStr)) return true;
    if (availableDates && !availableDates.has(dateStr)) return true;
    return false;
  };

  return (
    <div className="px-2">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-foreground">{viewYear}年{viewMonth + 1}月</span>
        <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {weeks.map((w) => (
          <div key={w} className="text-center text-xs text-muted-foreground py-1 font-medium">{w}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === value;
          const disabled = isDateDisabled(dateStr);
          const isAvailable = !disabled && (availableDates ? availableDates.has(dateStr) : dateStr >= todayStr);
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              className={`h-9 text-sm rounded-full flex flex-col items-center justify-center transition-colors relative ${
                isSelected
                  ? "bg-primary text-primary-foreground font-bold"
                  : disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : isAvailable
                  ? "text-primary font-semibold hover:bg-primary/10"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {day}
              {isAvailable && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
