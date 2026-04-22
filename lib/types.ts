/**
 * 對齊兩顆 app（user app / coach app）的核心型別。
 * 欄位命名沿用原始 code，新增後台專用欄位（審核狀態、stats 等）。
 */

export type Role = "lst-admin" | "venue-admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  venueId?: string; // venue-admin 必填
  avatar?: string;
}

// ─── 場館 ────────────────────────────────────────
export type VenueStatus = "active" | "suspended" | "pending";

export interface Venue {
  id: string;
  name: string;
  address: string;
  area: string; // 広島 / 大阪 ...
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: VenueStatus;
  courtCount: number;
  createdAt: string;
  /** 企業代表画像 URL（ユーザー app の一覧に表示）*/
  image?: string;
  /** 企業紹介文 */
  description?: string;
  /** 営業時間（平日/週末）*/
  openingHours?: {
    weekday: { open: string; close: string };
    weekend: { open: string; close: string };
  };
  /** 外部リンク（公式サイト、予約ポリシー等）*/
  externalLinks?: { title: string; url: string }[];
}

// ─── 場地 (Court) ────────────────────────────────
export type CourtType = "屋外ハード" | "室内" | "室内ハード" | "クレー";

export interface Court {
  id: string;
  venueId: string;
  name: string; // コートA / コートB
  type: CourtType;
  hourlyPrice: number; // ¥
  active: boolean;
  /** 設備タグ（駐車場、シャワー、ロッカー、ナイター、空調、カフェ 等）*/
  amenities: string[];
  /** コート写真 URL */
  image?: string;
  /** コート紹介文 */
  description?: string;
  /** 収容人数（1 コートあたりの最大プレイヤー数）*/
  capacity?: number;
  /** 平均評価（レビューから導出、表示用）*/
  rating?: number;
  /** レビュー数 */
  reviewCount?: number;
}

/** コートのアメニティ選択肢（user app のサンプルから抽出）*/
export const COURT_AMENITY_OPTIONS = [
  "駐車場",
  "シャワー",
  "ロッカー",
  "レンタル用具",
  "ナイター",
  "空調",
  "カフェ",
  "売店",
  "観戦席",
  "更衣室",
  "トイレ",
  "Wi-Fi",
] as const;

// ─── 時段 ─────────────────────────────────────────
export interface CourtSlot {
  courtId: string;
  /** 0=Sun, 1=Mon, ... 6=Sat */
  weekday: number;
  /** "09:00" */
  time: string;
  open: boolean;
}

// ─── 設備租賃 ─────────────────────────────────────
export type EquipmentPriceType = "hourly" | "perUse";

export interface Equipment {
  id: string;
  venueId: string;
  name: string;
  priceType: EquipmentPriceType;
  price: number;
  maxQty: number;
  stock: number;
  active: boolean;
}

// ─── 教練 ────────────────────────────────────────
export type CoachLevel = "B" | "A" | "S";
export type CoachStatus = "pending" | "approved" | "rejected" | "suspended";

/** 1 人のコーチが提供する複数のレッスンメニュー */
export interface CoachCourse {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  /** 対面対応 */
  supportsInPerson: boolean;
  /** オンライン対応 */
  supportsOnline: boolean;
}

/** 動画レビュー（遠隔フォーム添削）設定 */
export interface VideoReviewSettings {
  enabled: boolean;
  price: number;
  description: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  level: CoachLevel;
  status: CoachStatus;
  /** 登錄在多個場館 */
  venueIds: string[];
  specialties: string[];
  certifications: string[];
  /** 基本時給（代表価格として表示）*/
  hourlyRate: number;
  /** デフォルトレッスン時間（分）*/
  defaultLessonDuration?: number;
  rating: number;
  reviewCount: number;
  bio: string;
  /** 経歴・キャリア（bio と別の長文紹介）*/
  experience?: string;
  /** 活動エリア（例：広島市中区）*/
  area?: string;
  /** 対面レッスン対応 */
  onlineAvailable?: boolean;
  /** 動画レビュー対応 */
  videoReviewAvailable?: boolean;
  /** レッスンメニュー（複数登録可能）*/
  courses?: CoachCourse[];
  /** 動画レビュー設定 */
  videoReviewSettings?: VideoReviewSettings;
  /** パフォーマンス統計（レビューから自動算出）*/
  stats?: {
    completedSessions: number;
    repeatRate: number;
    satisfaction: number;
  };
  /** 累計収益 */
  totalEarnings?: number;
  /** 今月の収益 */
  monthlyEarnings?: number;
  bankAccount?: {
    bankName: string;
    branchName: string;
    /** 普通 / 当座 */
    accountType?: string;
    accountNumber: string;
    accountHolder: string;
  };
  /** 後台審核備註 */
  reviewNote?: string;
  /** 申請時間 */
  appliedAt: string;
  approvedAt?: string;
}

