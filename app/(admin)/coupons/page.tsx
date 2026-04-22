"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Ticket, Users, Filter, Upload, Send, Play, Pause } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
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
import { CouponBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { COUPONS, MEMBER_USERS, VENUES } from "@/lib/mock-data";
import type {
  Coupon,
  CouponDistributionMode,
  CouponFilter,
  CouponStatus,
} from "@/lib/types";
import { formatYen, cn } from "@/lib/utils";

const schema = z.object({
  label: z.string().min(4, "タイトルは 4 文字以上").max(50, "タイトルは 50 文字以内"),
  description: z.string().min(10, "説明は 10 文字以上"),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().min(1, "割引は 1 以上"),
  minAmount: z.number().min(0),
  applicableTypes: z.array(z.enum(["court", "coach_lesson"])).min(1, "適用種別を選んでください"),
  expiresAt: z.string().min(1, "有効期限を指定してください"),
  distributionMode: z.enum(["filter", "whitelist"]),
  // filter 用
  activeWithinDays: z.number().optional(),
  minTotalSpend: z.number().optional(),
  newWithinDays: z.number().optional(),
  includeTags: z.array(z.string()).optional(),
  // whitelist 用
  whitelistUserIds: z.array(z.string()).optional(),
});
type FormData = z.infer<typeof schema>;

export default function CouponsPage() {
  const { user } = useAuth();
  const { items, add, update, hydrated } = useMockCrud<Coupon>(MOCK_KEYS.coupons, COUPONS);
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipientsPreview, setRecipientsPreview] = useState<Coupon | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      description: "",
      discountType: "percent",
      discountValue: 10,
      minAmount: 2000,
      applicableTypes: ["court"],
      expiresAt: "",
      distributionMode: "filter",
      activeWithinDays: 60,
      minTotalSpend: 0,
      newWithinDays: 0,
      includeTags: [],
      whitelistUserIds: [],
    },
  });

  // 場館 admin → scope 限定 venue
  const scopedItems = useMemo(() => {
    if (user?.role === "venue-admin") {
      return items.filter(
        (c) =>
          (c.scope === "venue" && c.venueId === user.venueId) ||
          c.scope === "platform"
      );
    }
    return items;
  }, [items, user]);

  const filtered = useMemo(() => {
    return scopedItems.filter(
      (c) => statusFilter === "all" || c.status === statusFilter
    );
  }, [scopedItems, statusFilter]);

  const distributionMode = form.watch("distributionMode");

  // 受信者数リアルタイム計算
  const calcRecipientsFromFilter = (filter: CouponFilter): string[] => {
    return MEMBER_USERS.filter((u) => {
      if (u.status !== "active") return false;
      if (filter.minTotalSpend && u.totalSpend < filter.minTotalSpend) return false;
      if (
        filter.activeWithinDays &&
        u.lastLoginAt &&
        Date.now() - new Date(u.lastLoginAt).getTime() >
          filter.activeWithinDays * 86400000
      )
        return false;
      if (filter.newWithinDays) {
        const days =
          (Date.now() - new Date(u.registeredAt).getTime()) / 86400000;
        if (days > filter.newWithinDays) return false;
      }
      if (filter.includeTags && filter.includeTags.length > 0) {
        if (!filter.includeTags.some((t) => u.tags.includes(t))) return false;
      }
      return true;
    }).map((u) => u.id);
  };

  const previewCount = useMemo(() => {
    const v = form.watch();
    if (v.distributionMode === "whitelist") {
      return (v.whitelistUserIds ?? []).length;
    }
    const filter: CouponFilter = {
      activeWithinDays: v.activeWithinDays || undefined,
      minTotalSpend: v.minTotalSpend || undefined,
      newWithinDays: v.newWithinDays || undefined,
      includeTags:
        v.includeTags && v.includeTags.length > 0 ? v.includeTags : undefined,
    };
    return calcRecipientsFromFilter(filter).length;
  }, [form.watch()]);

  const onSubmit = async (data: FormData, send: boolean) => {
    await new Promise((r) => setTimeout(r, 500));
    const filter: CouponFilter | undefined =
      data.distributionMode === "filter"
        ? {
            activeWithinDays: data.activeWithinDays || undefined,
            minTotalSpend: data.minTotalSpend || undefined,
            newWithinDays: data.newWithinDays || undefined,
            includeTags:
              data.includeTags && data.includeTags.length > 0
                ? data.includeTags
                : undefined,
          }
        : undefined;

    const recipientIds =
      data.distributionMode === "whitelist"
        ? data.whitelistUserIds ?? []
        : calcRecipientsFromFilter(filter!);

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      label: data.label,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minAmount: data.minAmount,
      scope: user?.role === "venue-admin" ? "venue" : "platform",
      venueId: user?.role === "venue-admin" ? user.venueId : undefined,
      applicableTypes: data.applicableTypes,
      distributionMode: data.distributionMode,
      filter,
      whitelistUserIds:
        data.distributionMode === "whitelist"
          ? data.whitelistUserIds
          : undefined,
      distributedCount: send ? recipientIds.length : 0,
      redeemedCount: 0,
      expiresAt: data.expiresAt,
      status: send ? "active" : "draft",
      createdBy: user?.name ?? "",
      createdAt: new Date().toISOString(),
      distributedAt: send ? new Date().toISOString() : undefined,
    };
    add(newCoupon);
    toast.success(
      send
        ? `${recipientIds.length} 名に配布しました：${data.label}`
        : `下書き保存しました：${data.label}`
    );
    form.reset();
    setDialogOpen(false);
  };

  const distributeDraft = (c: Coupon) => {
    const recipientIds =
      c.distributionMode === "whitelist"
        ? c.whitelistUserIds ?? []
        : calcRecipientsFromFilter(c.filter ?? {});
    update(c.id, {
      status: "active",
      distributedCount: recipientIds.length,
      distributedAt: new Date().toISOString(),
    });
    toast.success(`${recipientIds.length} 名に配布しました：${c.label}`);
  };

  const togglePause = (c: Coupon) => {
    const next: CouponStatus = c.status === "active" ? "paused" : "active";
    update(c.id, { status: next });
    toast.success(next === "active" ? "配布を再開しました" : "配布を一時停止しました");
  };

  if (!hydrated) return null;

  const kpi = {
    activeCount: scopedItems.filter((c) => c.status === "active").length,
    totalDistributed: scopedItems.reduce((s, c) => s + c.distributedCount, 0),
    totalRedeemed: scopedItems.reduce((s, c) => s + c.redeemedCount, 0),
    avgRedeemRate:
      scopedItems.reduce((s, c) => s + c.distributedCount, 0) > 0
        ? Math.round(
            (scopedItems.reduce((s, c) => s + c.redeemedCount, 0) /
              scopedItems.reduce((s, c) => s + c.distributedCount, 0)) *
              100
          )
        : 0,
  };

  return (
    <PageShell
      title="クーポン管理"
      description="条件絞り込み or ホワイトリスト方式で会員へクーポンを配布します（ユーザー側での領取機能はありません）"
      breadcrumbs={[
        {
          label: user?.role === "lst-admin" ? "メイン" : "コーチング/ゲーム",
        },
        { label: "クーポン管理" },
      ]}
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          新規クーポン
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">配布中クーポン</div>
          <div className="text-2xl font-semibold mt-0.5">{kpi.activeCount}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">累計配布枚数</div>
          <div className="text-2xl font-semibold mt-0.5">
            {kpi.totalDistributed.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">累計利用枚数</div>
          <div className="text-2xl font-semibold mt-0.5">
            {kpi.totalRedeemed.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">平均利用率</div>
          <div className="text-2xl font-semibold mt-0.5">
            {kpi.avgRedeemRate}%
          </div>
        </div>
      </div>

      <Section
        actions={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="active">配布中</SelectItem>
              <SelectItem value="paused">一時停止</SelectItem>
              <SelectItem value="expired">期限切れ</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="クーポンはまだありません"
            description="最初のクーポンを作成して会員に配布しましょう"
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" /> 新規クーポン
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>クーポン</TableHead>
                <TableHead>割引</TableHead>
                <TableHead>範囲</TableHead>
                <TableHead>配布方式</TableHead>
                <TableHead>配布 / 利用</TableHead>
                <TableHead>有効期限</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const redeemRate =
                  c.distributedCount > 0
                    ? Math.round((c.redeemedCount / c.distributedCount) * 100)
                    : 0;
                const venue =
                  c.venueId && VENUES.find((v) => v.id === c.venueId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div>{c.label}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {c.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {c.discountType === "percent"
                          ? `${c.discountValue}%`
                          : formatYen(c.discountValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatYen(c.minAmount)}+
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.scope === "platform" ? (
                        <Badge variant="default">プラットフォーム</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {venue ? venue.name : "企業"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {c.distributionMode === "filter" ? (
                          <>
                            <Filter className="w-3.5 h-3.5" /> 条件絞り込み
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" /> ホワイトリスト
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {c.distributedCount} / {c.redeemedCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        利用率 {redeemRate}%
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.expiresAt}
                    </TableCell>
                    <TableCell>
                      <CouponBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecipientsPreview(c)}
                        >
                          受信者
                        </Button>
                        {c.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => distributeDraft(c)}
                          >
                            <Send className="w-3.5 h-3.5" /> 配布
                          </Button>
                        )}
                        {(c.status === "active" || c.status === "paused") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePause(c)}
                          >
                            {c.status === "active" ? (
                              <><Pause className="w-3.5 h-3.5" />停止</>
                            ) : (
                              <><Play className="w-3.5 h-3.5" />再開</>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 新規クーポン */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>新規クーポン配布</DialogTitle>
            <DialogDescription>
              条件で絞り込むか、特定会員リストに配布します。作成後は下書き保存 or 即時配布を選べます。
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>クーポン名</Label>
              <Input {...form.register("label")} placeholder="例：VIP 感謝クーポン" />
              {form.formState.errors.label && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>説明</Label>
              <Textarea
                rows={2}
                {...form.register("description")}
                placeholder="例：累計 ¥50,000 以上ご利用の VIP 会員へ 10% 割引"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label required>割引タイプ</Label>
                <Select
                  value={form.watch("discountType")}
                  onValueChange={(v) =>
                    form.setValue("discountType", v as "percent" | "fixed")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">パーセント (%)</SelectItem>
                    <SelectItem value="fixed">固定額 (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label required>割引値</Label>
                <Input
                  type="number"
                  min={1}
                  {...form.register("discountValue", { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>最低利用額 (¥)</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("minAmount", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label required>適用予約種別</Label>
              <div className="flex gap-2">
                {(["court", "coach_lesson"] as const).map((t) => {
                  const selected = form.watch("applicableTypes").includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const cur = form.watch("applicableTypes");
                        form.setValue(
                          "applicableTypes",
                          selected
                            ? cur.filter((x) => x !== t)
                            : [...cur, t]
                        );
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-sm",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      )}
                    >
                      {t === "court" ? "コート予約" : "コーチレッスン"}
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.applicableTypes && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.applicableTypes.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label required>有効期限</Label>
              <Input type="date" {...form.register("expiresAt")} />
              {form.formState.errors.expiresAt && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.expiresAt.message}
                </p>
              )}
            </div>

            {/* 配布方式 */}
            <div className="border rounded-md p-4 bg-muted/20">
              <div className="flex items-center gap-4 mb-3">
                <Label>配布方式</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => form.setValue("distributionMode", "filter")}
                    className={cn(
                      "px-3 py-1.5 rounded-md border text-sm flex items-center gap-1.5",
                      distributionMode === "filter"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    条件絞り込み
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue("distributionMode", "whitelist")
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-md border text-sm flex items-center gap-1.5",
                      distributionMode === "whitelist"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    ホワイトリスト
                  </button>
                </div>
              </div>

              {distributionMode === "filter" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>最終ログインから（日以内）</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="例：30（空白で無効化）"
                      {...form.register("activeWithinDays", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>最低累計利用額 (¥)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="例：50000"
                      {...form.register("minTotalSpend", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>新規登録（日以内）</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="例：30"
                      {...form.register("newWithinDays", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>タグ指定（OR 条件）</Label>
                    <div className="flex flex-wrap gap-1">
                      {["VIP", "常連", "新規", "女性向け", "大会参加"].map(
                        (tag) => {
                          const selected = (
                            form.watch("includeTags") ?? []
                          ).includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const cur = form.watch("includeTags") ?? [];
                                form.setValue(
                                  "includeTags",
                                  selected
                                    ? cur.filter((x) => x !== tag)
                                    : [...cur, tag]
                                );
                              }}
                              className={cn(
                                "px-2 py-1 rounded border text-xs",
                                selected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-input"
                              )}
                            >
                              {tag}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>対象会員を選択（複数選択可）</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md bg-background">
                    {MEMBER_USERS.filter((u) => u.status === "active").map(
                      (u) => {
                        const selected = (
                          form.watch("whitelistUserIds") ?? []
                        ).includes(u.id);
                        return (
                          <label
                            key={u.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/40 border-b last:border-b-0",
                              selected && "bg-primary/5"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {
                                const cur = form.watch("whitelistUserIds") ?? [];
                                form.setValue(
                                  "whitelistUserIds",
                                  selected
                                    ? cur.filter((x) => x !== u.id)
                                    : [...cur, u.id]
                                );
                              }}
                            />
                            <span className="text-sm font-medium">
                              {u.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {u.email}
                            </span>
                            <div className="ml-auto flex gap-1">
                              {u.tags.slice(0, 2).map((t) => (
                                <Badge key={t} variant="secondary">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div className="text-sm">
                  <strong>{previewCount}</strong> 名が配布対象
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit((d) => onSubmit(d, false))}
              >
                下書き保存
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit((d) => onSubmit(d, true))}
                loading={form.formState.isSubmitting}
                disabled={previewCount === 0}
              >
                <Send className="w-4 h-4" />
                即時配布
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 受信者プレビュー */}
      <Dialog
        open={!!recipientsPreview}
        onOpenChange={(o) => !o && setRecipientsPreview(null)}
      >
        <DialogContent size="md">
          {recipientsPreview && (
            <>
              <DialogHeader>
                <DialogTitle>{recipientsPreview.label} の受信者</DialogTitle>
                <DialogDescription>
                  配布済 {recipientsPreview.distributedCount} 名 · 利用済{" "}
                  {recipientsPreview.redeemedCount} 名
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm">
                {recipientsPreview.distributionMode === "whitelist" ? (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      ホワイトリスト方式（{recipientsPreview.whitelistUserIds?.length ?? 0} 名指定）
                    </div>
                    {(recipientsPreview.whitelistUserIds ?? []).map((id) => {
                      const u = MEMBER_USERS.find((x) => x.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between py-1 border-b last:border-b-0"
                        >
                          <span>{u?.name ?? id}</span>
                          <span className="text-xs text-muted-foreground">
                            {u?.email}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      絞り込み条件
                    </div>
                    <div className="space-y-1 bg-muted/40 rounded p-3">
                      {recipientsPreview.filter?.activeWithinDays && (
                        <div>
                          · 最終ログイン{" "}
                          {recipientsPreview.filter.activeWithinDays} 日以内
                        </div>
                      )}
                      {recipientsPreview.filter?.minTotalSpend && (
                        <div>
                          · 累計利用額{" "}
                          {formatYen(recipientsPreview.filter.minTotalSpend)}+
                        </div>
                      )}
                      {recipientsPreview.filter?.newWithinDays && (
                        <div>
                          · 登録{recipientsPreview.filter.newWithinDays}日以内
                        </div>
                      )}
                      {recipientsPreview.filter?.includeTags &&
                        recipientsPreview.filter.includeTags.length > 0 && (
                          <div>
                            · タグ：
                            {recipientsPreview.filter.includeTags.join(" / ")}
                          </div>
                        )}
                      {(!recipientsPreview.filter ||
                        Object.keys(recipientsPreview.filter).length === 0) && (
                        <div>· 全会員</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRecipientsPreview(null)}
                >
                  閉じる
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
