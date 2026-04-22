"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Star, Search, Coins } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { POINTS_LOGS, POINTS_RULES, MEMBER_USERS } from "@/lib/mock-data";
import type { PointsLog, PointsRule, PointsEventType } from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/utils";

const ruleSchema = z.object({
  label: z.string().min(3, "ルール名は 3 文字以上"),
  trigger: z.string().min(3, "トリガー条件を入力"),
  earnedPoints: z.number().min(0, "0 以上"),
  earnedXp: z.number().min(0, "0 以上"),
  active: z.boolean(),
  note: z.string().optional(),
});
type RuleForm = z.infer<typeof ruleSchema>;

const adjustSchema = z.object({
  userId: z.string().min(1, "会員を選択"),
  delta: z.number().refine((n) => n !== 0, "0 は指定できません"),
  note: z.string().min(5, "調整理由は 5 文字以上"),
});
type AdjustForm = z.infer<typeof adjustSchema>;

const EVENT_LABEL: Record<PointsEventType, string> = {
  booking_earned: "予約獲得",
  coupon_redeemed: "クーポン利用",
  admin_adjust_add: "管理者加算",
  admin_adjust_deduct: "管理者減算",
  expired: "失効",
  signup_bonus: "登録ボーナス",
  review_bonus: "レビュー投稿",
};

const EVENT_COLOR: Record<PointsEventType, string> = {
  booking_earned: "success",
  coupon_redeemed: "muted",
  admin_adjust_add: "success",
  admin_adjust_deduct: "destructive",
  expired: "muted",
  signup_bonus: "default",
  review_bonus: "success",
};

