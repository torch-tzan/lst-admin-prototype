import { useParams, useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getLessons, updateLesson, type Lesson } from "@/lib/lessonStore";
import { sendReviewReply } from "@/lib/messageStore";
import { FileVideo, User, Play, Pause, X, Volume2, Pencil } from "lucide-react";
import videoThumbnail from "@/assets/video-thumbnail.jpg";
import { toast } from "sonner";
import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ReviewRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | undefined>(() => getLessons().find((l) => l.id === id));
  const [comment, setComment] = useState(lesson?.reviewComment || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 45; // mock 45 seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 0.25;
        });
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  const togglePlay = () => {
    if (currentTime >= totalDuration) setCurrentTime(0);
    setIsPlaying((p) => !p);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(ratio * totalDuration);
  };

  if (!lesson) {
    return (
      <InnerPageLayout title="レビュー依頼">
        <div className="flex items-center justify-center pt-20">
          <p className="text-sm text-muted-foreground">レビュー依頼が見つかりません</p>
        </div>
      </InnerPageLayout>
    );
  }

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      toast.error("レビューコメントを入力してください");
      return;
    }
    updateLesson(lesson.id, { status: "completed", reviewComment: comment.trim() });
    setLesson({ ...lesson, status: "completed", reviewComment: comment.trim() });

    // Send review reply to message thread
    sendReviewReply(lesson.studentId, lesson.id, lesson.topic, comment.trim());

    toast.success("レビューを送信しました");
  };

  const handleDecline = () => {
    updateLesson(lesson.id, { status: "declined" });
    setLesson({ ...lesson, status: "declined" });
    toast.success("レビュー依頼を辞退しました");
  };

  return (
    <InnerPageLayout title="レビュー依頼">
      <div className="space-y-5 -mt-2">
        {/* Student info */}
        <div className="bg-card border border-border rounded-[8px] p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: lesson.studentAvatarColor }}
            >
              {lesson.studentInitial}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{lesson.studentName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {lesson.studentLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">依頼内容</p>
          <div className="flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-accent" />
            <p className="text-sm font-medium text-foreground">{lesson.topic}</p>
          </div>
        </div>

        {/* Video placeholder */}
        <button onClick={() => setShowVideo(true)} className="relative rounded-[8px] overflow-hidden aspect-video w-full block">
          <img src={videoThumbnail} alt="動画プレビュー" className="w-full h-full object-cover" loading="lazy" width={800} height={512} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        </button>

        {/* Video player modal */}
        <Dialog open={showVideo} onOpenChange={(open) => { setShowVideo(open); if (!open) setIsPlaying(false); }}>
          <DialogContent className="p-0 bg-black border-none max-w-[360px] rounded-[12px] overflow-hidden gap-0">
            <button
              onClick={() => { setShowVideo(false); setIsPlaying(false); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Video area */}
            <div className="aspect-video bg-black relative cursor-pointer" onClick={togglePlay}>
              <img src={videoThumbnail} alt="動画再生中" className="w-full h-full object-cover" />
              {/* Play/pause overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}>
                <div className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white fill-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div className="bg-foreground/95 px-4 py-2.5 space-y-2">
              {/* Progress bar */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-background/60 font-mono w-8 text-right">{formatTime(currentTime)}</span>
                <div className="flex-1 h-[3px] bg-background/20 rounded-full cursor-pointer relative" onClick={handleSeek}>
                  <div
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow" />
                  </div>
                </div>
                <span className="text-[10px] text-background/60 font-mono w-8">{formatTime(totalDuration)}</span>
              </div>

              {/* Info row */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-background truncate">{lesson.topic}</p>
                  <p className="text-[10px] text-background/50">{lesson.studentName}</p>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-background/40 flex-shrink-0" />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Earnings */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">報酬</p>
          <p className="text-lg font-bold text-primary">¥{lesson.earnings.toLocaleString()}</p>
        </div>

        {/* Review input */}
        {lesson.status === "pending" ? (
          <>
            <div className="flex items-start gap-2 bg-accent/10 border border-accent/20 rounded-[8px] px-3 py-2.5">
              <span className="text-accent text-sm mt-0.5">⚠</span>
              <p className="text-xs text-foreground/80">動画レビューは依頼受領後、<span className="font-bold text-foreground">1週間以内</span>にご回答ください。</p>
            </div>
          </>
        ) : null}
        {lesson.status === "pending" ? (
          <>
            <div>
              <label className="text-sm font-bold text-foreground mb-1.5 block">レビューコメント</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="フォームやテクニックについてのアドバイスを入力..."
                rows={5}
                className="w-full px-4 py-3 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 h-12 rounded-[4px] border border-border text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
              >
                辞退する
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 h-12 rounded-[4px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
              >
                レビューを送信
              </button>
            </div>
          </>
        ) : (
          lesson.reviewComment && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">回答済みレビュー</p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-primary font-medium"
                  >
                    <Pencil className="w-3 h-3" />
                    編集
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setComment(lesson.reviewComment || ""); setIsEditing(false); }}
                      className="flex-1 h-12 rounded-[4px] border border-border text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => {
                        if (!comment.trim()) { toast.error("コメントを入力してください"); return; }
                        updateLesson(lesson.id, { reviewComment: comment.trim() });
                        setLesson({ ...lesson, reviewComment: comment.trim() });
                        sendReviewReply(lesson.studentId, lesson.id, lesson.topic, comment.trim());
                        setIsEditing(false);
                        toast.success("レビューを更新しました");
                      }}
                      className="flex-1 h-12 rounded-[4px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      更新する
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-[8px] p-4">
                  <p className="text-sm text-foreground whitespace-pre-line">{lesson.reviewComment}</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </InnerPageLayout>
  );
};

export default ReviewRequestDetail;
