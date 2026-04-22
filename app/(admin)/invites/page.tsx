"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, UserPlus2, Copy, Link2 } from "lucide-react";

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
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { INVITES } from "@/lib/mock-data";
import type { Invite, InviteRole, InviteStatus } from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/utils";

const ROLE_LABEL: Record<InviteRole, string> = {
  staff: "スタッフ",
  receptionist: "受付",
  manager: "マネージャー",
  coach: "コーチ",
  "venue-admin": "企業管理者",
};

const STATUS_LABEL: Record<InviteStatus, { label: string; v: "success" | "warning" | "muted" | "destructive" }> = {
  pending: { label: "招待中", v: "warning" },
  accepted: { label: "受諾済み", v: "success" },
  expired: { label: "期限切れ", v: "muted" },
  revoked: { label: "取消", v: "destructive" },
};

const schema = z.object({
  email: z.string().email("メール形式が不正"),
  role: z.enum(["staff", "receptionist", "manager", "coach", "venue-admin"]),
  expirationDays: z.number().min(1).max(30),
  note: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function InvitesPage() {
  const { user } = useAuth();
  const { items, add, update, hydrated } = useMockCrud<Invite>(
    MOCK_KEYS.invites,
    INVITES
  );
  const [tab, setTab] = useState<"all" | InviteStatus>("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      role: "staff",
      expirationDays: 7,
      note: "",
    },
  });

  const myInvites = useMemo(
    () => items.filter((i) => i.venueId === user?.venueId),
    [items, user]
  );

  const filtered = useMemo(() => {
    return myInvites
      .filter((i) => tab === "all" || i.status === tab)
      .sort((a, b) => b.invitedAt.localeCompare(a.invitedAt));
  }, [myInvites, tab]);

  const counts = useMemo(
    () => ({
      pending: myInvites.filter((i) => i.status === "pending").length,
      accepted: myInvites.filter((i) => i.status === "accepted").length,
      expired: myInvites.filter((i) => i.status === "expired").length,
      revoked: myInvites.filter((i) => i.status === "revoked").length,
    }),
    [myInvites]
  );

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const now = new Date();
    const exp = new Date();
    exp.setDate(now.getDate() + data.expirationDays);
    add({
      id: `inv-${Date.now()}`,
      venueId: user?.venueId ?? "",
      email: data.email,
      role: data.role,
      status: "pending",
      invitedBy: user?.name ?? "",
      invitedAt: now.toISOString(),
      expiresAt: exp.toISOString().slice(0, 10),
      note: data.note,
    });
    toast.success(`招待を送信しました：${data.email}`);
    form.reset({
      email: "",
      role: "staff",
      expirationDays: 7,
      note: "",
    });
    setDialogOpen(false);
  };

  const revoke = (inv: Invite) => {
    update(inv.id, { status: "revoked" });
    toast.success(`招待を取り消しました：${inv.email}`);
  };

  const resend = (inv: Invite) => {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    update(inv.id, {
      status: "pending",
      invitedAt: new Date().toISOString(),
      expiresAt: exp.toISOString().slice(0, 10),
    });
    toast.success(`招待を再送しました：${inv.email}`);
  };

  const copyLink = (inv: Invite) => {
    const link = `https://lst.example/invite/${inv.id}`;
    navigator.clipboard?.writeText(link);
    setLinkCopied(inv.id);
    toast.success("招待リンクをコピーしました");
    setTimeout(() => setLinkCopied(null), 2000);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="アカウント招待"
      description="スタッフ・コーチ・管理者を招待します。招待リンク有効期限は最大 30 日まで設定可能。"
      breadcrumbs={[{ label: "会員/アカウント" }, { label: "アカウント招待" }]}
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          新規招待
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">招待中</div>
          <div className="text-2xl font-bold text-warning mt-1">{counts.pending}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">受諾済み</div>
          <div className="text-2xl font-bold text-success mt-1">{counts.accepted}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">期限切れ</div>
          <div className="text-2xl font-bold mt-1 text-muted-foreground">
            {counts.expired}
          </div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">取消</div>
          <div className="text-2xl font-bold mt-1 text-muted-foreground">
            {counts.revoked}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">
            招待中 <Badge variant="warning" className="ml-2">{counts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted">
            受諾済み <Badge variant="muted" className="ml-2">{counts.accepted}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expired">期限切れ</TabsTrigger>
          <TabsTrigger value="revoked">取消</TabsTrigger>
          <TabsTrigger value="all">すべて</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Section>
            {filtered.length === 0 ? (
              <EmptyState icon={UserPlus2} title="該当する招待はありません" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メール</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>招待者</TableHead>
                    <TableHead>招待日時</TableHead>
                    <TableHead>期限</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => {
                    const st = STATUS_LABEL[inv.status];
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">
                          <div>{inv.email}</div>
                          {inv.note && (
                            <div className="text-xs text-muted-foreground">
                              {inv.note}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ROLE_LABEL[inv.role]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{inv.invitedBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {relativeTime(inv.invitedAt)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {inv.status === "accepted"
                            ? `受諾 ${formatDate(inv.acceptedAt!)}`
                            : inv.expiresAt}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.v}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {inv.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyLink(inv)}
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  {linkCopied === inv.id ? "コピー済" : "リンク"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => revoke(inv)}
                                >
                                  取消
                                </Button>
                              </>
                            )}
                            {(inv.status === "expired" ||
                              inv.status === "revoked") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resend(inv)}
                              >
                                再送
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
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>新規アカウント招待</DialogTitle>
            <DialogDescription>
              招待メールを送信し、リンククリックで新規アカウント作成へ誘導します。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>招待先メールアドレス</Label>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="newstaff@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>役割</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as InviteRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ROLE_LABEL) as [InviteRole, string][]).map(
                      ([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label required>有効期限（日）</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  {...form.register("expirationDays", { valueAsNumber: true })}
                />
                {form.formState.errors.expirationDays && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.expirationDays.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>メモ</Label>
              <Textarea
                rows={2}
                {...form.register("note")}
                placeholder="例：週末シフト要員、A 級コーチ候補"
              />
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
                招待を送信
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
