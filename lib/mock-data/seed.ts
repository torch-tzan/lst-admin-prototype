/**
 * 統一假資料種子——10 頁共用同一批資料。
 * 場館 v1 = パデルコート広島（3 場地、4 設備、3 教練、10 預約）
 * 場館 v2 = 北広島パデルクラブ（2 場地、4 設備、3 教練、10 預約）
 * 另有 2 位待審教練（跨場館或獨立）。
 */

import type {
  Venue,
  Court,
  Equipment,
  Coach,
  Booking,
  Review,
  Match,
  Announcement,
  MemberUser,
  PointsLog,
  PointsRule,
  Coupon,
  CommissionRule,
  EarningRecord,
  MessageThread,
  MessageEntry,
  VideoReview,
  Staff,
  Shift,
  Invite,
  Campaign,
  SystemSettings,
  AdminAccount,
  AdminRole,
  AuditLogEntry,
} from "../types";

// ─── 場館 ────────────────────────────────────────
export const VENUES: Venue[] = [
  {
    id: "v1",
    name: "パデルコート広島",
    address: "広島県広島市中区大手町1-2-3",
    area: "広島",
    contactName: "田中 健一",
    contactEmail: "manager@hiroshima-padel.example",
    contactPhone: "082-123-4567",
    status: "active",
    courtCount: 3,
    createdAt: "2025-08-15",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    description: "広島市中心部にある本格的なパデル専門施設。屋外ハードコートと室内コートを完備し、初心者から上級者まで幅広く対応。ナイター設備あり。",
    openingHours: {
      weekday: { open: "09:00", close: "22:00" },
      weekend: { open: "08:00", close: "22:00" },
    },
    externalLinks: [
      { title: "公式サイト", url: "https://www.hiroshima-padel.example" },
      { title: "Google Maps", url: "https://maps.google.com/?q=hiroshima-padel" },
    ],
  },
  {
    id: "v2",
    name: "北広島パデルクラブ",
    address: "広島県北広島市中央5-10-1",
    area: "北広島",
    contactName: "佐藤 美咲",
    contactEmail: "manager@kitahiroshima.example",
    contactPhone: "082-987-6543",
    status: "active",
    courtCount: 2,
    createdAt: "2025-11-03",
    image: "https://images.unsplash.com/photo-1622279457486-28dc7d66b2f3?w=800&q=80",
    description: "全天候型室内パデルクラブ。空調完備で一年中快適にプレー可能。プロコーチによるレッスン、カフェ併設。",
    openingHours: {
      weekday: { open: "10:00", close: "22:00" },
      weekend: { open: "09:00", close: "21:00" },
    },
    externalLinks: [
      { title: "公式サイト", url: "https://www.kitahiroshima-padel.example" },
    ],
  },
  {
    id: "v3",
    name: "広島中央スポーツ",
    address: "広島県広島市南区松原町3-1-1",
    area: "広島",
    contactName: "山本 裕子",
    contactEmail: "info@hiroshima-central.example",
    contactPhone: "082-555-1111",
    status: "pending",
    courtCount: 2,
    createdAt: "2026-04-10",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
    description: "広島駅から徒歩 5 分の好立地。室内ハードコートで雨の日でも安心。初心者向けクリニックも開催。",
  },
  {
    id: "v4",
    name: "大阪パデルアリーナ",
    address: "大阪府大阪市北区梅田3-4-5",
    area: "大阪",
    contactName: "鈴木 一郎",
    contactEmail: "osaka@padel-arena.example",
    contactPhone: "06-1234-5678",
    status: "suspended",
    courtCount: 4,
    createdAt: "2024-12-01",
    description: "大阪最大級のパデル専用アリーナ（現在改装工事のため停止中）",
  },
];

// ─── 場地 ────────────────────────────────────────
export const COURTS: Court[] = [
  {
    id: "c1-a", venueId: "v1", name: "コートA", type: "屋外ハード",
    hourlyPrice: 2000, active: true,
    amenities: ["駐車場", "ナイター", "レンタル用具", "トイレ"],
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    description: "屋外ハードコート。夜間も照明完備で利用可能。初心者から中級者におすすめ。",
    capacity: 4, rating: 4.5, reviewCount: 128,
  },
  {
    id: "c1-b", venueId: "v1", name: "コートB", type: "室内",
    hourlyPrice: 2500, active: true,
    amenities: ["シャワー", "ロッカー", "空調", "レンタル用具", "更衣室"],
    image: "https://images.unsplash.com/photo-1627627256672-027a4613d028?w=800&q=80",
    description: "全天候型室内コート。空調完備で快適。雨天でも利用可能。",
    capacity: 4, rating: 4.7, reviewCount: 84,
  },
  {
    id: "c1-c", venueId: "v1", name: "コートC", type: "屋外ハード",
    hourlyPrice: 2000, active: false,
    amenities: ["駐車場"],
    description: "改装工事のため一時停止中。",
    capacity: 4,
  },
  {
    id: "c2-a", venueId: "v2", name: "コートA", type: "室内",
    hourlyPrice: 3500, active: true,
    amenities: ["シャワー", "ロッカー", "空調", "カフェ", "観戦席", "Wi-Fi"],
    image: "https://images.unsplash.com/photo-1622279457486-28dc7d66b2f3?w=800&q=80",
    description: "プレミアム室内コート。観戦席・カフェ併設で試合観戦にも最適。",
    capacity: 4, rating: 4.8, reviewCount: 86,
  },
  {
    id: "c2-b", venueId: "v2", name: "コートB", type: "室内ハード",
    hourlyPrice: 3200, active: true,
    amenities: ["シャワー", "ロッカー", "空調", "レンタル用具"],
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
    description: "室内ハードコート。プロトーナメント仕様の床面。",
    capacity: 4, rating: 4.6, reviewCount: 42,
  },
];

// ─── 設備 ────────────────────────────────────────
export const EQUIPMENT: Equipment[] = [
  { id: "e1-racket", venueId: "v1", name: "パデルラケット", priceType: "hourly", price: 300, maxQty: 4, stock: 12, active: true },
  { id: "e1-balls", venueId: "v1", name: "ボール (3個セット)", priceType: "perUse", price: 500, maxQty: 3, stock: 30, active: true },
  { id: "e1-shoes", venueId: "v1", name: "シューズレンタル", priceType: "perUse", price: 400, maxQty: 4, stock: 16, active: true },
  { id: "e1-towel", venueId: "v1", name: "タオル", priceType: "perUse", price: 200, maxQty: 4, stock: 2, active: true },
  { id: "e2-racket-pro", venueId: "v2", name: "プロ仕様ラケット", priceType: "hourly", price: 500, maxQty: 4, stock: 8, active: true },
  { id: "e2-racket", venueId: "v2", name: "パデルラケット", priceType: "hourly", price: 300, maxQty: 4, stock: 16, active: true },
  { id: "e2-balls", venueId: "v2", name: "ボール (3個セット)", priceType: "perUse", price: 500, maxQty: 3, stock: 40, active: true },
  { id: "e2-drink", venueId: "v2", name: "スポーツドリンク", priceType: "perUse", price: 250, maxQty: 4, stock: 0, active: false },
];

