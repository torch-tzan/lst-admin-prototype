"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, CreditCard, RefreshCw, Download, AlertTriangle } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayoutTxBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { EARNINGS, COACHES, VENUES } from "@/lib/mock-data";
import type { EarningRecord, PayoutTxStatus } from "@/lib/types";
import { formatYen, formatDate } from "@/lib/utils";

const LESSON_TYPE_LABEL = {
  practice: "対面",
  online: "オンライン",
  video_review: "動画レビュー",
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const { items, update, hydrated } = useMockCrud<EarningRecord>(
    MOCK_KEYS.earnings,
    EARNINGS
  );
  const [q, setQ] = useState("");
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PayoutTxStatus>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [selected, setSelected] = useState<EarningRecord | null>(null);

  const scoped = useMemo(() => {
    return items.filter((e) => {
      if (user?.role === "venue-admin" && e.venueId !== user.venueId) return false;
      return true;
    });
  }, [items, user]);

  const months = useMemo(
    () => Array.from(new Set(scoped.map((e) => e.earnedMonth))).sort().reverse(),
    [scoped]
  );

  const filtered = useMemo(() => {
    return scoped
      .filter((e) => {
        if (coachFilter !== "all" && e.coachId !== coachFilter) return false;
        if (venueFilter !== "all" && e.venueId !== venueFilter) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (monthFilter !== "all" && e.earnedMonth !== monthFilter) return false;
        if (
          q &&
          !`${e.coachName}${e.userName}${e.stripeChargeId}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
  }, [scoped, q, coachFilter, venueFilter, statusFilter, monthFilter]);

  const failedCount = scoped.filter((e) => e.status === "failed").length;

  const retryFailed = (e: EarningRecord) => {
    update(e.id, { status: "processing", errorMessage: undefined });
    toast.success(`Stripe への再送信を依頼：${e.coachName} ${formatYen(e.coachEarning)}`);
    setTimeout(() => {
      update(e.id, { status: "paid", paidAt: new Date().toISOString() });
      toast.success(`${e.coachName} へ着金完了`);
    }, 2000);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="支払い履歴"
      description="Stripe Connect 経由の自動送金トランザクションログ。エラー取引の再送と監査を行います。"
      breadcrumbs={[{ label: "売上/決済" }, { label: "支払い履歴" }]}
      actions={
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          CSV
        </Button>
      }
    >
      {failedCount > 0 && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span>
            <strong>{failedCount} 件</strong> の送金がエラーです
          </span>
        </div>
      )}

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="コーチ / 利用者 / Charge ID"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-60 h-8 text-xs"
              />
            </div>
            <Select value={coachFilter} onValueChange={setCoachFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全コーチ</SelectItem>
                {COACHES.filter((c) => c.status === "approved").map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user?.role === "lst-admin" && (
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全企業</SelectItem>
                  {VENUES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全期間</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全状態</SelectItem>
                <SelectItem value="paid">着金済み</SelectItem>
                <SelectItem value="processing">処理中</SelectItem>
                <SelectItem value="pending">待機</SelectItem>
                <SelectItem value="failed">エラー</SelectItem>
                <SelectItem value="refunded">返金</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title="該当する取引はありません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>コーチ / 企業</TableHead>
                <TableHead>利用者</TableHead>
                <TableHead>総額</TableHead>
                <TableHead>手数料</TableHead>
                <TableHead>コーチ送金</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(e.earnedAt, true)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{e.coachName}</div>
                    <div className="text-xs text-muted-foreground">{e.venueName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{e.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {LESSON_TYPE_LABEL[e.lessonType]}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatYen(e.grossAmount)}</TableCell>
                  <TableCell className="text-xs">
                    <div>Platform {formatYen(e.platformFee)}</div>
                    <div className="text-muted-foreground">Stripe {formatYen(e.stripeFee)}</div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`font-semibold ${
                        e.status === "paid"
                          ? "text-success"
                          : e.status === "refunded"
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {formatYen(e.coachEarning)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PayoutTxBadge status={e.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {e.status === "failed" && (
                        <Button variant="ghost" size="sm" onClick={() => retryFailed(e)}>
                          <RefreshCw className="w-3.5 h-3.5" />
                          再送
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelected(e)}>
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
        <DrawerContent width="md">
          {selected && (
            <>
              <DrawerHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle>{selected.coachName}</DrawerTitle>
                    <DrawerDescription>
                      {LESSON_TYPE_LABEL[selected.lessonType]} · {selected.venueName}
                    </DrawerDescription>
                  </div>
                  <PayoutTxBadge status={selected.status} />
                </div>
              </DrawerHeader>
              <DrawerBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">利用者</div>
                    <div className="font-medium mt-0.5">{selected.userName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">完了時刻</div>
                    <div className="font-medium mt-0.5">
                      {formatDate(selected.earnedAt, true)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    金額内訳
                  </div>
                  <div className="border rounded-md divide-y">
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span>レッスン料（利用者支払額）</span>
                      <span className="font-semibold">{formatYen(selected.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 text-sm text-destructive">
                      <span>- プラットフォーム手数料</span>
                      <span>-{formatYen(selected.platformFee)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 text-sm text-destructive">
                      <span>- Stripe 手数料</span>
                      <span>-{formatYen(selected.stripeFee)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 font-semibold bg-success/5">
                      <span>コーチ銀行口座へ振込</span>
                      <span
                        className={
                          selected.status === "refunded"
                            ? "line-through text-muted-foreground"
                            : "text-success"
                        }
                      >
                        {formatYen(selected.coachEarning)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    ＊ コート利用料は利用者が別途企業へ支払い（当記録には含まれない）
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    決済・送金詳細
                  </div>
                  <div className="text-xs font-mono bg-muted/40 rounded-md p-3 space-y-1">
                    <div>Stripe Charge ID: {selected.stripeChargeId}</div>
                    {selected.payoutReference && (
                      <div>振込参照: {selected.payoutReference}</div>
                    )}
                    {selected.paidAt && (
                      <div>着金時刻: {formatDate(selected.paidAt, true)}</div>
                    )}
                  </div>
                </div>

                {selected.errorMessage && (
                  <div>
                    <div className="text-xs font-medium text-destructive mb-1.5">
                      エラー内容
                    </div>
                    <div className="text-sm bg-destructive/10 text-destructive rounded-md p-3">
                      {selected.errorMessage}
                    </div>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter>
                {selected.status === "failed" && (
                  <Button onClick={() => retryFailed(selected)}>
                    <RefreshCw className="w-4 h-4" />
                    再送信
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelected(null)}>
                  閉じる
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </PageShell>
  );
}
