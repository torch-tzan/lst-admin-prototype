"use client";

import { useRouter, usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/permissions";
import { VENUES } from "@/lib/mock-data";

export function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const current = NAV_ITEMS.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/dashboard" && pathname.startsWith(n.href + "/"))
  );

  const venue = VENUES.find((v) => v.id === user.venueId);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10 h-14 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          {current?.label ?? "ダッシュボード"}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 hover:bg-muted rounded-full"
          aria-label="通知"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="text-xs">
            <div className="font-medium">{user.name}</div>
            {venue && (
              <div className="text-muted-foreground">{venue.name}</div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          ログアウト
        </Button>
      </div>
    </header>
  );
}