// ─── 教練 ────────────────────────────────────────
export const COACHES: Coach[] = [
  {
    id: "co-001",
    name: "山田 翔太",
    email: "shota@coach.example",
    phone: "090-1111-2222",
    level: "S",
    status: "approved",
    venueIds: ["v1"],
    specialties: ["フォアハンド", "サーブ", "ゲーム戦術", "競技向け"],
    certifications: ["JPA公認S級", "元日本代表"],
    hourlyRate: 7000,
    defaultLessonDuration: 60,
    rating: 4.9,
    reviewCount: 84,
    bio: "元全国大会準優勝。初心者から上級者まで対応可能。",
    experience: "パデル歴 15 年。2020 年全日本選手権準優勝。2022 年から指導開始、延べ 1,200 名以上のレッスン経験。",
    area: "広島市中区",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    onlineAvailable: true,
    videoReviewAvailable: true,
    courses: [
      { id: "crs-001-1", name: "パデル基礎レッスン", description: "初心者向けの基本フォームと戦術", hourlyRate: 5000, supportsInPerson: true, supportsOnline: true },
      { id: "crs-001-2", name: "競技者向け戦術クリニック", description: "中上級者の試合戦術強化", hourlyRate: 7000, supportsInPerson: true, supportsOnline: false },
      { id: "crs-001-3", name: "個別動画分析", description: "試合映像のコマ送り分析", hourlyRate: 3500, supportsInPerson: false, supportsOnline: true },
    ],
    videoReviewSettings: {
      enabled: true,
      price: 3500,
      description: "プレー動画を送信いただき、フォーム・戦術・ポジショニングについて詳細なフィードバックを 48 時間以内にお返しします。",
    },
    stats: { completedSessions: 1247, repeatRate: 68, satisfaction: 98 },
    totalEarnings: 8729000,
    monthlyEarnings: 182000,
    bankAccount: {
      bankName: "みずほ銀行", branchName: "広島支店",
      accountType: "普通", accountNumber: "1234567", accountHolder: "ヤマダ ショウタ",
    },
    appliedAt: "2025-08-20",
    approvedAt: "2025-08-25",
  },
  {
    id: "co-002",
    name: "伊藤 美穂",
    email: "miho@coach.example",
    phone: "090-3333-4444",
    level: "A",
    status: "approved",
    venueIds: ["v1", "v2"],
    specialties: ["初心者指導", "フォーム改善", "ダブルス戦術"],
    certifications: ["JPA公認A級", "スポーツ心理学修了"],
    hourlyRate: 5000,
    defaultLessonDuration: 50,
    rating: 4.7,
    reviewCount: 52,
    bio: "女性やシニアの初心者指導が得意です。",
    experience: "大学時代からパデルに没頭、プロ転向後 8 年。女性・シニア層のレッスン経験豊富。",
    area: "広島市全域",
    avatar: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80",
    onlineAvailable: true,
    videoReviewAvailable: false,
    courses: [
      { id: "crs-002-1", name: "女性向け初心者レッスン", description: "安心・楽しく始められる基礎クラス", hourlyRate: 5000, supportsInPerson: true, supportsOnline: true },
      { id: "crs-002-2", name: "ダブルス戦術クリニック", description: "ペア連携とポジショニング", hourlyRate: 5500, supportsInPerson: true, supportsOnline: false },
    ],
    stats: { completedSessions: 486, repeatRate: 72, satisfaction: 95 },
    totalEarnings: 2430000,
    monthlyEarnings: 98000,
    bankAccount: {
      bankName: "三井住友銀行", branchName: "広島中央支店",
      accountType: "普通", accountNumber: "7654321", accountHolder: "イトウ ミホ",
    },
    appliedAt: "2025-09-05",
    approvedAt: "2025-09-10",
  },
  {
    id: "co-003",
    name: "高橋 大輔",
    email: "daisuke@coach.example",
    phone: "090-5555-6666",
    level: "B",
    status: "approved",
    venueIds: ["v2"],
    specialties: ["ジュニア育成", "基礎トレーニング"],
    certifications: ["JPA公認B級"],
    hourlyRate: 3500,
    defaultLessonDuration: 50,
    rating: 4.3,
    reviewCount: 21,
    bio: "ジュニア世代の育成に情熱を注いでいます。",
    experience: "元県代表選手。教員免許保有、指導歴 4 年。",
    area: "北広島市",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    onlineAvailable: false,
    videoReviewAvailable: false,
    courses: [
      { id: "crs-003-1", name: "ジュニアパデルクラス", description: "10〜15 歳向け、楽しく始める入門コース", hourlyRate: 3500, supportsInPerson: true, supportsOnline: false },
    ],
    stats: { completedSessions: 198, repeatRate: 65, satisfaction: 91 },
    totalEarnings: 693000,
    monthlyEarnings: 42000,
    bankAccount: {
      bankName: "広島銀行", branchName: "北広島支店",
      accountType: "普通", accountNumber: "2345678", accountHolder: "タカハシ ダイスケ",
    },
    appliedAt: "2025-11-12",
    approvedAt: "2025-11-15",
  },
  {
    id: "co-004",
    name: "中村 健",
    email: "ken@coach.example",
    phone: "090-7777-8888",
    level: "A",
    status: "pending",
    venueIds: ["v1"],
    specialties: ["戦術", "動画分析"],
    certifications: ["日本パデル協会公認 A 級", "スポーツ科学修士"],
    hourlyRate: 5500,
    rating: 0,
    reviewCount: 0,
    bio: "動画分析による戦術的アプローチを得意としています。",
    appliedAt: "2026-04-18",
  },
  {
    id: "co-005",
    name: "木村 彩香",
    email: "ayaka@coach.example",
    phone: "090-9999-0000",
    level: "B",
    status: "pending",
    venueIds: ["v2"],
    specialties: ["フィットネス", "基礎"],
    certifications: ["パーソナルトレーナー"],
    hourlyRate: 3000,
    rating: 0,
    reviewCount: 0,
    bio: "フィットネス×パデルの融合レッスンを提供します。",
    appliedAt: "2026-04-20",
  },
  {
    id: "co-006",
    name: "小林 誠",
    email: "makoto@coach.example",
    phone: "090-2222-3333",
    level: "B",
    status: "rejected",
    venueIds: ["v1"],
    specialties: ["初心者"],
    certifications: [],
    hourlyRate: 2500,
    rating: 0,
    reviewCount: 0,
    bio: "初心者向けレッスンを提供したいです。",
    appliedAt: "2026-04-05",
    reviewNote: "認証資格の提出が不足しています。再申請時に資格証明書を添付してください。",
  },
];

// ─── 預約（本週 + 今日，含改期 / 退款請求）───────
const todayStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const BOOKINGS: Booking[] = [
  // 場館 v1 — 今日
  {
    id: "bk-101", type: "court", status: "confirmed", userId: "u-001", userName: "田中 太郎",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-a", courtName: "コートA",
    date: todayStr(0), startTime: "09:00", endTime: "10:00",
    price: 2000, createdAt: todayStr(-2) + "T10:00:00",
  },
  {
    id: "bk-102", type: "court", status: "reschedule_requested", userId: "u-002", userName: "佐藤 花子",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-a", courtName: "コートA",
    date: todayStr(0), startTime: "13:00", endTime: "15:00",
    people: 2, mode: "standard",
    price: 4600, courtFee: 4000, equipmentFee: 600,
    equipment: [
      { id: "eq-1", name: "パデルラケット", priceType: "hourly", unitPrice: 300, qty: 1, lineTotal: 600 },
    ],
    rescheduleFrom: { date: todayStr(0), startTime: "10:00", endTime: "12:00" },
    note: "急な仕事で午後に変更希望",
    createdAt: todayStr(-3) + "T14:20:00",
  },
  {
    id: "bk-103", type: "coach_lesson", status: "confirmed", userId: "u-003", userName: "鈴木 健",
    venueId: "v1", venueName: "パデルコート広島", coachId: "co-001", coachName: "山田 翔太",
    lessonType: "practice", date: todayStr(0), startTime: "15:00", endTime: "16:00",
    price: 7000, courtFeePerHour: 2000, createdAt: todayStr(-1) + "T09:00:00",
  },
  {
    id: "bk-104", type: "court", status: "refund_requested", userId: "u-004", userName: "渡辺 正",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-b", courtName: "コートB",
    date: todayStr(0), startTime: "18:00", endTime: "19:00",
    price: 2500, note: "雨天のためキャンセル希望",
    createdAt: todayStr(-2) + "T18:30:00",
  },
  {
    id: "bk-105", type: "court", status: "pending", userId: "u-005", userName: "加藤 由美",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-a", courtName: "コートA",
    date: todayStr(0), startTime: "19:00", endTime: "20:00",
    price: 2000, createdAt: todayStr(0) + "T11:00:00",
  },
  {
    id: "bk-106", type: "court", status: "completed", userId: "u-006", userName: "松本 誠",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-b", courtName: "コートB",
    date: todayStr(-1), startTime: "10:00", endTime: "12:00",
    people: 4, mode: "standard",
    price: 5800, courtFee: 5000, equipmentFee: 800,
    equipment: [
      { id: "eq-1", name: "パデルラケット", priceType: "hourly", unitPrice: 300, qty: 2, lineTotal: 600 },
      { id: "eq-2", name: "ボール (3個セット)", priceType: "perUse", unitPrice: 500, qty: 1, lineTotal: 200 }, // 実際は 500 だがデモ用
    ],
    rating: { stars: 5, comment: "設備が整っており、スタッフの対応も丁寧でした。また利用します。", createdAt: todayStr(-1) + "T14:00:00" },
    createdAt: todayStr(-5) + "T20:00:00",
  },
  // 場館 v1 — 未來幾天
  {
    id: "bk-107", type: "coach_lesson", status: "confirmed", userId: "u-007", userName: "林 優子",
    venueId: "v1", venueName: "パデルコート広島", coachId: "co-002", coachName: "伊藤 美穂",
    lessonType: "online", date: todayStr(1), startTime: "20:00", endTime: "21:00",
    price: 4500, createdAt: todayStr(-1) + "T08:00:00",
  },
  {
    id: "bk-108", type: "court", status: "confirmed", userId: "u-008", userName: "石川 正治",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-a", courtName: "コートA",
    date: todayStr(2), startTime: "09:00", endTime: "10:00",
    price: 2000, createdAt: todayStr(-1) + "T12:00:00",
  },
  {
    id: "bk-109", type: "court", status: "cancelled", userId: "u-009", userName: "藤原 一樹",
    venueId: "v1", venueName: "パデルコート広島", courtId: "c1-c", courtName: "コートC",
    date: todayStr(-2), startTime: "14:00", endTime: "15:00",
    price: 2000, createdAt: todayStr(-4) + "T15:00:00",
  },
  {
    id: "bk-110", type: "coach_lesson", status: "reschedule_requested", userId: "u-010", userName: "吉田 京子",
    venueId: "v1", venueName: "パデルコート広島", coachId: "co-001", coachName: "山田 翔太",
    lessonType: "video_review", date: todayStr(1), startTime: "16:00", endTime: "17:00",
    price: 3500,
    reviewVideos: [
      { name: "forehand-practice.mp4", size: 42500000, type: "video/mp4", url: "https://example.com/video/demo-001.mp4" },
      { name: "backhand-drill.mov", size: 38200000, type: "video/quicktime", url: "https://example.com/video/demo-002.mov" },
    ],
    rescheduleFrom: { date: todayStr(0), startTime: "16:00", endTime: "17:00" },
    note: "プレー予定を翌日に変更させてください",
    createdAt: todayStr(-2) + "T11:00:00",
  },

  // 場館 v2
  {
    id: "bk-201", type: "court", status: "confirmed", userId: "u-011", userName: "中田 信二",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-a", courtName: "コートA",
    date: todayStr(0), startTime: "10:00", endTime: "12:00",
    price: 7000, equipmentFee: 1000, createdAt: todayStr(-2) + "T09:00:00",
  },
  {
    id: "bk-202", type: "court", status: "reschedule_requested", userId: "u-012", userName: "川村 恵美",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-a", courtName: "コートA",
    date: todayStr(0), startTime: "14:00", endTime: "16:00",
    price: 7000,
    rescheduleFrom: { date: todayStr(-1), startTime: "14:00", endTime: "16:00" },
    note: "前日が祝日で時間取れず", createdAt: todayStr(-3) + "T13:00:00",
  },
  {
    id: "bk-203", type: "coach_lesson", status: "confirmed", userId: "u-013", userName: "西村 淳",
    venueId: "v2", venueName: "北広島パデルクラブ", coachId: "co-003", coachName: "高橋 大輔",
    lessonType: "practice", date: todayStr(0), startTime: "16:00", endTime: "17:00",
    price: 3500, courtFeePerHour: 3500, createdAt: todayStr(-1) + "T14:00:00",
  },
  {
    id: "bk-204", type: "court", status: "pending", userId: "u-014", userName: "三浦 光輝",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-b", courtName: "コートB",
    date: todayStr(0), startTime: "18:00", endTime: "19:00",
    price: 3200, createdAt: todayStr(0) + "T10:30:00",
  },
  {
    id: "bk-205", type: "court", status: "refund_requested", userId: "u-015", userName: "福田 亮",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-a", courtName: "コートA",
    date: todayStr(0), startTime: "20:00", endTime: "21:00",
    price: 3500, note: "体調不良のため", createdAt: todayStr(-1) + "T20:00:00",
  },
  {
    id: "bk-206", type: "court", status: "completed", userId: "u-016", userName: "坂本 大樹",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-a", courtName: "コートA",
    date: todayStr(-1), startTime: "09:00", endTime: "11:00",
    price: 7000, createdAt: todayStr(-4) + "T19:00:00",
  },
  {
    id: "bk-207", type: "coach_lesson", status: "confirmed", userId: "u-017", userName: "原田 貴志",
    venueId: "v2", venueName: "北広島パデルクラブ", coachId: "co-002", coachName: "伊藤 美穂",
    lessonType: "practice", date: todayStr(2), startTime: "11:00", endTime: "12:00",
    price: 5000, courtFeePerHour: 3500, createdAt: todayStr(-1) + "T10:00:00",
  },
  {
    id: "bk-208", type: "court", status: "confirmed", userId: "u-018", userName: "横山 智子",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-b", courtName: "コートB",
    date: todayStr(3), startTime: "15:00", endTime: "17:00",
    price: 6400, equipmentFee: 600, createdAt: todayStr(-2) + "T11:00:00",
  },
  {
    id: "bk-209", type: "court", status: "cancelled", userId: "u-019", userName: "近藤 俊介",
    venueId: "v2", venueName: "北広島パデルクラブ", courtId: "c2-a", courtName: "コートA",
    date: todayStr(-2), startTime: "13:00", endTime: "14:00",
    price: 3500, createdAt: todayStr(-5) + "T14:00:00",
  },
  {
    id: "bk-210", type: "coach_lesson", status: "pending", userId: "u-020", userName: "清水 真由",
    venueId: "v2", venueName: "北広島パデルクラブ", coachId: "co-003", coachName: "高橋 大輔",
    lessonType: "online", date: todayStr(1), startTime: "21:00", endTime: "22:00",
    price: 3500, createdAt: todayStr(0) + "T09:00:00",
  },
];

