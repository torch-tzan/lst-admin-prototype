"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Sparkles,
  Search,
  Trophy,
  Megaphone,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { CAMPAIGNS, VENUES } from "@/lib/mock-data";
import type { Campaign, CampaignKind, CampaignStatus } from "@/lib/types";
import { formatYen, formatDate, cn } from "@/lib/utils";

const KIND_LABEL: Record<CampaignKind, string> = {
  tournament: "大会",
  lesson_event: "レッスンイベント",
  promotion: "販促キャンペーン",
  social_gathering: "交流会",
};

const KIND_ICON: Record<CampaignKind, any> = {
  tournament: Trophy,
  lesson_event: BookOpen,
  promotion: Megaphone,
  social_gathering: Users,
};

const STATUS_LABEL: Record<
  CampaignStatus,
  { label: string; v: "muted" | "warning" | "success" | "default" }
> = {
  draft: { label: "下書き", v: "muted" },
  scheduled: { label: "予定", v: "warning" },
  active: { label: "開催中", v: "success" },
  ended: { label: "終了", v: "muted" },
};

const schema = z.object({
  title: z.string().min(4, "タイトルは 4 文字以上"),
  description: z.string().min(10, "説明は 10 文字以上"),
  kind: z.enum(["tournament", "lesson_event", "promotion", "social_gathering"]),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  fee: z.number().min(0),
  capacity: z.number().min(0),
  status: z.enum(["draft", "scheduled", "active", "ended"]),
});
type FormData = z.infer<typeof schema>;

export default function CampaignsPage() {
  const { user } = useAuth();
  const { items, add, update, hydrated } = useMockCrud<Campaign>(
    MOCK_KEYS.campaigns,
    CAMPAIGNS
  );
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CampaignKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CampaignStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      kind: "lesson_event",
      startAt: "",
      endAt: "",
      fee: 0,
      capacity: 16,
      status: "draft",
    },
  });

  const scopedItems = useMemo(() => {
    if (user?.role === "venue-admin") {
      return items.filter(
        (c) =>
          c.scope === "platform" ||
          (c.scope === "venue" && c.venueId === user.venueId)
      );
    }
    return items;
  }, [items, user]);

  const filtered = useMemo(() => {
    return scopedItems.filter((c) => {
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !`${c.title}${c.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [scopedItems, q, kindFilter, statusFilter]);

  const stats = {
    active: scopedItems.filter((c) => c.status === "active").length,
    scheduled: scopedItems.filter((c) => c.status === "scheduled").length,
    totalParticipants: scopedItems.reduce((s, c) => s + c.participantCount, 0),
    revenue: scopedItems.reduce(
      (s, c) => s + c.fee * c.participantCount,
      0
    ),
  };

  const openNew = () => {
    setEditing(null);
    form.reset({
      title: "",
      description: "",
      kind: "lesson_event",
      startAt: "",
      endAt: "",
      fee: 0,
      capacity: 16,
      status: "draft",
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    form.reset({
      title: c.title,
      description: c.description,
      kind: c.kind,
      startAt: c.startAt.slice(0, 16),
      endAt: c.endAt.slice(0, 16),
      fee: c.fee,
      capacity: c.capacity,
      status: c.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, data);
      toast.success(`キャンペーンを更新：${data.title}`);
    } else {
      add({
        id: `cm-${Date.now()}`,
        ...data,
        scope: user?.role === "venue-admin" ? "venue" : "platform",
        venueId: user?.role === "venue-admin" ? user.venueId : undefined,
        participantCount: 0,
        createdBy: user?.name ?? "",
        createdAt: new Date().toISOString(),
      });
      toast.success(`キャンペーンを追加：${data.title}`);
    }
    setDialogOpen(false);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="キャンペーン・イベント管理"
      description="大会・レッスンイベント・販促キャンペーン・交流会の企画と進捗管理"
      breadcrumbs={[
        { label: "お知らせ/イベント" },
        { label: "キャンペーン・イベント管理" },
      ]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規作成
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">開催中</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">予定</div>
            <div className="text-2xl font-bold text-warning mt-1">
              {stats.scheduled}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">総参加者数</div>
            <div className="text-2xl font-bold mt-1">
              {stats.totalParticipants.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">参加費総額</div>
            <div className="text-2xl font-bold mt-1">{formatYen(stats.revenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タイトル / 説明で検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-56 h-8 text-xs"
              />
            </div>
            <Select
              value={kindFilter}
              onValueChange={(v) => setKindFilter(v as typeof kindFilter)}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全種別</SelectItem>
                {(Object.entries(KIND_LABEL) as [CampaignKind, string][]).map(
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
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全状態</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="scheduled">予定</SelectItem>
                <SelectItem value="active">開催中</SelectItem>
                <SelectItem value="ended">終了</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={Sparkles} title="該当するキャンペーンはありません" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
            {filtered.map((c) => {
              const Icon = KIND_ICON[c.kind];
              const st = STATUS_LABEL[c.status];
              const fillRate =
                c.capacity > 0
                  ? Math.round((c.participantCount / c.capacity) * 100)
                  : 0;
              const venue = c.venueId ? VENUES.find((v) => v.id === c.venueId) : undefined;
              return (
                <Card
                  key={c.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openEdit(c)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-0.5">
                            {KIND_LABEL[c.kind]}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {c.scope === "platform"
                              ? "プラットフォーム全体"
                              : venue?.name}
                          </div>
                        </div>
                      </div>
                      <Badge variant={st.v}>{st.label}</Badge>
                    </div>
                    <div className="font-semibold mb-1">{c.title}</div>
                    <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {c.description}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(c.startAt)}
                      </div>
                      {c.fee > 0 && <div>{formatYen(c.fee)}</div>}
                    </div>
                    {c.capacity > 0 && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            参加者 {c.participantCount} / {c.capacity}
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              fillRate >= 100
                                ? "text-destructive"
                                : fillRate >= 70
                                ? "text-warning"
                                : "text-success"
                            )}
                          >
                            {fillRate}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              fillRate >= 100
                                ? "bg-destructive"
                                : fillRate >= 70
                                ? "bg-warning"
                                : "bg-success"
                            )}
                            style={{ width: `${Math.min(fillRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "キャンペーン編集" : "新規キャンペーン"}
            </DialogTitle>
            <DialogDescription>
              イベント・大会・販促・交流会の企画を登録します
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>タイトル</Label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>説明</Label>
              <Textarea rows={3} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>種別</Label>
                <Select
                  value={form.watch("kind")}
                  onValueChange={(v) => form.setValue("kind", v as CampaignKind)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(KIND_LABEL) as [CampaignKind, string][]).map(
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
                <Label required>状態</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    form.setValue("status", v as CampaignStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="scheduled">予定</SelectItem>
                    <SelectItem value="active">開催中</SelectItem>
                    <SelectItem value="ended">終了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>開始日時</Label>
                <Input type="datetime-local" {...form.register("startAt")} />
              </div>
              <div className="grid gap-1.5">
                <Label required>終了日時</Label>
                <Input type="datetime-local" {...form.register("endAt")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>参加費（¥、無料は 0）</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("fee", { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>定員（無制限は 0）</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("capacity", { valueAsNumber: true })}
                />
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
