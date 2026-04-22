import { useParams, useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { Star, MapPin, Monitor, FileVideo } from "lucide-react";

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
  venueName?: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    studentName: "山田 花子",
    studentInitial: "山",
    studentAvatarColor: "hsl(25, 90%, 55%)",
    rating: 5,
    comment: "とても分かりやすく、楽しいレッスンでした！初心者の私でも安心して受けられました。コーチの説明が丁寧で、基本的なストロークのフォームを短時間で習得できました。",
    lessonType: "practice",
    date: "2025/04/12",
    courseName: "パデル基礎レッスン",
    venueName: "パデル東京コート",
  },
  {
    id: "rev-2",
    studentName: "佐々木 翔",
    studentInitial: "佐",
    studentAvatarColor: "hsl(140, 60%, 42%)",
    rating: 4,
    comment: "実践的なアドバイスが多く、すぐに試合で使えそうです。次回もお願いします。特にサーブのコース打ち分けについて詳しく教えていただけました。",
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
    comment: "動画レビューが丁寧で、自分のフォームの改善点がよく分かりました。具体的なドリルも提案していただき、自主練習に活かせそうです。",
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
    comment: "毎回のレッスンで上達を実感できます。丁寧なご指導ありがとうございます！特に壁際のプレーが苦手でしたが、コツを教えていただいて自信がつきました。",
    lessonType: "practice",
    date: "2025/04/05",
    courseName: "パデル基礎レッスン",
    venueName: "パデル東京コート",
  },
  {
    id: "rev-5",
    studentName: "小林 大輔",
    studentInitial: "小",
    studentAvatarColor: "hsl(200, 70%, 50%)",
    rating: 3,
    comment: "内容は良かったですが、もう少し時間が欲しかったです。短い時間の中でも要点を押さえて教えていただけたのは良かったです。",
    lessonType: "online",
    date: "2025/04/01",
    courseName: "試合戦略コース",
  },
];

const lessonTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  practice: { label: "対面レッスン", icon: MapPin },
  online: { label: "オンラインレッスン", icon: Monitor },
  video_review: { label: "動画レビュー", icon: FileVideo },
};

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const review = MOCK_REVIEWS.find((r) => r.id === id);

  if (!review) {
    return (
      <InnerPageLayout title="評価詳細">
        <div className="flex flex-col items-center justify-center pt-20 gap-3">
          <p className="text-sm font-bold text-foreground">評価が見つかりません</p>
        </div>
      </InnerPageLayout>
    );
  }

  const typeConfig = lessonTypeConfig[review.lessonType];
  const TypeIcon = typeConfig.icon;

  return (
    <InnerPageLayout title="評価詳細">
      <div className="space-y-5 -mt-2">
        {/* Student info */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: review.studentAvatarColor }}
          >
            {review.studentInitial}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{review.studentName}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-card border border-border rounded-[8px] p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < review.rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="text-2xl font-bold text-foreground">{review.rating}.0</p>
        </div>

        {/* Comment */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">コメント</p>
          <div className="bg-card border border-border rounded-[8px] p-4">
            <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
          </div>
        </div>

        {/* Lesson info */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">レッスン情報</p>
          <div className="bg-card border border-border rounded-[8px] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <TypeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">レッスン形式</p>
                <p className="text-sm font-medium text-foreground">{typeConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">コース名</p>
                <p className="text-sm font-medium text-foreground">{review.courseName}</p>
              </div>
            </div>
            {review.venueName && (
              <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">場所</p>
                  <p className="text-sm font-medium text-foreground">{review.venueName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default ReviewDetail;
