"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Users2, Search } from "lucide-react";

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
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { STAFF } from "@/lib/mock-data";
import type { Staff, StaffRole, StaffStatus, PayrollLineItem } from "@/lib/types";
import { formatYen } from "@/lib/utils";
import { Plus as PlusIcon, X } from "lucide-react";

const ROLE_LABEL: Record<StaffRole, string> = {
  owner: "オーナー",
  manager: "マネージャー",
  staff: "スタッフ",
  receptionist: "受付",
};

const schema = z.object({
  name: z.string().min(2, "2 文字以上"),
  email: z.string().email("メール形式が不正"),
  phone: z.string().min(7, "有効な電話番号"),
  role: z.enum(["owner", "manager", "staff", "receptionist"]),
  hiredAt: z.string().min(1, "入社日を指定"),
  note: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  lessonAllowance: z.number().min(0).optional(),
  bookingAllowance: z.number().min(0).optional(),
  achievementBonus: z.number().min(0).optional(),
});
type FormData = z.infer<typeof schema>;

export default function StaffPage() {
  const { user } = useAuth();
  const { items, add, update, remove, hydrated } = useMockCrud<Staff>(
    MOCK_KEYS.staff,
    STAFF
  );
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StaffStatus>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  // 個別明細項目（保険・年金・源泉徴収など、人ごとに設定）
  const [lineItems, setLineItems] = useState<PayrollLineItem[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      hiredAt: new Date().toISOString().slice(0, 10),
      note: "",
      hourlyRate: 1100,
      lessonAllowance: 0,
      bookingAllowance: 0,
      achievementBonus: 0,
    },
  });

  const myStaff = useMemo(
    () => items.filter((s) => s.venueId === user?.venueId),
    [items, user]
  );

  const filtered = useMemo(() => {
    return myStaff.filter((s) => {
      if (roleFilter !== "all" && s.role !== roleFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !`${s.name}${s.email}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [myStaff, q, roleFilter, statusFilter]);

  const stats = {
    total: myStaff.length,
    active: myStaff.filter((s) => s.status === "active").length,
    byRole: (["owner", "manager", "receptionist", "staff"] as StaffRole[]).reduce(
      (acc, r) => ({
        ...acc,
        [r]: myStaff.filter((s) => s.role === r && s.status === "active").length,
      }),
      {} as Record<StaffRole, number>
    ),
  };

  const openNew = () => {
    setEditing(null);
    setLineItems([]);
    form.reset({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      hiredAt: new Date().toISOString().slice(0, 10),
      note: "",
      hourlyRate: 1100,
      lessonAllowance: 0,
      bookingAllowance: 0,
      achievementBonus: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setLineItems(s.customLineItems ?? []);
    form.reset({
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      hiredAt: s.hiredAt,
      note: s.note ?? "",
      hourlyRate: s.hourlyRate ?? 1100,
      lessonAllowance: s.lessonAllowance ?? 0,
      bookingAllowance: s.bookingAllowance ?? 0,
      achievementBonus: s.achievementBonus ?? 0,
    });
    setDialogOpen(true);
  };

  const addLineItem = () =>
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        label: "",
        amount: 0,
        category: "deduction",
      },
    ]);
  const updateLineItem = (id: string, patch: Partial<PayrollLineItem>) =>
    setLineItems((prev) => prev.map((li) => (li.id === id ? { ...li, ...patch } : li)));
  const removeLineItem = (id: string) =>
    setLineItems((prev) => prev.filter((li) => li.id !== id));

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const payload = { ...data, customLineItems: lineItems };
    if (editing) {
      update(editing.id, payload);
      toast.success(`スタッフを更新：${data.name}`);
    } else {
      add({
        id: `s-${Date.now()}`,
        venueId: user?.venueId ?? "",
        status: "active",
        ...payload,
      });
      toast.success(`スタッフを追加：${data.name}`);
    }
    setDialogOpen(false);
  };

  const toggleStatus = (s: Staff) => {
    update(s.id, { status: s.status === "active" ? "inactive" : "active" });
    toast.success(
      `${s.name} を${s.status === "active" ? "非稼働" : "稼働"}に変更`
    );
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="スタッフ管理"
      description="当企業のスタッフ一覧・権限管理・稼働状態を管理します"
      breadcrumbs={[{ label: "スタッフ/勤務" }, { label: "スタッフ管理" }]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規スタッフ
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">稼働スタッフ</div>
          <div className="text-2xl font-bold mt-1">{stats.active}</div>
          <div className="text-[10px] text-muted-foreground">全 {stats.total} 名</div>
        </div>
        {(["owner", "manager", "receptionist", "staff"] as StaffRole[]).map((r) => (
          <div key={r} className="bg-card border rounded-lg px-4 py-3">
            <div className="text-xs text-muted-foreground">{ROLE_LABEL[r]}</div>
            <div className="text-2xl font-bold mt-1">{stats.byRole[r]}</div>
          </div>
        ))}
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="氏名 / メール"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-52 h-8 text-xs"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全役職</SelectItem>
                {(Object.entries(ROLE_LABEL) as [StaffRole, string][]).map(
                  ([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全状態</SelectItem>
                <SelectItem value="active">稼働中</SelectItem>
                <SelectItem value="inactive">非稼働</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={Users2} title="該当するスタッフはいません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead>入社日</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <div>{s.name}</div>
                    {s.note && (
                      <div className="text-xs text-muted-foreground">{s.note}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.role === "owner"
                          ? "default"
                          : s.role === "manager"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {ROLE_LABEL[s.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{s.email}</div>
                    <div className="text-xs text-muted-foreground">{s.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.hiredAt}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "success" : "muted"}>
                      {s.status === "active" ? "稼働中" : "非稼働"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                        編集
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(s)}>
                        {s.status === "active" ? "非稼働に" : "稼働に"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`${s.name} を削除しますか？`)) {
                            remove(s.id);
                            toast.success(`削除しました：${s.name}`);
                          }
                        }}
                      >
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? "スタッフ編集" : "新規スタッフ"}</DialogTitle>
            <DialogDescription>スタッフの基本情報と権限を設定します</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>氏名</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>役職</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as StaffRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ROLE_LABEL) as [StaffRole, string][]).map(
                      ([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label required>メールアドレス</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>電話番号</Label>
                <Input {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>入社日</Label>
                <Input type="date" {...form.register("hiredAt")} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>備考</Label>
              <Textarea rows={2} {...form.register("note")} />
            </div>

            {/* ───── 給与設定 ───── */}
            <div className="border rounded-md p-3 bg-muted/20 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                給与設定（時給・手当・成果報酬）
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>基本時給（¥/h）</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register("hourlyRate", { valueAsNumber: true })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>レッスン手当（¥/件）</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register("lessonAllowance", { valueAsNumber: true })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>予約対応手当（¥/件）</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register("bookingAllowance", { valueAsNumber: true })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>成果報酬（¥/件）</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register("achievementBonus", { valueAsNumber: true })}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    イベント主催・大会開催の成功時に支払う特別報酬
                  </p>
                </div>
              </div>

              {/* 個別明細項目（保険・年金・源泉徴収など）*/}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    個別明細（保険・年金・源泉徴収など）
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                  >
                    <PlusIcon className="w-3 h-3" />
                    項目を追加
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  人によって異なる保険・年金・源泉徴収などを手動で設定。
                  正の数で加算、負の数で控除。社労士相談で項目を確定してください。
                </p>
                {lineItems.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
                    明細項目はまだありません
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {lineItems.map((li) => (
                      <div key={li.id} className="flex items-center gap-2">
                        <Select
                          value={li.category}
                          onValueChange={(v) =>
                            updateLineItem(li.id, {
                              category: v as "allowance" | "deduction",
                            })
                          }
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allowance">手当</SelectItem>
                            <SelectItem value="deduction">控除</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="項目名（例：源泉徴収、健康保険、交通費）"
                          value={li.label}
                          onChange={(e) =>
                            updateLineItem(li.id, { label: e.target.value })
                          }
                          className="h-8 text-xs flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="金額"
                          value={li.amount}
                          onChange={(e) =>
                            updateLineItem(li.id, {
                              amount: Number(e.target.value),
                            })
                          }
                          className="h-8 text-xs w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(li.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 計算プレビュー */}
              {(() => {
                const hr = form.watch("hourlyRate") ?? 0;
                const sample = 160; // 月 160h 想定
                const base = hr * sample;
                const liSum = lineItems.reduce((s, li) => s + li.amount, 0);
                return (
                  <div className="text-xs bg-background rounded p-2.5 border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">月 160h ベース基本給</span>
                      <span>{formatYen(base)}</span>
                    </div>
                    {liSum !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">個別明細合計</span>
                        <span className={liSum < 0 ? "text-destructive" : ""}>
                          {liSum >= 0 ? "+" : ""}
                          {formatYen(liSum)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-1 border-t mt-1">
                      <span>支給参考額</span>
                      <span>{formatYen(base + liSum)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ＊ 実際の支給は実勤務時間 + 各種手当 × 件数 + 成果報酬 で計算されます
                    </p>
                  </div>
                );
              })()}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                {editing ? "変更を保存" : "追加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
