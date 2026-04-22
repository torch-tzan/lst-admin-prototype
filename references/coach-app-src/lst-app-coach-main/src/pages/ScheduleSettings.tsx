import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, RotateCcw, X } from "lucide-react";

const DAYS = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
];

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, "0")}:00`;
});

type ServiceMode = "in_person" | "online" | "video_review";

interface DaySchedule {
  enabled: boolean;
  hours: string[];
  services: ServiceMode[];
}

type WeekSchedule = Record<string, DaySchedule>;

const defaultServices: ServiceMode[] = ["in_person", "online", "video_review"];
const defaultHours = HOURS.filter((h) => {
  const n = parseInt(h);
  return n >= 9 && n <= 19;
});

const createDefaultWeek = (): WeekSchedule => {
  const week: WeekSchedule = {};
  DAYS.forEach((d) => {
    const isWeekday = !["sat", "sun"].includes(d.key);
    week[d.key] = {
      enabled: isWeekday || d.key === "sat",
      hours: isWeekday ? [...defaultHours] : HOURS.filter((h) => { const n = parseInt(h); return n >= 10 && n <= 17; }),
      services: [...defaultServices],
    };
  });
  week["sun"] = { enabled: false, hours: [], services: [...defaultServices] };
  return week;
};

const SERVICE_LABELS: Record<ServiceMode, { label: string; emoji: string }> = {
  in_person: { label: "対面レッスン", emoji: "🏟️" },
  online: { label: "オンライン", emoji: "💻" },
  video_review: { label: "動画レビュー", emoji: "🎥" },
};

const DAY_KEYS_BY_JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const JP_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// Date override: per-date hour list
interface DateOverride {
  hours: string[]; // active hours for this date (inherited from default, user can remove)
}

const ScheduleSettings = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<WeekSchedule>(createDefaultWeek);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [tab, setTab] = useState<"default" | "weekly">("default");
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const initialRef = useRef({
    schedule: JSON.stringify(createDefaultWeek()),
    overrides: JSON.stringify({}),
  });

  // Weekly override state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>({});

  const updateDay = (dayKey: string, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...updates },
    }));
  };

  const toggleHour = (dayKey: string, hour: string) => {
    const day = schedule[dayKey];
    const newHours = day.hours.includes(hour)
      ? day.hours.filter((h) => h !== hour)
      : [...day.hours, hour].sort();
    updateDay(dayKey, { hours: newHours });
  };

  const toggleService = (dayKey: string, service: ServiceMode) => {
    const day = schedule[dayKey];
    const newServices = day.services.includes(service)
      ? day.services.filter((s) => s !== service)
      : [...day.services, service];
    updateDay(dayKey, { services: newServices });
  };

  const copyToAll = (sourceDayKey: string) => {
    const source = schedule[sourceDayKey];
    setSchedule((prev) => {
      const updated = { ...prev };
      DAYS.forEach((d) => {
        if (d.key !== sourceDayKey) {
          updated[d.key] = { ...source, hours: [...source.hours], services: [...source.services] };
        }
      });
      return updated;
    });
    toast.success("全曜日にコピーしました");
  };

  const resetDay = (dayKey: string) => {
    const defaults = createDefaultWeek();
    updateDay(dayKey, defaults[dayKey]);
    toast.success("リセットしました");
  };

  const isDirty = useCallback(
    () =>
      JSON.stringify(schedule) !== initialRef.current.schedule ||
      JSON.stringify(dateOverrides) !== initialRef.current.overrides,
    [schedule, dateOverrides]
  );

  const handleSave = () => {
    toast.success("スケジュール設定を保存しました");
    navigate(-1);
  };

  const handleBack = () => {
    if (isDirty()) {
      setShowUnsavedAlert(true);
    } else {
      navigate(-1);
    }
  };

  const totalActiveHours = Object.values(schedule).reduce(
    (sum, day) => sum + (day.enabled ? day.hours.length : 0),
    0
  );

  // Calendar helpers
  const getDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const getDefaultHoursForDate = (d: Date): string[] => {
    const dayKey = DAY_KEYS_BY_JS_DAY[d.getDay()];
    const daySchedule = schedule[dayKey];
    return daySchedule.enabled ? [...daySchedule.hours] : [];
  };

  const getEffectiveHours = (d: Date): string[] => {
    const key = getDateKey(d);
    if (dateOverrides[key]) return dateOverrides[key].hours;
    return getDefaultHoursForDate(d);
  };

  const hasOverride = (d: Date): boolean => {
    return getDateKey(d) in dateOverrides;
  };

  const toggleDateHour = (date: Date, hour: string) => {
    const key = getDateKey(date);
    const current = dateOverrides[key]?.hours ?? getDefaultHoursForDate(date);
    const newHours = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort();
    setDateOverrides((prev) => ({
      ...prev,
      [key]: { hours: newHours },
    }));
  };

  const resetDateOverride = (date: Date) => {
    const key = getDateKey(date);
    setDateOverrides((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    toast.success("通常設定に戻しました");
  };

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    // Start from Monday: JS getDay() 0=Sun, we want Mon=0
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
    // Pad to complete rows
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [calendarMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const overrideCount = Object.keys(dateOverrides).length;

  return (
    <InnerPageLayout title="スケジュール設定" ctaLabel="保存する" onCtaClick={handleSave} onBack={handleBack}>
      <div className="space-y-5 -mt-2">
        {/* Summary */}
        <div className="bg-muted/50 rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-muted-foreground">週間稼働</p>
            <p className="text-xs text-muted-foreground">
              {Object.values(schedule).filter((d) => d.enabled).length}日 / {totalActiveHours}時間
            </p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {DAYS.map((d) => (
              <div
                key={d.key}
                className={`flex-1 h-1.5 rounded-full ${
                  schedule[d.key].enabled ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1.5 mt-1">
            {DAYS.map((d) => (
              <span key={d.key} className="flex-1 text-[10px] text-center text-muted-foreground">
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-[8px] p-1">
          <button
            onClick={() => setTab("default")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-[6px] transition-colors ${
              tab === "default" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            通常設定
          </button>
          <button
            onClick={() => setTab("weekly")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-[6px] transition-colors relative ${
              tab === "weekly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            日別調整
            {overrideCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                {overrideCount}
              </span>
            )}
          </button>
        </div>

        {tab === "default" ? (
          <>

            {/* Day-by-day config */}
            <div>
              <p className="text-sm font-bold text-foreground mb-3">曜日別スケジュール</p>
              <div className="space-y-2">
                {DAYS.map((d) => {
                  const day = schedule[d.key];
                  const isExpanded = expandedDay === d.key;

                  return (
                    <div
                      key={d.key}
                      className={`border rounded-[8px] overflow-hidden transition-colors ${
                        day.enabled ? "border-border bg-card" : "border-border/50 bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Switch
                          checked={day.enabled}
                          onCheckedChange={(checked) => updateDay(d.key, { enabled: checked })}
                        />
                        <button
                          onClick={() => setExpandedDay(isExpanded ? null : d.key)}
                          className="flex-1 flex items-center justify-between"
                          disabled={!day.enabled}
                        >
                          <div>
                            <span
                              className={`text-sm font-bold ${
                                day.enabled ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {d.label}曜日
                            </span>
                            {day.enabled && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {day.hours.length > 0
                                  ? `${day.hours[0]}〜${parseInt(day.hours[day.hours.length - 1]) + 1}:00`
                                  : "未設定"}
                              </span>
                            )}
                          </div>
                          {day.enabled && (
                            isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )
                          )}
                        </button>
                      </div>

                      {isExpanded && day.enabled && (
                        <div className="px-4 pb-4 space-y-4">
                          <Separator />
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-muted-foreground">時間帯</p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => copyToAll(d.key)}
                                  className="flex items-center gap-1 text-[10px] font-medium text-primary px-2 py-1 rounded-[4px] border border-primary/30 hover:bg-primary/5"
                                >
                                  <Copy className="w-3 h-3" />
                                  全曜日にコピー
                                </button>
                                <button
                                  onClick={() => resetDay(d.key)}
                                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground px-2 py-1 rounded-[4px] border border-border hover:bg-muted/50"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {HOURS.map((hour) => {
                                const active = day.hours.includes(hour);
                                return (
                                  <button
                                    key={hour}
                                    onClick={() => toggleHour(d.key, hour)}
                                    className={`h-9 rounded-[4px] text-[11px] font-medium transition-colors ${
                                      active
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {parseInt(hour)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Calendar-based override tab */
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-[8px] p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                カレンダーから日付を選んで、通常設定から時間帯を個別に変更できます。
              </p>
            </div>

            {/* Calendar */}
            <div className="border border-border rounded-[8px] bg-card overflow-hidden">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={prevMonth} className="w-8 h-8 rounded-[4px] flex items-center justify-center hover:bg-muted/50">
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <p className="text-sm font-bold text-foreground">
                  {calendarMonth.getFullYear()}年{calendarMonth.getMonth() + 1}月
                </p>
                <button onClick={nextMonth} className="w-8 h-8 rounded-[4px] flex items-center justify-center hover:bg-muted/50">
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <Separator />

              {/* Weekday headers */}
              <div className="grid grid-cols-7 px-2 pt-2">
                {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => (
                  <div key={d} className={`text-center text-[10px] font-bold py-1 ${
                    i === 5 ? "text-blue-500" : i === 6 ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-10" />;
                  }

                  const isPast = date < today;
                  const isToday = date.getTime() === today.getTime();
                  const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                  const dateHasOverride = hasOverride(date);
                  const effectiveHours = getEffectiveHours(date);
                  const dayKey = DAY_KEYS_BY_JS_DAY[date.getDay()];
                  const defaultDay = schedule[dayKey];
                  const isOff = !defaultDay.enabled && !dateHasOverride;
                  const jsDay = date.getDay();

                  // Check if override reduced hours
                  const isReduced = dateHasOverride && effectiveHours.length < getDefaultHoursForDate(date).length;
                  const isAdded = dateHasOverride && effectiveHours.length > getDefaultHoursForDate(date).length;

                  return (
                    <button
                      key={getDateKey(date)}
                      onClick={() => !isPast && setSelectedDate(isSelected ? null : date)}
                      disabled={isPast}
                      className={`h-10 rounded-[4px] flex flex-col items-center justify-center relative transition-colors ${
                        isPast
                          ? "text-muted-foreground/30"
                          : isSelected
                            ? "bg-primary text-primary-foreground"
                            : isToday
                              ? "bg-primary/10 text-primary font-bold"
                              : isOff
                                ? "text-muted-foreground/40"
                                : jsDay === 0
                                  ? "text-destructive hover:bg-muted/50"
                                  : jsDay === 6
                                    ? "text-blue-500 hover:bg-muted/50"
                                    : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xs font-medium">{date.getDate()}</span>
                      {!isPast && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dateHasOverride ? (
                            <span className={`w-1 h-1 rounded-full ${
                              isReduced ? "bg-destructive" : isAdded ? "bg-green-500" : "bg-accent"
                            }`} />
                          ) : defaultDay.enabled ? (
                            <span className="w-1 h-1 rounded-full bg-primary/40" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="px-4 pb-3 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="text-[9px] text-muted-foreground">通常</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <span className="text-[9px] text-muted-foreground">削減</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[9px] text-muted-foreground">追加</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[9px] text-muted-foreground">変更</span>
                </div>
              </div>
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <SelectedDateEditor
                date={selectedDate}
                defaultHours={getDefaultHoursForDate(selectedDate)}
                effectiveHours={getEffectiveHours(selectedDate)}
                hasOverride={hasOverride(selectedDate)}
                onToggleHour={(hour) => toggleDateHour(selectedDate, hour)}
                onReset={() => resetDateOverride(selectedDate)}
                onClose={() => setSelectedDate(null)}
                defaultEnabled={schedule[DAY_KEYS_BY_JS_DAY[selectedDate.getDay()]].enabled}
              />
            )}

            {/* Override summary */}
            {overrideCount > 0 && !selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">変更済みの日程（{overrideCount}件）</p>
                  <button
                    onClick={() => { setDateOverrides({}); toast.success("すべてリセットしました"); }}
                    className="text-[10px] font-medium text-destructive"
                  >
                    すべてリセット
                  </button>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(dateOverrides)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, override]) => {
                      const parts = key.split("-");
                      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                      const dayLabel = JP_WEEKDAYS[d.getDay()];
                      const defaultHrs = getDefaultHoursForDate(d);
                      const diff = override.hours.length - defaultHrs.length;

                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedDate(d)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {parseInt(parts[1])}/{parseInt(parts[2])}（{dayLabel}）
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              diff < 0
                                ? "bg-destructive/10 text-destructive"
                                : diff > 0
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-accent/10 text-accent"
                            }`}>
                              {override.hours.length}h
                              {diff !== 0 && ` (${diff > 0 ? "+" : ""}${diff})`}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

// Selected date editor component
interface SelectedDateEditorProps {
  date: Date;
  defaultHours: string[];
  effectiveHours: string[];
  hasOverride: boolean;
  defaultEnabled: boolean;
  onToggleHour: (hour: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const SelectedDateEditor = ({
  date,
  defaultHours,
  effectiveHours,
  hasOverride,
  defaultEnabled,
  onToggleHour,
  onReset,
  onClose,
}: SelectedDateEditorProps) => {
  const dayLabel = JP_WEEKDAYS[date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (
    <div className="border border-primary/30 rounded-[8px] bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            {month}/{day}（{dayLabel}）
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {defaultEnabled
              ? `通常: ${defaultHours.length}時間稼働`
              : "通常: 休み"}
            {hasOverride && (
              <span className="text-accent font-bold ml-1">→ 変更あり</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {hasOverride && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground px-2 py-1 rounded-[4px] border border-border hover:bg-background"
            >
              <RotateCcw className="w-3 h-3" />
              リセット
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-background">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Hour grid */}
      <div className="px-4 py-3">
        <p className="text-xs font-bold text-muted-foreground mb-2">
          時間帯を選択（タップで切り替え）
        </p>
        <div className="grid grid-cols-7 gap-1">
          {HOURS.map((hour) => {
            const isActive = effectiveHours.includes(hour);
            const isDefault = defaultHours.includes(hour);
            // Removed from default
            const isRemoved = isDefault && !isActive;
            // Added beyond default
            const isAdded = !isDefault && isActive;

            return (
              <button
                key={hour}
                onClick={() => onToggleHour(hour)}
                className={`h-10 rounded-[4px] text-[11px] font-medium transition-colors relative ${
                  isActive
                    ? isAdded
                      ? "bg-green-500 text-white"
                      : "bg-primary text-primary-foreground"
                    : isRemoved
                      ? "bg-destructive/10 text-destructive line-through"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {parseInt(hour)}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-primary" />
            <span className="text-[9px] text-muted-foreground">稼働</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-destructive/10 border border-destructive/30" />
            <span className="text-[9px] text-muted-foreground">取消</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-green-500" />
            <span className="text-[9px] text-muted-foreground">追加</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-[4px] bg-background border border-border">
          <span className="text-xs text-muted-foreground">この日の稼働</span>
          <span className="text-sm font-bold text-foreground">{effectiveHours.length}時間</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettings;