export default function PointsPage() {
  const { items: rules, add: addRule, update: updateRule, hydrated: rulesHyd } = useMockCrud<PointsRule>(
    MOCK_KEYS.pointsRules,
    POINTS_RULES
  );
  const { items: logs, add: addLog, hydrated: logsHyd } = useMockCrud<PointsLog>(
    MOCK_KEYS.pointsLogs,
    POINTS_LOGS
  );
  const { items: members, update: updateMember } = useMockCrud(
    MOCK_KEYS.members,
    MEMBER_USERS
  );

  const [q, setQ] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | PointsEventType>("all");
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointsRule | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const ruleForm = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      label: "",
      trigger: "",
      earnedPoints: 0,
      earnedXp: 0,
      active: true,
      note: "",
    },
  });

  const adjustForm = useForm<AdjustForm>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { userId: "", delta: 0, note: "" },
  });

  const filteredLogs = useMemo(() => {
    return logs
      .filter((p) => {
        if (eventFilter !== "all" && p.eventType !== eventFilter) return false;
        if (q && !p.userName.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [logs, q, eventFilter]);

  const stats = useMemo(() => {
    const totalPoints = members.reduce((s, u) => s + u.points, 0);
    const thisMonth = logs.filter((p) => {
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyEarned = thisMonth
      .filter((p) => p.delta > 0)
      .reduce((s, p) => s + p.delta, 0);
    const monthlySpent = thisMonth
      .filter((p) => p.delta < 0)
      .reduce((s, p) => s + Math.abs(p.delta), 0);
    return {
      totalPoints,
      monthlyEarned,
      monthlySpent,
      activeRules: rules.filter((r) => r.active).length,
    };
  }, [members, logs, rules]);

  const openNewRule = () => {
    setEditingRule(null);
    ruleForm.reset({
      label: "",
      trigger: "",
      earnedPoints: 0,
      earnedXp: 0,
      active: true,
      note: "",
    });
    setRuleDialogOpen(true);
  };

  const openEditRule = (r: PointsRule) => {
    setEditingRule(r);
    ruleForm.reset(r);
    setRuleDialogOpen(true);
  };

  const onSubmitRule = async (data: RuleForm) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editingRule) {
      updateRule(editingRule.id, data);
      toast.success(`ルールを更新しました：${data.label}`);
    } else {
      addRule({ id: `pr-${Date.now()}`, ...data });
      toast.success(`ルールを追加しました：${data.label}`);
    }
    setRuleDialogOpen(false);
  };

  const toggleRule = (r: PointsRule) => {
    updateRule(r.id, { active: !r.active });
    toast.success(`${r.label} を${!r.active ? "有効" : "無効"}化しました`);
  };

  const onAdjust = async (data: AdjustForm) => {
    await new Promise((r) => setTimeout(r, 400));
    const u = members.find((m) => m.id === data.userId);
    if (!u) return;
    const nextBalance = u.points + data.delta;
    updateMember(u.id, { points: nextBalance });
    addLog({
      id: `pl-${Date.now()}`,
      userId: u.id,
      userName: u.name,
      eventType: data.delta > 0 ? "admin_adjust_add" : "admin_adjust_deduct",
      delta: data.delta,
      balance: nextBalance,
      note: data.note,
      operator: "LST プラットフォーム管理者",
      createdAt: new Date().toISOString(),
    });
    toast.success(
      `${u.name} のポイントを ${data.delta > 0 ? "+" : ""}${data.delta} 調整`
    );
    adjustForm.reset({ userId: "", delta: 0, note: "" });
    setAdjustOpen(false);
  };

  if (!rulesHyd || !logsHyd) return null;

  return (
    <PageShell
      title="ポイント管理"
      description="ポイント獲得ルールの設定・会員ポイントの手動調整・履歴の監査"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "ポイント管理" }]}
      actions={
        <Button onClick={() => setAdjustOpen(true)}>
          <Coins className="w-4 h-4" />
          手動調整
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">流通ポイント総量</div>
          <div className="text-2xl font-semibold mt-0.5">
            {stats.totalPoints.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">今月獲得</div>
          <div className="text-2xl font-semibold mt-0.5 text-success">
            +{stats.monthlyEarned.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">今月消費</div>
          <div className="text-2xl font-semibold mt-0.5 text-destructive">
            -{stats.monthlySpent.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">有効ルール数</div>
          <div className="text-2xl font-semibold mt-0.5">{stats.activeRules}</div>
        </div>
      </div>

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">
            履歴 <Badge variant="muted" className="ml-2">{logs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rules">
            獲得ルール <Badge variant="muted" className="ml-2">{rules.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Section
            actions={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="会員名で検索"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-8 w-52 h-8 text-xs"
                  />
                </div>
                <Select
                  value={eventFilter}
                  onValueChange={(v) =>
                    setEventFilter(v as typeof eventFilter)
                  }
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全イベント</SelectItem>
                    {Object.entries(EVENT_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          >
            {filteredLogs.length === 0 ? (
              <EmptyState icon={Coins} title="履歴はありません" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>会員</TableHead>
                    <TableHead>イベント</TableHead>
                    <TableHead>増減</TableHead>
                    <TableHead>残高</TableHead>
                    <TableHead>備考</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 100).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {relativeTime(p.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{p.userName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            EVENT_COLOR[p.eventType] as
                              | "success"
                              | "destructive"
                              | "muted"
                              | "default"
                          }
                        >
                          {EVENT_LABEL[p.eventType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            p.delta > 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {p.delta > 0 ? "+" : ""}
                          {p.delta}
                        </span>
                      </TableCell>
                      <TableCell>{p.balance.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                        {p.note ?? "—"}
                        {p.operator && ` · ${p.operator}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="rules">
          <Section
            actions={
              <Button size="sm" onClick={openNewRule}>
                <Plus className="w-3.5 h-3.5" />
                新規ルール
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ルール名</TableHead>
                  <TableHead>トリガー</TableHead>
                  <TableHead>獲得ポイント</TableHead>
                  <TableHead>獲得 XP</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div>{r.label}</div>
                      {r.note && (
                        <div className="text-xs text-muted-foreground">
                          {r.note}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{r.trigger}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-warning">
                        +{r.earnedPoints}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">+{r.earnedXp}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.active ? "success" : "muted"}>
                        {r.active ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditRule(r)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRule(r)}
                        >
                          {r.active ? "無効化" : "有効化"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </TabsContent>
      </Tabs>

      {/* ルール新規/編集 */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "ルールを編集" : "新規獲得ルール"}
            </DialogTitle>
            <DialogDescription>
              条件が満たされると会員にポイント・XP が自動付与されます。
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={ruleForm.handleSubmit(onSubmitRule)}
            className="grid gap-4"
          >
            <div className="grid gap-1.5">
              <Label required>ルール名</Label>
              <Input {...ruleForm.register("label")} placeholder="例：コート予約 1 件" />
              {ruleForm.formState.errors.label && (
                <p className="text-xs text-destructive">
                  {ruleForm.formState.errors.label.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>トリガー条件</Label>
              <Input
                {...ruleForm.register("trigger")}
                placeholder="例：予約完了時、レビュー承認時"
              />
              {ruleForm.formState.errors.trigger && (
                <p className="text-xs text-destructive">
                  {ruleForm.formState.errors.trigger.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>獲得ポイント</Label>
                <Input
                  type="number"
                  min={0}
                  {...ruleForm.register("earnedPoints", { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>獲得 XP</Label>
                <Input
                  type="number"
                  min={0}
                  {...ruleForm.register("earnedXp", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>備考</Label>
              <Textarea
                rows={2}
                {...ruleForm.register("note")}
                placeholder="例：1 予約につき 1 回、重複付与なし"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={ruleForm.watch("active")}
                onCheckedChange={(v) => ruleForm.setValue("active", v)}
              />
              <Label>ルールを有効化</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRuleDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={ruleForm.formState.isSubmitting}>
                {editingRule ? "変更を保存" : "ルールを追加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 手動調整 */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>ポイント手動調整</DialogTitle>
            <DialogDescription>
              会員のポイントを加算 / 減算します。履歴に管理者ログとして記録されます。
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={adjustForm.handleSubmit(onAdjust)}
            className="grid gap-3"
          >
            <div className="grid gap-1.5">
              <Label required>対象会員</Label>
              <Select
                value={adjustForm.watch("userId")}
                onValueChange={(v) => adjustForm.setValue("userId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="会員を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}（現在 {m.points.toLocaleString()} P）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {adjustForm.formState.errors.userId && (
                <p className="text-xs text-destructive">
                  {adjustForm.formState.errors.userId.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>増減値</Label>
              <Input
                type="number"
                {...adjustForm.register("delta", { valueAsNumber: true })}
                placeholder="+500 / -200"
              />
              {adjustForm.formState.errors.delta && (
                <p className="text-xs text-destructive">
                  {adjustForm.formState.errors.delta.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>調整理由</Label>
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
              <Button
                type="submit"
                loading={adjustForm.formState.isSubmitting}
              >
                調整を確定
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
