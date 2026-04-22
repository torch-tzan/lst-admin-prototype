"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Search, UserCheck, Mail, Phone, Award } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
import { CoachBadge } from "@/components/status-badge";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { COACHES, VENUES } from "@/lib/mock-data";
import type { Coach, CoachStatus } from "@/lib/types";
import { formatYen } from "@/lib/utils";

const rejectSchema = z.object({
  reason: z.string().min(10, "却下理由は 10 文字以上で入力してください（コーチ側の修正のため）"),
});
type RejectForm = z.infer<typeof rejectSchema>;

export default function CoachesPage() {
  const { items, update, hydrated } = useMockCrud<Coach>(MOCK_KEYS.coaches, COACHES);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<CoachStatus>("pending");
  const [selected, setSelected] = useState<Coach | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const venueMap = useMemo(
    () => Object.fromEntries(VENUES.map((v) => [v.id, v.name])),
    []
  );

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (c.status !== tab) return false;
      if (
        q &&
        !`${c.name}${c.email}${c.specialties.join("")}`.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [items, q, tab]);

  const counts = useMemo(() => {
    return {
      pending: items.filter((c) => c.status === "pending").length,
      approved: items.filter((c) => c.status === "approved").length,
      rejected: items.filter((c) => c.status === "rejected").length,
      suspended: items.filter((c) => c.status === "suspended").length,
    };
  }, [items]);

  const rejectForm = useForm<RejectForm>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });

  const handleApprove = async () => {
    if (!selected) return;
    await new Promise((r) => setTimeout(r, 400));
    update(selected.id, {
      status: "approved",
      approvedAt: new Date().toISOString().slice(0, 10),
      reviewNote: undefined,
    });
    toast.success(`コーチを承認しました：${selected.name}`);
    setApproveOpen(false);
    setSelected(null);
  };

  const handleReject = async (data: RejectForm) => {
    if (!selected) return;
    await new Promise((r) => setTimeout(r, 400));
    update(selected.id, { status: "rejected", reviewNote: data.reason });
    toast.success(`申請を却下しました：${selected.name}`);
    setRejectOpen(false);
    rejectForm.reset();
    setSelected(null);
  };

  const handleSuspend = (c: Coach) => {
    update(c.id, { status: "suspended" });
    toast.success(`コーチを停止しました：${c.name}`);
    setSelected(null);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="コーチ審査"
      description="新規コーチ申請の審査、承認済みコーチの停止/復帰管理"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "コーチ審査" }]}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as CoachStatus)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              審査待ち <Badge variant="warning" className="ml-2">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              承認済み <Badge variant="muted" className="ml-2">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              却下 <Badge variant="muted" className="ml-2">{counts.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="suspended">
              停止 <Badge variant="muted" className="ml-2">{counts.suspended}</Badge>
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="コーチ名 / メール / 専門で検索"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8 w-64 h-8 text-xs"
            />
          </div>
        </div>

        <TabsContent value={tab}>
          <Section>
            {filtered.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title={`${tab === "pending" ? "審査待ちの" : ""}コーチはいません`}
                description="タブを切り替えるか、検索条件を調整してください"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コーチ</TableHead>
                    <TableHead>レベル</TableHead>
                    <TableHead>専門</TableHead>
                    <TableHead>活動施設</TableHead>
                    <TableHead>時給</TableHead>
                    <TableHead>申請 / 承認</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          {c.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-9 h-9 rounded-full object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div>{c.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {c.email}
                              {c.area && ` · ${c.area}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.level === "S" ? "default" : c.level === "A" ? "success" : "muted"}
                        >
                          {c.level} 級
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.specialties.join("、")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.venueIds.map((id) => venueMap[id]).join(" / ")}
                      </TableCell>
                      <TableCell>{formatYen(c.hourlyRate)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.approvedAt ?? c.appliedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                          詳細 / 対応
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </TabsContent>
      </Tabs>

      {/* 教練詳情抽屜 */}
      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent width="lg">
          {selected && (
            <>
              <DrawerHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {selected.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selected.avatar}
                        alt={selected.name}
                        className="w-14 h-14 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                        {selected.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <DrawerTitle>{selected.name}</DrawerTitle>
                      <DrawerDescription>
                        {selected.level} 級 · {selected.area ?? "エリア未設定"} · 申請日 {selected.appliedAt}
                      </DrawerDescription>
                      {selected.status === "approved" && selected.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <span className="text-yellow-600">★</span>
                          <span className="font-semibold">{selected.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({selected.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CoachBadge status={selected.status} />
                </div>
              </DrawerHeader>
              <DrawerBody className="space-y-5">
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

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">自己紹介</div>
                  <div className="text-sm bg-muted/40 rounded-md p-3 leading-relaxed">
                    {selected.bio}
                  </div>
                </div>

                {selected.experience && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">経歴・キャリア</div>
                    <div className="text-sm bg-muted/40 rounded-md p-3 leading-relaxed">
                      {selected.experience}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      専門
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.specialties.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      時給（基本）
                    </div>
                    <div className="text-lg font-semibold">
                      {formatYen(selected.hourlyRate)}
                      {selected.defaultLessonDuration && (
                        <span className="text-xs text-muted-foreground ml-1">
                          / {selected.defaultLessonDuration}分
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* レッスン対応 flag */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    レッスン対応
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success">対面</Badge>
                    {selected.onlineAvailable && <Badge variant="success">オンライン</Badge>}
                    {selected.videoReviewAvailable && <Badge variant="success">動画レビュー</Badge>}
                  </div>
                </div>

                {/* コース一覧 */}
                {selected.courses && selected.courses.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      レッスンメニュー（{selected.courses.length} 件）
                    </div>
                    <div className="border rounded-md divide-y">
                      {selected.courses.map((c) => (
                        <div key={c.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm">{c.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {c.description}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {c.supportsInPerson && <Badge variant="secondary">対面</Badge>}
                                {c.supportsOnline && <Badge variant="secondary">オンライン</Badge>}
                              </div>
                            </div>
                            <div className="text-sm font-semibold shrink-0">
                              {formatYen(c.hourlyRate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 動画レビュー設定 */}
                {selected.videoReviewSettings?.enabled && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      動画レビュー
                    </div>
                    <div className="bg-muted/40 rounded-md p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span>1 件あたり</span>
                        <span className="font-semibold">
                          {formatYen(selected.videoReviewSettings.price)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selected.videoReviewSettings.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* パフォーマンス統計 */}
                {selected.stats && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      パフォーマンス統計
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <div className="text-lg font-semibold">
                          {selected.stats.completedSessions.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">完了レッスン</div>
                      </div>
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <div className="text-lg font-semibold">{selected.stats.repeatRate}%</div>
                        <div className="text-[10px] text-muted-foreground">リピート率</div>
                      </div>
                      <div className="bg-muted/40 rounded-md p-3 text-center">
                        <div className="text-lg font-semibold">
                          {selected.stats.satisfaction}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">満足度</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 収益 */}
                {(selected.totalEarnings != null || selected.monthlyEarnings != null) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-success/5 border border-success/20 rounded-md p-3">
                      <div className="text-[10px] text-muted-foreground">今月の収益</div>
                      <div className="text-lg font-semibold text-success mt-0.5">
                        {formatYen(selected.monthlyEarnings ?? 0)}
                      </div>
                    </div>
                    <div className="bg-muted/40 rounded-md p-3">
                      <div className="text-[10px] text-muted-foreground">累計収益</div>
                      <div className="text-lg font-semibold mt-0.5">
                        {formatYen(selected.totalEarnings ?? 0)}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> 資格・認定
                  </div>
                  {selected.certifications.length === 0 ? (
                    <div className="text-xs text-destructive">資格証明が未提出</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    活動施設（コーチ自身が選択）
                  </div>
                  <div className="text-sm">
                    {selected.venueIds.length > 0
                      ? selected.venueIds.map((id) => venueMap[id]).join("、")
                      : "未選択"}
                  </div>
                </div>

                {selected.bankAccount && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      振込先口座
                    </div>
                    <div className="text-sm bg-muted/40 rounded-md p-3 space-y-1">
                      <div>
                        {selected.bankAccount.bankName} / {selected.bankAccount.branchName}
                        {selected.bankAccount.accountType && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {selected.bankAccount.accountType}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs">
                        {selected.bankAccount.accountNumber}
                        <span className="text-muted-foreground ml-2">
                          （{selected.bankAccount.accountHolder}）
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selected.reviewNote && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      前回の却下理由
                    </div>
                    <div className="text-sm bg-destructive/10 text-destructive rounded-md p-3">
                      {selected.reviewNote}
                    </div>
                  </div>
                )}

                {selected.status === "approved" && selected.rating > 0 && (
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">評価</div>
                      <div className="font-semibold">★ {selected.rating.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">レビュー数</div>
                      <div className="font-semibold">{selected.reviewCount}</div>
                    </div>
                  </div>
                )}
              </DrawerBody>
              <DrawerFooter>
                {selected.status === "pending" && (
                  <>
                    <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                      却下
                    </Button>
                    <Button variant="success" onClick={() => setApproveOpen(true)}>
                      承認する
                    </Button>
                  </>
                )}
                {selected.status === "approved" && (
                  <Button variant="destructive" onClick={() => handleSuspend(selected)}>
                    停止
                  </Button>
                )}
                {selected.status === "suspended" && (
                  <Button
                    variant="success"
                    onClick={() => {
                      update(selected.id, { status: "approved" });
                      toast.success(`コーチを復帰しました：${selected.name}`);
                      setSelected(null);
                    }}
                  >
                    復帰させる
                  </Button>
                )}
                {selected.status === "rejected" && (
                  <Button onClick={() => setSelected(null)}>閉じる</Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* 承認確認 */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>コーチを承認</DialogTitle>
            <DialogDescription>
              承認すると {selected?.name} は活動施設で直ちに予約を受け、収益を得られるようになります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              キャンセル
            </Button>
            <Button variant="success" onClick={handleApprove}>
              承認する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 却下フォーム */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>申請を却下</DialogTitle>
            <DialogDescription>
              却下理由を入力してください。コーチに通知され、修正後に再申請できます。
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={rejectForm.handleSubmit(handleReject)}
            className="grid gap-3"
          >
            <div className="grid gap-1.5">
              <Label required>却下理由（10 文字以上）</Label>
              <Textarea
                rows={4}
                {...rejectForm.register("reason")}
                placeholder="例：認定資格証明書が未提出です。A 級以上の資格証明書をアップロードしてください。"
              />
              {rejectForm.formState.errors.reason && (
                <p className="text-xs text-destructive">
                  {rejectForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={rejectForm.formState.isSubmitting}
              >
                却下を送信
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