// ─── 評價 ────────────────────────────────────────
export const REVIEWS: Review[] = [
  {
    id: "rv-001", bookingId: "bk-106", userId: "u-006", userName: "松本 誠",
    targetType: "venue", targetId: "v1", targetName: "パデルコート広島",
    rating: 5, comment: "設備が整っており、スタッフの対応も丁寧でした。また利用します。",
    status: "published", createdAt: todayStr(-1) + "T14:00:00",
  },
  {
    id: "rv-002", bookingId: "bk-206", userId: "u-016", userName: "坂本 大樹",
    targetType: "coach", targetId: "co-002", targetName: "伊藤 美穂",
    rating: 5, comment: "丁寧で分かりやすい指導をしていただきました。",
    status: "pending_reply", createdAt: todayStr(-1) + "T12:00:00",
  },
  {
    id: "rv-003", bookingId: "bk-106", userId: "u-006", userName: "匿名ユーザー",
    targetType: "venue", targetId: "v1", targetName: "パデルコート広島",
    rating: 1, comment: "施設の清潔さに問題あり。他の人にオススメできない。",
    status: "pending_reply", createdAt: todayStr(-2) + "T18:00:00",
  },
  {
    id: "rv-004", bookingId: "bk-206", userId: "u-017", userName: "原田 貴志",
    targetType: "coach", targetId: "co-001", targetName: "山田 翔太",
    rating: 4, comment: "技術指導は素晴らしいが、説明がやや早口。",
    status: "published", reply: "ご意見ありがとうございます。以後、ペースに気をつけて指導いたします。",
    createdAt: todayStr(-3) + "T20:00:00",
  },
  {
    id: "rv-005", bookingId: "bk-206", userId: "u-020", userName: "クレーマー",
    targetType: "venue", targetId: "v2", targetName: "北広島パデルクラブ",
    rating: 1, comment: "（不適切な内容のため非表示）",
    status: "hidden", createdAt: todayStr(-4) + "T20:00:00",
  },
];

// ─── 賽事 ────────────────────────────────────────
export const MATCHES: Match[] = [
  {
    id: "mt-001", week: 17, teamAName: "Hiroshima Smashers", teamBName: "Kita Rising Stars",
    venueId: "v1", venueName: "パデルコート広島", date: todayStr(-1),
    status: "disputed", scoreA: 6, scoreB: 4,
    disputeReason: "第3ゲームのライン判定について異議。ビデオ判定を希望。",
    disputedBy: "Kita Rising Stars", proposedBy: "Hiroshima Smashers",
  },
  {
    id: "mt-002", week: 17, teamAName: "Osaka Waves", teamBName: "Hiroshima Smashers",
    venueId: "v1", venueName: "パデルコート広島", date: todayStr(-3),
    status: "completed", scoreA: 3, scoreB: 6, proposedBy: "Osaka Waves",
  },
  {
    id: "mt-003", week: 17, teamAName: "Padel Force", teamBName: "Night Owls",
    venueId: "v2", venueName: "北広島パデルクラブ", date: todayStr(0),
    status: "awaiting_review", proposedBy: "Padel Force",
  },
  {
    id: "mt-004", week: 17, teamAName: "Kita Rising Stars", teamBName: "Osaka Waves",
    venueId: "v2", venueName: "北広島パデルクラブ", date: todayStr(2),
    status: "scheduled", proposedBy: "Kita Rising Stars",
  },
  {
    id: "mt-005", week: 16, teamAName: "Night Owls", teamBName: "Padel Force",
    venueId: "v1", venueName: "パデルコート広島", date: todayStr(-8),
    status: "disputed", scoreA: 5, scoreB: 5,
    disputeReason: "スコアの記録ミス。実際は 6-4 で終了した。",
    disputedBy: "Padel Force", proposedBy: "Night Owls",
  },
];

// ─── 公告 ────────────────────────────────────────
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001", title: "ゴールデンウィーク営業時間のご案内",
    body: "4月29日〜5月6日は 08:00〜22:00 の拡大営業。期間中は予約が埋まりやすいため早めのご予約をおすすめします。",
    target: "users", status: "sent", sentAt: todayStr(-5) + "T10:00:00",
    author: "運営管理者", createdAt: todayStr(-5) + "T09:30:00",
  },
  {
    id: "ann-002", title: "コーチ向けシステムメンテナンス",
    body: "2026年4月25日 (金) 02:00〜04:00、動画レビュー機能のメンテナンスを実施します。",
    target: "coaches", status: "scheduled", scheduledAt: todayStr(2) + "T02:00:00",
    author: "運営管理者", createdAt: todayStr(0) + "T14:00:00",
  },
  {
    id: "ann-003", title: "場館運営者向け：新料金プラン説明会",
    body: "ZOOM ミーティングにて新料金プランをご説明いたします。詳細は別途メールにて。",
    target: "venue-admins", status: "draft",
    author: "運営管理者", createdAt: todayStr(0) + "T10:00:00",
  },
];

// ─── 既存公告に KPI を補充 ─────────────────────────
ANNOUNCEMENTS[0].reachedCount = 2543;
ANNOUNCEMENTS[0].readCount = 1876;
ANNOUNCEMENTS[0].clickCount = 312;
ANNOUNCEMENTS[1].reachedCount = 48;
ANNOUNCEMENTS[1].readCount = 0;

