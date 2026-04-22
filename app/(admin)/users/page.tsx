"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Users, Mail, Phone, Star, Coins, TrendingUp } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStatusBadge, BookingBadge } from "@/components/status-badge";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { MEMBER_USERS, BOOKINGS, POINTS_LOGS, COUPONS } from "@/lib/mock-data";
import type { MemberUser, UserStatus, PointsLog } from "@/lib/types";
import { formatYen, formatDate, relativeTime } from "@/lib/utils";

const adjustSchema = z.object({
  delta: z.number().refine((n) => n !== 0, "0 は指定できません"),
  note: z.string().min(5, "調整理由は 5 文字以上で入力してください"),
});
type AdjustForm = z.infer<typeof adjustSchema>;

const suspendSchema = z.object({
  reason: z.string().min(5, "停止理由は 5 文字以上"),
});
type SuspendForm = z.infer<typeof suspendSchema>;

const POINT_EVENT_LABEL: Record<string, string> = {
  booking_earned: "予約獲得",
  coupon_redeemed: "クーポン利用",
  admin_adjust_add: "管理者加算",
  admin_adjust_deduct: "管理者減算",
  expired: "失効",
  signup_bonus: "登録ボーナス",
  review_bonus: "レビュー投稿",
};

export default function UsersPage() {
  const { items, update, hydrated } = useMockCrud<MemberUser>(MOCK_KEYS.members, MEMBER_USERS);
  const { items: pointsLogs, add: addPointLog } = useMockCrud<PointsLog>(
    MOCK_KEYS.pointsLogs,
    POINTS_LOGS
  );
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selected, setSelected] = useState<MemberUser | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const adjustForm = useForm<AdjustForm>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { delta: 0, note: "" },
  });

  const suspendForm = useForm<SuspendForm>({
    resolver: zodResolver(suspendSchema),
    defaultValues: { reason: "" },
  });

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((u) => u.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((u) => {
        if (statusFilter !== "all" && u.status !== statusFilter) return false;
        if (tagFilter !== "all" && !u.tags.includes(tagFilter)) return false;
        if (
          q &&
          !`${u.name}${u.email}${u.phone}`.toLowerCase().includes(q.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [items, q, statusFilter, tagFilter]);

  const kpi = useMemo(() => {
    const active = items.filter((u) => u.status === "active").length;
    const avgSpend =
      items.length > 0
        ? Math.round(items.reduce((s, u) => s + u.totalSpend, 0) / items.length)
        : 0;
    const vipCount = items.filter((u) => u.tags.includes("VIP")).length;
    return { active, total: items.length, avgSpend, vipCount };
  }, [items]);

  const userBookings = useMemo(() => {
    if (!selected) return [];
    return BOOKINGS.filter((b) => b.userId === selected.id).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [selected]);

  const userPoints = useMemo(() => {
    if (!selected) return [];
    return pointsLogs
      .filter((p) => p.userId === selected.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [selected, pointsLogs]);

  const userCoupons = useMemo(() => {
    if (!selected) return [];
    return COUPONS.filter(
      (c) =>
        c.status !== "expired" &&
        ((c.distributionMode === "whitelist" &&
          c.whitelistUserIds?.includes(selected.id)) ||
          c.distributionMode === "filter")
    );
  }, [selected]);

  const onAdjust = async (data: AdjustForm) => {
    if (!selected) return;
    await new Promise((r) => setTimeout(r, 400));
    const nextBalance = selected.points + data.delta;
    update(selected.id, { points: nextBalance });
    const log: PointsLog = {
      id: `pl-${Date.now()}`,
      userId: selected.id,
      userName: selected.name,
      eventType: data.delta > 0 ? "admin_adjust_add" : "admin_adjust_deduct",
      delta: data.delta,
      balance: nextBalance,
      note: data.note,
      operator: "LST プラットフォーム管理者",
      createdAt: new Date().toISOString(),
    };
    addPointLog(log);
    toast.success(`ポイントを ${data.delta > 0 ? "+" : ""}${data.delta} 調整しました`);
    adjustForm.reset({ delta: 0, note: "" });
    setAdjustOpen(false);
    setSelected({ ...selected, points: nextBalance });
  };

  const onSuspend = async (data: SuspendForm) => {
    if (!selected) return;
    await new Promise((r) => setTimeout(r, 400));
    update(selected.id, { status: "suspended", notes: data.reason });
    toast.success(`アカウントを停止しました：${selected.name}`);
    suspendForm.reset();
    setSuspendOpen(false);
    setSelected({ ...selected, status: "suspended", notes: data.reason });
  };

  const onRestore = () => {
    if (!selected) return;
    update(selected.id, { status: "active" });
    toast.success(`アカウントを復帰しました：${selected.name}`);
    setSelected({ ...selected, status: "active" });
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="会員管理"
      description="プラットフォーム全利用者の管理・ポイント調整・アカウント停止/復帰"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "会員管理" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">総会員数</div>
          <div className="text-2xl font-semibold mt-0.5">{kpi.total}</div>
          <div className="text-xs text-success mt-0.5">
            稼働中 {kpi.active} 名
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">VIP 会員</div>
          <div className="text-2xl font-semibold mt-0.5">{kpi.vipCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            累計 ¥50,000+ タグ付き
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">平均利用額</div>
          <div className="text-2xl font-semibold mt-0.5">
            {formatYen(kpi.avgSpend)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">1 会員あたり</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">認証待ち</div>
          <div className="text-2xl font-semibold mt-0.5">
            {items.filter((u) => u.status === "pending_verification").length}
          </div>
          <div className="text-xs text-warning mt-0.5">要対応</div>
        </div>
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="氏名 / メール / 電話で検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-60 h-8 text-xs"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">稼働中</SelectItem>
                <SelectItem value="suspended">停止中</SelectItem>
                <SelectItem value="pending_verification">認証待ち</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全タグ</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="該当する会員はいません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>会員</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>ポイント / XP</TableHead>
                <TableHead>累計</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div>{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.tags.length === 0 && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      {u.tags.map((t) => (
                        <Badge
                          key={t}
                          variant={
                            t === "VIP"
                              ? "default"
                              : t === "要注意"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Coins className="w-3 h-3 inline mr-1 text-warning" />
                      {u.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lv.{u.level} · XP {u.xp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatYen(u.totalSpend)}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.totalBookings} 件
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.lastLoginAt ? relativeTime(u.lastLoginAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(u)}
                    >
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 会員詳細ドロワー */}
      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent width="lg">
          {selected && (
            <>
              <DrawerHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle>{selected.name}</DrawerTitle>
                    <DrawerDescription>
                      会員 ID {selected.id} · 登録 {selected.registeredAt}
                    </DrawerDescription>
                  </div>
                  <UserStatusBadge status={selected.status} />
                </div>
              </DrawerHeader>
              <DrawerBody>
                <Tabs defaultValue="info">
                  <TabsList>
                    <TabsTrigger value="info">基本情報</TabsTrigger>
                    <TabsTrigger value="bookings">
                      予約履歴 <Badge variant="muted" className="ml-2">{userBookings.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="points">
                      ポイント履歴 <Badge variant="muted" className="ml-2">{userPoints.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="coupons">
                      保有クーポン <Badge variant="muted" className="ml-2">{userCoupons.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {selected.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {selected.phone}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <Coins className="w-4 h-4 mx-auto text-warning mb-1" />
                        <div className="text-lg font-semibold">
                          {selected.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ポイント
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <Star className="w-4 h-4 mx-auto text-primary mb-1" />
                        <div className="text-lg font-semibold">
                          Lv.{selected.level}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          XP {selected.xp}
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <TrendingUp className="w-4 h-4 mx-auto text-success mb-1" />
                        <div className="text-lg font-semibold">
                          {formatYen(selected.totalSpend)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          累計利用額
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <div className="text-lg font-semibold mt-1">
                          {selected.totalBookings}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          累計予約
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">
                        タグ
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.tags.length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            なし
                          </span>
                        ) : (
                          selected.tags.map((t) => (
                            <Badge
                              key={t}
                              variant={
                                t === "VIP"
                                  ? "default"
                                  : t === "要注意"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {t}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    {selected.notes && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1.5">
                          管理者メモ
                        </div>
                        <div className="text-sm bg-muted/40 rounded-md p-3">
                          {selected.notes}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      最終ログイン：
                      {selected.lastLoginAt
                        ? formatDate(selected.lastLoginAt, true)
                        : "未ログイン"}
                    </div>
                  </TabsContent>

                  <TabsContent value="bookings">
                    {userBookings.length === 0 ? (
                      <EmptyState title="予約履歴はありません" />
                    ) : (
                      <div className="divide-y border rounded-md">
                        {userBookings.slice(0, 20).map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {b.date} {b.startTime}-{b.endTime}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {b.venueName} ·{" "}
                                {b.type === "court"
                                  ? b.courtName
                                  : `コーチ：${b.coachName}`}{" "}
                                · {formatYen(b.price + (b.equipmentFee ?? 0))}
                              </div>
                            </div>
                            <BookingBadge status={b.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="points">
                    {userPoints.length === 0 ? (
                      <EmptyState title="ポイント履歴はありません" />
                    ) : (
                      <div className="divide-y border rounded-md">
                        {userPoints.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {POINT_EVENT_LABEL[p.eventType] ?? p.eventType}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(p.createdAt, true)}
                                {p.note && ` · ${p.note}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${
                                  p.delta > 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {p.delta > 0 ? "+" : ""}
                                {p.delta}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                残高 {p.balance.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="coupons">
                    {userCoupons.length === 0 ? (
                      <EmptyState title="保有クーポンはありません" />
                    ) : (
                      <div className="space-y-2">
                        {userCoupons.map((c) => (
                          <div
                            key={c.id}
                            className="border rounded-md p-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {c.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {c.discountType === "percent"
                                  ? `${c.discountValue}% OFF`
                                  : `${formatYen(c.discountValue)} OFF`}{" "}
                                · 有効期限 {c.expiresAt}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {c.distributionMode === "whitelist"
                                ? "個別配布"
                                : "条件配布"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  variant="outline"
                  onClick={() => setAdjustOpen(true)}
                >
                  <Coins className="w-4 h-4" />
                  ポイント調整
                </Button>
                {selected.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={() => setSuspendOpen(true)}
                  >
                    アカウント停止
                  </Button>
                )}
                {selected.status === "suspended" && (
                  <Button variant="success" onClick={onRestore}>
                    停止解除
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* ポイント調整 */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>ポイント調整</DialogTitle>
            <DialogDescription>
              {selected?.name} の現在残高：
              <strong>{selected?.points.toLocaleString()}</strong> ポイント
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={adjustForm.handleSubmit(onAdjust)}
            className="grid gap-3"
          >
            <div className="grid gap-1.5">
              <Label required>増減値（+ / -）</Label>
              <Input
                type="number"
                {...adjustForm.register("delta", { valueAsNumber: true })}
                placeholder="例：+500 / -200"
              />
              {adjustForm.formState.errors.delta && (
                <p className="text-xs text-destructive">
                  {adjustForm.formState.errors.delta.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>調整理由（ログに記録）</Label>
              <Textarea
                rows={3}
                {...adjustForm.register("note")}
                placeholder="例：キャンペーン補填、誤付与の修正"
              />
              {adjustForm.formState.errors.note && (
                <p className="text-xs text-destructive">
                  {adjustForm.formState.errors.note.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={adjustForm.formState.isSubmitting}>
                調整を確定
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* アカウント停止 */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>アカウント停止</DialogTitle>
            <DialogDescription>
              停止中の会員はログイン・予約不可。理由は管理者ログに記録されます。
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={suspendForm.handleSubmit(onSuspend)}
            className="grid gap-3"
          >
            <div className="grid gap-1.5">
              <Label required>停止理由</Label>
              <Textarea
                rows={3}
                {...suspendForm.register("reason")}
                placeholder="例：無断キャンセル 3 回、不適切な行動、等"
              />
              {suspendForm.formState.errors.reason && (
                <p className="text-xs text-destructive">
                  {suspendForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuspendOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={suspendForm.formState.isSubmitting}
              >
                停止を確定
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
