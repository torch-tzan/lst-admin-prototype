export interface ChatMessage {
  id: string;
  sender: "coach" | "student" | "system";
  text: string;
  time: string;
  type?: "text" | "online_link" | "booking_confirm" | "review_reply" | "review_request" | "lesson_link";
  linkUrl?: string;
  linkExpired?: boolean;
  // For booking_confirm type
  bookingDate?: string;
  bookingTime?: string;
  bookingType?: string;
  // For review_reply / review_request type
  reviewId?: string;
  reviewTopic?: string;
  // For lesson_link type
  lessonId?: string;
  lessonType?: string;
}

export interface MessageThread {
  id: string;
  studentName: string;
  studentInitial: string;
  studentAvatarColor: string;
  bookingId: string;
  messages: ChatMessage[];
  createdAt: string;
  readCount?: number;
}

const STORAGE_KEY = "padel_messages";

// Version key to force re-seed when demo data changes
const SEED_VERSION_KEY = "padel_messages_seed_v";
const CURRENT_SEED_VERSION = "7";

export const getThreads = (): MessageThread[] => {
  try {
    const ver = localStorage.getItem(SEED_VERSION_KEY);
    if (ver !== CURRENT_SEED_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
      return seedAndReturn();
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0 && parsed[0].coachName) {
        localStorage.removeItem(STORAGE_KEY);
        return seedAndReturn();
      }
      return parsed;
    }
  } catch {}
  return seedAndReturn();
};

function seedAndReturn(): MessageThread[] {
  const threads = getDemoThreads();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  return threads;
}

const saveThreads = (threads: MessageThread[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
};

export const getThreadById = (threadId: string): MessageThread | undefined => {
  return getThreads().find((t) => t.id === threadId);
};

const now = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const addCoachMessage = (threadId: string, text: string): ChatMessage | null => {
  const threads = getThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: "coach",
    text,
    time: now(),
  };
  thread.messages.push(msg);
  saveThreads(threads);
  return msg;
};

export const addStudentReply = (threadId: string, text: string): ChatMessage | null => {
  const threads = getThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-auto`,
    sender: "student",
    text,
    time: now(),
  };
  thread.messages.push(msg);
  saveThreads(threads);
  return msg;
};

export const markThreadRead = (threadId: string): void => {
  const threads = getThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;
  thread.readCount = thread.messages.length;
  saveThreads(threads);
};

export const sendBookingConfirmation = (
  studentId: string,
  date: string,
  startTime: string,
  endTime: string,
  typeLabel: string,
): void => {
  const threads = getThreads();
  const thread = threads.find((t) => t.id === `thread-${studentId}`);
  if (!thread) return;

  const text = `ご予約が確定しました！\n\n📅 ${date} ${startTime}〜${endTime}\n💻 ${typeLabel}\n\n当日お会いできるのを楽しみにしています！何かご質問があればお気軽にどうぞ😊`;

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-confirm`,
    sender: "coach",
    text,
    time: now(),
    type: "booking_confirm",
    bookingDate: date,
    bookingTime: `${startTime}〜${endTime}`,
    bookingType: typeLabel,
  };
  thread.messages.push(msg);
  saveThreads(threads);
};

