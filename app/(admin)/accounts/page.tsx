"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, UserCog, Search, Mail } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ADMIN_ACCOUNTS, ADMIN_ROLES, VENUES } from "@/lib/mock-data";
import type {
  AdminAccount,
  AdminAccountStatus,
} from "@/lib/types";
import { relativeTime } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "氏名は 2 文字以上"),
  email: z.string().email("正しいメールアドレス"),
  roleKey: z.string().min(1, "ロールを選択"),
  venueId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const STATUS_COLOR: Record<
  AdminAccountStatus,
  "success" | "warning" | "destructive"
> = {
  active: "success",
  invited: "warning",
  suspended: "destructive",
};
const STATUS_LABEL: Record<AdminAccountStatus, string> = {
  active: "有効",
  invited: "招待中",
  suspended: "停止中",
};

export default function AccountsPage() {
  const { user } = useAuth();
  const { items, add, update, hydrated } = useMockCrud<AdminAccount>(
    MOCK_KEYS.adminAccounts,
    ADMIN_ACCOUNTS
  );
  const { items: roles } = useMockCrud(MOCK_KEYS.adminRoles, ADMIN_ROLES);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminAccountStatus>(
    "all"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      roleKey: user?.role === "lst-admin" ? "lst-operations" : "venue-manager",
      venueId: user?.role === "venue-admin" ? user.venueId : "",
    },
  });

  const isLst = user?.role === "lst-admin";

  const scopedAccounts = useMemo(() => {
    if (isLst) return items;
    return items.filter((a) => a.venueId === user?.venueId);
  }, [items, user, isLst]);

  const availableRoles = useMemo(() => {
    if (isLst) return roles;
    return roles.filter((r) => r.scope === "venue");
  }, [isLst, roles]);

  const roleMap = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.key, r])),
    [roles]
  );

  const filtered = useMemo(() => {
    return scopedAccounts.filter((a) => {
      if (roleFilter !== "all" && a.roleKey !== roleFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q && !`${a.name}${a.email}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [scopedAccounts, q, roleFilter, statusFilter]);

  const stats = {
    total: scopedAccounts.length,
    active: scopedAccounts.filter((a) => a.status === "active").length,
    invited: scopedAccounts.filter((a) => a.status === "invited").length,
    suspended: scopedAccounts.filter((a) => a.status === "suspended").length,
  };

  const openNew = () => {
    setEditing(null);
    form.reset({
      name: "",
      email: "",
      roleKey: isLst ? "lst-operations" : "venue-manager",
      venueId: isLst ? "" : user?.venueId,
    });
    setDialogOpen(true);
  };

  const openEdit = (a: AdminAccount) => {
    setEditing(a);
    form.reset({
      name: a.name,
      email: a.email,
      roleKey: a.roleKey,
      venueId: a.venueId ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const role = availableRoles.find((r) => r.key === data.roleKey);
    const venueScoped = role?.scope === "venue";

    if (editing) {
      update(editing.id, {
        name: data.name,
        email: data.email,
        roleKey: data.roleKey,
        venueId: venueScoped ? data.venueId : undefined,
      });
      toast.success(`アカウントを更新：${data.name}`);
    } else {
      add({
        id: `acc-${Date.now()}`,
        name: data.name,
        email: data.email,
        roleKey: data.roleKey,
        venueId: venueScoped ? data.venueId : undefined,
        status: "invited",
        createdAt: new Date().toISOString(),
        createdBy: user?.name,
      });
      toast.success(`招待メールを送信：${data.email}`);
    }
    setDialogOpen(false);
  };

  const toggleStatus = (a: AdminAccount) => {
    const next: AdminAccountStatus =
      a.status === "active" ? "suspended" : "active";
    update(a.id, { status: next });
    toast.success(`${a.name} を${next === "active" ? "有効化" : "停止"}しました`);
  };

  const resendInvite = (a: AdminAccount) => {
    toast.success(`招待メールを再送しました：${a.email}`);
  };

  if (!hydrated) return null;

  const selectedRole = form.watch("roleKey");
  const selectedRoleInfo = availableRoles.find((r) => r.key === selectedRole);

  return (
    <PageShell
      title="管理者アカウント"
      description={
        isLst
          ? "LST 運営チームと全加盟店の管理者アカウント。権限は「権限・ロール」で定義されたロールから割り当てます。"
          : "当企業の管理者アカウント。オーナーがロール割当てを管理します。"
      }
      breadcrumbs={[
        { label: isLst ? "システム" : "会員/アカウント" },
        { label: "管理者アカウント" },
      ]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規アカウント
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">総アカウント</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">有効</div>
          <div className="text-2xl font-bold text-success mt-1">
            {stats.active}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">招待中</div>
          <div className="text-2xl font-bold text-warning mt-1">
            {stats.invited}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">停止中</div>
          <div className="text-2xl font-bold text-muted-foreground mt-1">
            {stats.suspended}
          </div>
        </div>
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="氏名 / メール"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-52 h-8 text-xs"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ロール</SelectItem>
                {availableRoles.map((r) => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.label}
                  </SelectItem>
                ))}
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
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="invited">招待中</SelectItem>
                <SelectItem value="suspended">停止中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={UserCog} title="該当するアカウントはありません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>アカウント</TableHead>
                <TableHead>ロール</TableHead>
                {isLst && <TableHead>範囲</TableHead>}
                <TableHead>最終ログイン</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const role = roleMap[a.roleKey];
                const venue = a.venueId
                  ? VENUES.find((v) => v.id === a.venueId)
                  : undefined;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <div>{a.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={role?.scope === "lst" ? "default" : "secondary"}
                      >
                        {role?.label ?? a.roleKey}
                      </Badge>
                    </TableCell>
                    {isLst && (
                      <TableCell className="text-xs text-muted-foreground">
                        {role?.scope === "lst"
                          ? "LST 全体"
                          : venue?.name ?? "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground">
                      {a.lastLoginAt ? relativeTime(a.lastLoginAt) : "未ログイン"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLOR[a.status]}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(a)}
                        >
                          編集
                        </Button>
                        {a.status === "invited" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendInvite(a)}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            再送
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            a.status === "active" ? "text-destructive" : ""
                          }
                          onClick={() => toggleStatus(a)}
                        >
                          {a.status === "active" ? "停止" : "有効化"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 新規/編集 dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "アカウントを編集" : "新規アカウント招待"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "アカウントのロールを変更できます。メール変更不可。"
                : "招待メールを送信し、リンククリックでパスワード設定後に利用開始します。"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
              <Label required>メールアドレス</Label>
              <Input
                type="email"
                {...form.register("email")}
                disabled={!!editing}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>ロール</Label>
              <Select
                value={form.watch("roleKey")}
                onValueChange={(v) => form.setValue("roleKey", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.label}（{r.scope === "lst" ? "LST" : "企業"}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoleInfo && (
                <p className="text-xs text-muted-foreground">
                  {selectedRoleInfo.description}
                </p>
              )}
            </div>

            {selectedRoleInfo?.scope === "venue" && isLst && (
              <div className="grid gap-1.5">
                <Label required>担当企業</Label>
                <Select
                  value={form.watch("venueId")}
                  onValueChange={(v) => form.setValue("venueId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="企業を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                {editing ? "変更を保存" : "招待を送信"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
