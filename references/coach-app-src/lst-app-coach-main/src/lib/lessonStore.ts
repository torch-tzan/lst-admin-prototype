export type LessonType = "practice" | "online" | "video_review";
export type LessonStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "declined";

export interface Lesson {
  id: string;
  type: LessonType;
  status: LessonStatus;
  studentId: string;
  studentName: string;
  studentInitial: string;
  studentAvatarColor: string;
  studentLevel: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  venueAddress?: string;
  topic?: string;
  earnings: number;
  createdAt: string;
  // video review specific
  videoUrl?: string;
  reviewComment?: string;
}

const STORAGE_KEY = "padel_coach_lessons";
const SEED_VERSION_KEY = "padel_coach_lessons_version";
const CURRENT_SEED_VERSION = "4";

export const getLessons = (): Lesson[] => {
  try {
    const version = localStorage.getItem(SEED_VERSION_KEY);
    if (version === CURRENT_SEED_VERSION) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  // Seed default data (or refresh on version change)
  const seeds = getSeedLessons();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  return seeds;
};

export const updateLesson = (id: string, updates: Partial<Lesson>) => {
  const lessons = getLessons();
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx !== -1) {
    lessons[idx] = { ...lessons[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  }
};

export const getLessonsByType = (type: LessonType): Lesson[] =>
  getLessons().filter((l) => l.type === type);

export const getPendingCount = (type?: LessonType): number =>
  getLessons().filter((l) => l.status === "pending" && (!type || l.type === type)).length;

export const getTypeLabel = (type: LessonType): string => {
  switch (type) {
    case "practice": return "実践練習";
    case "online": return "オンライン指導";
    case "video_review": return "動画レビュー";
  }
};

export const getStatusLabel = (status: LessonStatus): string => {
  switch (status) {
    case "pending": return "承認待ち";
    case "confirmed": return "確定";
    case "in_progress": return "進行中";
    case "completed": return "完了";
    case "cancelled": return "キャンセル";
    case "declined": return "辞退";
  }
};

export const getStatusColor = (status: LessonStatus): string => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-green-100 text-green-800";
    case "in_progress": return "bg-blue-100 text-blue-800";
    case "completed": return "bg-muted text-muted-foreground";
    case "cancelled": return "bg-red-100 text-red-800";
    case "declined": return "bg-muted text-muted-foreground";
  }
};

