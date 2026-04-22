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
  Calendar,
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  Info,
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
import { CAMPAIGNS, VENUES } from "@/lib/mock-data";
import type { Campaign, CampaignStatus } from "@/lib/types";

const STATUS_LABEL: Record<
  CampaignStatus,
  { label: string; v: "muted" | "warning" | "success" | "default" }
> = {
  draft: { label: "下書き", v: "muted" },
  scheduled: { label: "公開予定", v: "warning" },
  active: { label: "公開中", v: "success" },
  ended: { label: "終了", v: "muted" },
};

/** app 内遷移先のプリセット候補（自由入力も可）*/
const CTA_LINK_PRESETS = [
  { label: "コート予約画面", value: "/search" },
  { label: "ゲーム・大会ページ", value: "/game" },
  { label: "マイページ", value: "/mypage" },
  { label: "お知らせ一覧", value: "/notifications" },
  { label: "指定なし", value: "" },
];

const schema = z.object({
  title: z.string().min(4, "タイトルは 4 文字以上"),
  image: z.string().url("URL 形式が不正").or(z.literal("")).optional(),
  body: z.string().min(10, "本文は 10 文字以上"),
  dateLabel: z.string().min(1, "期間表記を入力（例：2026/07/01 〜 2026/08/31）"),
  location: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
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
  const [statusFilter, setStatusFilter] = useState<"all" | CampaignStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [preview, setPreview] = useState<Campaign | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      image: "",
      body: "",
      dateLabel: "",
      location: "",
      ctaLabel: "",
      ctaLink: "",
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
    return scopedItems
      .filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (
          q &&
          !`${c.title}${c.body}${c.dateLabel}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [scopedItems, q, statusFilter]);

  const stats = {
    active: scopedItems.filter((c) => c.status === "active").length,
    scheduled: scopedItems.filter((c) => c.status === "scheduled").length,
    draft: scopedItems.filter((c) => c.status === "draft").length,
    ended: scopedItems.filter((c) => c.status === "ended").length,
  };

  const openNew = () => {
    setEditing(null);
    form.reset({
      title: "",
      image: "",
      body: "",
      dateLabel: "",
      location: "",
      ctaLabel: "",
      ctaLink: "",
      status: "draft",
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    form.reset({
      title: c.title,
      image: c.image ?? "",
      body: c.body,
      dateLabel: c.dateLabel,
      location: c.location ?? "",
      ctaLabel: c.ctaLabel ?? "",
      ctaLink: c.ctaLink ?? "",
      status: c.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const payload = {
      title: data.title,
      image: data.image || undefined,
      body: data.body,
      dateLabel: data.dateLabel,
      location: data.location || undefined,
      ctaLabel: data.ctaLabel || undefined,
      ctaLink: data.ctaLink || undefined,
      status: data.status,
    };
    if (editing) {
      update(editing.id, payload);
      toast.success(`更新：${data.title}`);
    } else {
      add({
        id: `cm-${Date.now()}`,
        ...payload,
        scope: user?.role === "venue-admin" ? "venue" : "platform",
        venueId: user?.role === "venue-admin" ? user.venueId : undefined,
        createdBy: user?.name ?? "",
        createdAt: new Date().toISOString(),
      });
      toast.success(`作成：${data.title}`);
    }
    setDialogOpen(false);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="キャンペーン・イベント管理"
      description="app 内で表示されるお知らせコンテンツの管理。バナー画像・本文・CTA ボタンを設定し、利用者を予約画面や大会ページへ誘導します。"
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
      <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground leading-relaxed">
          キャンペーン・イベントは<strong>純粋な告知コンテンツ</strong>です。
          報名・エントリー機能はありません。参加申込みが必要な場合は、CTA ボタンで app 内の別画面（予約画面・ゲーム大会ページ等）へ誘導してください。
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">公開中</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">公開予定</div>
            <div className="text-2xl font-bold text-warning mt-1">
              {stats.scheduled}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">下書き</div>
            <div className="text-2xl font-bold mt-1">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">終了</div>
            <div className="text-2xl font-bold text-muted-foreground mt-1">
              {stats.ended}
            </div>
          </CardContent>
        </Card>
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タイトル / 本文で検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-60 h-8 text-xs"
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
                <SelectItem value="all">全状態</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="scheduled">公開予定</SelectItem>
                <SelectItem value="active">公開中</SelectItem>
                <SelectItem value="ended">終了</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={Sparkles} title="該当するキャンペーンはありません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">バナー</TableHead>
                <TableHead>タイトル / 本文</TableHead>
                <TableHead className="w-44">期間 / 場所</TableHead>
                <TableHead className="w-40">CTA</TableHead>
                <TableHead className="w-28">スコープ</TableHead>
                <TableHead className="w-24">状態</TableHead>
                <TableHead className="text-right w-36">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const st = STATUS_LABEL[c.status];
                const venue = c.venueId
                  ? VENUES.find((v) => v.id === c.venueId)
                  : undefined;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="w-16 aspect-[5/3] rounded bg-muted overflow-hidden flex items-center justify-center">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{c.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {c.body}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span>{c.dateLabel}</span>
                      </div>
                      {c.location && (
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{c.location}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {c.ctaLabel ? (
                        <div className="flex items-center gap-1 text-primary">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{c.ctaLabel}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {c.scope === "platform" ? (
                        <Badge variant="default">全体</Badge>
                      ) : venue ? (
                        <Badge variant="secondary">{venue.name}</Badge>
                      ) : (
                        <Badge variant="secondary">自社</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.v}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreview(c)}
                        >
                          プレビュー
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(c)}
                        >
                          編集
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
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "キャンペーン編集" : "新規キャンペーン"}
            </DialogTitle>
            <DialogDescription>
              利用者アプリに公開されるコンテンツです。参加条件・参加費などはすべて本文に記載してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Banner */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                バナー画像
              </Label>
              <div className="flex gap-3">
                <div className="w-40 aspect-[5/3] rounded-md border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {form.watch("image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.watch("image")}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 grid gap-1.5">
                  <Input
                    {...form.register("image")}
                    placeholder="https://... (画像 URL)"
                  />
                  <p className="text-xs text-muted-foreground">
                    app 詳細画面の上部に全幅表示されます（推奨比率 5:3）
                  </p>
                </div>
              </div>
              {form.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label required>タイトル</Label>
              <Input {...form.register("title")} placeholder="例：春のキャンペーン開催中" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  期間表記
                </Label>
                <Input
                  {...form.register("dateLabel")}
                  placeholder="例：2026/03/01 〜 2026/04/30"
                />
                <p className="text-[10px] text-muted-foreground">
                  自由入力。「毎週土曜日」なども可
                </p>
                {form.formState.errors.dateLabel && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.dateLabel.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  開催場所（任意）
                </Label>
                <Input
                  {...form.register("location")}
                  placeholder="例：パデルコート広島 コートA・B"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label required>本文</Label>
              <Textarea
                rows={8}
                {...form.register("body")}
                placeholder="参加条件・参加費・賞品などの詳細を記載。改行可能。"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                「■ キャンペーン内容」などの見出しで区切ると読みやすい
              </p>
              {form.formState.errors.body && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.body.message}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="border rounded-md p-3 bg-muted/20 space-y-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                CTA ボタン（任意）
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>ボタンラベル</Label>
                  <Input
                    {...form.register("ctaLabel")}
                    placeholder="例：コートを予約する"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>遷移先</Label>
                  <Select
                    value={form.watch("ctaLink") ?? ""}
                    onValueChange={(v) => form.setValue("ctaLink", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="遷移先を選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_LINK_PRESETS.map((p) => (
                        <SelectItem key={p.label} value={p.value || "NONE"}>
                          {p.label} {p.value && <span className="text-muted-foreground ml-1 font-mono text-[10px]">{p.value}</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                ボタンラベルを入れると app 詳細画面下部に CTA ボタンが表示されます。ラベル空欄なら非表示。
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label required>公開状態</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as CampaignStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き（app 非公開）</SelectItem>
                  <SelectItem value="scheduled">公開予定</SelectItem>
                  <SelectItem value="active">公開中</SelectItem>
                  <SelectItem value="ended">終了</SelectItem>
                </SelectContent>
              </Select>
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
                {editing ? "変更を保存" : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview dialog（app 内表示イメージ）*/}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent size="md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>app 詳細画面プレビュー</DialogTitle>
                <DialogDescription>
                  利用者アプリでの表示イメージ
                </DialogDescription>
              </DialogHeader>
              <div className="border rounded-md overflow-hidden bg-background">
                {preview.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.image}
                    alt={preview.title}
                    className="w-full aspect-[5/3] object-cover"
                  />
                )}
                <div className="p-4 space-y-3">
                  <h2 className="text-lg font-bold leading-snug">
                    {preview.title}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {preview.dateLabel}
                    </div>
                    {preview.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {preview.location}
                      </div>
                    )}
                  </div>
                  <hr />
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {preview.body}
                  </div>
                  {preview.ctaLabel && (
                    <Button className="w-full" size="lg">
                      {preview.ctaLabel}
                    </Button>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreview(null)}>
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
