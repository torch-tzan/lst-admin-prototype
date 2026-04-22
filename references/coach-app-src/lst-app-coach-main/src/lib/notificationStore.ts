export interface PushNotification {
  id: string;
  type: "booking_confirmed" | "booking_rejected" | "lesson_started" | "lesson_completed" | "change_approved" | "change_rejected" | "booking_cancelled" | "online_link" | "review_request" | "review_overdue";
  title: string;
  message: string;
  bookingId?: string;
  coachName?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "padel_notifications";

export const getNotifications = (): PushNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (items: PushNotification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addNotification = (n: Omit<PushNotification, "id" | "createdAt" | "read">) => {
  const items = getNotifications();
  items.unshift({
    ...n,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  save(items);
};

export const markAllNotificationsRead = () => {
  const items = getNotifications();
  save(items.map((n) => ({ ...n, read: true })));
};

export const markNotificationRead = (id: string) => {
  const items = getNotifications();
  save(items.map((n) => n.id === id ? { ...n, read: true } : n));
};

export const getUnreadCount = (): number => {
  return getNotifications().filter((n) => !n.read).length;
};

/** Seed demo review request notifications */
export const seedReviewNotifications = (): void => {
  const items = getNotifications();
  if (items.some((n) => n.type === "review_request")) return;

  const demoReviews: Omit<PushNotification, "id">[] = [
    {
      type: "review_request",
      title: "レッスンの評価をお願いします",
      message: "佐藤 翔太コーチのレッスンはいかがでしたか？ぜひ評価をお寄せください。",
      coachName: "佐藤 翔太",
      bookingId: "demo-ba",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
    {
      type: "review_request",
      title: "レッスンの評価をお願いします",
      message: "鈴木 健太コーチのレッスンはいかがでしたか？ぜひ評価をお寄せください。",
      coachName: "鈴木 健太",
      bookingId: "demo-be",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      read: true,
    },
  ];

  const newItems = [
    ...demoReviews.map((n) => ({
      ...n,
      id: `notif-review-${Math.random().toString(36).slice(2, 8)}`,
    })),
    ...items,
  ];
  save(newItems);
};
