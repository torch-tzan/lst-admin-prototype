export interface Venue {
  id: string;
  name: string;
  area: string;
  address: string;
  courts: number;
  image?: string;
}

export interface CoachCourse {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  supportsInPerson: boolean;
  supportsOnline: boolean;
}

export interface VideoReviewSettings {
  enabled: boolean;
  price: number;
  description: string;
}

const VIDEO_REVIEW_STORAGE_KEY = "padel_coach_video_review";

const VENUE_STORAGE_KEY = "padel_coach_venues";
const COURSE_STORAGE_KEY = "padel_coach_courses";

// Platform venues (all available on the platform)
export const PLATFORM_VENUES: Venue[] = [
  { id: "v1", name: "PADEL TOKYO", area: "渋谷区", address: "東京都渋谷区神南1-2-3", courts: 4 },
  { id: "v2", name: "PADEL BASE 豊洲", area: "江東区", address: "東京都江東区豊洲5-6-7", courts: 3 },
  { id: "v3", name: "Tokyo Padel Club", area: "品川区", address: "東京都品川区東品川3-8-9", courts: 6 },
  { id: "v4", name: "PADEL GARDEN 世田谷", area: "世田谷区", address: "東京都世田谷区駒沢2-4-1", courts: 2 },
  { id: "v5", name: "Bay Padel Arena", area: "港区", address: "東京都港区台場1-7-10", courts: 5 },
  { id: "v6", name: "PADEL SQUARE 新宿", area: "新宿区", address: "東京都新宿区西新宿6-12-3", courts: 3 },
  { id: "v7", name: "Riverside Padel 府中", area: "府中市", address: "東京都府中市日鋼町1-5", courts: 4 },
  { id: "v8", name: "PADEL FIELD 立川", area: "立川市", address: "東京都立川市緑町3-1-2", courts: 2 },
];

// Coach's selected venues
export const getCoachVenues = (): string[] => {
  try {
    const raw = localStorage.getItem(VENUE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: first 2 venues selected
  const defaults = ["v1", "v2"];
  localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const saveCoachVenues = (venueIds: string[]) => {
  localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify(venueIds));
};

// Coach's courses
export const getCoachCourses = (): CoachCourse[] => {
  try {
    const raw = localStorage.getItem(COURSE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults = getDefaultCourses();
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const saveCoachCourses = (courses: CoachCourse[]) => {
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
};

export const addCoachCourse = (course: Omit<CoachCourse, "id">): CoachCourse => {
  const courses = getCoachCourses();
  const newCourse: CoachCourse = { ...course, id: `course-${Date.now()}` };
  courses.push(newCourse);
  saveCoachCourses(courses);
  return newCourse;
};

export const updateCoachCourse = (id: string, updates: Partial<CoachCourse>) => {
  const courses = getCoachCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx >= 0) {
    courses[idx] = { ...courses[idx], ...updates };
    saveCoachCourses(courses);
  }
};

export const deleteCoachCourse = (id: string) => {
  const courses = getCoachCourses().filter((c) => c.id !== id);
  saveCoachCourses(courses);
};

function getDefaultCourses(): CoachCourse[] {
  return [
    {
      id: "course-1",
      name: "パデル基礎レッスン",
      description: "初心者向けの基本的なフォームと戦術を学ぶレッスン",
      hourlyRate: 5000,
      supportsInPerson: true,
      supportsOnline: true,
    },
    {
      id: "course-2",
      name: "試合形式プラクティス",
      description: "実戦形式で試合感覚を養うレッスン",
      hourlyRate: 6000,
      supportsInPerson: true,
      supportsOnline: false,
    },
    {
      id: "course-3",
      name: "フォーム改善オンライン",
      description: "動画を使ったフォーム分析と改善アドバイス",
      hourlyRate: 3500,
      supportsInPerson: false,
      supportsOnline: true,
    },
  ];
}

// Video review settings
export const getVideoReviewSettings = (): VideoReviewSettings => {
  try {
    const raw = localStorage.getItem(VIDEO_REVIEW_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults: VideoReviewSettings = { enabled: true, price: 2000, description: "動画を送信していただき、フォームや技術についてアドバイスを返信します。" };
  localStorage.setItem(VIDEO_REVIEW_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const saveVideoReviewSettings = (settings: VideoReviewSettings) => {
  localStorage.setItem(VIDEO_REVIEW_STORAGE_KEY, JSON.stringify(settings));
};
