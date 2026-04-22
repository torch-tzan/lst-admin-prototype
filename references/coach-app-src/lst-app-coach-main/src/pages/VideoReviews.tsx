import { useState } from "react";
import PhoneMockup from "@/components/PhoneMockup";
import BottomNav from "@/components/BottomNav";
import AnimatedTabs from "@/components/AnimatedTabs";
import { getLessons, type Lesson } from "@/lib/lessonStore";
import { useNavigate } from "react-router-dom";
import { FileVideo, Clock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import videoThumbnail from "@/assets/video-thumbnail.jpg";

type Tab = "pending" | "completed";

const VideoReviews = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const bottomNav = <BottomNav active={3} />;

  const getRemainingDays = (lesson: Lesson) => {
    const deadlineMs = new Date(lesson.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((deadlineMs - Date.now()) / (24 * 60 * 60 * 1000)));
  };

  const allReviews = getLessons().filter((l) => l.type === "video_review");
  const pendingReviews = allReviews
    .filter((l) => l.status === "pending" || l.status === "confirmed")
    .sort((a, b) => getRemainingDays(a) - getRemainingDays(b));
  const completedReviews = allReviews.filter((l) => l.status === "completed");

  const reviews = activeTab === "pending" ? pendingReviews : completedReviews;

  const tabs = [
    { key: "pending" as Tab, label: "未回答", badge: pendingReviews.length || undefined },
    { key: "completed" as Tab, label: "回答済み" },
  ];

  return (
    <PhoneMockup bottomNav={bottomNav}>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-2 flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground">動画レビュー</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0">
          <AnimatedTabs
            tabs={tabs.map((t) => ({ key: t.key, label: t.label, badge: t.badge }))}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as Tab)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-[20px] py-4">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <FileVideo className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {activeTab === "pending" ? "未回覆のレビューはありません" : "回答済みのレビューはありません"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const remaining = getRemainingDays(review);
                const isUrgent = remaining <= 2;

                return (
                  <button
                    key={review.id}
                    onClick={() => navigate(`/review-request/${review.id}`)}
                    className="w-full text-left border border-border rounded-[8px] bg-card overflow-hidden"
                  >
                    {/* Thumbnail row */}
                    <div className="flex gap-3 p-3">
                      {/* Video thumbnail */}
                      <div className="w-20 h-14 rounded-[4px] overflow-hidden flex-shrink-0 relative">
                        <img src={videoThumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                            <FileVideo className="w-3 h-3 text-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{review.topic}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                            style={{ backgroundColor: review.studentAvatarColor }}
                          >
                            {review.studentInitial}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">{review.studentName}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{review.studentLevel}</span>
                        </div>

                        {activeTab === "pending" ? (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className={cn("w-3 h-3", isUrgent ? "text-destructive" : "text-amber-500")} />
                            <span className={cn("text-[10px] font-bold", isUrgent ? "text-destructive" : "text-amber-600")}>
                              残り {remaining} 日
                            </span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            回答済み
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-primary">¥{review.earnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PhoneMockup>
  );
};

export default VideoReviews;