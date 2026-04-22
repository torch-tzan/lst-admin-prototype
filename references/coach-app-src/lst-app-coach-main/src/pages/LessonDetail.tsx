import { useParams, useNavigate } from "react-router-dom";
import PhoneMockup from "@/components/PhoneMockup";
import { getLessons, updateLesson, getTypeLabel, getStatusLabel, getStatusColor, type Lesson } from "@/lib/lessonStore";
import { sendBookingConfirmation } from "@/lib/messageStore";
import { addNotification } from "@/lib/notificationStore";
import { MapPin, Clock, User, ChevronLeft, Video, Dumbbell, FileText, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | undefined>(() => getLessons().find((l) => l.id === id));
  const [reviewText, setReviewText] = useState(lesson?.reviewComment || "");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => {},
  });

  if (!lesson) {
    return (
      <PhoneMockup>
        <div className="flex flex-col h-full bg-background">
          <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
            <div className="px-[20px] pt-4 pb-3 relative flex items-center justify-center">
              <button onClick={() => navigate(-1)} className="absolute left-[12px] p-1 text-foreground">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-foreground">レッスン詳細</h1>
            </div>
            <Separator />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">レッスンが見つかりません</p>
          </div>
        </div>
      </PhoneMockup>
    );
  }

  const handleApprove = () => {
    updateLesson(lesson.id, { status: "confirmed" });
    setLesson({ ...lesson, status: "confirmed" });
    // Send canned confirmation message
    sendBookingConfirmation(
      lesson.studentId,
      lesson.date,
      lesson.startTime,
      lesson.endTime,
      getTypeLabel(lesson.type),
    );
    toast.success("レッスンを承認しました");
  };

  const handleDecline = () => {
    updateLesson(lesson.id, { status: "declined" });
    setLesson({ ...lesson, status: "declined" });
    toast.success("レッスンを辞退しました");
    navigate(-1);
  };

  const handleStart = () => {
    setConfirmDialog({
      open: true,
      title: "レッスンを開始しますか？",
      description: "開始すると進行中ステータスに変わります。",
      onConfirm: () => {
        updateLesson(lesson.id, { status: "in_progress" });
        setLesson({ ...lesson, status: "in_progress" });
        toast.success("レッスンを開始しました");
      },
    });
  };

  const handleEnd = () => {
    setConfirmDialog({
      open: true,
      title: "レッスンを終了しますか？",
      description: "終了すると完了ステータスに変わります。この操作は取り消せません。",
      onConfirm: () => {
        updateLesson(lesson.id, { status: "completed" });
        setLesson({ ...lesson, status: "completed" });
        toast.success("レッスンが完了しました");
      },
    });
  };

  const handleJoinOnline = () => {
    navigate(`/online-lesson?student=${encodeURIComponent(lesson.studentName)}&duration=50`);
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("レビューコメントを入力してください");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "レビューを送信しますか？",
      description: "送信すると生徒にレビューが届き、レッスンが完了になります。",
      onConfirm: () => {
        updateLesson(lesson.id, { status: "completed", reviewComment: reviewText });
        setLesson({ ...lesson, status: "completed", reviewComment: reviewText });
        sendBookingConfirmation(lesson.studentId, lesson.date, "", "", "動画レビュー完了");
        toast.success("レビューを送信しました");
      },
    });
  };

  // Determine bottom action based on type & status
  const renderBottomAction = () => {
    // --- Video Review: submit review within 1 week ---
    if (lesson.type === "video_review") {
      // Calculate remaining days from createdAt
      const deadlineMs = new Date(lesson.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
      const remainingDays = Math.max(0, Math.ceil((deadlineMs - Date.now()) / (24 * 60 * 60 * 1000)));
      const isOverdue = remainingDays === 0;
      const isUrgent = remainingDays <= 2 && !isOverdue;

      // Auto-expire overdue reviews
      if (isOverdue && (lesson.status === "pending" || lesson.status === "confirmed")) {
        updateLesson(lesson.id, { status: "cancelled" });
        setLesson({ ...lesson, status: "cancelled" });
        addNotification({
          type: "review_overdue",
          title: "動画レビュー期限切れ",
          message: `${lesson.studentName}さんの動画レビュー「${lesson.topic}」が期限を過ぎました。`,
          bookingId: lesson.id,
        });
      }

      if (lesson.status === "cancelled") {
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[8px] p-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-700 font-bold">期限切れ — このレビューは回答期限を過ぎました</p>
                <p className="text-xs text-red-600 mt-1">1週間以内に回答できなかったため、このリクエストは無効になりました。</p>
              </div>
            </div>
          </div>
        );
      }

      if (lesson.status === "pending" || lesson.status === "confirmed") {
        return (
          <div className="space-y-3">
            <div className={`flex items-start gap-2 rounded-[8px] p-3 ${isUrgent ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isUrgent ? "text-red-600" : "text-amber-600"}`} />
              <div>
                <p className={`text-xs ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                  承認後、1週間以内にレビューを回答してください。回答は自動的に生徒へ送信されます。
                </p>
                <p className={`text-xs font-bold mt-1 ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                  残り {remainingDays} 日
                </p>
              </div>
            </div>
            {lesson.status === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 h-[52px] rounded-[8px] border border-border text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
                >
                  辞退する
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  承認する
                </button>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="レビューコメントを入力..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
                <button
                  onClick={handleSubmitReview}
                  className="w-full h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  レビューを送信する
                </button>
              </>
            )}
          </div>
        );
      }
      if (lesson.status === "completed") {
        return (
          <div className="space-y-2">
            {lesson.reviewComment && (
              <div className="bg-muted rounded-[8px] p-3">
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">送信済みレビュー</p>
                <p className="text-sm text-foreground">{lesson.reviewComment}</p>
              </div>
            )}
            <div className="bg-muted rounded-[8px] p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">このレビューは完了しました</p>
            </div>
          </div>
        );
      }
    }

    // --- Online: join meeting room only ---
    if (lesson.type === "online") {
      switch (lesson.status) {
        case "pending":
          return (
            <div className="flex gap-3">
              <button onClick={handleDecline} className="flex-1 h-[52px] rounded-[8px] border border-border text-sm font-bold text-foreground hover:bg-muted/50 transition-colors">辞退する</button>
              <button onClick={handleApprove} className="flex-1 h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">承認する</button>
            </div>
          );
        case "confirmed":
        case "in_progress":
          return (
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-[8px] p-3">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">レッスン時間内に会議室へ参加してください。終了時間から10分以内に退出をお願いします。</p>
              </div>
              <button
                onClick={handleJoinOnline}
                className="w-full h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                会議室に参加する
              </button>
            </div>
          );
        case "completed":
          return (
            <div className="bg-muted rounded-[8px] p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">このレッスンは完了しました</p>
            </div>
          );
      }
    }

    // --- Practice (現場): start & end buttons ---
    switch (lesson.status) {
      case "pending":
        return (
          <div className="flex gap-3">
            <button onClick={handleDecline} className="flex-1 h-[52px] rounded-[8px] border border-border text-sm font-bold text-foreground hover:bg-muted/50 transition-colors">辞退する</button>
            <button onClick={handleApprove} className="flex-1 h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">承認する</button>
          </div>
        );
      case "confirmed":
        return (
          <button onClick={handleStart} className="w-full h-[52px] rounded-[8px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">レッスンを開始する</button>
        );
      case "in_progress":
        return (
          <button onClick={handleEnd} className="w-full h-[52px] rounded-[8px] bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 transition-opacity">レッスンを終了する</button>
        );
      case "completed":
        return (
          <div className="bg-muted rounded-[8px] p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">このレッスンは完了しました</p>
          </div>
        );
      default:
        return (
          <div className="bg-muted rounded-[8px] p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {lesson.status === "declined" ? "このレッスンは辞退されました" : "このレッスンはキャンセルされました"}
            </p>
          </div>
        );
    }
  };

  return (
    <PhoneMockup>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-3 relative flex items-center justify-center">
            <button onClick={() => navigate(-1)} className="absolute left-[12px] p-1 text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">レッスン詳細</h1>
          </div>
          <Separator />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[20px] pt-5 pb-4">
          <div className="space-y-5">
            {/* Status & type badges */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-primary/30 text-primary">
                {lesson.type === "online" ? <Video className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                {getTypeLabel(lesson.type)}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(lesson.status)}`}>
                {getStatusLabel(lesson.status)}
              </span>
            </div>

            {/* Student card */}
            <div className="bg-card border border-border rounded-[8px] p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: lesson.studentAvatarColor }}
                >
                  {lesson.studentInitial}
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{lesson.studentName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3" />
                    {lesson.studentLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Lesson details */}
            <div className="bg-card border border-border rounded-[8px] p-4 space-y-4">
              {lesson.topic && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 font-medium">レッスン内容</p>
                  <p className="text-sm font-medium text-foreground">{lesson.topic}</p>
                </div>
              )}
              {lesson.startTime && lesson.endTime && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 font-medium">日時</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">{lesson.date} {lesson.startTime}〜{lesson.endTime}</p>
                  </div>
                </div>
              )}
              {lesson.venueName && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 font-medium">会場</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{lesson.venueName}</p>
                      {lesson.venueAddress && <p className="text-xs text-muted-foreground">{lesson.venueAddress}</p>}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">報酬</p>
                <p className="text-lg font-bold text-primary">¥{lesson.earnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action — with home indicator spacing */}
        <div className="flex-shrink-0 bg-background border-t border-border px-[20px] pt-3 pb-2">
          {renderBottomAction()}
          {/* Home indicator */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-[134px] h-[5px] bg-muted-foreground/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent className="max-w-[340px] rounded-[12px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmDialog.onConfirm(); setConfirmDialog((prev) => ({ ...prev, open: false })); }}>
              確認
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PhoneMockup>
  );
};

export default LessonDetail;