/** 専門分野プリセット（coach app から取り込み）*/
export const COACH_SPECIALTY_OPTIONS = [
  "フォアハンド", "バックハンド", "サーブ", "ボレー",
  "ゲーム戦術", "フットワーク", "メンタル強化", "初心者指導",
  "競技向け", "戦術分析", "フィジカル", "ダブルス戦術",
  "ジュニア育成", "基礎トレーニング", "試合形式", "フォーム改善",
  "体力強化", "ポジショニング", "レクリエーション",
] as const;

export const COACH_CERTIFICATION_OPTIONS = [
  "JPA公認S級", "JPA公認A級", "JPA公認B級",
  "元日本代表", "スポーツ心理学修了", "NSCA-CPT",
  "日本体育協会公認コーチ", "救急法認定", "栄養学修了",
  "FIP公認コーチ", "スペインパデル連盟認定",
  "パーソナルトレーナー",
] as const;

// ─── 課程 / 預約 ──────────────────────────────────
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "reschedule_requested"
  | "refund_requested";

export type BookingType = "court" | "coach_lesson";
export type LessonType = "practice" | "online" | "video_review";
/** 1 人練習 or 複数人スタンダード */
export type BookingMode = "solo" | "standard";

/** 予約時に追加された備品レンタルの明細 */
export interface BookingEquipmentLine {
  id: string;
  name: string;
  priceType: "hourly" | "perUse";
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

/** 利用者からの評価 */
export interface BookingRating {
  stars: number; // 1-5
  comment: string;
  createdAt: string;
}

/** 動画レビュー用のアップロード動画メタ情報 */
export interface ReviewVideoMeta {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Booking {
  id: string;
  type: BookingType;
  status: BookingStatus;
  userId: string;
  userName: string;
  venueId: string;
  venueName: string;
  courtId?: string;
  courtName?: string;
  /** サブコート名（大きいコート内の区画名など）*/
  courtSubName?: string;
  coachId?: string;
  coachName?: string;
  lessonType?: LessonType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  /** 利用人数 */
  people?: number;
  /** 予約モード（solo=1 人練習、standard=複数人）*/
  mode?: BookingMode;
  /** 総額（コート費 + レッスン費 + 備品 合計）*/
  price: number;
  /** コート費（lesson 予約の場合のみ）*/
  courtFeePerHour?: number;
  courtFee?: number;
  /** 備品レンタル合計額 */
  equipmentFee?: number;
  /** 備品レンタル明細 */
  equipment?: BookingEquipmentLine[];
  /** 利用者評価 */
  rating?: BookingRating;
  /** 動画レビュー用の動画リスト */
  reviewVideos?: ReviewVideoMeta[];
  /** 改期を一度使用済み */
  rescheduleUsed?: boolean;
  /** 改期請求（承認待ちの場合）*/
  rescheduleFrom?: { date: string; startTime: string; endTime: string };
  note?: string;
  createdAt: string;
}

// ─── 評價 ─────────────────────────────────────────
export type ReviewStatus = "published" | "pending_reply" | "hidden";

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  targetType: "coach" | "venue";
  targetId: string;
  targetName: string;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  reply?: string;
  createdAt: string;
}

// ─── 賽事 / 爭議 ─────────────────────────────────
export type MatchStatus =
  | "scheduled"
  | "completed"
  | "disputed"
  | "cancelled"
  | "awaiting_review";

export interface Match {
  id: string;
  week: number;
  teamAName: string;
  teamBName: string;
  venueId: string;
  venueName: string;
  date: string;
  status: MatchStatus;
  scoreA?: number;
  scoreB?: number;
  disputeReason?: string;
  disputedBy?: string;
  proposedBy: string;
}

// ─── 公告 ─────────────────────────────────────────
export type AnnouncementTarget = "all" | "users" | "coaches" | "venue-admins";
export type AnnouncementStatus = "draft" | "scheduled" | "sent";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: AnnouncementTarget;
  status: AnnouncementStatus;
  scheduledAt?: string;
  sentAt?: string;
  author: string;
  createdAt: string;
  /** 送達人数 */
  reachedCount?: number;
  /** 既読人数 */
  readCount?: number;
  /** CTA リンククリック数 */
  clickCount?: number;
}

