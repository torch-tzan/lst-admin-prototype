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

/**
 * ロール別ナビ構造。
 *
 * LST 運営管理者：プラットフォーム全体を俯瞰管理。
 * 企業管理者：自社コート・備品・スタッフ・予約のみ管理。
 *   コーチ・大会・ポイント・会員情報などプラットフォーム資産には関与しない。
 */
export const NAV_ITEMS: (NavItem & { roles: Role[] })[] = [
  // ── メイン（LST のみ）─────────────────────────
  { href: "/dashboard", label: "ダッシュボード", icon: "LayoutDashboard", section: "main", roles: ["lst-admin", "venue-admin"] },
  { href: "/users", label: "会員管理", icon: "UserPlus", section: "main", roles: ["lst-admin"] },
  { href: "/venues", label: "企業管理", icon: "Building2", section: "main", roles: ["lst-admin"] },
  { href: "/courts", label: "コート管理", icon: "LayoutGrid", section: "main", roles: ["lst-admin"] },
  { href: "/bookings", label: "予約管理", icon: "CalendarCheck", section: "main", roles: ["lst-admin"] },

  // ── 会員/アカウント（企業のみ ＝ 自社スタッフ招待）──
  { href: "/invites", label: "アカウント招待", icon: "UserPlus2", section: "account", roles: ["venue-admin"] },

  // ── 施設/予約（企業のみ）──────────────────────
  { href: "/courts", label: "コート管理", icon: "LayoutGrid", section: "facility", roles: ["venue-admin"] },
  { href: "/bookings", label: "予約管理", icon: "CalendarCheck", section: "facility", roles: ["venue-admin"] },
  { href: "/equipment", label: "備品レンタル", icon: "Package", section: "facility", roles: ["venue-admin"] },

  // ── 売上/決済 ────────────────────────────────
  { href: "/sales", label: "売上管理", icon: "TrendingUp", section: "finance", roles: ["lst-admin", "venue-admin"] },
  { href: "/payments", label: "支払い履歴", icon: "CreditCard", section: "finance", roles: ["lst-admin"] },

  // ── スタッフ/勤務（企業のみ）──────────────────
  { href: "/staff", label: "スタッフ管理", icon: "Users2", section: "staff", roles: ["venue-admin"] },
  { href: "/shifts", label: "シフト管理", icon: "CalendarDays", section: "staff", roles: ["venue-admin"] },

  // ── お知らせ/イベント（両方、企業は自社スコープ）────
  { href: "/announcements", label: "お知らせ配信", icon: "Megaphone", section: "announce", roles: ["lst-admin", "venue-admin"] },
  { href: "/campaigns", label: "キャンペーン・イベント管理", icon: "Sparkles", section: "announce", roles: ["lst-admin", "venue-admin"] },

  // ── システム ─────────────────────────────────
  { href: "/settings", label: "システム設定", icon: "Settings", section: "system", roles: ["lst-admin"] },
  { href: "/commission", label: "手数料設定", icon: "Percent", section: "system", roles: ["lst-admin"] },
  { href: "/accounts", label: "管理者アカウント", icon: "UserCog", section: "system", roles: ["lst-admin", "venue-admin"] },
  { href: "/roles", label: "権限・ロール", icon: "ShieldCheck", section: "system", roles: ["lst-admin"] },
  { href: "/audit-log", label: "監査ログ", icon: "History", section: "system", roles: ["lst-admin", "venue-admin"] },

  // ── コーチング／プラットフォーム特化（LST のみ）────
  // 企業はコーチ・大会・会員ポイントに関与しないため表示なし
  // ポイント管理は利用者 app 側機能のため後台では扱わない
  { href: "/coaches", label: "コーチ管理", icon: "UserCheck", section: "coaching", roles: ["lst-admin"] },
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
  coaching: "コーチング",
};
