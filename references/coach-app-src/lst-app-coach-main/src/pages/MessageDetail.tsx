import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { Send, FileVideo, CalendarCheck, Video, MonitorPlay } from "lucide-react";
import { getThreadById, addCoachMessage, addStudentReply, markThreadRead, type ChatMessage, type MessageThread } from "@/lib/messageStore";
import { getLessonsByType, type Lesson } from "@/lib/lessonStore";

const MessageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [input, setInput] = useState("");
  const [studentReviews, setStudentReviews] = useState<Lesson[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const t = getThreadById(id);
    setThread(t || null);
    if (t) {
      markThreadRead(t.id);
      const reviews = getLessonsByType("video_review").filter(
        (r) => r.studentName === t.studentName
      );
      setStudentReviews(reviews);
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  const autoReplies = [
    "ありがとうございます！了解しました😊",
    "はい、大丈夫です！よろしくお願いします。",
    "分かりました、楽しみにしています！",
    "承知しました。当日よろしくお願いします💪",
  ];

  const handleSend = () => {
    if (!input.trim() || !thread) return;
    const msg = addCoachMessage(thread.id, input.trim());
    if (msg) {
      setThread({ ...thread, messages: [...thread.messages, msg] });
      setTimeout(() => {
        const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const reply = addStudentReply(thread.id, replyText);
        if (reply) {
          setThread((prev) => {
            if (!prev) return prev;
            const refreshed = getThreadById(prev.id);
            if (refreshed) {
              markThreadRead(refreshed.id);
              return refreshed;
            }
            return { ...prev, messages: [...prev.messages, reply] };
          });
        }
      }, 1000 + Math.random() * 2000);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!thread) {
    return (
      <InnerPageLayout title="メッセージ">
        <div className="flex items-center justify-center pt-20">
          <p className="text-sm text-muted-foreground">メッセージが見つかりません</p>
        </div>
      </InnerPageLayout>
    );
  }

  const pendingReviews = studentReviews.filter((r) => r.status === "pending");

  const renderBookingConfirmCard = (msg: ChatMessage) => {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-[12px] rounded-br-[4px] p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">予約確定</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span>📅</span>
            <span className="font-medium">{msg.bookingDate} {msg.bookingTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span>💻</span>
            <span className="font-medium">{msg.bookingType}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
          当日お会いできるのを楽しみにしています！
        </p>
      </div>
    );
  };

  const renderReviewReplyCard = (msg: ChatMessage) => {
    return (
      <button
        onClick={() => msg.reviewId && navigate(`/review-request/${msg.reviewId}`)}
        className="bg-accent/10 border border-accent/30 rounded-[12px] rounded-br-[4px] p-3.5 text-left hover:bg-accent/20 transition-colors w-full"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Video className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-bold text-accent">動画レビュー回答</span>
        </div>
        <p className="text-sm text-foreground font-medium mb-1.5">「{msg.reviewTopic}」</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{msg.text}</p>
        <span className="inline-block mt-2.5 text-xs font-bold text-accent border border-accent rounded-[4px] px-3 py-1">
          詳細を見る →
        </span>
      </button>
    );
  };

  const renderReviewRequestCard = (msg: ChatMessage) => {
    return (
      <button
        onClick={() => msg.reviewId && navigate(`/review-request/${msg.reviewId}`)}
        className="bg-accent/10 border border-accent/30 rounded-[12px] rounded-bl-[4px] p-3.5 text-left hover:bg-accent/20 transition-colors w-full"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <FileVideo className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-bold text-accent">動画レビュー依頼</span>
        </div>
        <p className="text-sm text-foreground font-medium">{msg.reviewTopic}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.text}</p>
        <span className="inline-block mt-2.5 text-xs font-bold text-accent border border-accent rounded-[4px] px-3 py-1">
          確認する →
        </span>
      </button>
    );
  };

  const renderLessonLinkCard = (msg: ChatMessage) => {
    return (
      <div className="bg-muted/80 border border-border rounded-[12px] rounded-br-[4px] p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <MonitorPlay className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{msg.lessonType || "オンラインレッスン"}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          オンラインレッスンの開始時間が近づきました。下のリンクから参加してください。
        </p>
        <button
          onClick={() => navigate(msg.linkUrl || "/online-lesson")}
          className="w-full py-3 rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          レッスンに参加する
        </button>
        <p className="text-[10px] text-muted-foreground mt-2">{msg.time}</p>
      </div>
    );
  };

  const renderMessage = (msg: ChatMessage) => {
    const isCoach = msg.sender === "coach";

    return (
      <div key={msg.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
        <div className={`flex items-end gap-2 max-w-[85%] ${isCoach ? "flex-row-reverse" : ""}`}>
          {!isCoach && msg.sender !== "system" && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: thread.studentAvatarColor }}
            >
              {thread.studentInitial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {msg.type === "lesson_link" ? (
              renderLessonLinkCard(msg)
            ) : msg.type === "booking_confirm" ? (
              renderBookingConfirmCard(msg)
            ) : msg.type === "review_reply" ? (
              renderReviewReplyCard(msg)
            ) : msg.type === "review_request" ? (
              renderReviewRequestCard(msg)
            ) : (
              <div
                className={`px-3.5 py-2.5 rounded-[12px] text-sm whitespace-pre-line ${
                  isCoach
                    ? "bg-primary text-primary-foreground rounded-br-[4px]"
                    : "bg-muted text-foreground rounded-bl-[4px]"
                }`}
              >
                {msg.text}
              </div>
            )}
            <p className={`text-[10px] text-muted-foreground/60 mt-1 ${isCoach ? "text-right" : ""}`}>
              {msg.time}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <InnerPageLayout title={thread.studentName}>
      <div className="-mx-[20px] -mt-6 -mb-6 flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-[20px] py-4 space-y-4">
          {/* Pending review cards at top */}
          {pendingReviews.map((review) => (
            <div key={review.id} className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[85%]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: thread.studentAvatarColor }}
                >
                  {thread.studentInitial}
                </div>
                <button
                  onClick={() => navigate(`/review-request/${review.id}`)}
                  className="bg-accent/10 border border-accent/30 rounded-[12px] rounded-bl-[4px] p-3 text-left hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileVideo className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-bold text-accent">動画レビュー依頼</span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{review.topic}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{review.date}</p>
                  <span className="inline-block mt-2 text-xs font-bold text-accent border border-accent rounded-[4px] px-3 py-1">
                    確認する →
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* All messages */}
          {thread.messages.map(renderMessage)}
        </div>
        <div className="flex-shrink-0 px-[20px] py-3 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              className="flex-1 h-10 px-4 rounded-full border border-border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default MessageDetail;