// ─── 会員（利用者）────────────────────────────────
export type UserStatus = "active" | "suspended" | "pending_verification";

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: UserStatus;
  /** 積分 */
  points: number;
  /** 経験値 */
  xp: number;
  /** レベル（XP から算出、表示用） */
  level: number;
  registeredAt: string;
  lastLoginAt?: string;
  /** 累計予約件数 */
  totalBookings: number;
  /** 累計利用額 */
  totalSpend: number;
  /** 優遇タグ */
  tags: string[];
  notes?: string;
}

// ─── 積分・XP ─────────────────────────────────────
export type PointsEventType =
  | "booking_earned"
  | "coupon_redeemed"
  | "admin_adjust_add"
  | "admin_adjust_deduct"
  | "expired"
  | "signup_bonus"
  | "review_bonus";

export interface PointsLog {
  id: string;
  userId: string;
  userName: string;
  eventType: PointsEventType;
  delta: number;
  balance: number;
  note?: string;
  relatedBookingId?: string;
  operator?: string;
  createdAt: string;
}

export interface PointsRule {
  id: string;
  label: string;
  trigger: string;
  earnedPoints: number;
  earnedXp: number;
  active: boolean;
  note?: string;
}

// ─── 優惠券（クーポン配布）─────────────────────────
/**
 * 配布方式：領券中心はない。管理者が条件で絞り込んで配布 OR ホワイトリストで個別配布。
 */
export type CouponDiscountType = "percent" | "fixed";
export type CouponScope = "platform" | "venue";
export type CouponStatus = "draft" | "active" | "paused" | "expired";
export type CouponDistributionMode = "filter" | "whitelist";

export interface CouponFilter {
  /** 最終ログイン日から何日以内 */
  activeWithinDays?: number;
  /** 累計利用額の下限 */
  minTotalSpend?: number;
  /** タグ（OR 条件） */
  includeTags?: string[];
  /** 新規会員（登録から何日以内） */
  newWithinDays?: number;
}

export interface Coupon {
  id: string;
  label: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minAmount: number;
  scope: CouponScope;
  /** scope=venue の場合のみ */
  venueId?: string;
  /** 適用予約種別 */
  applicableTypes: ("court" | "coach_lesson")[];
  /** 配布方式 */
  distributionMode: CouponDistributionMode;
  /** mode=filter の場合の絞り込み条件 */
  filter?: CouponFilter;
  /** mode=whitelist の場合の受信者 userId */
  whitelistUserIds?: string[];
  /** 実際に配布された人数 */
  distributedCount: number;
  /** 利用済み人数 */
  redeemedCount: number;
  expiresAt: string;
  status: CouponStatus;
  createdBy: string;
  createdAt: string;
  distributedAt?: string;
}

// ─── 抽成設定（コミッション）───────────────────────
export interface CommissionRule {
  id: string;
  /** 適用対象 */
  scope: "platform_default" | "venue_override" | "coach_override";
  venueId?: string;
  coachId?: string;
  /** コート予約：プラットフォーム取り分（%）*/
  courtPlatformRate: number;
  /** 施設取り分（%）*/
  courtVenueRate: number;
  /** レッスン：プラットフォーム取り分（%）*/
  lessonPlatformRate: number;
  /** 施設取り分（%）*/
  lessonVenueRate: number;
  /** コーチ取り分（%）= 100 - 他二つ */
  validFrom: string;
  validTo?: string;
  note?: string;
}

// ─── 収益・自動出金（Stripe Connect 連携）──────────
/**
 * レッスン支払完了 → 自動で各手数料を控除してコーチに即時送金（Stripe Express アカウント）。
 * 月次バッチではなく、1 レッスン = 1 取引で精算。
 */
export type PayoutTxStatus =
  | "pending" // 支払い受取待ち
  | "processing" // Stripe 処理中
  | "paid" // コーチへ着金完了
  | "failed" // Stripe エラー / 口座エラー
  | "refunded"; // レッスン取消に伴う返金