function getSeedLessons(): Lesson[] {
  return [
    // === Today's lessons (2026/04/15) ===
    {
      id: "l1", type: "practice", status: "confirmed",
      studentId: "s1", studentName: "山田 花子", studentInitial: "山", studentAvatarColor: "hsl(25, 90%, 55%)", studentLevel: "初級",
      date: "2026/04/15", startTime: "10:00", endTime: "11:00",
      venueName: "パデルコート広島", venueAddress: "広島県広島市中区大手町1-2-3",
      topic: "フォアハンド基礎", earnings: 5000, createdAt: "2026-04-14T10:00:00Z",
    },
    {
      id: "l10", type: "online", status: "confirmed",
      studentId: "s4", studentName: "中村 美咲", studentInitial: "中", studentAvatarColor: "hsl(0, 70%, 55%)", studentLevel: "初級",
      date: "2026/04/15", startTime: "13:00", endTime: "14:00",
      topic: "基礎ルール解説", earnings: 3000, createdAt: "2026-04-13T09:00:00Z",
    },
    {
      id: "l11", type: "practice", status: "in_progress",
      studentId: "s7", studentName: "田中 太郎", studentInitial: "田", studentAvatarColor: "hsl(45, 80%, 45%)", studentLevel: "中級",
      date: "2026/04/15", startTime: "15:00", endTime: "16:30",
      venueName: "パデルコート広島", venueAddress: "広島県広島市中区大手町1-2-3",
      topic: "ダブルス戦術", earnings: 7500, createdAt: "2026-04-14T11:00:00Z",
    },
    // Today's video reviews (due today)
    {
      id: "l7", type: "video_review", status: "pending",
      studentId: "s6", studentName: "渡辺 優子", studentInitial: "渡", studentAvatarColor: "hsl(320, 60%, 50%)", studentLevel: "初級",
      date: "2026/04/15", startTime: "", endTime: "",
      topic: "バックハンドのフォーム確認", earnings: 2000, createdAt: "2026-04-14T14:00:00Z",
      videoUrl: "https://example.com/video1.mp4",
    },
    {
      id: "l12", type: "video_review", status: "pending",
      studentId: "s7", studentName: "田中 太郎", studentInitial: "田", studentAvatarColor: "hsl(45, 80%, 45%)", studentLevel: "中級",
      date: "2026/04/15", startTime: "", endTime: "",
      topic: "スマッシュの打点チェック", earnings: 2000, createdAt: "2026-04-14T20:00:00Z",
      videoUrl: "https://example.com/video4.mp4",
    },
    {
      id: "l17", type: "video_review", status: "pending",
      studentId: "s1", studentName: "山田 花子", studentInitial: "山", studentAvatarColor: "hsl(25, 90%, 55%)", studentLevel: "初級",
      date: "2026/04/16", startTime: "", endTime: "",
      topic: "ロブショットのフォーム改善", earnings: 2000, createdAt: "2026-04-12T10:00:00Z",
      videoUrl: "https://example.com/video5.mp4",
    },
    {
      id: "l18", type: "video_review", status: "pending",
      studentId: "s5", studentName: "小林 大輔", studentInitial: "小", studentAvatarColor: "hsl(200, 70%, 50%)", studentLevel: "中級",
      date: "2026/04/14", startTime: "", endTime: "",
      topic: "ボレーの足運びチェック", earnings: 2000, createdAt: "2026-04-10T08:00:00Z",
      videoUrl: "https://example.com/video6.mp4",
    },
    {
      id: "l19", type: "video_review", status: "pending",
      studentId: "s8", studentName: "松本 直樹", studentInitial: "松", studentAvatarColor: "hsl(180, 50%, 45%)", studentLevel: "上級",
      date: "2026/04/13", startTime: "", endTime: "",
      topic: "試合中のポジション取り分析", earnings: 2000, createdAt: "2026-04-09T15:00:00Z",
      videoUrl: "https://example.com/video7.mp4",
    },
    {
      id: "l20", type: "video_review", status: "pending",
      studentId: "s4", studentName: "中村 美咲", studentInitial: "中", studentAvatarColor: "hsl(0, 70%, 55%)", studentLevel: "初級",
      date: "2026/04/15", startTime: "", endTime: "",
      topic: "グリップの握り方確認", earnings: 2000, createdAt: "2026-04-14T12:00:00Z",
      videoUrl: "https://example.com/video8.mp4",
    },

    // === Upcoming lessons ===
    {
      id: "l2", type: "practice", status: "pending",
      studentId: "s2", studentName: "佐々木 翔", studentInitial: "佐", studentAvatarColor: "hsl(140, 60%, 42%)", studentLevel: "中級",
      date: "2026/04/18", startTime: "14:00", endTime: "15:30",
      venueName: "北広島パデルクラブ", venueAddress: "広島県北広島市中央5-8-12",
      topic: "ゲーム戦術", earnings: 7500, createdAt: "2026-04-13T08:00:00Z",
    },
    {
      id: "l4", type: "online", status: "confirmed",
      studentId: "s4", studentName: "中村 美咲", studentInitial: "中", studentAvatarColor: "hsl(0, 70%, 55%)", studentLevel: "初級",
      date: "2026/04/17", startTime: "20:00", endTime: "21:00",
      topic: "基礎フォーム解説", earnings: 3000, createdAt: "2026-04-12T15:00:00Z",
    },
    {
      id: "l5", type: "online", status: "pending",
      studentId: "s5", studentName: "小林 大輔", studentInitial: "小", studentAvatarColor: "hsl(200, 70%, 50%)", studentLevel: "中級",
      date: "2026/04/20", startTime: "19:00", endTime: "20:00",
      topic: "試合映像分析", earnings: 3000, createdAt: "2026-04-14T09:00:00Z",
    },
    {
      id: "l13", type: "practice", status: "confirmed",
      studentId: "s8", studentName: "松本 直樹", studentInitial: "松", studentAvatarColor: "hsl(180, 50%, 45%)", studentLevel: "上級",
      date: "2026/04/16", startTime: "11:00", endTime: "12:30",
      venueName: "パデルコート広島", venueAddress: "広島県広島市中区大手町1-2-3",
      topic: "試合前調整", earnings: 7500, createdAt: "2026-04-14T16:00:00Z",
    },
    // Future video review (not due today)
    {
      id: "l8", type: "video_review", status: "pending",
      studentId: "s2", studentName: "佐々木 翔", studentInitial: "佐", studentAvatarColor: "hsl(140, 60%, 42%)", studentLevel: "中級",
      date: "2026/04/17", startTime: "", endTime: "",
      topic: "サーブフォームのチェック", earnings: 2000, createdAt: "2026-04-13T20:00:00Z",
      videoUrl: "https://example.com/video2.mp4",
    },

    // === Past/completed lessons ===
    {
      id: "l3", type: "practice", status: "completed",
      studentId: "s3", studentName: "高橋 健一", studentInitial: "高", studentAvatarColor: "hsl(270, 60%, 55%)", studentLevel: "上級",
      date: "2026/04/10", startTime: "09:00", endTime: "10:30",
      venueName: "パデルコート広島", venueAddress: "広島県広島市中区大手町1-2-3",
      topic: "サーブ改善", earnings: 7500, createdAt: "2026-04-08T12:00:00Z",
    },
    {
      id: "l6", type: "online", status: "completed",
      studentId: "s1", studentName: "山田 花子", studentInitial: "山", studentAvatarColor: "hsl(25, 90%, 55%)", studentLevel: "初級",
      date: "2026/04/08", startTime: "18:00", endTime: "19:00",
      topic: "ルール解説・基本動作", earnings: 3000, createdAt: "2026-04-06T10:00:00Z",
    },
    {
      id: "l9", type: "video_review", status: "completed",
      studentId: "s3", studentName: "高橋 健一", studentInitial: "高", studentAvatarColor: "hsl(270, 60%, 55%)", studentLevel: "上級",
      date: "2026/04/05", startTime: "", endTime: "",
      topic: "ボレー技術の分析", earnings: 2000, createdAt: "2026-04-04T08:00:00Z",
      videoUrl: "https://example.com/video3.mp4",
      reviewComment: "ボレーのタイミングが良いですね。手首の角度をもう少し意識すると精度が上がります。",
    },
    {
      id: "l14", type: "practice", status: "cancelled",
      studentId: "s5", studentName: "小林 大輔", studentInitial: "小", studentAvatarColor: "hsl(200, 70%, 50%)", studentLevel: "中級",
      date: "2026/04/12", startTime: "10:00", endTime: "11:30",
      venueName: "北広島パデルクラブ", venueAddress: "広島県北広島市中央5-8-12",
      topic: "基礎練習", earnings: 7500, createdAt: "2026-04-10T08:00:00Z",
    },
    {
      id: "l15", type: "online", status: "completed",
      studentId: "s8", studentName: "松本 直樹", studentInitial: "松", studentAvatarColor: "hsl(180, 50%, 45%)", studentLevel: "上級",
      date: "2026/04/07", startTime: "20:00", endTime: "21:00",
      topic: "戦術分析・ポジショニング", earnings: 3000, createdAt: "2026-04-05T14:00:00Z",
    },
    {
      id: "l16", type: "practice", status: "declined",
      studentId: "s6", studentName: "渡辺 優子", studentInitial: "渡", studentAvatarColor: "hsl(320, 60%, 50%)", studentLevel: "初級",
      date: "2026/04/14", startTime: "09:00", endTime: "10:00",
      venueName: "パデルコート広島", venueAddress: "広島県広島市中区大手町1-2-3",
      topic: "初回レッスン", earnings: 5000, createdAt: "2026-04-12T10:00:00Z",
    },
  ];
}
