import type { AdminUser, Role } from "./types";

export type NavSection =
  | "main"
  | "account"
  | "facility"
  | "finance"
  | "staff"
  | "announce"
  | "system"
  | "coaching";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: NavSection;
}

// 設計師版ナビ構造（ロール認識）
export const NAV_ITEMS: (NavItem & { roles: Role[] })[] = [
  // ── メイン（LST）──────────────────────────────
  { href: "/dashboard", label: "ダッシュボード", icon: "LayoutDashboard", section: "main", roles: ["lst-admin", "venue-admin"] },
  { href: "/users", label: "会員管理", icon: "UserPlus", section: "main", roles: ["lst-admin"] },
  { href: "/venues", label: "企業管理", icon: "Building2", section: "main", roles: ["lst-admin"] },
  { href: "/courts", label: "コート管理", icon: "LayoutGrid", section: "main", roles: ["lst-admin"] },
  { href: "/bookings", label: "予約管理", icon: "CalendarCheck", section: "main", roles: ["lst-admin"] },

  // ── 会員/アカウント（企業）────────────────────
  { href: "/users", label: "会員管理", icon: "UserPlus", section: "account", roles: ["venue-admin"] },
  { href: "/invites", label: "アカウント招待", icon: "UserPlus2", section: "account", roles: ["venue-admin"] },

  // ── 施設/予約（企業）──────────────────────────
  { href: "/courts", label: "コート管理", icon: "LayoutGrid", section: "facility", roles: ["venue-admin"] },
  { href: "/bookings", label: "予約管理", icon: "CalendarCheck", section: "facility", roles: ["venue-admin"] },
  { href: "/equipment", label: "備品レンタル", icon: "Package", section: "facility", roles: ["venue-admin"] },

  // ── 売上/決済（両方）──────────────────────────
  { href: "/sales", label: "売上管理", icon: "TrendingUp", section: "finance", roles: ["lst-admin", "venue-admin"] },
  { href: "/payments", label: "支払い履歴", icon: "CreditCard", section: "finance", roles: ["lst-admin"] },

  // ── スタッフ/勤務（企業）──────────────────────
  { href: "/staff", label: "スタッフ管理", icon: "Users2", section: "staff", roles: ["venue-admin"] },
  { href: "/shifts", label: "シフト管理", icon: "CalendarDays", section: "staff", roles: ["venue-admin"] },

  // ── お知らせ/イベント（両方）──────────────────
  { href: "/announcements", label: "お知らせ配信", icon: "Megaphone", section: "announce", roles: ["lst-admin", "venue-admin"] },
  { href: "/campaigns", label: "キャンペーン・イベント管理", icon: "Sparkles", section: "announce", roles: ["lst-admin", "venue-admin"] },

  // ── システム（両方の role、ただし LST 側が多い）─
  { href: "/settings", label: "システム設定", icon: "Settings", section: "system", roles: ["lst-admin"] },
  { href: "/commission", label: "手数料設定", icon: "Percent", section: "system", roles: ["lst-admin"] },
  { href: "/accounts", label: "管理者アカウント", icon: "UserCog", section: "system", roles: ["lst-admin", "venue-admin"] },
  { href: "/roles", label: "権限・ロール", icon: "ShieldCheck", section: "system", roles: ["lst-admin"] },
  { href: "/audit-log", label: "監査ログ", icon: "History", section: "system", roles: ["lst-admin", "venue-admin"] },

  // ── コーチング/ゲーム（両方）──────────────────
  { href: "/coaches", label: "コーチ管理", icon: "UserCheck", section: "coaching", roles: ["lst-admin"] },
  { href: "/coupons", label: "クーポン管理", icon: "Ticket", section: "coaching", roles: ["lst-admin", "venue-admin"] },
  { href: "/points", label: "ポイント管理", icon: "Star", section: "coaching", roles: ["lst-admin"] },
];

export function getNavFor(user: AdminUser | null): NavItem[] {
  if (!user) return [];
  // 重複除去（同じ href が両ロールに出現する場合、最初の一つを採用）
  const seen = new Set<string>();
  const result: NavItem[] = [];
  for (const it of NAV_ITEMS) {
    if (!it.roles.includes(user.role)) continue;
    if (seen.has(it.href)) continue;
    seen.add(it.href);
    result.push(it);
  }
  return result;
}

export function canAccess(user: AdminUser | null, path: string): boolean {
  if (!user) return false;
  const item = NAV_ITEMS.find((it) => path.startsWith(it.href));
  if (!item) return true;
  return item.roles.includes(user.role);
}

export function scopedVenueIds(user: AdminUser | null, allVenueIds: string[]): string[] {
  if (!user) return [];
  if (user.role === "lst-admin") return allVenueIds;
  return user.venueId ? [user.venueId] : [];
}

export function isScopedVenue(user: AdminUser | null, venueId: string): boolean {
  if (!user) return false;
  if (user.role === "lst-admin") return true;
  return user.venueId === venueId;
}

export const SECTION_LABELS: Record<NavSection, string> = {
  main: "メイン",
  account: "会員/アカウント",
  facility: "施設/予約",
  finance: "売上/決済",
  staff: "スタッフ/勤務",
  announce: "お知らせ/イベント",
  system: "システム",
  coaching: "コーチング/ゲーム",
};
