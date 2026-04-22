import { useState } from "react";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getLessons, getTypeLabel, getStatusLabel, getStatusColor, type Lesson } from "@/lib/lessonStore";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, Dumbbell, Video, FileVideo, History, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const CalendarPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const isToday = (date: Date) => isSameDay(date, today);

  const allLessons = getLessons();
  const lessons = allLessons.filter(
    (l) => l.status !== "cancelled" && l.status !== "declined" && l.type !== "video_review"
  );

  const pendingVideoReviews = allLessons.filter(
    (l) => l.type === "video_review" && (l.status === "pending" || l.status === "confirmed")
  ).filter((l) => {
    const deadline = new Date(new Date(l.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);
    return isSameDay(deadline, selectedDate);
  });

  const lessonsByDate = new Map<string, Lesson[]>();
  lessons.forEach((l) => {
    const key = l.date;
    if (!lessonsByDate.has(key)) lessonsByDate.set(key, []);
    lessonsByDate.get(key)!.push(l);
  });

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  };

  const selectedKey = formatDateKey(selectedDate);
  const selectedLessons = lessonsByDate.get(selectedKey) || [];

  // Build calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Next month padding
  const remaining = 7 - (calendarDays.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      calendarDays.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const formatSelectedDate = (date: Date) =>
    `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;

  const handleCardClick = (lesson: Lesson) => navigate(`/lesson/${lesson.id}`);

  const handleJoinOnline = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation();
    navigate(`/online-lesson?student=${encodeURIComponent(lesson.studentName)}&duration=50`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice": return <Dumbbell className="w-3.5 h-3.5" />;
      case "online": return <Video className="w-3.5 h-3.5" />;
      case "video_review": return <FileVideo className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <InnerPageLayout
      title="予約"
      rightAction={
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1 rounded-full border border-primary text-primary text-xs font-bold"
          >
            今日
          </button>
          <button
            onClick={() => navigate("/coaching-history")}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center"
          >
            <History className="w-4 h-4 text-foreground" />
          </button>
        </div>
      }
    >

        <div className="flex-1 overflow-y-auto -mx-[20px] -mt-6">
          {/* Custom Calendar */}
          <div className="px-[16px] pt-4 pb-2">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-base font-bold text-foreground tracking-wide">
                {month + 1}月 {year}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className={cn(
                  "text-center text-xs font-medium py-1",
                  i === 0 ? "text-destructive" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                )}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map(({ date: d, isCurrentMonth }, idx) => {
                const key = formatDateKey(d);
                const hasLessons = lessonsByDate.has(key);
                const isSelected = isSameDay(d, selectedDate);
                const isTodayDate = isToday(d);
                const dayOfWeek = d.getDay();

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(d);
                      if (!isCurrentMonth) setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                    className="flex flex-col items-center py-[3px] relative"
                  >
                    <span className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-full text-[14px] transition-colors",
                      !isCurrentMonth && "text-muted-foreground/30",
                      isCurrentMonth && dayOfWeek === 0 && !isSelected && "text-destructive",
                      isCurrentMonth && dayOfWeek === 6 && !isSelected && "text-blue-500",
                      isCurrentMonth && dayOfWeek !== 0 && dayOfWeek !== 6 && !isSelected && "text-foreground",
                      isSelected && "bg-primary text-primary-foreground font-bold",
                      isTodayDate && !isSelected && "border-2 border-primary font-bold"
                    )}>
                      {d.getDate()}
                    </span>
                    {/* Dot indicator */}
                    {hasLessons && (
                      <span className={cn(
                        "w-[5px] h-[5px] rounded-full mt-[2px]",
                        isSelected ? "bg-primary-foreground" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Pending video reviews due today */}
          {pendingVideoReviews.length > 0 && (
            <div className="px-[20px] pt-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <h2 className="text-sm font-bold text-foreground">{formatSelectedDate(selectedDate)}期限の動画レビュー</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                  {pendingVideoReviews.length}件
                </span>
              </div>
              <div className="space-y-2">
                {pendingVideoReviews.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/review-request/${r.id}`)}
                    className="w-full text-left bg-card border border-border rounded-[8px] p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: r.studentAvatarColor }}
                      >
                        {r.studentInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{r.studentName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FileVideo className="w-3 h-3 text-accent" />
                          <p className="text-xs text-muted-foreground truncate">{r.topic}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-accent border border-accent rounded-[4px] px-3 py-1.5 flex-shrink-0">
                        詳細
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected date lessons */}
          <div className="px-[20px] py-4">
            <h2 className="text-base font-bold text-foreground mb-3">
              {formatSelectedDate(selectedDate)}
            </h2>

            {selectedLessons.length === 0 ? (
              <div className="bg-card border border-border rounded-[8px] p-6 text-center">
                <p className="text-sm text-muted-foreground">予定はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedLessons
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleCardClick(lesson)}
                    className="w-full text-left bg-card border border-border rounded-[8px] p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-[72px] h-[72px] rounded-[8px] flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: lesson.studentAvatarColor }}
                      >
                        {lesson.studentInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Type & Status badges */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {getTypeIcon(lesson.type)}
                            <span className="ml-0.5">{getTypeLabel(lesson.type)}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(lesson.status)}`}>
                            {getStatusLabel(lesson.status)}
                          </span>
                        </div>
                        {/* Name */}
                        <p className="text-sm font-bold text-foreground">{lesson.studentName}</p>
                        {/* Details */}
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {lesson.studentLevel}
                          {lesson.topic ? ` / ${lesson.topic}` : ""}
                        </p>
                        {/* Time */}
                        {lesson.startTime && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lesson.date} {lesson.startTime}〜{lesson.endTime}
                          </p>
                        )}
                        {/* Join button for online */}
                        {lesson.type === "online" && (lesson.status === "confirmed" || lesson.status === "in_progress") && (
                          <div className="mt-2" onClick={(e) => handleJoinOnline(e, lesson)}>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-foreground bg-accent rounded-[4px] px-3 py-1.5">
                              <Video className="w-3.5 h-3.5" />
                              参加する
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
    </InnerPageLayout>
  );
};

export default CalendarPage;