export const sendReviewReply = (
  studentId: string,
  reviewId: string,
  topic: string,
  comment: string,
): void => {
  const threads = getThreads();
  const thread = threads.find((t) => t.id === `thread-${studentId}`);
  if (!thread) return;

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-review`,
    sender: "coach",
    text: comment,
    time: now(),
    type: "review_reply",
    reviewId,
    reviewTopic: topic,
  };
  thread.messages.push(msg);
  saveThreads(threads);
};

export const getUnreadMessageCount = (): number => {
  const threads = getThreads();
  let count = 0;
  for (const thread of threads) {
    const read = thread.readCount || 0;
    const unread = thread.messages.length - read;
    if (unread > 0) count += unread;
  }
  return count;
};

function getDemoThreads(): MessageThread[] {
  return [
    {
      id: "thread-s1",
      studentName: "山田 花子",
      studentInitial: "山",
      studentAvatarColor: "hsl(25, 90%, 55%)",
      bookingId: "l1",
      createdAt: new Date().toISOString(),
      messages: [
        { id: "dm1", sender: "student", text: "明日のレッスンよろしくお願いします！フォアハンドを重点的にお願いしたいです。", time: "04/14 10:00" },
        { id: "dm2", sender: "coach", text: "承知しました！フォアハンドの基礎からしっかりやりましょう💪", time: "04/14 10:05" },
        // Booking confirmation card
        {
          id: "dm2b",
          sender: "coach",
          text: "ご予約が確定しました！\n\n📅 2026/04/20 14:00〜15:00\n💻 オンラインレッスン\n\n当日お会いできるのを楽しみにしています！何かご質問があればお気軽にどうぞ😊",
          time: "04/14 10:10",
          type: "booking_confirm",
          bookingDate: "2026/04/20",
          bookingTime: "14:00〜15:00",
          bookingType: "オンラインレッスン",
        },
        { id: "dm3", sender: "student", text: "ありがとうございます！楽しみにしています😊", time: "04/14 10:15" },
      ],
    },
    {
      id: "thread-s4",
      studentName: "中村 美咲",
      studentInitial: "中",
      studentAvatarColor: "hsl(0, 70%, 55%)",
      bookingId: "l4",
      createdAt: new Date().toISOString(),
      messages: [
        { id: "dm4", sender: "student", text: "オンラインレッスンの件ですが、Zoomで大丈夫ですか？", time: "04/13 18:00" },
        { id: "dm5", sender: "coach", text: "はい、Zoomで行います。開始10分前にリンクをお送りしますね。", time: "04/13 18:15" },
        // Booking confirmation
        {
          id: "dm5b",
          sender: "coach",
          text: "ご予約が確定しました！",
          time: "04/13 18:20",
          type: "booking_confirm",
          bookingDate: "2026/04/18",
          bookingTime: "10:00〜11:00",
          bookingType: "オンラインレッスン",
        },
        { id: "dm5c", sender: "student", text: "確認しました！ありがとうございます🙏", time: "04/13 18:25" },
        // Lesson link card (10 min before lesson)
        {
          id: "dm5d",
          sender: "coach",
          text: "オンラインレッスンの開始時間が近づきました。下のリンクから参加してください。",
          time: "04/14 14:50",
          type: "lesson_link",
          lessonId: "l4",
          lessonType: "オンラインレッスン",
          linkUrl: "/online-lesson?student=%E4%B8%AD%E6%9D%91+%E7%BE%8E%E5%92%B2&duration=50",
        },
      ],
    },
    {
      id: "thread-s6",
      studentName: "渡辺 優子",
      studentInitial: "渡",
      studentAvatarColor: "hsl(320, 60%, 50%)",
      bookingId: "l7",
      createdAt: new Date().toISOString(),
      messages: [
        // Review request from student
        {
          id: "dm6",
          sender: "student",
          text: "動画レビューをお願いします。バックハンドのフォームが気になっています。",
          time: "04/14 14:00",
          type: "review_request",
          reviewId: "l7",
          reviewTopic: "バックハンドのフォーム改善",
        },
        // Coach review reply
        {
          id: "dm6b",
          sender: "coach",
          text: "バックハンドのフォームを確認しました。\n\n全体的に良いフォームですが、インパクト時の手首の角度をもう少し固定すると安定感が増します。\n\n練習ドリルとして壁打ちで手首を意識してみてください💪",
          time: "04/14 15:30",
          type: "review_reply",
          reviewId: "l7",
          reviewTopic: "バックハンドのフォーム改善",
        },
        { id: "dm6c", sender: "student", text: "詳しいレビューありがとうございます！早速練習してみます！", time: "04/14 16:00" },
      ],
    },
    {
      id: "thread-staff",
      studentName: "PADEL BASE 事務局",
      studentInitial: "P",
      studentAvatarColor: "hsl(36, 100%, 46%)",
      bookingId: "",
      createdAt: new Date().toISOString(),
      messages: [
        { id: "dm7", sender: "student", text: "今月の報酬明細が確定しました。マイページの報酬管理からご確認ください。", time: "04/01 09:00" },
        { id: "dm7b", sender: "student", text: "新しいコーチガイドラインを公開しました。ご確認をお願いいたします。", time: "04/10 10:00" },
      ],
    },
  ];
}
