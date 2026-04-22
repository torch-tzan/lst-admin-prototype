import { useState } from "react";
import PhoneMockup from "@/components/PhoneMockup";
import BottomNav from "@/components/BottomNav";
import AnimatedTabs from "@/components/AnimatedTabs";
import { getLessons, getStatusLabel, getStatusColor, type Lesson } from "@/lib/lessonStore";
import { useNavigate } from "react-router-dom";
import { Video, Clock } from "lucide-react";

type Tab = "upcoming" | "completed";

const OnlineLessons = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const bottomNav = <BottomNav active={2} />;

  const allOnline = getLessons().filter((l) => l.type === "online");
  const upcomingLessons = allOnline
    .filter((l) => l.status === "pending" || l.status === "confirmed" || l.status === "in_progress")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const completedLessons = allOnline
    .filter((l) => l.status === "completed" || l.status === "cancelled" || l.status === "declined")
    .sort((a, b) => b.date.localeCompare(a.date));

  const lessons = activeTab === "upcoming" ? upcomingLessons : completedLessons;

  const tabs = [
    { key: "upcoming" as Tab, label: "待執行", badge: upcomingLessons.length || undefined },
    { key: "completed" as Tab, label: "完了" },
  ];

  return (
    <PhoneMockup bottomNav={bottomNav}>
      <div className="flex flex-col h-full bg-background">
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-2 flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground">オンライン指導</h1>
          </div>
        </div>

        <div className="flex-shrink-0">
          <AnimatedTabs
            tabs={tabs.map((t) => ({ key: t.key, label: t.label, badge: t.badge }))}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as Tab)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-[20px] py-4">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <Video className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {activeTab === "upcoming" ? "予定のオンライン指導はありません" : "完了したオンライン指導はありません"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="w-full text-left bg-card border border-border rounded-[8px] p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: lesson.studentAvatarColor }}
                    >
                      {lesson.studentInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{lesson.studentName}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(lesson.status)}`}>
                          {getStatusLabel(lesson.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {lesson.date} {lesson.startTime}〜{lesson.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-primary">¥{lesson.earnings.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PhoneMockup>
  );
};

export default OnlineLessons;