// ─── 会員 ─────────────────────────────────────────
export const MEMBER_USERS: MemberUser[] = [
  {
    id: "u-001", name: "田中 太郎", email: "tanaka@example.com", phone: "090-1234-5678",
    status: "active", points: 1250, xp: 340, level: 3,
    registeredAt: "2025-03-15", lastLoginAt: todayStr(0) + "T08:30:00",
    totalBookings: 28, totalSpend: 68400, tags: ["常連", "VIP"],
  },
  {
    id: "u-002", name: "佐藤 花子", email: "sato.h@example.com", phone: "090-2345-6789",
    status: "active", points: 580, xp: 120, level: 2,
    registeredAt: "2025-09-01", lastLoginAt: todayStr(0) + "T10:15:00",
    totalBookings: 9, totalSpend: 22400, tags: ["女性向け"],
  },
  {
    id: "u-003", name: "鈴木 健", email: "suzuki.k@example.com", phone: "090-3456-7890",
    status: "active", points: 3480, xp: 920, level: 5,
    registeredAt: "2024-11-20", lastLoginAt: todayStr(-1) + "T19:00:00",
    totalBookings: 62, totalSpend: 185200, tags: ["常連", "VIP", "大会参加"],
  },
  {
    id: "u-004", name: "渡辺 正", email: "watanabe@example.com", phone: "090-4567-8901",
    status: "active", points: 150, xp: 45, level: 1,
    registeredAt: "2026-02-10", lastLoginAt: todayStr(-2) + "T20:30:00",
    totalBookings: 3, totalSpend: 7500, tags: ["新規"],
  },
  {
    id: "u-005", name: "加藤 由美", email: "kato.y@example.com", phone: "090-5678-9012",
    status: "active", points: 720, xp: 200, level: 3,
    registeredAt: "2025-06-22", lastLoginAt: todayStr(0) + "T11:00:00",
    totalBookings: 14, totalSpend: 35600, tags: [],
  },
  {
    id: "u-006", name: "松本 誠", email: "matsumoto@example.com", phone: "090-6789-0123",
    status: "active", points: 2100, xp: 540, level: 4,
    registeredAt: "2025-01-08", lastLoginAt: todayStr(-1) + "T14:00:00",
    totalBookings: 38, totalSpend: 102400, tags: ["常連"],
  },
  {
    id: "u-007", name: "林 優子", email: "hayashi@example.com", phone: "090-7890-1234",
    status: "active", points: 450, xp: 110, level: 2,
    registeredAt: "2025-10-15", lastLoginAt: todayStr(-1) + "T08:00:00",
    totalBookings: 8, totalSpend: 28800, tags: ["女性向け"],
  },
  {
    id: "u-008", name: "石川 正治", email: "ishikawa@example.com", phone: "090-8901-2345",
    status: "active", points: 1800, xp: 480, level: 4,
    registeredAt: "2024-08-30", lastLoginAt: todayStr(0) + "T12:00:00",
    totalBookings: 45, totalSpend: 126000, tags: ["常連", "VIP"],
  },
  {
    id: "u-009", name: "藤原 一樹", email: "fujiwara@example.com", phone: "090-9012-3456",
    status: "suspended", points: 0, xp: 180, level: 3,
    registeredAt: "2025-04-01", lastLoginAt: todayStr(-15) + "T15:00:00",
    totalBookings: 18, totalSpend: 42000,
    tags: ["要注意"], notes: "無断キャンセル 3 回のため停止中",
  },
  {
    id: "u-010", name: "吉田 京子", email: "yoshida@example.com", phone: "090-0123-4567",
    status: "active", points: 960, xp: 280, level: 3,
    registeredAt: "2025-05-18", lastLoginAt: todayStr(0) + "T09:45:00",
    totalBookings: 22, totalSpend: 58800, tags: ["常連"],
  },
  {
    id: "u-011", name: "中田 信二", email: "nakata@example.com", phone: "080-1111-2222",
    status: "active", points: 2800, xp: 720, level: 5,
    registeredAt: "2024-10-12", lastLoginAt: todayStr(0) + "T16:20:00",
    totalBookings: 51, totalSpend: 156400, tags: ["常連", "VIP", "大会参加"],
  },
  {
    id: "u-012", name: "川村 恵美", email: "kawamura@example.com", phone: "080-2222-3333",
    status: "active", points: 340, xp: 90, level: 2,
    registeredAt: "2025-12-05", lastLoginAt: todayStr(-3) + "T18:00:00",
    totalBookings: 7, totalSpend: 21000, tags: [],
  },
  {
    id: "u-013", name: "西村 淳", email: "nishimura@example.com", phone: "080-3333-4444",
    status: "active", points: 1560, xp: 420, level: 4,
    registeredAt: "2024-12-20", lastLoginAt: todayStr(-1) + "T21:00:00",
    totalBookings: 32, totalSpend: 89600, tags: ["常連"],
  },
  {
    id: "u-014", name: "三浦 光輝", email: "miura@example.com", phone: "080-4444-5555",
    status: "pending_verification", points: 100, xp: 0, level: 1,
    registeredAt: todayStr(-3), totalBookings: 1, totalSpend: 3200,
    tags: ["新規"], notes: "メール認証待ち",
  },
  {
    id: "u-015", name: "福田 亮", email: "fukuda@example.com", phone: "080-5555-6666",
    status: "active", points: 680, xp: 170, level: 2,
    registeredAt: "2025-07-30", lastLoginAt: todayStr(-1) + "T20:00:00",
    totalBookings: 11, totalSpend: 33500, tags: [],
  },
];

// ─── 積分ルール ─────────────────────────────────
export const POINTS_RULES: PointsRule[] = [
  { id: "pr-001", label: "新規登録ボーナス", trigger: "初回登録時", earnedPoints: 500, earnedXp: 0, active: true },
  { id: "pr-002", label: "コート予約 1 件", trigger: "予約完了後", earnedPoints: 50, earnedXp: 10, active: true },
  { id: "pr-003", label: "レッスン受講 1 件", trigger: "レッスン完了後", earnedPoints: 100, earnedXp: 20, active: true },
  { id: "pr-004", label: "レビュー投稿", trigger: "レビュー承認後", earnedPoints: 30, earnedXp: 5, active: true, note: "1 予約につき 1 回" },
  { id: "pr-005", label: "友達紹介", trigger: "紹介された友達が初回予約", earnedPoints: 300, earnedXp: 50, active: true },
  { id: "pr-006", label: "誕生日ボーナス", trigger: "誕生月の初ログイン", earnedPoints: 200, earnedXp: 0, active: false, note: "2026 年 5 月リリース予定" },
];

export const POINTS_LOGS: PointsLog[] = [
  { id: "pl-001", userId: "u-001", userName: "田中 太郎", eventType: "booking_earned", delta: 50, balance: 1250, relatedBookingId: "bk-101", createdAt: todayStr(0) + "T09:00:00" },
  { id: "pl-002", userId: "u-001", userName: "田中 太郎", eventType: "review_bonus", delta: 30, balance: 1200, createdAt: todayStr(-2) + "T14:00:00" },
  { id: "pl-003", userId: "u-003", userName: "鈴木 健", eventType: "booking_earned", delta: 100, balance: 3480, relatedBookingId: "bk-103", createdAt: todayStr(0) + "T15:30:00" },
  { id: "pl-004", userId: "u-003", userName: "鈴木 健", eventType: "coupon_redeemed", delta: -0, balance: 3380, note: "クーポン PADEL500 使用", createdAt: todayStr(-1) + "T10:00:00" },
  { id: "pl-005", userId: "u-009", userName: "藤原 一樹", eventType: "admin_adjust_deduct", delta: -500, balance: 0, note: "無断キャンセルによる調整", operator: "運営管理者", createdAt: todayStr(-15) + "T16:00:00" },
  { id: "pl-006", userId: "u-004", userName: "渡辺 正", eventType: "signup_bonus", delta: 500, balance: 500, createdAt: "2026-02-10T12:00:00" },
  { id: "pl-007", userId: "u-004", userName: "渡辺 正", eventType: "admin_adjust_deduct", delta: -350, balance: 150, note: "誤付与の補正", operator: "運営管理者", createdAt: todayStr(-5) + "T10:00:00" },
  { id: "pl-008", userId: "u-011", userName: "中田 信二", eventType: "booking_earned", delta: 50, balance: 2800, relatedBookingId: "bk-201", createdAt: todayStr(0) + "T10:00:00" },
  { id: "pl-009", userId: "u-006", userName: "松本 誠", eventType: "booking_earned", delta: 50, balance: 2100, relatedBookingId: "bk-106", createdAt: todayStr(-1) + "T12:00:00" },
  { id: "pl-010", userId: "u-008", userName: "石川 正治", eventType: "admin_adjust_add", delta: 500, balance: 1800, note: "キャンペーン補填", operator: "運営管理者", createdAt: todayStr(-3) + "T15:00:00" },
];

// ─── 優惠券 ──────────────────────────────────────
export const COUPONS: Coupon[] = [
  {
    id: "cp-001", label: "VIP 会員春感謝クーポン",
    description: "利用額 ¥50,000 以上の VIP 会員に 10% 割引",
    discountType: "percent", discountValue: 10, minAmount: 2000,
    scope: "platform", applicableTypes: ["court", "coach_lesson"],
    distributionMode: "filter",
    filter: { minTotalSpend: 50000, includeTags: ["VIP"] },
    distributedCount: 42, redeemedCount: 18,
    expiresAt: "2026-06-30", status: "active",
    createdBy: "運営管理者", createdAt: "2026-03-25",
    distributedAt: "2026-03-25T10:00:00",
  },
  {
    id: "cp-002", label: "新規登録者ウェルカム ¥500",
    description: "過去 30 日以内に登録した新規会員に ¥500 割引",
    discountType: "fixed", discountValue: 500, minAmount: 2500,
    scope: "platform", applicableTypes: ["court", "coach_lesson"],
    distributionMode: "filter",
    filter: { newWithinDays: 30 },
    distributedCount: 12, redeemedCount: 5,
    expiresAt: "2026-06-30", status: "active",
    createdBy: "運営管理者", createdAt: "2026-04-01",
    distributedAt: "2026-04-01T09:00:00",
  },
  {
    id: "cp-003", label: "広島コート リピーター 20% OFF",
    description: "パデルコート広島の常連にホワイトリスト配布",
    discountType: "percent", discountValue: 20, minAmount: 5000,
    scope: "venue", venueId: "v1", applicableTypes: ["court"],
    distributionMode: "whitelist",
    whitelistUserIds: ["u-001", "u-003", "u-006", "u-008", "u-011"],
    distributedCount: 5, redeemedCount: 3,
    expiresAt: "2026-05-31", status: "active",
    createdBy: "パデルコート広島 企業管理者", createdAt: "2026-03-20",
    distributedAt: "2026-03-20T14:00:00",
  },
  {
    id: "cp-004", label: "北広島 オンラインレッスン ¥1,000 OFF",
    description: "過去 60 日以内利用の会員限定",
    discountType: "fixed", discountValue: 1000, minAmount: 4000,
    scope: "venue", venueId: "v2", applicableTypes: ["coach_lesson"],
    distributionMode: "filter",
    filter: { activeWithinDays: 60 },
    distributedCount: 28, redeemedCount: 9,
    expiresAt: "2026-06-15", status: "active",
    createdBy: "北広島パデルクラブ 企業管理者", createdAt: "2026-03-28",
    distributedAt: "2026-03-28T11:00:00",
  },
  {
    id: "cp-005", label: "GW キャンペーン 15% OFF（配布済）",
    description: "2025 年 GW 全員配布 (終了)",
    discountType: "percent", discountValue: 15, minAmount: 2000,
    scope: "platform", applicableTypes: ["court", "coach_lesson"],
    distributionMode: "filter",
    filter: {},
    distributedCount: 487, redeemedCount: 312,
    expiresAt: "2025-05-06", status: "expired",
    createdBy: "運営管理者", createdAt: "2025-04-15",
    distributedAt: "2025-04-15T10:00:00",
  },
  {
    id: "cp-006", label: "春の復帰会員特別",
    description: "90 日以上利用がない休眠会員への呼び戻し",
    discountType: "fixed", discountValue: 500, minAmount: 2500,
    scope: "platform", applicableTypes: ["court"],
    distributionMode: "filter",
    filter: { activeWithinDays: 365, minTotalSpend: 10000 },
    distributedCount: 0, redeemedCount: 0,
    expiresAt: "2026-04-30", status: "draft",
    createdBy: "運営管理者", createdAt: "2026-04-10",
  },
];

