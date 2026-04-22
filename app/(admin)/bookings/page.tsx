"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Search, CalendarCheck } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { BOOKINGS } from "@/lib/mock-data";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatYen } from "@/lib/utils";
import { isScopedVenue } from "@/lib/permissions";

const refundSchema = z.object({
  amount: z.number().min(0, "金額は 0 以上"),
  reason: z.string().min(5, "返金理由は 5 文字以上"),
});
type RefundForm = z.infer<typeof refundSchema>;

export default function BookingsPage() {
  const { user } = useAuth();
  const { items, update, hydrated } = useMockCrud<Booking>(MOCK_KEYS.bookings, BOOKINGS);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "past">("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const form = useForm<RefundForm>({
    resolver: zodResolver(refundSchema),
    defaultValues: { amount: 0, reason: "" },
  });

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return items
      .filter((b) => isScopedVenue(user, b.venueId))
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;

        const d = b.date;
        if (dateFilter === "today" && d !== today) return false;
        if (dateFilter === "past" && d >= today) return false;
        if (dateFilter === "week") {
          const bd = new Date(b.date);
          const now = new Date();
          const diff = (bd.getTime() - now.getTime()) / 86400000;
          if (diff < -7 || diff > 7) return false;
        }
        if (
          q &&
          !`${b.userName}${b.courtName ?? ""}${b.coachName ?? ""}${b.id}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  }, [items, user, statusFilter, dateFilter, q, today]);

  const pendingCount = useMemo(
    () =>
      items
        .filter((b) => isScopedVenue(user, b.venueId))
        .filter(
          (b) =>
            b.status === "reschedule_requested" || b.status === "refund_requested"
        ).length,
    [items, user]
  );

  const approveReschedule = () => {
    if (!selected) return;
    update(selected.id, {
      status: "confirmed",
      rescheduleFrom: undefined,
      note: `（振替を承認）${selected.note ?? ""}`,
    });
    toast.success(`振替を承認しました：${selected.userName} · ${selected.date} ${selected.startTime}`);
    setSelected(null);
  };

  const rejectReschedule = () => {
    if (!selected) return;
    if (!selected.rescheduleFrom) return;
    update(selected.id, {
      status: "confirmed",
      date: selected.rescheduleFrom.date,
      startTime: selected.rescheduleFrom.startTime,
      endTime: selected.rescheduleFrom.endTime,
      rescheduleFrom: undefined,
      note: `（振替却下・元の時間帯を維持）`,
    });
    toast.success("振替を却下し、元の時間帯を維持しました");
    setSelected(null);
  };

  const openRefund = (b: Booking) => {
    form.reset({
      amount: b.price + (b.equipmentFee ?? 0),
      reason: "",
    });
    setRefundOpen(true);
  };

  const handleRefund = async (data: RefundForm) => {
    if (!selected) return;
    await new Promise((r) => setTimeout(r, 500));
    update(selected.id, {
      status: "cancelled",
      note: `返金 ${formatYen(data.amount)} · ${data.reason}`,
    });
    toast.success(`${formatYen(data.amount)} を返金し、予約をキャンセルしました`);
    setRefundOpen(false);
    setSelected(null);
  };

  const confirmPending = (b: Booking) => {
    update(b.id, { status: "confirmed" });
    toast.success(`予約を確認しました：${b.userName}`);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="予約管理"
      description={`当企業の予約一覧。振替申請・返金・確認待ちの処理を行います。${
        pendingCount > 0 ? `現在 ${pendingCount} 件の要対応があります。` : ""
      }`}
      breadcrumbs={[{ label: "施設管理" }, { label: "予約管理" }]}
    >
      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="氏名 / コート / コーチで検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-52 h-8 text-xs"
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
                <SelectItem value="pending">確認待ち</SelectItem>
                <SelectItem value="confirmed">確認済み</SelectItem>
                <SelectItem value="reschedule_requested">振替申請中</SelectItem>
                <SelectItem value="refund_requested">返金申請中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="cancelled">キャンセル</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dateFilter}
              onValueChange={(v) => setDateFilter(v as typeof dateFilter)}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全期間</SelectItem>
                <SelectItem value="today">本日</SelectItem>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="past">過去</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="該当する予約はありません"
            description="期間や状態を切り替えてみてください"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>利用者 / 種別</TableHead>
                <TableHead>コート / コーチ</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{b.date}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.startTime}-{b.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{b.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.type === "court" ? "コート予約" : "コーチレッスン"}
                      {b.lessonType &&
                        ` · ${
                          b.lessonType === "practice"
                            ? "対面"
                            : b.lessonType === "online"
                            ? "オンライン"
                            : "動画レビュー"
                        }`}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {b.courtName ?? "—"}
                    {b.coachName && (
                      <div className="text-xs text-muted-foreground">
                        コーチ：{b.coachName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatYen(b.price + (b.equipmentFee ?? 0))}
                    </div>
                    {b.equipmentFee ? (
                      <div className="text-xs text-muted-foreground">
                        備品込み {formatYen(b.equipmentFee)}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <BookingBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {b.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmPending(b)}
                        >
                          確認
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelected(b)}>
                        詳細
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent>
          {selected && (
            <>
              <DrawerHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle>{selected.userName}</DrawerTitle>
                    <DrawerDescription>
                      予約番号 {selected.id} · 作成 {selected.createdAt.slice(0, 10)}
                    </DrawerDescription>
                  </div>
                  <BookingBadge status={selected.status} />
                </div>
              </DrawerHeader>
              <DrawerBody className="space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">日付</div>
                    <div className="font-medium mt-0.5">{selected.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">時間帯</div>
                    <div className="font-medium mt-0.5">
                      {selected.startTime} - {selected.endTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">種別</div>
                    <div className="font-medium mt-0.5">
                      {selected.type === "court" ? "コート予約" : "コーチレッスン"}
                      {selected.mode && (
                        <Badge variant="secondary" className="ml-2">
                          {selected.mode === "solo" ? "1 人練習" : "複数人"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">利用人数</div>
                    <div className="font-medium mt-0.5">
                      {selected.people ? `${selected.people} 名` : "—"}
                    </div>
                  </div>
                  {selected.courtName && (
                    <div>
                      <div className="text-xs text-muted-foreground">コート</div>
                      <div className="font-medium mt-0.5">
                        {selected.courtName}
                        {selected.courtSubName && (
                          <span className="text-xs text-muted-foreground ml-1">
                            / {selected.courtSubName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {selected.coachName && (
                    <div>
                      <div className="text-xs text-muted-foreground">コーチ</div>
                      <div className="font-medium mt-0.5">{selected.coachName}</div>
                    </div>
                  )}
                </div>

                {/* 金額内訳 */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    金額内訳
                  </div>
                  <div className="border rounded-md divide-y">
                    {selected.courtFee != null && selected.courtFee > 0 && (
                      <div className="flex justify-between px-3 py-2 text-sm">
                        <span>コート費</span>
                        <span>{formatYen(selected.courtFee)}</span>
                      </div>
                    )}
                    {selected.type === "coach_lesson" && (
                      <div className="flex justify-between px-3 py-2 text-sm">
                        <span>
                          レッスン費
                          {selected.lessonType && (
                            <span className="text-xs text-muted-foreground ml-1">
                              （
                              {selected.lessonType === "practice"
                                ? "対面"
                                : selected.lessonType === "online"
                                ? "オンライン"
                                : "動画レビュー"}
                              ）
                            </span>
                          )}
                        </span>
                        <span>
                          {formatYen(
                            selected.price -
                              (selected.courtFee ?? 0) -
                              (selected.equipmentFee ?? 0)
                          )}
                        </span>
                      </div>
                    )}
                    {selected.type === "court" && !selected.courtFee && (
                      <div className="flex justify-between px-3 py-2 text-sm">
                        <span>コート費</span>
                        <span>
                          {formatYen(selected.price - (selected.equipmentFee ?? 0))}
                        </span>
                      </div>
                    )}
                    {selected.equipmentFee != null && selected.equipmentFee > 0 && (
                      <div className="flex justify-between px-3 py-2 text-sm">
                        <span>備品レンタル</span>
                        <span>{formatYen(selected.equipmentFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-3 py-2 text-sm font-semibold bg-muted/30">
                      <span>合計</span>
                      <span>
                        {formatYen(selected.price + (selected.equipmentFee ?? 0) - (selected.courtFee ?? 0) * 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 備品レンタル明細 */}
                {selected.equipment && selected.equipment.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      備品レンタル明細（{selected.equipment.length} 点）
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">備品</th>
                            <th className="text-right px-3 py-2 font-medium">単価</th>
                            <th className="text-right px-3 py-2 font-medium">数量</th>
                            <th className="text-right px-3 py-2 font-medium">小計</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selected.equipment.map((e) => (
                            <tr key={e.id}>
                              <td className="px-3 py-2">
                                <div>{e.name}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {e.priceType === "hourly" ? "時間課金" : "回数課金"}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right">
                                {formatYen(e.unitPrice)}
                              </td>
                              <td className="px-3 py-2 text-right">{e.qty}</td>
                              <td className="px-3 py-2 text-right font-medium">
                                {formatYen(e.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 動画レビュー */}
                {selected.reviewVideos && selected.reviewVideos.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      アップロード動画（{selected.reviewVideos.length} 本）
                    </div>
                    <div className="border rounded-md divide-y">
                      {selected.reviewVideos.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{v.name}</div>
                            <div className="text-muted-foreground">
                              {(v.size / 1024 / 1024).toFixed(1)} MB · {v.type}
                            </div>
                          </div>
                          {v.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={v.url} target="_blank" rel="noreferrer">
                                再生
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 利用者評価 */}
                {selected.rating && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      利用者評価
                    </div>
                    <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={
                              n <= selected.rating!.stars
                                ? "text-[hsl(38_92%_50%)]"
                                : "text-muted-foreground/30"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm font-semibold ml-1">
                          {selected.rating.stars}.0
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {selected.rating.createdAt.slice(0, 10)}
                        </span>
                      </div>
                      {selected.rating.comment && (
                        <div className="text-sm leading-relaxed">
                          {selected.rating.comment}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selected.rescheduleUsed && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    ⚠ この予約は 1 度振替を使用済み（再度の振替不可）
                  </div>
                )}

                {selected.rescheduleFrom && (
                  <div className="bg-warning/10 border border-warning/30 rounded-md p-3">
                    <div className="text-xs font-medium text-[hsl(38_92%_30%)] mb-1">
                      振替申請
                    </div>
                    <div className="text-sm">
                      元の時間帯：{selected.rescheduleFrom.date}{" "}
                      {selected.rescheduleFrom.startTime}-
                      {selected.rescheduleFrom.endTime}
                    </div>
                    <div className="text-sm mt-1">
                      希望時間帯：{selected.date} {selected.startTime}-{selected.endTime}
                    </div>
                    {selected.note && (
                      <div className="text-xs text-muted-foreground mt-2">
                        利用者コメント：{selected.note}
                      </div>
                    )}
                  </div>
                )}

                {selected.status === "refund_requested" && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                    <div className="text-xs font-medium text-destructive mb-1">
                      返金申請
                    </div>
                    <div className="text-sm">
                      {selected.note ?? "（理由未入力）"}
                    </div>
                  </div>
                )}

                {selected.note && !selected.rescheduleFrom &&
                  selected.status !== "refund_requested" && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        備考
                      </div>
                      <div className="text-sm bg-muted/40 rounded-md p-3">
                        {selected.note}
                      </div>
                    </div>
                  )}
              </DrawerBody>
              <DrawerFooter>
                {selected.status === "reschedule_requested" && (
                  <>
                    <Button variant="outline" onClick={rejectReschedule}>
                      却下・元の時間帯を維持
                    </Button>
                    <Button variant="success" onClick={approveReschedule}>
                      振替を承認
                    </Button>
                  </>
                )}
                {selected.status === "refund_requested" && (
                  <Button
                    variant="destructive"
                    onClick={() => openRefund(selected)}
                  >
                    返金を実行
                  </Button>
                )}
                {selected.status === "pending" && (
                  <Button onClick={() => confirmPending(selected)}>
                    予約を確認
                  </Button>
                )}
                {!["reschedule_requested", "refund_requested", "pending"].includes(
                  selected.status
                ) && (
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    閉じる
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* 返金ダイアログ */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>返金を実行</DialogTitle>
            <DialogDescription>
              返金後、予約は自動的にキャンセルされ、財務レポートに記録されます。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleRefund)} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label required>返金額</Label>
              <Input
                type="number"
                min={0}
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>返金理由</Label>
              <Textarea
                rows={3}
                placeholder="例：悪天候により利用者が早期にキャンセル。全額返金。"
                {...form.register("reason")}
              />
              {form.formState.errors.reason && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefundOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={form.formState.isSubmitting}
              >
                返金を確定
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
