import { useMemo, useState } from "react";
import InnerPageLayout from "@/components/InnerPageLayout";
import AnimatedTabs from "@/components/AnimatedTabs";
import { getLessons, getTypeLabel, type LessonType } from "@/lib/lessonStore";
import { Separator } from "@/components/ui/separator";

type Tab = "practice" | "online" | "video_review";

const CoachingHistory = () => {
  const [activeTab, setActiveTab] = useState<Tab>("practice");

  const allCompleted = useMemo(() => getLessons().filter((l) => l.status === "completed"), []);

  const tabs = [
    { key: "practice" as Tab, label: "実体", badge: allCompleted.filter((l) => l.type === "practice").length || undefined },
    { key: "online" as Tab, label: "オンライン", badge: allCompleted.filter((l) => l.type === "online").length || undefined },
    { key: "video_review" as Tab, label: "動画レビュー", badge: allCompleted.filter((l) => l.type === "video_review").length || undefined },
  ];

  const filtered = allCompleted.filter((l) => l.type === activeTab);

  return (
    <InnerPageLayout title="コーチング履歴">
      <div className="-mx-[20px] -mt-4">
        <AnimatedTabs
          tabs={tabs.map((t) => ({ key: t.key, label: t.label, badge: t.badge }))}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as Tab)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center pt-20">
          <p className="text-sm text-muted-foreground">履歴はありません</p>
        </div>
      ) : (
        <div className="-mx-[20px] mt-2">
          {filtered.map((lesson, i) => (
            <div key={lesson.id}>
              <div className="flex items-center gap-3 px-[20px] py-3.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: lesson.studentAvatarColor }}
                >
                  {lesson.studentInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{lesson.studentName}</p>
                  <p className="text-xs text-muted-foreground">{lesson.topic}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{lesson.date}</p>
                </div>
                <p className="text-sm font-bold text-primary flex-shrink-0">¥{lesson.earnings.toLocaleString()}</p>
              </div>
              {i < filtered.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </InnerPageLayout>
  );
};

export default CoachingHistory;