// ─── 抽成（コミッション）設定 ─────────────────────
export const COMMISSION_RULES: CommissionRule[] = [
  {
    id: "cm-default",
    scope: "platform_default",
    courtPlatformRate: 15,
    courtVenueRate: 85,
    lessonPlatformRate: 20,
    lessonVenueRate: 10,
    validFrom: "2024-01-01",
    note: "全企業・全コーチのデフォルト設定。レッスンはコーチ 70% 取り分",
  },
  {
    id: "cm-v1",
    scope: "venue_override",
    venueId: "v1",
    courtPlatformRate: 12,
    courtVenueRate: 88,
    lessonPlatformRate: 18,
    lessonVenueRate: 12,
    validFrom: "2025-09-01",
    note: "パデルコート広島：優先取引先割引（コート 3%, レッスン 2%）",
  },
  {
    id: "cm-v2",
    scope: "venue_override",
    venueId: "v2",
    courtPlatformRate: 15,
    courtVenueRate: 85,
    lessonPlatformRate: 20,
    lessonVenueRate: 10,
    validFrom: "2025-11-01",
    note: "北広島パデルクラブ：デフォルト準拠",
  },
];

// ─── 収益・自動出金（Stripe Connect）──────────────
/**
 * Stripe 決済手数料は 3.6% + ¥40 で計算。
 * プラットフォーム/施設手数料はコミッション設定 (COMMISSION_RULES) と一致。
 */
function computeFees(gross: number, courtFee: number, venueId: string) {
  const rule =
    COMMISSION_RULES.find((r) => r.venueId === venueId) ||
    COMMISSION_RULES.find((r) => r.scope === "platform_default")!;
  const lessonPortion = gross - courtFee;
  const platformFee = Math.round((lessonPortion * rule.lessonPlatformRate) / 100);
  const venueFee = Math.round((lessonPortion * rule.lessonVenueRate) / 100);
  const stripeFee = Math.round(gross * 0.036 + 40);
  const coachEarning = lessonPortion - platformFee - venueFee - stripeFee;
  return { courtFee, platformFee, venueFee, stripeFee, coachEarning };
}

function makeEarning(
  id: string,
  coachId: string,
  coachName: string,
  lessonId: string,
  lessonType: "practice" | "online" | "video_review",
  venueId: string,
  venueName: string,
  userId: string,
  userName: string,
  gross: number,
  courtFee: number,
  earnedAt: string,
  status: "pending" | "processing" | "paid" | "failed" | "refunded" = "paid",
  errorMessage?: string
): EarningRecord {
  const fees = computeFees(gross, courtFee, venueId);
  const stripeChargeId = `ch_${Math.random().toString(36).slice(2, 11)}`;
  const stripeTransferId = status === "paid" || status === "processing"
    ? `tr_${Math.random().toString(36).slice(2, 11)}`
    : undefined;
  return {
    id, coachId, coachName, lessonId, lessonType,
    venueId, venueName, userId, userName,
    grossAmount: gross,
    ...fees,
    stripeChargeId, stripeTransferId,
    status, errorMessage,
    earnedAt,
    paidAt: status === "paid" ? earnedAt : undefined,
    earnedMonth: earnedAt.slice(0, 7),
  };
}

export const EARNINGS: EarningRecord[] = [
  // 山田 翔太（co-001）
  makeEarning("er-001", "co-001", "山田 翔太", "bk-103", "practice", "v1", "パデルコート広島", "u-003", "鈴木 健", 9000, 2000, todayStr(0) + "T16:00:00", "processing"),
  makeEarning("er-002", "co-001", "山田 翔太", "bk-110", "video_review", "v1", "パデルコート広島", "u-010", "吉田 京子", 7000, 0, todayStr(-2) + "T17:00:00"),
  makeEarning("er-003", "co-001", "山田 翔太", "prev-001", "practice", "v1", "パデルコート広島", "u-003", "鈴木 健", 9000, 2000, todayStr(-5) + "T10:00:00"),
  makeEarning("er-004", "co-001", "山田 翔太", "prev-002", "practice", "v1", "パデルコート広島", "u-008", "石川 正治", 9000, 2000, todayStr(-8) + "T14:00:00"),
  makeEarning("er-005", "co-001", "山田 翔太", "prev-003", "online", "v1", "パデルコート広島", "u-001", "田中 太郎", 5500, 0, todayStr(-12) + "T20:00:00"),
  makeEarning("er-006", "co-001", "山田 翔太", "prev-004", "practice", "v1", "パデルコート広島", "u-003", "鈴木 健", 9000, 2000, todayStr(-18) + "T09:00:00"),
  // 伊藤 美穂（co-002）
  makeEarning("er-007", "co-002", "伊藤 美穂", "bk-107", "online", "v1", "パデルコート広島", "u-007", "林 優子", 4500, 0, todayStr(1) + "T20:00:00", "pending"),
  makeEarning("er-008", "co-002", "伊藤 美穂", "bk-207", "practice", "v2", "北広島パデルクラブ", "u-017", "原田 貴志", 8500, 3500, todayStr(2) + "T11:00:00", "pending"),
  makeEarning("er-009", "co-002", "伊藤 美穂", "prev-005", "practice", "v1", "パデルコート広島", "u-006", "松本 誠", 7000, 2000, todayStr(-6) + "T15:00:00"),
  makeEarning("er-010", "co-002", "伊藤 美穂", "prev-006", "online", "v2", "北広島パデルクラブ", "u-011", "中田 信二", 4500, 0, todayStr(-10) + "T19:00:00"),
  makeEarning("er-011", "co-002", "伊藤 美穂", "prev-007", "practice", "v1", "パデルコート広島", "u-005", "加藤 由美", 7000, 2000, todayStr(-14) + "T10:00:00", "failed", "Stripe: 口座情報不一致"),
  // 高橋 大輔（co-003）
  makeEarning("er-012", "co-003", "高橋 大輔", "bk-203", "practice", "v2", "北広島パデルクラブ", "u-013", "西村 淳", 7000, 3500, todayStr(0) + "T17:00:00", "processing"),
  makeEarning("er-013", "co-003", "高橋 大輔", "prev-008", "practice", "v2", "北広島パデルクラブ", "u-013", "西村 淳", 7000, 3500, todayStr(-9) + "T16:00:00"),
  makeEarning("er-014", "co-003", "高橋 大輔", "prev-009", "practice", "v2", "北広島パデルクラブ", "u-016", "坂本 大樹", 7000, 3500, todayStr(-15) + "T10:00:00"),
  // 返金例
  makeEarning("er-015", "co-001", "山田 翔太", "cancelled-001", "practice", "v1", "パデルコート広島", "u-004", "渡辺 正", 9000, 2000, todayStr(-20) + "T10:00:00", "refunded"),
];

// ─── 訊息 ─────────────────────────────────────────
export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: "th-001", venueId: "v1", venueName: "パデルコート広島",
    userId: "u-002", userName: "佐藤 花子",
    coachId: "co-001", coachName: "山田 翔太",
    bookingId: "bk-102",
    lastMessageAt: todayStr(0) + "T11:20:00",
    messageCount: 8, status: "active",
    preview: "承知しました。当日 10 分前に来ます",
  },
  {
    id: "th-002", venueId: "v1", venueName: "パデルコート広島",
    userId: "u-004", userName: "渡辺 正",
    bookingId: "bk-104",
    lastMessageAt: todayStr(0) + "T15:00:00",
    messageCount: 4, status: "flagged",
    flagReason: "不適切な言葉遣いの通報",
    flaggedBy: "u-006",
    preview: "雨で予約キャンセルしたのに対応が遅すぎる",
  },
  {
    id: "th-003", venueId: "v2", venueName: "北広島パデルクラブ",
    userId: "u-011", userName: "中田 信二",
    coachId: "co-003", coachName: "高橋 大輔",
    bookingId: "bk-203",
    lastMessageAt: todayStr(-1) + "T20:00:00",
    messageCount: 12, status: "active",
    preview: "ありがとうございます。次回もお願いします",
  },
  {
    id: "th-004", venueId: "v2", venueName: "北広島パデルクラブ",
    userId: "u-020", userName: "清水 真由",
    coachId: "co-003", coachName: "高橋 大輔",
    bookingId: "bk-210",
    lastMessageAt: todayStr(0) + "T09:30:00",
    messageCount: 3, status: "active",
    preview: "オンラインレッスンのリンクを教えてください",
  },
  {
    id: "th-005", venueId: "v1", venueName: "パデルコート広島",
    userId: "u-010", userName: "吉田 京子",
    coachId: "co-001", coachName: "山田 翔太",
    bookingId: "bk-110",
    lastMessageAt: todayStr(-2) + "T11:00:00",
    messageCount: 6, status: "active",
    preview: "動画アップロードしました",
  },
  {
    id: "th-006", venueId: "v1", venueName: "パデルコート広島",
    userId: "u-009", userName: "藤原 一樹",
    lastMessageAt: todayStr(-15) + "T16:00:00",
    messageCount: 15, status: "archived",
    preview: "（停止された利用者との過去の会話）",
  },
];

