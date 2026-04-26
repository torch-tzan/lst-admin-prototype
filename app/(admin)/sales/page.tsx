"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatYen, cn } from "@/lib/utils";

/** 手動売上調整（現金売上、訂正分など）— localStorage 保存 */
type ManualAdjustment = {
  id: string;
  venueId: string;
  date: string; // YYYY-MM-DD
  amount: number; // 正＝売上加算、負＝減算
  category: "cash" | "correction" | "other";
  note: string;
  createdAt: string;
};
const ADJUSTMENT_KEY = "lst-mock-sales-adjustments-v1";

const LESSON_LABEL = { practice: "対面", online: "オンライン", video_review: "動画レビュー" };

export default function SalesPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"this-month" | "last-month" | "last-3-months" | "ytd">(
    "this-month"
  );
  const [venueFilter, setVenueFilter] = useState<string>("all");

  // 手動調整 state（localStorage 永続化）
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([]);
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    category: "cash" as "cash" | "correction" | "other",
    note: "",
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADJUSTMENT_KEY);
      if (raw) setAdjustments(JSON.parse(raw));
    } catch {}
  }, []);
  const persistAdjustments = (next: ManualAdjustment[]) => {
    setAdjustments(next);
    try {
      localStorage.setItem(ADJUSTMENT_KEY, JSON.stringify(next));
    } catch {}
  };

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
      // 企業管理者：コーチレッスンは学生↔コーチの直接取引のため、コート予約のみ集計
      if (user?.role === "venue-admin" && b.type !== "court") return false;
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

  // 期間内・スコープ内の手動調整
  const scopedAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      if (user?.role === "venue-admin" && a.venueId !== user.venueId) return false;
      if (venueFilter !== "all" && a.venueId !== venueFilter) return false;
      const d = new Date(a.date);
      if (period === "this-month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === "last-month") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
      }
      if (period === "last-3-months") {
        const ago = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return d >= ago;
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [adjustments, period, venueFilter, user]);
  const adjustmentTotal = scopedAdjustments.reduce((s, a) => s + a.amount, 0);

  // KPI
  const gmv =
    scopedBookings.reduce((s, b) => s + b.price + (b.equipmentFee ?? 0), 0) +
    adjustmentTotal;
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
          <Button
            size="sm"
            onClick={() => {
              setAdjForm({
                date: new Date().toISOString().slice(0, 10),
                amount: 0,
                category: "cash",
                note: "",
              });
              setAdjOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            売上手動調整
          </Button>
        </>
      }
    >
      {/* KPI */}
      <div className={cn("grid grid-cols-2 gap-3 mb-5", user?.role === "lst-admin" ? "md:grid-cols-5" : "md:grid-cols-3")}>
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

      <div className={cn("grid grid-cols-1 gap-4 mb-5", user?.role === "lst-admin" && "lg:grid-cols-2")}>
        {/* 企業別売上 */}
        <Section title={user?.role === "lst-admin" ? "企業別売上" : "自社売上"}>
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

        {/* レッスンタイプ別（LST のみ）*/}
        {user?.role === "lst-admin" && (
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
        )}
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

      {/* 手動調整明細 */}
      <Section
        title="手動売上調整"
        description="現金売上・訂正分など、自動集計に含まれない売上をここで手動追加"
      >
        {scopedAdjustments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            期間内の手動調整はありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>区分</TableHead>
                <TableHead>備考</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopedAdjustments
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">{a.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {a.category === "cash"
                          ? "現金売上"
                          : a.category === "correction"
                          ? "訂正"
                          : "その他"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.note}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        a.amount < 0 && "text-destructive"
                      )}
                    >
                      {a.amount >= 0 ? "+" : ""}
                      {formatYen(a.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("この調整を削除しますか？")) {
                            persistAdjustments(
                              adjustments.filter((x) => x.id !== a.id)
                            );
                            toast.success("削除しました");
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={3} className="text-right">
                  期間内合計
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    adjustmentTotal < 0 && "text-destructive"
                  )}
                >
                  {adjustmentTotal >= 0 ? "+" : ""}
                  {formatYen(adjustmentTotal)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 手動調整 dialog */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>売上手動調整</DialogTitle>
            <DialogDescription>
              現金決済の売上、計算ミスの訂正分など、システム自動集計に含まれない金額を手動で追加します。
              負の金額を入力すると減算されます。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>日付</Label>
                <Input
                  type="date"
                  value={adjForm.date}
                  onChange={(e) =>
                    setAdjForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>区分</Label>
                <Select
                  value={adjForm.category}
                  onValueChange={(v) =>
                    setAdjForm((f) => ({
                      ...f,
                      category: v as typeof adjForm.category,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">現金売上</SelectItem>
                    <SelectItem value="correction">訂正</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label required>金額（¥）</Label>
              <Input
                type="number"
                value={adjForm.amount}
                onChange={(e) =>
                  setAdjForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                placeholder="例：3000（減算は -3000）"
              />
              <p className="text-[10px] text-muted-foreground">
                正の数で売上加算、負の数で減算
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label required>備考</Label>
              <Textarea
                rows={3}
                value={adjForm.note}
                onChange={(e) =>
                  setAdjForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="例：4/22 飛び込み利用者の現金決済 3,000 円"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                if (!adjForm.amount || !adjForm.note) {
                  toast.error("金額と備考は必須です");
                  return;
                }
                const venueId =
                  user?.role === "venue-admin"
                    ? user.venueId ?? "v1"
                    : venueFilter !== "all"
                    ? venueFilter
                    : VENUES[0]?.id ?? "v1";
                const newItem: ManualAdjustment = {
                  id: `adj-${Date.now()}`,
                  venueId,
                  date: adjForm.date,
                  amount: adjForm.amount,
                  category: adjForm.category,
                  note: adjForm.note,
                  createdAt: new Date().toISOString(),
                };
                persistAdjustments([newItem, ...adjustments]);
                toast.success("売上調整を追加しました");
                setAdjOpen(false);
              }}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
