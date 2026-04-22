import { CalendarDays, MessageSquare, User, Home, FileVideo, Dumbbell, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUnreadMessageCount } from "@/lib/messageStore";
import { getLessons } from "@/lib/lessonStore";

const tabs = [
  { icon: Home, label: "ホーム", path: "/" },
  { icon: Dumbbell, label: "実践", path: "/practice-lessons" },
  { icon: Video, label: "オンライン", path: "/online-lessons" },
  { icon: FileVideo, label: "動画レビュー", path: "/video-reviews" },
  { icon: MessageSquare, label: "メッセージ", path: "/messages" },
  { icon: User, label: "マイページ", path: "/mypage" },
];

interface BottomNavProps {
  active?: number;
}

const BottomNav = ({ active = 0 }: BottomNavProps) => {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    const update = () => {
      setUnreadMessages(getUnreadMessageCount());
      setPendingReviews(getLessons().filter((l) => l.type === "video_review" && (l.status === "pending" || l.status === "confirmed")).length);
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  const getBadge = (label: string): number => {
    if (label === "メッセージ") return unreadMessages;
    if (label === "動画レビュー") return pendingReviews;
    return 0;
  };

  return (
    <nav className="flex-shrink-0">
      <div className="flex">
        {tabs.map((tab, i) => {
          const badge = getBadge(tab.label);
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative ${
                i === active ? "text-primary" : "text-primary-foreground/50"
              }`}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