export const MESSAGE_ENTRIES: MessageEntry[] = [
  // th-001 会話例
  { id: "me-001-1", threadId: "th-001", senderType: "user", senderName: "佐藤 花子", kind: "text", body: "すみません、午後に変更できますか？", createdAt: todayStr(-3) + "T14:00:00" },
  { id: "me-001-2", threadId: "th-001", senderType: "venue", senderName: "パデルコート広島", kind: "text", body: "申請を確認しました。承認の方向で進めます", createdAt: todayStr(-3) + "T14:30:00" },
  { id: "me-001-3", threadId: "th-001", senderType: "user", senderName: "佐藤 花子", kind: "text", body: "ありがとうございます", createdAt: todayStr(-3) + "T14:35:00" },
  { id: "me-001-4", threadId: "th-001", senderType: "venue", senderName: "パデルコート広島", kind: "booking_confirm", body: "振替を承認しました（13:00-15:00）", createdAt: todayStr(-2) + "T10:00:00" },
  { id: "me-001-5", threadId: "th-001", senderType: "user", senderName: "佐藤 花子", kind: "text", body: "承知しました。当日 10 分前に来ます", createdAt: todayStr(0) + "T11:20:00" },
  // th-002 通報されたスレッド
  { id: "me-002-1", threadId: "th-002", senderType: "user", senderName: "渡辺 正", kind: "text", body: "雨で予約キャンセルしたのに対応が遅すぎる", createdAt: todayStr(0) + "T15:00:00" },
  { id: "me-002-2", threadId: "th-002", senderType: "user", senderName: "渡辺 正", kind: "text", body: "何回も同じ事を言わせないで欲しい", createdAt: todayStr(0) + "T15:05:00" },
  { id: "me-002-3", threadId: "th-002", senderType: "venue", senderName: "パデルコート広島", kind: "text", body: "申し訳ございません、返金手続き中です", createdAt: todayStr(0) + "T15:10:00" },
];

// ─── 動画レビュー ────────────────────────────────
export const VIDEO_REVIEWS: VideoReview[] = [
  {
    id: "vr-001", studentId: "u-010", studentName: "吉田 京子",
    coachId: "co-001", coachName: "山田 翔太", venueId: "v1",
    uploadedAt: todayStr(-2), dueAt: todayStr(2),
    status: "pending", topic: "バックハンドのフォーム改善",
    videoUrl: "https://example.com/video/demo-001.mp4",
    bookingId: "bk-110",
  },
  {
    id: "vr-002", studentId: "u-003", studentName: "鈴木 健",
    coachId: "co-001", coachName: "山田 翔太", venueId: "v1",
    uploadedAt: todayStr(-5), dueAt: todayStr(-1),
    status: "overdue", topic: "サーブの軌道分析",
    videoUrl: "https://example.com/video/demo-002.mp4",
  },
  {
    id: "vr-003", studentId: "u-006", studentName: "松本 誠",
    coachId: "co-002", coachName: "伊藤 美穂", venueId: "v1",
    uploadedAt: todayStr(-8), dueAt: todayStr(-5),
    status: "completed", topic: "試合での戦術選択",
    videoUrl: "https://example.com/video/demo-003.mp4",
    reviewComment: "戦術的には適切な判断でしたが、シングルでの守備時のポジショニングをもう少し後ろに取るとミスが減ります。次回のレッスンで実践練習しましょう。",
    submittedAt: todayStr(-5) + "T15:00:00",
  },
  {
    id: "vr-004", studentId: "u-011", studentName: "中田 信二",
    coachId: "co-002", coachName: "伊藤 美穂", venueId: "v2",
    uploadedAt: todayStr(-3), dueAt: todayStr(4),
    status: "in_progress", topic: "ペア連携の改善",
    videoUrl: "https://example.com/video/demo-004.mp4",
  },
  {
    id: "vr-005", studentId: "u-008", studentName: "石川 正治",
    coachId: "co-001", coachName: "山田 翔太", venueId: "v1",
    uploadedAt: todayStr(-1), dueAt: todayStr(6),
    status: "pending", topic: "スマッシュのコース",
    videoUrl: "https://example.com/video/demo-005.mp4",
  },
];

// ─── スタッフ ─────────────────────────────────────
export const STAFF: Staff[] = [
  { id: "s-001", venueId: "v1", name: "田中 健一", email: "tanaka@hiroshima-padel.example", phone: "082-100-0001", role: "owner", status: "active", hiredAt: "2025-08-15", note: "オーナー兼店長" },
  { id: "s-002", venueId: "v1", name: "山本 太郎", email: "yamamoto@hiroshima-padel.example", phone: "082-100-0002", role: "manager", status: "active", hiredAt: "2025-09-01" },
  { id: "s-003", venueId: "v1", name: "鈴木 あやの", email: "suzuki@hiroshima-padel.example", phone: "082-100-0003", role: "receptionist", status: "active", hiredAt: "2025-10-12" },
  { id: "s-004", venueId: "v1", name: "森田 光", email: "morita@hiroshima-padel.example", phone: "082-100-0004", role: "staff", status: "active", hiredAt: "2026-01-20" },
  { id: "s-005", venueId: "v1", name: "井上 信", email: "inoue@hiroshima-padel.example", phone: "082-100-0005", role: "staff", status: "inactive", hiredAt: "2025-11-05", note: "育休中" },
  { id: "s-006", venueId: "v2", name: "佐藤 美咲", email: "sato@kitahiroshima.example", phone: "082-200-0001", role: "owner", status: "active", hiredAt: "2025-11-03" },
  { id: "s-007", venueId: "v2", name: "中村 大輔", email: "nakamura@kitahiroshima.example", phone: "082-200-0002", role: "manager", status: "active", hiredAt: "2025-11-20" },
  { id: "s-008", venueId: "v2", name: "高橋 麻衣", email: "takahashi@kitahiroshima.example", phone: "082-200-0003", role: "receptionist", status: "active", hiredAt: "2026-02-01" },
];

// ─── シフト（今週の例）─────────────────────────
const weekBase = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const SHIFTS: Shift[] = [
  // v1 今日
  { id: "sh-001", staffId: "s-002", staffName: "山本 太郎", venueId: "v1", date: weekBase(0), startTime: "09:00", endTime: "18:00", type: "regular" },
  { id: "sh-002", staffId: "s-003", staffName: "鈴木 あやの", venueId: "v1", date: weekBase(0), startTime: "10:00", endTime: "19:00", type: "regular" },
  { id: "sh-003", staffId: "s-004", staffName: "森田 光", venueId: "v1", date: weekBase(0), startTime: "13:00", endTime: "22:00", type: "regular" },
  // v1 明日
  { id: "sh-004", staffId: "s-002", staffName: "山本 太郎", venueId: "v1", date: weekBase(1), startTime: "09:00", endTime: "18:00", type: "regular" },
  { id: "sh-005", staffId: "s-004", staffName: "森田 光", venueId: "v1", date: weekBase(1), startTime: "09:00", endTime: "13:00", type: "regular" },
  // v1 今週残り
  { id: "sh-006", staffId: "s-003", staffName: "鈴木 あやの", venueId: "v1", date: weekBase(2), startTime: "10:00", endTime: "19:00", type: "regular" },
  { id: "sh-007", staffId: "s-002", staffName: "山本 太郎", venueId: "v1", date: weekBase(3), startTime: "09:00", endTime: "18:00", type: "regular" },
  { id: "sh-008", staffId: "s-004", staffName: "森田 光", venueId: "v1", date: weekBase(4), startTime: "13:00", endTime: "22:00", type: "overtime", note: "GW 準備" },
  { id: "sh-009", staffId: "s-003", staffName: "鈴木 あやの", venueId: "v1", date: weekBase(5), startTime: "10:00", endTime: "19:00", type: "holiday" },
  { id: "sh-010", staffId: "s-002", staffName: "山本 太郎", venueId: "v1", date: weekBase(6), startTime: "09:00", endTime: "18:00", type: "holiday" },
  // v2 今週
  { id: "sh-011", staffId: "s-007", staffName: "中村 大輔", venueId: "v2", date: weekBase(0), startTime: "09:00", endTime: "18:00", type: "regular" },
  { id: "sh-012", staffId: "s-008", staffName: "高橋 麻衣", venueId: "v2", date: weekBase(0), startTime: "13:00", endTime: "22:00", type: "regular" },
  { id: "sh-013", staffId: "s-007", staffName: "中村 大輔", venueId: "v2", date: weekBase(1), startTime: "09:00", endTime: "18:00", type: "regular" },
  { id: "sh-014", staffId: "s-008", staffName: "高橋 麻衣", venueId: "v2", date: weekBase(2), startTime: "13:00", endTime: "22:00", type: "regular" },
];