export interface EarningRecord {
  id: string;
  coachId: string;
  coachName: string;
  lessonId: string;
  lessonType: LessonType;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  /** 利用者支払額（コート費含む）*/
  grossAmount: number;
  /** コート費（施設側）*/
  courtFee: number;
  /** プラットフォーム手数料 */
  platformFee: number;
  /** 施設手数料（課金取引経由の場合）*/
  venueFee: number;
  /** Stripe 決済手数料（3.6% + ¥40 想定）*/
  stripeFee: number;
  /** コーチ取り分（= gross - court - platform - venue - stripe）*/
  coachEarning: number;
  /** Stripe charge ID（決済 ID）*/
  stripeChargeId: string;
  /** Stripe transfer ID（コーチへの振替）*/
  stripeTransferId?: string;
  /** 取引状態 */
  status: PayoutTxStatus;
  /** レッスン完了時刻（支払確定トリガー）*/
  earnedAt: string;
  /** コーチ着金時刻 */
  paidAt?: string;
  /** 失敗時のエラー */
  errorMessage?: string;
  /** YYYY-MM（集計用）*/
  earnedMonth: string;
}

// ─── 訊息 ─────────────────────────────────────────
export type MessageKind =
  | "text"
  | "booking_confirm"
  | "online_link"
  | "review_request"
  | "review_reply"
  | "lesson_link";

export type ThreadStatus = "active" | "flagged" | "archived";

export interface MessageEntry {
  id: string;
  threadId: string;
  senderType: "user" | "coach" | "venue";
  senderName: string;
  kind: MessageKind;
  body: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  coachId?: string;
  coachName?: string;
  bookingId?: string;
  lastMessageAt: string;
  messageCount: number;
  status: ThreadStatus;
  /** 通報の有無 */
  flagReason?: string;
  flaggedBy?: string;
  /** 直近プレビュー */
  preview: string;
}

// ─── 動画レビュー（互換保持、未使用）──────────────
export type VideoReviewStatus = "pending" | "in_progress" | "completed" | "overdue";

export interface VideoReview {
  id: string;
  studentId: string;
  studentName: string;
  coachId: string;
  coachName: string;
  venueId: string;
  uploadedAt: string;
  dueAt: string;
  status: VideoReviewStatus;
  topic: string;
  videoUrl: string;
  reviewComment?: string;
  submittedAt?: string;
  bookingId?: string;
}

// ─── スタッフ（企業内部）─────────────────────────
export type StaffRole = "owner" | "manager" | "staff" | "receptionist";
export type StaffStatus = "active" | "inactive";

export interface Staff {
  id: string;
  venueId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  hiredAt: string;
  note?: string;
}

// ─── シフト ──────────────────────────────────────
export type ShiftType = "regular" | "overtime" | "holiday";

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  note?: string;
}

// ─── アカウント招待 ──────────────────────────────
export type InviteRole = "staff" | "receptionist" | "manager" | "coach" | "venue-admin";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invite {
  id: string;
  venueId: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
  expiresAt: string;
  /** 招待メモ */
  note?: string;
}

// ─── キャンペーン・イベント ─────────────────────
export type CampaignStatus = "draft" | "scheduled" | "active" | "ended";
export type CampaignKind =
  | "tournament" // 大会
  | "lesson_event" // レッスンイベント
  | "promotion" // 販促
  | "social_gathering"; // 交流会

export interface Campaign {
  id: string;
  title: string;
  description: string;
  kind: CampaignKind;
  venueId?: string; // 省略時はプラットフォーム全体
  scope: "platform" | "venue";
  startAt: string;
  endAt: string;
  /** 参加費 */
  fee: number;
  /** 定員 */
  capacity: number;
  /** 申込数 */
  participantCount: number;
  status: CampaignStatus;
  bannerUrl?: string;
  createdBy: string;
  createdAt: string;
}

// ─── 管理者アカウント・権限 ───────────────────────

/** 管理対象モジュール（CRUD マトリクスの行）*/
export type ModuleKey =
  | "user"
  | "venue"
  | "coach"
  | "booking"
  | "court"
  | "equipment"
  | "finance"
  | "commission"
  | "coupon"
  | "points"
  | "announcement"
  | "campaign"
  | "staff"
  | "shift"
  | "settings"
  | "account"
  | "audit";

/** 標準 CRUD アクション（マトリクスの列）*/
export type CrudAction = "read" | "create" | "update" | "delete";

/** 機微操作（CRUD 外の特殊権限）*/
export type SpecialAction =
  | "coach.approve"
  | "coach.suspend"
  | "booking.approve_reschedule"
  | "booking.refund"
  | "payment.retry"
  | "finance.export"
  | "coupon.distribute"
  | "announcement.send"
  | "user.points_adjust"
  | "user.suspend"
  | "venue.suspend";

