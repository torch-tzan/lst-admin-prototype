import { useState, useEffect } from "react";
import AnimatedTabs from "@/components/AnimatedTabs";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { Separator } from "@/components/ui/separator";
import { Bell, CalendarCheck, CalendarX, Play, CheckCircle2, RefreshCw, XCircle, Video, Star } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  seedReviewNotifications,
  type PushNotification,
} from "@/lib/notificationStore";

const ICON_MAP: Record<PushNotification["type"], { icon: React.ElementType; color: string }> = {
  booking_confirmed: { icon: CalendarCheck, color: "text-available" },
  booking_rejected: { icon: XCircle, color: "text-destructive" },
  lesson_started: { icon: Play, color: "text-available" },
  lesson_completed: { icon: CheckCircle2, color: "text-primary" },
  change_approved: { icon: RefreshCw, color: "text-available" },
  change_rejected: { icon: XCircle, color: "text-destructive" },
  booking_cancelled: { icon: CalendarX, color: "text-muted-foreground" },
  online_link: { icon: Video, color: "text-primary" },
  review_request: { icon: Star, color: "text-accent-yellow" },
  review_overdue: { icon: CalendarX, color: "text-destructive" },
};

interface SystemNotification {
  id: string;
  title: string;
  summary: string;
  date: string;
  read: boolean;
  isSystem: true;
}

const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "sys-1",
    title: "春の新規登録キャンペーン！",
    summary: "今なら新規登録で500ポイントプレゼント。4月30日まで。",
    date: "2026/04/14",
    read: false,
    isSystem: true,
  },
  {
    id: "sys-2",
    title: "ポイント付与のお知らせ",
    summary: "予約利用によるポイントが付与されました。+3pt",
    date: "2026/04/12",
    read: true,
    isSystem: true,
  },
  {
    id: "sys-3",
    title: "システムメンテナンスのお知らせ",
    summary: "4月20日 2:00〜5:00にメンテナンスを実施します。",
    date: "2026/04/10",
    read: true,
    isSystem: true,
  },
];

type Tab = "all" | "booking" | "system";

const Notifications = () => {
  const navigate = useNavigate();
  const [pushNotifs, setPushNotifs] = useState<PushNotification[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    seedReviewNotifications();
    setPushNotifs(getNotifications());
  }, []);

  const hasUnread = pushNotifs.some((n) => !n.read) || SYSTEM_NOTIFICATIONS.some((n) => !n.read);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setPushNotifs(getNotifications());
  };

  const handlePushClick = (n: PushNotification) => {
    markNotificationRead(n.id);
    setPushNotifs(getNotifications());
    if (n.type === "review_request" && n.coachName) {
      navigate(`/review/submit?coach=${encodeURIComponent(n.coachName)}&bookingId=${n.bookingId || ""}`);
    } else if (n.bookingId) {
      navigate(`/booking/detail/${n.bookingId}`);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const filteredPush = activeTab === "system" ? [] : pushNotifs;
  const filteredSystem = activeTab === "booking" ? [] : SYSTEM_NOTIFICATIONS;

  // Merge and sort by date
  type DisplayItem =
    | { kind: "push"; data: PushNotification }
    | { kind: "system"; data: SystemNotification };

  const items: DisplayItem[] = [
    ...filteredPush.map((p) => ({ kind: "push" as const, data: p })),
    ...filteredSystem.map((s) => ({ kind: "system" as const, data: s })),
  ].sort((a, b) => {
    const dateA = a.kind === "push" ? new Date(a.data.createdAt).getTime() : new Date(a.data.date.replace(/\//g, "-")).getTime();
    const dateB = b.kind === "push" ? new Date(b.data.createdAt).getTime() : new Date(b.data.date.replace(/\//g, "-")).getTime();
    return dateB - dateA;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "booking", label: "予約・レッスン" },
    { key: "system", label: "お知らせ" },
  ];

  return (
    <InnerPageLayout
      title="通知"
      rightAction={
        hasUnread ? (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            すべて既読
          </button>
        ) : undefined
      }
    >
      {/* Tabs */}
      <div className="-mx-[20px] -mt-3 mb-4">
        <AnimatedTabs
          tabs={tabs.map((t) => ({
            key: t.key,
            label: t.label,
            badge: t.key === "booking" ? pushNotifs.filter((n) => !n.read).length : undefined,
          }))}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as Tab)}
        />
      </div>

      <div className="-mx-[20px] -mt-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 gap-3">
            <Bell className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">通知はありません</p>
          </div>
        ) : (
          items.map((item, i) => {
            if (item.kind === "push") {
              const n = item.data;
              const iconCfg = ICON_MAP[n.type];
              const Icon = iconCfg.icon;
              return (
                <div key={n.id}>
                  <button
                    onClick={() => handlePushClick(n)}
                    className={`w-full flex items-start gap-3 px-[20px] py-4 text-left hover:bg-muted/50 transition-colors ${
                      !n.read ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${iconCfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />}
                        <p className={`text-sm truncate ${!n.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatTime(n.createdAt)}</p>
                    </div>
                  </button>
                  {i < items.length - 1 && <Separator />}
                </div>
              );
            } else {
              const n = item.data;
              return (
                <div key={n.id}>
                  <button
                    onClick={() => navigate(`/notifications/${n.id}`)}
                    className={`w-full flex items-start gap-3 px-[20px] py-4 text-left hover:bg-muted/50 transition-colors ${
                      !n.read ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />}
                        <p className={`text-sm truncate ${!n.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">{n.date}</p>
                    </div>
                  </button>
                  {i < items.length - 1 && <Separator />}
                </div>
              );
            }
          })
        )}
      </div>
    </InnerPageLayout>
  );
};

export default Notifications;