// ─── アカウント招待 ──────────────────────────────
export const INVITES: Invite[] = [
  { id: "inv-001", venueId: "v1", email: "newstaff1@example.com", role: "staff", status: "pending", invitedBy: "田中 健一", invitedAt: weekBase(-2) + "T10:00:00", expiresAt: weekBase(5), note: "週末シフト用" },
  { id: "inv-002", venueId: "v1", email: "newstaff2@example.com", role: "receptionist", status: "accepted", invitedBy: "田中 健一", invitedAt: weekBase(-10) + "T14:00:00", acceptedAt: weekBase(-8) + "T09:30:00", expiresAt: weekBase(-3) },
  { id: "inv-003", venueId: "v1", email: "coach-applicant@example.com", role: "coach", status: "pending", invitedBy: "田中 健一", invitedAt: weekBase(-1) + "T11:00:00", expiresAt: weekBase(6), note: "A 級コーチ候補" },
  { id: "inv-004", venueId: "v1", email: "expired@example.com", role: "staff", status: "expired", invitedBy: "田中 健一", invitedAt: weekBase(-30) + "T09:00:00", expiresAt: weekBase(-15) },
  { id: "inv-005", venueId: "v1", email: "revoked@example.com", role: "staff", status: "revoked", invitedBy: "田中 健一", invitedAt: weekBase(-20) + "T15:00:00", expiresAt: weekBase(-5), note: "採用見送り" },
  { id: "inv-006", venueId: "v2", email: "newstaff3@example.com", role: "staff", status: "pending", invitedBy: "佐藤 美咲", invitedAt: weekBase(-1) + "T16:00:00", expiresAt: weekBase(6) },
];

// ─── キャンペーン・イベント ─────────────────────
export const CAMPAIGNS: Campaign[] = [
  {
    id: "cm-001", title: "GW パデル体験会", description: "初心者向け無料体験会。ラケット・ボール貸出あり。",
    kind: "lesson_event", scope: "venue", venueId: "v1",
    startAt: weekBase(7) + "T10:00:00", endAt: weekBase(9) + "T16:00:00",
    fee: 0, capacity: 24, participantCount: 18, status: "scheduled",
    createdBy: "田中 健一", createdAt: weekBase(-5) + "T10:00:00",
  },
  {
    id: "cm-002", title: "春の交流トーナメント 2026", description: "週末 2 日間の交流試合イベント。全加盟店から参加可能。",
    kind: "tournament", scope: "platform",
    startAt: weekBase(14) + "T09:00:00", endAt: weekBase(15) + "T18:00:00",
    fee: 3000, capacity: 64, participantCount: 28, status: "active",
    createdBy: "運営管理者", createdAt: weekBase(-20) + "T12:00:00",
  },
  {
    id: "cm-003", title: "春割キャンペーン", description: "3 月〜4 月、コート予約 15% OFF キャンペーン",
    kind: "promotion", scope: "platform",
    startAt: "2026-03-01T00:00:00", endAt: "2026-04-30T23:59:59",
    fee: 0, capacity: 0, participantCount: 234, status: "active",
    createdBy: "運営管理者", createdAt: "2026-02-20T10:00:00",
  },
  {
    id: "cm-004", title: "プロコーチによるレベル別クリニック", description: "S 級コーチ山田翔太による上級者向けクリニック",
    kind: "lesson_event", scope: "venue", venueId: "v1",
    startAt: weekBase(3) + "T14:00:00", endAt: weekBase(3) + "T17:00:00",
    fee: 5000, capacity: 8, participantCount: 8, status: "active",
    createdBy: "田中 健一", createdAt: weekBase(-10) + "T09:00:00",
  },
  {
    id: "cm-005", title: "北広島パデル会員交流会", description: "同じ場館の会員どうしの交流と試合。",
    kind: "social_gathering", scope: "venue", venueId: "v2",
    startAt: weekBase(10) + "T18:00:00", endAt: weekBase(10) + "T21:00:00",
    fee: 1500, capacity: 20, participantCount: 12, status: "scheduled",
    createdBy: "佐藤 美咲", createdAt: weekBase(-3) + "T15:00:00",
  },
  {
    id: "cm-006", title: "バレンタイン 2026 キャンペーン（終了）", description: "2 月限定 20% OFF",
    kind: "promotion", scope: "platform",
    startAt: "2026-02-10T00:00:00", endAt: "2026-02-20T23:59:59",
    fee: 0, capacity: 0, participantCount: 89, status: "ended",
    createdBy: "運営管理者", createdAt: "2026-02-05T10:00:00",
  },
  {
    id: "cm-007", title: "ジュニア育成プログラム（下書き）", description: "10〜15 歳対象、4 週間の育成コース",
    kind: "lesson_event", scope: "venue", venueId: "v2",
    startAt: weekBase(20) + "T16:00:00", endAt: weekBase(48) + "T18:00:00",
    fee: 12000, capacity: 16, participantCount: 0, status: "draft",
    createdBy: "佐藤 美咲", createdAt: weekBase(-2) + "T14:00:00",
  },
];

// ─── システム設定 ────────────────────────────────
export const SYSTEM_SETTINGS: SystemSettings = {
  platformName: "LST パデルプラットフォーム",
  supportEmail: "support@lst.example",
  supportPhone: "03-1234-5678",
  termsUrl: "https://lst.example/terms",
  privacyUrl: "https://lst.example/privacy",
  maintenanceMode: false,
  registrationOpen: true,
  stripePublishableKey: "pk_live_***************************abc",
  defaultCurrency: "JPY",
  timezone: "Asia/Tokyo",
  cancellationWindowHours: 24,
  pointsExpirationDays: 365,
  updatedAt: weekBase(-7) + "T10:00:00",
  updatedBy: "運営管理者",
};

// ─── 管理者アカウント ────────────────────────────
export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "acc-001", email: "admin@lst.example", name: "運営管理者（総括）",
    roleKey: "lst-super", status: "active", mfaEnabled: true,
    lastLoginAt: weekBase(0) + "T09:15:00", createdAt: "2025-08-01T10:00:00",
  },
  {
    id: "acc-002", email: "ops.yamamoto@lst.example", name: "山本 優子（運営）",
    roleKey: "lst-operations", status: "active", mfaEnabled: true,
    lastLoginAt: weekBase(-1) + "T14:30:00", createdAt: "2025-09-15T10:00:00",
    createdBy: "運営管理者（総括）",
  },
  {
    id: "acc-003", email: "finance.sato@lst.example", name: "佐藤 圭太（財務）",
    roleKey: "lst-finance", status: "active", mfaEnabled: true,
    lastLoginAt: weekBase(0) + "T08:00:00", createdAt: "2025-10-01T10:00:00",
    createdBy: "運営管理者（総括）",
  },
  {
    id: "acc-004", email: "support.ishida@lst.example", name: "石田 美奈（CS）",
    roleKey: "lst-support", status: "active", mfaEnabled: false,
    lastLoginAt: weekBase(0) + "T10:45:00", createdAt: "2026-01-20T10:00:00",
    createdBy: "運営管理者（総括）",
  },
  {
    id: "acc-005", email: "new.hire@lst.example", name: "新規採用者",
    roleKey: "lst-support", status: "invited", mfaEnabled: false,
    createdAt: weekBase(-2) + "T14:00:00",
    createdBy: "運営管理者（総括）",
  },
  // 企業 v1 オーナー・マネージャー
  {
    id: "acc-101", email: "manager@hiroshima-padel.example", name: "田中 健一（オーナー）",
    roleKey: "venue-owner", venueId: "v1", status: "active", mfaEnabled: true,
    lastLoginAt: weekBase(0) + "T07:30:00", createdAt: "2025-08-15T10:00:00",
    createdBy: "運営管理者（総括）",
  },
  {
    id: "acc-102", email: "yamamoto@hiroshima-padel.example", name: "山本 太郎（マネージャー）",
    roleKey: "venue-manager", venueId: "v1", status: "active", mfaEnabled: false,
    lastLoginAt: weekBase(-1) + "T18:00:00", createdAt: "2025-09-01T10:00:00",
    createdBy: "田中 健一（オーナー）",
  },
  {
    id: "acc-103", email: "suzuki@hiroshima-padel.example", name: "鈴木 あやの（受付）",
    roleKey: "venue-staff", venueId: "v1", status: "active", mfaEnabled: false,
    lastLoginAt: weekBase(0) + "T11:20:00", createdAt: "2025-10-12T10:00:00",
    createdBy: "田中 健一（オーナー）",
  },
  {
    id: "acc-104", email: "former@hiroshima-padel.example", name: "元スタッフ",
    roleKey: "venue-staff", venueId: "v1", status: "suspended", mfaEnabled: false,
    lastLoginAt: weekBase(-30) + "T15:00:00", createdAt: "2025-10-15T10:00:00",
    createdBy: "田中 健一（オーナー）",
  },
  // 企業 v2
  {
    id: "acc-201", email: "manager@kitahiroshima.example", name: "佐藤 美咲（オーナー）",
    roleKey: "venue-owner", venueId: "v2", status: "active", mfaEnabled: true,
    lastLoginAt: weekBase(0) + "T09:00:00", createdAt: "2025-11-03T10:00:00",
    createdBy: "運営管理者（総括）",
  },
  {
    id: "acc-202", email: "nakamura@kitahiroshima.example", name: "中村 大輔（マネージャー）",
    roleKey: "venue-manager", venueId: "v2", status: "active", mfaEnabled: false,
    lastLoginAt: weekBase(-1) + "T10:00:00", createdAt: "2025-11-20T10:00:00",
    createdBy: "佐藤 美咲（オーナー）",
  },
];

