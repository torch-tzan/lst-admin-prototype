import PhoneMockup from "@/components/PhoneMockup";
import BottomNav from "@/components/BottomNav";
import { useUserProfile } from "@/lib/userProfileStore";
import { getLessons, getTypeLabel, getStatusLabel, getStatusColor } from "@/lib/lessonStore";
import { Star, TrendingUp, FileVideo, Bell, MapPin, Clock, Video, Dumbbell, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import appLogo from "@/assets/app-logo.png";

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const lessons = getLessons();

  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/-/g, "/");
  const todayLessons = lessons.filter((l) => l.date === today && l.status !== "cancelled" && l.status !== "declined" && l.type !== "video_review");

  const pendingReviews = lessons.filter((l) => l.type === "video_review" && l.status === "pending" && l.date === today);
  const completedLessons = lessons.filter((l) => l.status === "completed");
  const totalEarned = completedLessons.reduce((sum, l) => sum + l.earnings, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "practice": return <Dumbbell className="w-3.5 h-3.5" />;
      case "online": return <Video className="w-3.5 h-3.5" />;
      case "video_review": return <FileVideo className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const recentEarnings = [
    { month: "2026年4月", amount: profile.monthlyEarnings },
    { month: "2026年3月", amount: 58000 },
    { month: "2026年2月", amount: 45000 },
  ];

  const bottomNav = <BottomNav active={0} />;

  return (
    <PhoneMockup bottomNav={bottomNav}>
      <div className="flex flex-col h-full bg-background relative">
        {/* Dark header area */}
        <div className="flex-shrink-0 bg-gray-5 pb-5">
          {/* Logo (centered) + notification row */}
          <div className="px-[20px] pt-4 pb-4 flex items-center justify-center relative">
            <img src={appLogo} alt="PADEL BASE" style={{ height: 32, filter: "brightness(0) invert(1)" }} className="object-contain" />
            <button onClick={() => navigate("/notifications")} className="absolute right-[20px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-gray-5" />
            </button>
          </div>

          {/* Stats cards */}
          <div className="px-[20px] grid grid-cols-2 gap-3">
            <div className="bg-primary-foreground/10 rounded-[8px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary-foreground/60 font-medium">累計報酬</p>
              </div>
              <p className="text-xl font-bold text-primary-foreground">¥{totalEarned.toLocaleString()}</p>
            </div>
            <button onClick={() => navigate("/reviews")} className="bg-primary-foreground/10 rounded-[8px] p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary-foreground/60 font-medium">評価</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-primary-foreground">{profile.rating}</p>
                <p className="text-xs text-primary-foreground/60">({profile.reviewCount}件)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-[20px] py-5 space-y-4">
          {/* Today's schedule */}
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">今日の予定</h2>
            {todayLessons.length === 0 ? (
              <div className="bg-card border border-border rounded-[8px] p-4 text-center">
                <p className="text-sm text-muted-foreground">今日の予定はありません</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...todayLessons].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(lesson.type === "video_review" ? `/review-request/${lesson.id}` : `/lesson/${lesson.id}`)}
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
                          <span className="flex items-center gap-0.5 text-xs text-accent">
                            {getTypeIcon(lesson.type)}
                            {getTypeLabel(lesson.type)}
                          </span>
                          {lesson.startTime && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {lesson.startTime}〜{lesson.endTime}
                            </span>
                          )}
                        </div>
                        {lesson.venueName && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground truncate">{lesson.venueName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pending reviews */}
          {pendingReviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground">本日期限の動画レビュー</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                  {pendingReviews.length}件
                </span>
              </div>
              <div className="space-y-2">
                {pendingReviews.map((r) => (
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

          {/* Recent earnings */}
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">直近の収益</h2>
            <div className="bg-card border border-border rounded-[8px] overflow-hidden">
              {recentEarnings.map((entry, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < recentEarnings.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="text-sm text-foreground">{entry.month}</span>
                  <span className="text-sm font-bold text-primary">¥{entry.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating calendar button */}
        <button
          onClick={() => navigate("/calendar")}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-20"
        >
          <CalendarDays className="w-6 h-6" />
        </button>
      </div>
    </PhoneMockup>
  );
};

export default CoachDashboard;
