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
import type { Staff, StaffRole, StaffStatus } from "@/lib/types";

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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      hiredAt: new Date().toISOString().slice(0, 10),
      note: "",
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
    form.reset({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      hiredAt: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    form.reset({
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      hiredAt: s.hiredAt,
      note: s.note ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, data);
      toast.success(`スタッフを更新：${data.name}`);
    } else {
      add({
        id: `s-${Date.now()}`,
        venueId: user?.venueId ?? "",
        status: "active",
        ...data,
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