// ─── 権限ロール（RBAC）──────────────────────────
export const ADMIN_ROLES: AdminRole[] = [
  {
    id: "role-lst-super", key: "lst-super",
    label: "運営管理者（総括）", scope: "lst",
    description: "プラットフォーム全体の最高権限。システム設定、手数料設定、管理者管理を含むすべての操作が可能。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read","user.write","user.suspend","user.points_adjust",
      "venue.read","venue.write","venue.suspend",
      "coach.read","coach.write","coach.approve","coach.suspend",
      "booking.read","booking.approve_reschedule","booking.refund",
      "court.read","court.write","equipment.read","equipment.write",
      "finance.read","finance.export","payout.retry","commission.write",
      "coupon.read","coupon.write","coupon.distribute",
      "points.read","points.write","points.adjust",
      "announcement.read","announcement.write","announcement.send",
      "campaign.read","campaign.write",
      "staff.read","staff.write","shift.read","shift.write",
      "settings.read","settings.write",
      "account.read","account.write","role.write","audit.read",
    ],
  },
  {
    id: "role-lst-operations", key: "lst-operations",
    label: "運営担当", scope: "lst",
    description: "日常運営：コーチ審査、お知らせ配信、クーポン配布、キャンペーン企画。手数料設定とシステム設定は閲覧のみ。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read","user.write","user.suspend",
      "venue.read","venue.write",
      "coach.read","coach.write","coach.approve",
      "booking.read","booking.approve_reschedule",
      "court.read","equipment.read",
      "finance.read",
      "coupon.read","coupon.write","coupon.distribute",
      "points.read","points.adjust",
      "announcement.read","announcement.write","announcement.send",
      "campaign.read","campaign.write",
      "settings.read","audit.read",
    ],
  },
  {
    id: "role-lst-finance", key: "lst-finance",
    label: "財務担当", scope: "lst",
    description: "財務特化：売上・決済・手数料・出金エラー再送。運営系の書込み権限なし。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read","venue.read","coach.read","booking.read",
      "finance.read","finance.export","payout.retry","commission.write",
      "points.read","settings.read","audit.read","account.read",
    ],
  },
  {
    id: "role-lst-support", key: "lst-support",
    label: "カスタマーサポート", scope: "lst",
    description: "利用者対応：会員情報閲覧・予約振替審査・返金処理・ポイント調整。コーチ審査や財務設定不可。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read","user.points_adjust",
      "venue.read","coach.read",
      "booking.read","booking.approve_reschedule","booking.refund",
      "court.read","equipment.read",
      "coupon.read","points.read","points.adjust",
      "announcement.read","settings.read",
    ],
  },
  {
    id: "role-venue-owner", key: "venue-owner",
    label: "企業オーナー", scope: "venue",
    description: "当企業の全操作：コート・備品・スタッフ管理、予約対応、売上確認、キャンペーン企画。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read",
      "venue.read","venue.write",
      "booking.read","booking.approve_reschedule","booking.refund",
      "court.read","court.write","equipment.read","equipment.write",
      "finance.read","finance.export",
      "coupon.read","coupon.write","coupon.distribute",
      "announcement.read","announcement.write","announcement.send",
      "campaign.read","campaign.write",
      "staff.read","staff.write","shift.read","shift.write",
      "account.read","account.write","audit.read",
    ],
  },
  {
    id: "role-venue-manager", key: "venue-manager",
    label: "企業マネージャー", scope: "venue",
    description: "日常運営：予約・スタッフ・シフト・コート・備品の管理。アカウント管理や財務エクスポートは不可。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "user.read",
      "venue.read",
      "booking.read","booking.approve_reschedule","booking.refund",
      "court.read","court.write","equipment.read","equipment.write",
      "finance.read",
      "coupon.read",
      "announcement.read","announcement.write",
      "campaign.read","campaign.write",
      "staff.read","staff.write","shift.read","shift.write",
    ],
  },
  {
    id: "role-venue-staff", key: "venue-staff",
    label: "企業スタッフ", scope: "venue",
    description: "閲覧と基本操作のみ：予約確認、振替審査、備品在庫更新。CRUD や財務権限なし。",
    builtin: true, createdAt: "2025-01-01",
    permissions: [
      "booking.read","booking.approve_reschedule",
      "court.read","equipment.read","equipment.write",
      "shift.read",
    ],
  },
];

// ─── 監査ログ ────────────────────────────────────
export const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-001", actorId: "acc-001", actorName: "運営管理者（総括）", actorRoleKey: "lst-super",
    category: "coach", action: "coach.approve",
    targetType: "coach", targetId: "co-002", targetLabel: "伊藤 美穂",
    summary: "コーチ審査を承認（A 級）",
    ipAddress: "203.0.113.45", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(0) + "T10:15:23",
  },
  {
    id: "audit-002", actorId: "acc-003", actorName: "佐藤 圭太（財務）", actorRoleKey: "lst-finance",
    category: "finance", action: "payout.retry",
    targetType: "earning", targetId: "er-011", targetLabel: "伊藤 美穂 ¥5,390",
    summary: "Stripe 送金エラーを再送信",
    ipAddress: "203.0.113.48", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(0) + "T09:42:11",
  },
  {
    id: "audit-003", actorId: "acc-002", actorName: "山本 優子（運営）", actorRoleKey: "lst-operations",
    category: "coupon", action: "coupon.distribute",
    targetType: "coupon", targetId: "cp-001", targetLabel: "VIP 会員春感謝クーポン",
    summary: "条件絞り込みで 42 名に配布",
    ipAddress: "203.0.113.46", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-1) + "T14:20:55",
  },
  {
    id: "audit-004", actorId: "acc-004", actorName: "石田 美奈（CS）", actorRoleKey: "lst-support",
    category: "booking", action: "booking.refund",
    targetType: "booking", targetId: "bk-104", targetLabel: "渡辺 正 コートB",
    summary: "¥2,500 を返金（雨天キャンセル対応）",
    ipAddress: "203.0.113.47", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(0) + "T11:30:42",
  },
  {
    id: "audit-005", actorId: "acc-101", actorName: "田中 健一（オーナー）", actorRoleKey: "venue-owner",
    scopeVenueId: "v1",
    category: "booking", action: "booking.approve_reschedule",
    targetType: "booking", targetId: "bk-102", targetLabel: "佐藤 花子 コートA",
    summary: "振替申請を承認（13:00-15:00 へ変更）",
    ipAddress: "192.0.2.10", userAgent: "Safari/17 iPhone",
    createdAt: weekBase(0) + "T08:15:00",
  },
  {
    id: "audit-006", actorId: "acc-102", actorName: "山本 太郎（マネージャー）", actorRoleKey: "venue-manager",
    scopeVenueId: "v1",
    category: "staff", action: "shift.write",
    targetType: "shift", targetId: "sh-008", targetLabel: "森田 光 5/2",
    summary: "シフトを休日出勤に変更",
    ipAddress: "192.0.2.11", userAgent: "Chrome/121 Windows",
    createdAt: weekBase(-1) + "T16:45:20",
  },
  {
    id: "audit-007", actorId: "acc-001", actorName: "運営管理者（総括）", actorRoleKey: "lst-super",
    category: "settings", action: "commission.write",
    targetType: "commission", targetId: "cm-v1", targetLabel: "パデルコート広島",
    summary: "レッスン手数料率を 20% → 18% に変更",
    ipAddress: "203.0.113.45", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-2) + "T10:30:00",
  },
  {
    id: "audit-008", actorId: "acc-001", actorName: "運営管理者（総括）", actorRoleKey: "lst-super",
    category: "account", action: "account.write",
    targetType: "account", targetId: "acc-005", targetLabel: "新規採用者",
    summary: "新規 CS アカウントを招待",
    ipAddress: "203.0.113.45", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-2) + "T14:00:00",
  },
  {
    id: "audit-009", actorId: "acc-002", actorName: "山本 優子（運営）", actorRoleKey: "lst-operations",
    category: "announce", action: "announcement.send",
    targetType: "announcement", targetId: "ann-001", targetLabel: "ゴールデンウィーク営業時間",
    summary: "お知らせを 2,543 名に送信",
    ipAddress: "203.0.113.46", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-5) + "T10:00:00",
  },
  {
    id: "audit-010", actorId: "acc-201", actorName: "佐藤 美咲（オーナー）", actorRoleKey: "venue-owner",
    scopeVenueId: "v2",
    category: "venue", action: "venue.write",
    targetType: "venue", targetId: "v2", targetLabel: "北広島パデルクラブ",
    summary: "営業時間を平日 10:00-22:00 に更新",
    ipAddress: "192.0.2.20", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-3) + "T11:00:00",
  },
  {
    id: "audit-011", actorId: "acc-004", actorName: "石田 美奈（CS）", actorRoleKey: "lst-support",
    category: "user", action: "user.points_adjust",
    targetType: "user", targetId: "u-009", targetLabel: "藤原 一樹",
    summary: "ポイント -500（無断キャンセルによる調整）",
    ipAddress: "203.0.113.47", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(-15) + "T16:00:00",
  },
  {
    id: "audit-012", actorId: "acc-001", actorName: "運営管理者（総括）", actorRoleKey: "lst-super",
    category: "auth", action: "auth.login",
    targetType: "session", targetId: "sess-001", targetLabel: "運営管理者（総括）",
    summary: "ログイン成功（MFA 認証）",
    ipAddress: "203.0.113.45", userAgent: "Chrome/121 macOS",
    createdAt: weekBase(0) + "T09:15:00",
  },
];
