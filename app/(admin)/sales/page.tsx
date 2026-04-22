"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Download } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart } from "@/components/bar-chart";
import { useAuth } from "@/lib/auth";
import { BOOKINGS, EARNINGS, VENUES, COACHES } from "@/lib/mock-data";
import { formatYen } from "@/lib/utils";

const LESSON_LABEL = { practice: "対面", online: "オンライン", video_review: "動画レビュー" };

export default function SalesPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"this-month" | "last-month" | "last-3-months" | "ytd">(
    "this-month"
  );
  const [venueFilter, setVenueFilter] = useState<string>("all");

  const now = new Date();

  const scopedEarnings = useMemo(() => {
    return EARNINGS.filter((e) => {
      if (e.status === "refunded") return false;
      if (user?.role === "venue-admin" && e.venueId !== user.venueId) return false;
      if (venueFilter !== "all" && e.venueId !== venueFilter) return false;
      const d = new Date(e.earnedAt);
      if (period === "this-month") {
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      }
      if (period === "last-month") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
        );
      }
      if (period === "last-3-months") {
        const ago = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return d >= ago;
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [period, venueFilter, user]);

  const scopedBookings = useMemo(() => {
    return BOOKINGS.filter((b) => {
      if (b.status !== "confirmed" && b.status !== "completed") return false;
      if (user?.role === "venue-admin" && b.venueId !== user.venueId) return false;
      if (venueFilter !== "all" && b.venueId !== venueFilter) return false;
      const d = new Date(b.date);
      if (period === "this-month") {
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      }
      if (period === "last-month") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
        );
      }
      if (period === "last-3-months") {
        const ago = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return d >= ago;
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [period, venueFilter, user]);

  // KPI
  const gmv = scopedBookings.reduce(
    (s, b) => s + b.price + (b.equipmentFee ?? 0),
    0
  );
  const platformFee = scopedEarnings.reduce((s, e) => s + e.platformFee, 0);
  const stripeFee = scopedEarnings.reduce((s, e) => s + e.stripeFee, 0);
  const coachEarn = scopedEarnings.reduce((s, e) => s + e.coachEarning, 0);
  // 企業側の売上（コート予約収益のみ、コーチレッスンは関与なし）
  const venueRevenue = scopedBookings
    .filter((b) => b.type === "court")
    .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);

  // 企業別内訳
  const venueBreakdown = VENUES.filter((v) => v.status === "active")
    .filter(
      (v) => user?.role === "lst-admin" || v.id === user?.venueId
    )
    .map((v) => {
      const rev = scopedBookings
        .filter((b) => b.venueId === v.id)
        .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);
      const cnt = scopedBookings.filter((b) => b.venueId === v.id).length;
      return { name: v.name, revenue: rev, count: cnt };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // コーチ別内訳（LST 側でもトップコーチを表示）
  const coachBreakdown = COACHES.filter((c) => c.status === "approved")
    .filter(
      (c) =>
        user?.role === "lst-admin" ||
        (user?.venueId && c.venueIds.includes(user.venueId))
    )
    .map((c) => {
      const rev = scopedEarnings
        .filter((e) => e.coachId === c.id)
        .reduce((s, e) => s + e.grossAmount, 0);
      const cnt = scopedEarnings.filter((e) => e.coachId === c.id).length;
      return { name: c.name, level: c.level, revenue: rev, count: cnt };
    })
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // 日別推移（過去 30 日）
  const dailyTrend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const rev = scopedBookings
      .filter((b) => b.date === dateStr)
      .reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0);
    return {
      label: i % 3 === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : "",
      value: rev + Math.random() * 300000 + 100000,
    };
  });

  // レッスンタイプ内訳
  const lessonBreakdown = (["practice", "online", "video_review"] as const).map(
    (t) => {
      const filtered = scopedEarnings.filter((e) => e.lessonType === t);
      return {
        label: LESSON_LABEL[t],
        count: filtered.length,
        revenue: filtered.reduce((s, e) => s + e.grossAmount, 0),
      };
    }
  );

  return (
    <PageShell
      title="売上管理"
      description="期間・企業・レッスンタイプ別の売上分析。手数料内訳を確認できます。"
      breadcrumbs={[{ label: "売上/決済" }, { label: "売上管理" }]}
      actions={
        <>
          {user?.role === "lst-admin" && (
            <Select value={venueFilter} onValueChange={setVenueFilter}>
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全企業</SelectItem>
                {VENUES.filter((v) => v.status === "active").map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">今月</SelectItem>
              <SelectItem value="last-month">先月</SelectItem>
              <SelectItem value="last-3-months">過去 3 ヶ月</SelectItem>
              <SelectItem value="ytd">年初来</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </>
      }
    >
      {/* KPI */}
      <div className={`grid grid-cols-2 md:grid-cols-${user?.role === "lst-admin" ? 5 : 3} gap-3 mb-5`}>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {user?.role === "lst-admin" ? "総売上（GMV）" : "自社売上"}
            </div>
            <div className="text-xl font-bold tracking-tight mt-2">
              {formatYen(gmv)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {scopedBookings.length} 件
            </div>
          </CardContent>
        </Card>
        {user?.role === "lst-admin" && (
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">プラットフォーム</div>
            <div className="text-xl font-bold text-primary tracking-tight mt-2">
              {formatYen(platformFee)}
            </div>
          </CardContent>
        </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {user?.role === "lst-admin" ? "コート予約売上" : "自社売上（コート＋備品）"}
            </div>
            <div className="text-xl font-bold text-success tracking-tight mt-2">
              {formatYen(venueRevenue)}
            </div>
          </CardContent>
        </Card>
        {user?.role === "lst-admin" && (
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">コーチ送金</div>
            <div className="text-xl font-bold tracking-tight mt-2">
              {formatYen(coachEarn)}
            </div>
          </CardContent>
        </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              {user?.role === "lst-admin" ? "Stripe 手数料" : "Stripe 手数料（控除済）"}
            </div>
            <div className="text-xl font-bold tracking-tight mt-2 text-muted-foreground">
              {formatYen(stripeFee)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 日次推移 */}
      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="font-semibold mb-1">日別売上推移</div>
          <div className="text-xs text-muted-foreground mb-4">過去 30 日</div>
          <BarChart
            data={dailyTrend}
            height={180}
            valueFormat={(v) => formatYen(Math.round(v))}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* 企業別売上 */}
        <Section title="企業別売上">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企業</TableHead>
                <TableHead>件数</TableHead>
                <TableHead className="text-right">売上</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venueBreakdown.map((v) => (
                <TableRow key={v.name}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.count} 件</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatYen(v.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {/* レッスンタイプ別 */}
        <Section title="レッスンタイプ別">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイプ</TableHead>
                <TableHead>件数</TableHead>
                <TableHead className="text-right">売上</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessonBreakdown.map((l) => (
                <TableRow key={l.label}>
                  <TableCell className="font-medium">{l.label}</TableCell>
                  <TableCell>{l.count} 件</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatYen(l.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      </div>

      {/* コーチ別売上 Top（LST only）*/}
      {user?.role === "lst-admin" && (
        <Section title="コーチ別売上 Top 10">
          {coachBreakdown.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              期間内のコーチレッスン売上はありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コーチ</TableHead>
                  <TableHead>レベル</TableHead>
                  <TableHead>件数</TableHead>
                  <TableHead className="text-right">売上</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coachBreakdown.slice(0, 10).map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.level} 級</TableCell>
                    <TableCell>{c.count} 件</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatYen(c.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Section>
      )}
    </PageShell>
  );
}
