"use client";

import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { BOOKINGS, VENUES, COURTS, EQUIPMENT, STAFF } from "@/lib/mock-data";
import { formatYen } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * 企業管理者ダッシュボード
 *
 * 企業が関与するのは 以下のみ：
 * - 自社のコート・備品の予約収益
 * - 自社のスタッフ・シフト
 *
 * 企業は関与しない（表示しない）：
 * - コーチ・コーチレッスン売上（コーチはプラットフォーム所属、レッスンは学生↔コーチの直接取引）
 * - 大会・ゲーム（プラットフォーム主催）
 * - 会員情報（プラットフォームの顧客データ）
 */
export function VenueDashboard() {
  const { user } = useAuth();
  const venueId = user?.venueId;
  const venue = VENUES.find((v) => v.id === venueId);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // 企業の予約＝自社コートの予約のみ（コーチレッスンは企業と関係なし）
  const myCourtBookings = BOOKINGS.filter(
    (b) => b.venueId === venueId && b.type === "court"
  );
  const todayBookings = myCourtBookings.filter((b) => b.date === today);

  const todayRevenue = todayBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);

  // 今月の売上
  const monthlyRevenue = myCourtBookings
    .filter((b) => {
      if (b.status !== "confirmed" && b.status !== "completed") return false;
      const d = new Date(b.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);

  // コート稼働状況
  const myCourts = COURTS.filter((c) => c.venueId === venueId);
  const activeCourts = myCourts.filter((c) => c.active).length;

  // 要対応件数
  const pendingActions = myCourtBookings.filter(
    (b) => b.status === "reschedule_requested" || b.status === "refund_requested"
  ).length;

  // スタッフ
  const activeStaff = STAFF.filter(
    (s) => s.venueId === venueId && s.status === "active"
  ).length;

  // 備品在庫警告
  const lowStockEquipment = EQUIPMENT.filter(
    (e) => e.venueId === venueId && e.active && e.stock < 5
  ).length;

  // 直近の予約（自社コート予約のみ、10 件）
  const recentBookings = [...myCourtBookings]
    .sort(
      (a, b) =>
        (b.date + b.startTime).localeCompare(a.date + a.startTime)
    )
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

      {/* メイン KPI（自社コート運営の数値のみ）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard
          label="本日の予約数"
          value={todayBookings.length.toString()}
          sub={`確定 ${
            todayBookings.filter((b) => b.status === "confirmed").length
          } 件`}
        />
        <KpiCard
          label="本日の売上"
          value={formatYen(todayRevenue)}
          sub="コート + 備品"
        />
        <KpiCard
          label="今月の売上"
          value={formatYen(monthlyRevenue)}
          sub={`${
            myCourtBookings.filter((b) => {
              const d = new Date(b.date);
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length
          } 件の予約`}
        />
        <KpiCard
          label="要対応"
          value={pendingActions.toString()}
          sub="振替 / 返金申請"
          highlight={pendingActions > 0}
        />
      </div>

      {/* サブ KPI（運営管理の数値）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SubKpi
          label="稼働コート"
          value={`${activeCourts} / ${myCourts.length}`}
          sub={`${myCourts.length - activeCourts} コート停止中`}
        />
        <SubKpi
          label="稼働スタッフ"
          value={`${activeStaff}名`}
          sub="シフト管理へ"
        />
        <SubKpi
          label="備品在庫警告"
          value={`${lowStockEquipment}件`}
          sub="在庫 5 未満"
          highlight={lowStockEquipment > 0}
        />
        <SubKpi
          label="今月の予約件数"
          value={myCourtBookings
            .filter((b) => {
              const d = new Date(b.date);
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            })
            .length.toString()}
          sub="自社コート予約"
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
                    <th className="pb-2 pr-3 font-medium">利用者</th>
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

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-warning/60 bg-warning/5")}>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            "text-3xl font-bold tracking-tight mt-3",
            highlight && "text-warning"
          )}
        >
          {value}
        </div>
        {sub && (
          <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        )}
      </CardContent>
    </Card>
  );
}

function SubKpi({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-warning/60 bg-warning/5")}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            "text-xl font-bold tracking-tight mt-1",
            highlight && "text-warning"
          )}
        >
          {value}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
