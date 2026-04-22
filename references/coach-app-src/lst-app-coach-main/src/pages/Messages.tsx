import PhoneMockup from "@/components/PhoneMockup";
import BottomNav from "@/components/BottomNav";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { getThreads } from "@/lib/messageStore";
import { getLessonsByType, getStatusLabel, type Lesson } from "@/lib/lessonStore";
import { useState, useEffect } from "react";
import { FileVideo } from "lucide-react";

interface DisplayThread {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  lastMessage: string;
  date: string;
  unread: boolean;
  pendingReviewCount: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const bottomNav = <BottomNav active={4} />;
  const [threads, setThreads] = useState<DisplayThread[]>([]);
  

  useEffect(() => {
    const stored = getThreads();
    const videoReviews = getLessonsByType("video_review");

    const display: DisplayThread[] = stored.map((t) => {
      const lastMsg = t.messages[t.messages.length - 1];
      const read = t.readCount || 0;
      // Count pending video reviews from same student
      const studentReviews = videoReviews.filter(
        (r) => r.studentName === t.studentName && r.status === "pending"
      );
      // Check if latest activity is a review request (show review topic as last message)
      let lastMessage = lastMsg?.text || "";
      let lastDate = lastMsg?.time?.split(" ")[0] || "";
      if (studentReviews.length > 0) {
        const latestReview = studentReviews[0];
        lastMessage = `📹 動画レビュー依頼: ${latestReview.topic}`;
        lastDate = latestReview.date.replace(/^\d{4}\//, "");
      }

      return {
        id: t.id,
        name: t.studentName,
        initial: t.studentInitial,
        avatarColor: t.studentAvatarColor,
        lastMessage,
        date: lastDate,
        unread: t.messages.length > read || studentReviews.length > 0,
        pendingReviewCount: studentReviews.length,
      };
    });
    setThreads(display);
  }, []);

  const filtered = threads;

  return (
    <PhoneMockup bottomNav={bottomNav}>
      <div className="flex flex-col h-full bg-background relative">
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-3 flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground">メッセージ</h1>
          </div>
          <Separator />
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24 gap-3 px-[20px]">
              <p className="text-sm font-bold text-foreground">メッセージはありません</p>
              <p className="text-xs text-muted-foreground text-center">
                生徒とのやり取りがここに表示されます。
              </p>
            </div>
          ) : (
            filtered.map((thread, i) => (
              <div key={thread.id}>
                <button
                  onClick={() => navigate(`/messages/${thread.id}`)}
                  className={`w-full flex items-center gap-3 px-[20px] py-4 text-left hover:bg-muted/50 transition-colors ${
                    thread.unread ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                      style={{ backgroundColor: thread.avatarColor }}
                    >
                      {thread.initial}
                    </div>
                    {thread.pendingReviewCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <FileVideo className="w-3 h-3 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${thread.unread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                        {thread.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 ml-2">{thread.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {thread.unread && <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />}
                      <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                    </div>
                  </div>
                </button>
                {i < filtered.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>

      </div>
    </PhoneMockup>
  );
};

export default Messages;
