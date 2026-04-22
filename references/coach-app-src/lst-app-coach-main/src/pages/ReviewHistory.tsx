import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { Star, ChevronRight } from "lucide-react";

interface Review {
  id: string;
  studentName: string;
  studentInitial: string;
  studentAvatarColor: string;
  rating: number;
  comment: string;
  lessonType: "practice" | "online" | "video_review";
  date: string;
  courseName: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    studentName: "山田 花子",
    studentInitial: "山",
    studentAvatarColor: "hsl(25, 90%, 55%)",
    rating: 5,
    comment: "とても分かりやすく、楽しいレッスンでした！初心者の私でも安心して受けられました。",
    lessonType: "practice",
    date: "2025/04/12",
    courseName: "パデル基礎レッスン",
  },
  {
    id: "rev-2",
    studentName: "佐々木 翔",
    studentInitial: "佐",
    studentAvatarColor: "hsl(140, 60%, 42%)",
    rating: 4,
    comment: "実践的なアドバイスが多く、すぐに試合で使えそうです。次回もお願いします。",
    lessonType: "online",
    date: "2025/04/10",
    courseName: "試合戦略コース",
  },
  {
    id: "rev-3",
    studentName: "高橋 健一",
    studentInitial: "高",
    studentAvatarColor: "hsl(270, 60%, 55%)",
    rating: 5,
    comment: "動画レビューが丁寧で、自分のフォームの改善点がよく分かりました。",
    lessonType: "video_review",
    date: "2025/04/08",
    courseName: "動画レビュー",
  },
  {
    id: "rev-4",
    studentName: "中村 美咲",
    studentInitial: "中",
    studentAvatarColor: "hsl(0, 70%, 55%)",
    rating: 5,
    comment: "毎回のレッスンで上達を実感できます。丁寧なご指導ありがとうございます！",
    lessonType: "practice",
    date: "2025/04/05",
    courseName: "パデル基礎レッスン",
  },
  {
    id: "rev-5",
    studentName: "小林 大輔",
    studentInitial: "小",
    studentAvatarColor: "hsl(200, 70%, 50%)",
    rating: 3,
    comment: "内容は良かったですが、もう少し時間が欲しかったです。",
    lessonType: "online",
    date: "2025/04/01",
    courseName: "試合戦略コース",
  },
];

const lessonTypeLabel: Record<string, string> = {
  practice: "対面",
  online: "オンライン",
  video_review: "動画レビュー",
};

const ReviewHistory = () => {
  const navigate = useNavigate();
  const reviews = MOCK_REVIEWS;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <InnerPageLayout title="受けた評価">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 gap-3">
          <Star className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm font-bold text-foreground">評価はまだありません</p>
          <p className="text-xs text-muted-foreground text-center">
            レッスン完了後に生徒からの評価が<br />ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="-mt-2">
          {/* Summary */}
          <div className="flex items-center gap-4 bg-card border border-border rounded-[8px] p-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{avgRating}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(Number(avgRating))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-sm font-bold text-foreground">{reviews.length}件の評価</p>
              <p className="text-[11px] text-muted-foreground">全レッスン合計</p>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-3">
            {reviews.map((review) => (
              <button
                key={review.id}
                onClick={() => navigate(`/reviews/${review.id}`)}
                className="w-full text-left bg-card border border-border rounded-[8px] p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: review.studentAvatarColor }}
                  >
                    {review.studentInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-foreground">{review.studentName}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground">
                        {lessonTypeLabel[review.lessonType]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{review.courseName}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </InnerPageLayout>
  );
};

export default ReviewHistory;
