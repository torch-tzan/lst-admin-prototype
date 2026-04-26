"use client";

import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { BOOKINGS, VENUES, STAFF, MEMBER_USERS } from "@/lib/mock-data";
import { formatYen, cn } from "@/lib/utils";

/**
 * 企業管理者ダッシュボード（2026-04-26 デザイン更新）
 *
 * 表示する KPI は以下 4 つのみ：
 * - 本日の予約数
 * - 会員数（自社拠点に登録した会員、プロトタイプでは全会員数を表示）
 * - 本日の売上（自社コート + 備品予約のみ）
 * - 稼働スタッフ
 *
 * コーチング売上 / 大会 / ゲーム参加者などプラットフォーム資産は表示しない。
 */
export function VenueDashboard() {
  const { user } = useAuth();
  const venueId = user?.venueId;
  const venue = VENUES.find((v) => v.id === venueId);
  const today = new Date().toISOString().slice(0, 10);

  // 企業の予約＝自社コートの予約のみ
  const myCourtBookings = BOOKINGS.filter(
    (b) => b.venueId === venueId && b.type === "court"
  );
  const todayBookings = myCourtBookings.filter((b) => b.date === today);

  const todayRevenue = todayBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);

  const activeStaff = STAFF.filter(
    (s) => s.venueId === venueId && s.status === "active"
  ).length;

  // 会員数（プロトタイプ：v1 では拠点フィルター未実装、全会員数を表示）
  const memberCount = MEMBER_USERS.filter((m) => m.status === "active").length;

  // 直近の予約（自社コート予約のみ、10 件）
  const recentBookings = [...myCourtBookings]
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
    .slice(0, 10);

  // 直近の売上（自社コート予約のみ、10 件）
  const recentSales = myCourtBookings
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

      {/* メイン KPI ─ 4 枚（Figma デザイン準拠）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="本日の予約数" value={todayBookings.length.toString()} />
        <KpiCard label="会員数" value={memberCount.toLocaleString()} />
        <KpiCard label="本日の売上" value={formatYen(todayRevenue)} />
        <KpiCard label="稼働スタッフ" value={activeStaff.toString()} />
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
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-xs text-muted-foreground"
                      >
                        予約はまだありません
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b last:border-b-0 hover:bg-muted/40"
                      >
                        <td className="py-2 pr-3">{b.userName}</td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {b.courtName ?? "—"}
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
                                : b.status === "reschedule_requested" ||
                                  b.status === "refund_requested"
                                ? "text-[hsl(38_92%_30%)]"
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
                              : b.status === "reschedule_requested"
                              ? "振替申請中"
                              : b.status === "refund_requested"
                              ? "返金申請中"
                              : "処理中"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
              {recentSales.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  売上データはまだありません
                </div>
              ) : (
                recentSales.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-sm">{b.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.courtName} 予約
                        {b.equipmentFee ? " + 備品レンタル" : ""}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatYen(b.price + (b.equipmentFee ?? 0))}
                    </div>
                  </div>
                ))
              )}
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
      <CardContent className="p-6">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-3xl font-bold tracking-tight mt-3">{value}</div>
      </CardContent>
    </Card>
  );
}
