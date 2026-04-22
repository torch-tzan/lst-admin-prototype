"use client";

import { PageShell, Section } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "@/components/bar-chart";
import {
  BOOKINGS,
  COACHES,
  VENUES,
  MEMBER_USERS,
  EARNINGS,
  COUPONS,
  ANNOUNCEMENTS,
} from "@/lib/mock-data";
import { formatYen, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LstDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // ── メイン KPI 計算 ─────────────────────────
  const thisMonthEarnings = EARNINGS.filter((e) => {
    const d = new Date(e.earnedAt);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      e.status !== "refunded"
    );
  });
  const thisMonthGMV = BOOKINGS.filter((b) => {
    const d = new Date(b.date);
    return (
      (b.status === "confirmed" || b.status === "completed") &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);
  const platformRevenue = thisMonthEarnings.reduce(
    (s, e) => s + e.platformFee,
    0
  );
  const activeVenues = VENUES.filter((v) => v.status === "active").length;
  const activeMembers = MEMBER_USERS.filter((u) => u.status === "active").length;

  // ── サブ KPI（コーチ・ゲーム）───────────────
  const coachingRevenue = thisMonthEarnings.reduce(
    (s, e) => s + e.grossAmount,
    0
  );
  const activeCoaches = COACHES.filter((c) => c.status === "approved").length;
  const pendingCoaches = COACHES.filter((c) => c.status === "pending").length;
  const todayBookings = BOOKINGS.filter((b) => b.date === today).length;
  const activeCoupons = COUPONS.filter((c) => c.status === "active").length;

  // ── 月次売上推移（過去 12 ヶ月のダミーデータ）──
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const label = `${m.getMonth() + 1}月`;
    const base = 8500000 + Math.sin(i * 0.7) * 1500000 + i * 220000;
    return {
      label,
      value: Math.round(base + Math.random() * 500000),
    };
  });

  // ── 企業別売上ランキング ───────────────────
  const venueRanking = VENUES.filter((v) => v.status === "active")
    .map((v) => {
      const revenue = BOOKINGS.filter(
        (b) =>
          b.venueId === v.id &&
          (b.status === "confirmed" || b.status === "completed")
      ).reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);
      // サンプル補強
      const boosted =
        v.id === "v1"
          ? revenue + 2400000
          : v.id === "v2"
          ? revenue + 1900000
          : revenue + 1300000;
      return { id: v.id, name: v.name, area: v.area, revenue: boosted };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const totalVenueRev = venueRanking.reduce((s, v) => s + v.revenue, 0);

  // ── 最近のアクティビティ ─────────────────
  const activities = [
    ...BOOKINGS.slice(0, 2).map((b) => ({
      at: b.createdAt,
      venue: b.venueName,
      content: `新規予約 ${b.courtName ?? b.coachName} ${b.startTime}-${b.endTime}`,
      status: "確定",
      statusVariant: "success" as const,
      amount: b.price + (b.equipmentFee ?? 0),
    })),
    {
      at: todayStr(0) + "T13:15:00",
      venue: "新宿BASE",
      content: "コートB メンテナンス完了",
      status: "完了",
      statusVariant: "success" as const,
      amount: null,
    },
    {
      at: todayStr(0) + "T12:00:00",
      venue: "横浜パデルセンター",
      content: "月額プラン契約更新",
      status: "更新済",
      statusVariant: "default" as const,
      amount: 50000,
    },
    {
      at: todayStr(0) + "T10:45:00",
      venue: "大阪なんばパデル",
      content: "スタッフアカウント追加",
      status: "処理中",
      statusVariant: "warning" as const,
      amount: null,
    },
    {
      at: todayStr(0) + "T09:30:00",
      venue: "名古屋パデルアリーナ",
      content: "決済手数料精算",
      status: "精算済",
      statusVariant: "success" as const,
      amount: 128000,
    },
    {
      at: todayStr(0) + "T09:00:00",
      venue: VENUES[0].name,
      content: "キャンペーン「春割」開始",
      status: "アクティブ",
      statusVariant: "default" as const,
      amount: null,
    },
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <PageShell title="ダッシュボード">
      {/* メイン KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard
          label="全企業 月間売上"
          value={formatYen(thisMonthGMV + 11500000)}
          delta={{ value: "前月比 +8.3%", positive: true }}
        />
        <KpiCard
          label="手数料収入（LST）"
          value={formatYen(platformRevenue + 1100000)}
          delta={{ value: "手数料率 10%", positive: true, blue: true }}
        />
        <KpiCard
          label="加盟店数"
          value={`${activeVenues + 22}店舗`}
          delta={{ value: "今月 +2店舗", positive: true }}
        />
        <KpiCard
          label="アクティブユーザー"
          value={`${(activeMembers + 3827).toLocaleString()}人`}
          delta={{ value: "前月比 +12.1%", positive: true }}
        />
      </div>

      {/* サブ KPI（コーチ・ゲーム系）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SubKpi
          dotColor="bg-green-500"
          label="コーチング売上"
          value={formatYen(coachingRevenue + 450000)}
          sub="手数料率 20%"
        />
        <SubKpi
          dotColor="bg-green-500"
          label="アクティブコーチ"
          value={`${activeCoaches + 21}名`}
          sub={`承認待ち ${pendingCoaches}名`}
        />
        <SubKpi
          dotColor="bg-purple-500"
          label="今月の大会"
          value="3件"
          sub="参加チーム 28"
        />
        <SubKpi
          dotColor="bg-purple-500"
          label="ゲーム参加者"
          value={`${(todayBookings * 12 + 420).toLocaleString()}人`}
          sub="前月比 +23.5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 月次売上チャート */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-1 font-semibold">
                月間売上推移（全企業）
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                過去 12 ヶ月
              </div>
              <BarChart
                data={monthlyTrend}
                height={220}
                valueFormat={(v) => formatYen(v)}
              />
            </CardContent>
          </Card>
        </div>

        {/* 企業別売上ランキング */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 font-semibold">企業別売上ランキング</div>
            <div className="space-y-3">
              {venueRanking.slice(0, 5).map((v, idx) => {
                const pct = totalVenueRev > 0
                  ? ((v.revenue / totalVenueRev) * 100).toFixed(1)
                  : "0";
                return (
                  <div key={v.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                        idx === 0
                          ? "bg-primary text-white"
                          : idx === 1
                          ? "bg-blue-500 text-white"
                          : idx === 2
                          ? "bg-blue-400 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{v.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium">
                        {formatYen(v.revenue)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {pct}%
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* 架空の追加店舗 */}
              {[
                { name: "名古屋パデルアリーナ", revenue: 1280000, pct: "10.0" },
              ].map((v, idx) => (
                <div key={idx} className="flex items-center gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-muted text-muted-foreground">
                    {venueRanking.length + idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{v.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium">
                      {formatYen(v.revenue)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {v.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近のアクティビティ */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 font-semibold">最近のアクティビティ</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-2 pr-4 font-medium">日時</th>
                  <th className="pb-2 pr-4 font-medium">企業</th>
                  <th className="pb-2 pr-4 font-medium">内容</th>
                  <th className="pb-2 pr-4 font-medium">ステータス</th>
                  <th className="pb-2 font-medium text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {activities.slice(0, 7).map((a, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                      {formatDate(a.at, true)}
                    </td>
                    <td className="py-2.5 pr-4">{a.venue}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {a.content}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={a.statusVariant}>{a.status}</Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      {a.amount ? formatYen(a.amount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ポイント統計 浮動カード */}
      <div className="fixed bottom-6 left-72 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 shadow-lg flex items-center gap-4 z-20">
        <div className="flex items-center gap-1.5">
          <span className="text-purple-600">◆</span>
          <span className="text-xs font-medium">ポイント統計（全加盟店）</span>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">総発行</div>
            <div className="font-semibold text-purple-700">12,800pt</div>
          </div>
          <div>
            <div className="text-muted-foreground">総利用</div>
            <div className="font-semibold text-purple-700">3,450pt</div>
          </div>
          <div>
            <div className="text-muted-foreground">残高合計</div>
            <div className="font-semibold text-green-600">9,350pt</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean; blue?: boolean };
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold tracking-tight mt-2">{value}</div>
        {delta && (
          <div
            className={cn(
              "text-xs mt-2",
              delta.blue
                ? "text-primary"
                : delta.positive
                ? "text-success"
                : "text-muted-foreground"
            )}
          >
            {delta.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubKpi({
  dotColor,
  label,
  value,
  sub,
}: {
  dotColor: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("w-2 h-2 rounded-full", dotColor)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function todayStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
