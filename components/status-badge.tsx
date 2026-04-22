import { Badge } from "@/components/ui/badge";
import type {
  BookingStatus,
  CoachStatus,
  VenueStatus,
  MatchStatus,
  AnnouncementStatus,
  ReviewStatus,
  UserStatus,
  CouponStatus,
  PayoutTxStatus,
  VideoReviewStatus,
  ThreadStatus,
} from "@/lib/types";

type Variant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "muted";

const bookingMap: Record<BookingStatus, { label: string; v: Variant }> = {
  pending: { label: "確認待ち", v: "warning" },
  confirmed: { label: "確認済み", v: "success" },
  in_progress: { label: "進行中", v: "default" },
  completed: { label: "完了", v: "muted" },
  cancelled: { label: "キャンセル", v: "muted" },
  reschedule_requested: { label: "振替申請中", v: "warning" },
  refund_requested: { label: "返金申請中", v: "destructive" },
};

const coachMap: Record<CoachStatus, { label: string; v: Variant }> = {
  pending: { label: "審査待ち", v: "warning" },
  approved: { label: "承認済み", v: "success" },
  rejected: { label: "却下", v: "destructive" },
  suspended: { label: "停止", v: "muted" },
};

const venueMap: Record<VenueStatus, { label: string; v: Variant }> = {
  active: { label: "運営中", v: "success" },
  suspended: { label: "停止中", v: "muted" },
  pending: { label: "準備中", v: "warning" },
};

const matchMap: Record<MatchStatus, { label: string; v: Variant }> = {
  scheduled: { label: "予定", v: "default" },
  completed: { label: "完了", v: "muted" },
  disputed: { label: "異議あり", v: "destructive" },
  cancelled: { label: "キャンセル", v: "muted" },
  awaiting_review: { label: "裁定待ち", v: "warning" },
};

const announceMap: Record<AnnouncementStatus, { label: string; v: Variant }> = {
  draft: { label: "下書き", v: "muted" },
  scheduled: { label: "予約送信", v: "warning" },
  sent: { label: "送信済み", v: "success" },
};

const reviewMap: Record<ReviewStatus, { label: string; v: Variant }> = {
  published: { label: "公開中", v: "success" },
  pending_reply: { label: "返信待ち", v: "warning" },
  hidden: { label: "非表示", v: "muted" },
};

const userStatusMap: Record<UserStatus, { label: string; v: Variant }> = {
  active: { label: "稼働中", v: "success" },
  suspended: { label: "停止中", v: "destructive" },
  pending_verification: { label: "認証待ち", v: "warning" },
};

const couponMap: Record<CouponStatus, { label: string; v: Variant }> = {
  draft: { label: "下書き", v: "muted" },
  active: { label: "配布中", v: "success" },
  paused: { label: "一時停止", v: "warning" },
  expired: { label: "期限切れ", v: "muted" },
};

const payoutTxMap: Record<PayoutTxStatus, { label: string; v: Variant }> = {
  pending: { label: "待機中", v: "warning" },
  processing: { label: "送金処理中", v: "default" },
  paid: { label: "着金済み", v: "success" },
  failed: { label: "エラー", v: "destructive" },
  refunded: { label: "返金済", v: "muted" },
};

const videoReviewMap: Record<VideoReviewStatus, { label: string; v: Variant }> = {
  pending: { label: "未着手", v: "warning" },
  in_progress: { label: "作業中", v: "default" },
  completed: { label: "完了", v: "success" },
  overdue: { label: "期限超過", v: "destructive" },
};

const threadMap: Record<ThreadStatus, { label: string; v: Variant }> = {
  active: { label: "有効", v: "success" },
  flagged: { label: "通報あり", v: "destructive" },
  archived: { label: "アーカイブ", v: "muted" },
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  const c = bookingMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function CoachBadge({ status }: { status: CoachStatus }) {
  const c = coachMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function VenueBadge({ status }: { status: VenueStatus }) {
  const c = venueMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function MatchBadge({ status }: { status: MatchStatus }) {
  const c = matchMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function AnnouncementBadge({ status }: { status: AnnouncementStatus }) {
  const c = announceMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const c = reviewMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function UserStatusBadge({ status }: { status: UserStatus }) {
  const c = userStatusMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function CouponBadge({ status }: { status: CouponStatus }) {
  const c = couponMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function PayoutTxBadge({ status }: { status: PayoutTxStatus }) {
  const c = payoutTxMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function VideoReviewBadge({ status }: { status: VideoReviewStatus }) {
  const c = videoReviewMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
export function ThreadBadge({ status }: { status: ThreadStatus }) {
  const c = threadMap[status];
  return <Badge variant={c.v}>{c.label}</Badge>;
}