export interface AdminRole {
  id: string;
  /** ユニーク識別子（カスタムロールは自動生成）*/
  key: string;
  label: string;
  description: string;
  scope: "lst" | "venue";
  /** システム標準ロール（削除不可・編集制限あり）*/
  builtin: boolean;
  /** モジュール別 CRUD マトリクス */
  modulePerms: Partial<Record<ModuleKey, CrudAction[]>>;
  /** 機微操作リスト */
  specialPerms: SpecialAction[];
  createdAt: string;
  createdBy?: string;
}

export type AdminAccountStatus = "active" | "invited" | "suspended";

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  /** 割当てられたロールの key */
  roleKey: string;
  /** venue 範囲のアカウントのみ */
  venueId?: string;
  status: AdminAccountStatus;
  lastLoginAt?: string;
  createdAt: string;
  createdBy?: string;
}

/** モジュール表示ラベル */
export const MODULE_LABELS: Record<ModuleKey, string> = {
  user: "会員管理",
  venue: "企業管理",
  coach: "コーチ管理",
  booking: "予約管理",
  court: "コート管理",
  equipment: "備品レンタル",
  finance: "売上・決済",
  commission: "手数料設定",
  coupon: "クーポン管理",
  points: "ポイント管理",
  announcement: "お知らせ配信",
  campaign: "キャンペーン",
  staff: "スタッフ管理",
  shift: "シフト管理",
  settings: "システム設定",
  account: "管理者アカウント",
  audit: "監査ログ",
};

export const CRUD_LABELS: Record<CrudAction, string> = {
  read: "閲覧",
  create: "作成",
  update: "編集",
  delete: "削除",
};

export const SPECIAL_ACTION_LABELS: Record<SpecialAction, { label: string; module: ModuleKey }> = {
  "coach.approve": { label: "コーチ審査（承認・却下）", module: "coach" },
  "coach.suspend": { label: "コーチ停止・復帰", module: "coach" },
  "booking.approve_reschedule": { label: "予約振替審査", module: "booking" },
  "booking.refund": { label: "予約返金処理", module: "booking" },
  "payment.retry": { label: "Stripe 送金エラー再送", module: "finance" },
  "finance.export": { label: "財務 CSV エクスポート", module: "finance" },
  "coupon.distribute": { label: "クーポン配布実行", module: "coupon" },
  "announcement.send": { label: "お知らせ配信実行", module: "announcement" },
  "user.points_adjust": { label: "会員ポイント手動調整", module: "user" },
  "user.suspend": { label: "会員停止・復帰", module: "user" },
  "venue.suspend": { label: "企業停止・復帰", module: "venue" },
};

/** scope ごとに利用可能なモジュール */
export const SCOPE_MODULES: Record<"lst" | "venue", ModuleKey[]> = {
  lst: [
    "user", "venue", "coach",
    "booking", "court", "equipment",
    "finance", "commission",
    "coupon", "points",
    "announcement", "campaign",
    "settings", "account", "audit",
  ],
  venue: [
    "booking", "court", "equipment",
    "coupon", "announcement", "campaign",
    "staff", "shift",
    "account", "audit",
  ],
};

// ─── 監査ログ ────────────────────────────────────
export type AuditActionCategory =
  | "auth"
  | "user"
  | "venue"
  | "coach"
  | "booking"
  | "finance"
  | "settings"
  | "announce"
  | "coupon"
  | "staff"
  | "account";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRoleKey: string;
  /** 影響範囲（venue-scoped の場合のみ）*/
  scopeVenueId?: string;
  category: AuditActionCategory;
  /** e.g. "coach.approve", "booking.refund" */
  action: string;
  /** 対象の種別（coach, booking, etc.） */
  targetType: string;
  targetId: string;
  targetLabel: string;
  /** 変更差分の要約 */
  summary: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// ─── システム設定 ────────────────────────────────
export interface SystemSettings {
  /** プラットフォーム名 */
  platformName: string;
  /** サポートメール */
  supportEmail: string;
  /** サポート電話 */
  supportPhone: string;
  /** 利用規約 URL */
  termsUrl: string;
  /** プライバシーポリシー URL */
  privacyUrl: string;
  /** メンテナンスモード */
  maintenanceMode: boolean;
  /** 新規登録受付 */
  registrationOpen: boolean;
  /** Stripe 公開鍵（マスク表示） */
  stripePublishableKey: string;
  /** 地域（デフォルト通貨） */
  defaultCurrency: "JPY" | "TWD" | "USD";
  /** デフォルトタイムゾーン */
  timezone: string;
  /** 予約キャンセル受付（何時間前まで） */
  cancellationWindowHours: number;
  /** ポイント有効期限（日） */
  pointsExpirationDays: number;
  updatedAt: string;
  updatedBy: string;
}
