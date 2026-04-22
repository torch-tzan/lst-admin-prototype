"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNavFor, SECTION_LABELS, NavSection } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  UserPlus,
  UserPlus2,
  Users,
  Users2,
  Megaphone,
  Sparkles,
  CalendarCheck,
  CalendarDays,
  LayoutGrid,
  Package,
  TrendingUp,
  CreditCard,
  Settings,
  Percent,
  Ticket,
  Star,
  UserCog,
  ShieldCheck,
  History,
  type LucideIcon,
} from "lucide-react";
import { VENUES } from "@/lib/mock-data";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  UserCheck,
  UserPlus,
  UserPlus2,
  Users,
  Users2,
  Megaphone,
  Sparkles,
  CalendarCheck,
  CalendarDays,
  LayoutGrid,
  Package,
  TrendingUp,
  CreditCard,
  Settings,
  Percent,
  Ticket,
  Star,
  UserCog,
  ShieldCheck,
  History,
};

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const nav = getNavFor(user);
  const sections = Array.from(new Set(nav.map((n) => n.section))) as NavSection[];

  const logoLabel = user.role === "lst-admin" ? "LST 運営管理" : "ADMIN";

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              {user.role === "lst-admin" ? "L" : "A"}
            </span>
          </div>
          <div className="font-bold text-white tracking-wide">
            {logoLabel}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {sections.map((section) => {
          const items = nav.filter((n) => n.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="mb-5">
              <div className="px-6 mb-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                {SECTION_LABELS[section]}
              </div>
              {items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={`${section}-${item.href}`}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/15 text-white font-medium border-l-2 border-primary"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function CurrentVenueLabel() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "lst-admin") return <span>運営管理者</span>;
  const venue = VENUES.find((v) => v.id === user.venueId);
  return <span>{venue?.name ?? "企業管理者"}</span>;
}
