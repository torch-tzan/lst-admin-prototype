"use client";

import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOOKINGS, VENUES, COACHES, MEMBER_USERS, EARNINGS } from "@/lib/mock-data";
import { formatYen } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function VenueDashboard() {
  const { user } = useAuth();
  const venueId = user?.venueId;
  const venue = VENUES.find((v) => v.id === venueId);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const myBookings = BOOKINGS.filter((b) => b.venueId === venueId);
  const todayBookings = myBookings.filter((b) => b.date === today);
  const myMembers = MEMBER_USERS.filter((u) => u.status === "active");

  const todayRevenue = todayBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);

  // コーチ集計
  const myCoaches = COACHES.filter(
    (c) => c.status === "approved" && c.venueIds.includes(venueId ?? "")
  );
  const coachingRevenue = EARNINGS.filter(
    (e) =>
      e.venueId === venueId &&
      e.status !== "refunded" &&
      new Date(e.earnedAt).getMonth() === now.getMonth()
  ).reduce((s, e) => s + e.grossAmount, 0);

  // 直近の予約（10 件）
  const recentBookings = [...myBookings]
    .sort((a, b) =>
      (b.date + b.startTime).localeCompare(a.date + a.startTime)
    )
    .slice(0, 10);

  // 直近の売上（10 件）
  const recentSales = myBookings
    .filter((b) => b.status === "completed" || b.status === "confirmed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <PageShell title="ダッシュボード">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">
          {venue?.name} · {venue?.area} · 本日 {today}
        </div>
      </div>

      {/* メイン KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard label="本日の予約数" value={todayBookings.length.toString()} />
        <KpiCard label="会員数" value={myMembers.length.toLocaleString()} />
        <KpiCard label="本日の売上" value={formatYen(todayRevenue)} />
        <KpiCard label="稼働スタッフ" value="8" />
      </div>

      {/* サブ KPI（コーチ・ゲーム）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <EmojiKpi
          emoji="🎾"
          label="コーチング売上"
          value={formatYen(coachingRevenue + 850000)}
          sub="+18.5% 前月比"
          subClass="text-success"
        />
        <EmojiKpi
          emoji="🧑‍💼"
          label="活動中コーチ"
          value={`${myCoaches.length + 5}名`}
          sub="稼働率 85%"
          subClass="text-success"
        />
        <EmojiKpi
          emoji="🏆"
          label="今月の大会"
          value="5件"
          sub="参加者合計 156名"
          subClass="text-purple-600"
        />
        <EmojiKpi
          emoji="🎮"
          label="ゲーム参加者"
          value="892人"
          sub="+23% 前月比"
          subClass="text-purple-600"
        />
      </div>

      {/* 直近のデータ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 直近の予約 */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 font-semibold">直近の予約</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="pb-2 pr-3 font-medium">会員名</th>
                    <th className="pb-2 pr-3 font-medium">コート</th>
                    <th className="pb-2 pr-3 font-medium">日時</th>
                    <th className="pb-2 font-medium">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b last:border-b-0 hover:bg-muted/40"
                    >
                      <td className="py-2 pr-3">{b.userName}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {b.courtName ?? b.coachName ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {b.date.slice(5)} {b.startTime}
                      </td>
                      <td className="py-2">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            b.status === "confirmed" || b.status === "completed"
                              ? "text-success"
                              : b.status === "pending"
                              ? "text-warning"
                              : "text-muted-foreground"
                          )}
                        >
                          {b.status === "confirmed"
                            ? "確定"
                            : b.status === "pending"
                            ? "仮予約"
                            : b.status === "completed"
                            ? "完了"
                            : b.status === "cancelled"
                            ? "キャンセル"
                            : "処理中"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 直近の売上 */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 font-semibold">直近の売上</div>
            <div className="space-y-2">
              {recentSales.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-sm">{b.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.courtName
                        ? `${b.courtName} 予約`
                        : b.coachName
                        ? `${b.coachName} レッスン`
                        : "商品購入"}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatYen(b.price + (b.equipmentFee ?? 0))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-3xl font-bold tracking-tight mt-3">{value}</div>
      </CardContent>
    </Card>
  );
}

function EmojiKpi({
  emoji,
  label,
  value,
  sub,
  subClass,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  subClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{emoji}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
        <div className={cn("text-[10px] mt-1", subClass)}>{sub}</div>
      </CardContent>
    </Card>
  );
}
